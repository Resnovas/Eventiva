/**
 * @file tests/runtime/src/catalogue-import.spec.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { expect, it } from '@effect/vitest';
import {
    ApplyImportRow,
    CancelImport,
    GetImport,
    ImportPlan,
    StageImport,
    stockImportFlag,
    StockImportFailure,
    type StockImportSource,
    StockImportSources,
} from '@eventiva/contracts/catalogue';
import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags, safeDefault } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import {
    ArchiveProduct,
    CreateProduct,
    GetProduct,
    inventoryFlag,
    ListProducts,
} from '@eventiva/contracts/inventory-product';
import { ResourceFailure, Resources, type ResourceProvider } from '@eventiva/contracts/resource';
import { CurrentTenant, type JsonValue, Storage } from '@eventiva/contracts/storage';
import { client } from '@eventiva/integrations.sql/postgres';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { load, migrate, type Dialect } from '@eventiva/integrations.sql/migrations';
import { migrateResources, resourceProvider } from '@eventiva/integrations.sql/resource';
import { importResources, prepareStockImport, stockImportModule } from '@eventiva/runtime/catalogue-import';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { InputDigest } from '@eventiva/runtime/invocation';
import { productModule, productResources } from '@eventiva/runtime/inventory-product';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { durable } from '@eventiva/runtime/storage';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import {
    Clock,
    ConfigProvider,
    Context,
    Deferred,
    Effect,
    Fiber,
    Layer,
    Redacted,
    Ref,
    Schema,
    TestClock,
} from 'effect';

/** Stable synthetic identities make source/evidence/tenant swaps distinguishable without customer data. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(1));
const day = 86_400_000;
const header = 'supplierSku,manufacturer,model,variant,quantity';
const csv = `${header}\nS-1,Fixture Audio,A-10,,3`;
const reference = { id: id(9), manufacturer: 'Fixture Audio', model: 'A-10', variant: null };
const source: StockImportSource = {
    id: id(2),
    tenant,
    csv,
    evidence: {
        id: id(3),
        artifact: id(4),
        reviewer: SubjectId.make(id(5)),
        basis: 'synthetic',
        purpose: 'private-stock-import',
        reviewedAt: 0,
        validUntil: 60 * day,
        revoked: false,
    },
};

/** Compose the real preparation with a private synthetic source authority, not a request-supplied permission boolean. */
const prepare = (value: StockImportSource = source, references: JsonValue = [reference], sourceId = source.id) =>
    prepareStockImport(sourceId, references).pipe(
        Effect.provideService(CurrentTenant, { id: tenant }),
        Effect.provideService(StockImportSources, {
            /** Model inaccessible source IDs as denied; source identity is checked independently by the runtime. */
            load: (requestedTenant, requestedSource) =>
                requestedTenant === tenant && requestedSource === sourceId
                    ? Effect.succeed(value)
                    : Effect.fail(new StockImportFailure({ reason: 'denied' })),
        })
    );

it.effect(
    'prepares literal quoted CSV and repeats without mutating source or disclosing the raw file',
    /** Commas, quotes, BOM, CRLF and embedded newlines must preserve exact technical identity. */ () =>
        Effect.gen(
            /** Check independently specified output, including a zero quantity and an explicit variant. */ function* () {
                // Embedded delimiters/newlines are model identity, not opportunities to normalize or silently split private rows.
                const loaded = {
                    ...source,
                    csv: `\uFEFF${header}\r\n"S,1","Fixture ""Audio""","A\n10",mk2,0\r\n`,
                };
                const references = [{ ...reference, manufacturer: 'Fixture "Audio"', model: 'A\n10', variant: 'mk2' }];
                const before = JSON.stringify(loaded);
                const result = yield* prepare(loaded, references);
                expect(result).toEqual({
                    source: source.id,
                    evidence: source.evidence,
                    state: 'reviewable',
                    rows: [
                        {
                            row: 1,
                            state: 'matched',
                            reference: reference.id,
                            stock: {
                                supplierSku: 'S,1',
                                manufacturer: 'Fixture "Audio"',
                                model: 'A\n10',
                                variant: 'mk2',
                                quantity: 0,
                            },
                        },
                    ],
                });
                Object.assign(result.evidence, { revoked: true });
                expect((yield* prepare(loaded, references)).evidence.revoked).toBe(false);
                expect(JSON.stringify(loaded)).toBe(before);
                expect(yield* prepare()).toEqual(yield* prepare());
            }
        )
);

it.effect(
    'keeps correction positions and refuses numeric coercion and duplicate stock winners',
    /** A preparation is not reviewable unless every row has exactly one model match and a valid unique SKU. */ () =>
        Effect.gen(
            /** Bad quantities must not shift following records or be silently rounded into an accepted stock quantity. */ function* () {
                // Preserve row positions and an accepted control to distinguish correction reporting from whole-batch rejection.
                const result = yield* prepare({
                    ...source,
                    csv: `${header}\nS-1,Fixture Audio,A-10,,3\nS-2,Fixture Audio,A10,,1\nS-3,Fixture Audio,A-10,,01\nS-4,Fixture Audio,A-10,,1e3\nS-5,Fixture Audio,A-10,,9007199254740992\nS-6,Fixture Audio,A-10,,1.0\nS-7,Fixture Audio,A-10,,-1\nS-8,Fixture Audio,A-10,,`,
                });
                expect(result.state).toBe('corrections-required');
                expect(
                    result.rows.map(
                        /** Observe dispositions without conflating accepted private stock with invalid rejected fields. */
                        ({ row, state }) => ({ row, state })
                    )
                ).toEqual([
                    { row: 1, state: 'matched' },
                    { row: 2, state: 'unmatched' },
                    { row: 3, state: 'invalid' },
                    { row: 4, state: 'invalid' },
                    { row: 5, state: 'invalid' },
                    { row: 6, state: 'invalid' },
                    { row: 7, state: 'invalid' },
                    { row: 8, state: 'invalid' },
                ]);
                expect((yield* prepare({ ...source, csv: `${csv}\ns-1,Fixture Audio,A-10,,4` })).rows).toEqual([
                    { row: 1, state: 'duplicate-sku' },
                    { row: 2, state: 'duplicate-sku' },
                ]);
                expect((yield* prepare(source, [reference, { ...reference, id: id(10) }])).rows).toEqual([
                    { row: 1, state: 'ambiguous' },
                ]);
            }
        )
);

it.effect(
    'denies swapped tenant/source, revoked evidence and future reviews before exposing private row outcomes',
    /** A malicious or stale authority result must not grant cross-tenant access or turn a caller flag into permission. */ () =>
        Effect.gen(
            /** Retain a valid control and exercise each independent binding and time invariant. */ function* () {
                // Reuse then revoke the same source object to catch cached authority while checking that failures omit private rows.
                expect((yield* prepare()).state).toBe('reviewable');
                for (const value of [
                    { ...source, id: id(99) },
                    { ...source, tenant: TenantId.make(id(99)) },
                    { ...source, evidence: { ...source.evidence, revoked: true } },
                    { ...source, evidence: { ...source.evidence, reviewedAt: 1 } },
                    { ...source, evidence: { ...source.evidence, validUntil: 0 } },
                ]) {
                    const error = yield* Effect.flip(prepare(value));
                    expect(error.reason).toBe('denied');
                    expect(JSON.stringify(error)).not.toContain('Fixture Audio');
                }
                const revocable = { ...source, evidence: { ...source.evidence } };
                expect((yield* prepare(revocable)).state).toBe('reviewable');
                Object.assign(revocable.evidence, { revoked: true });
                expect((yield* Effect.flip(prepare(revocable))).reason).toBe('denied');
                const malformed = { ...source, privateNote: 'private-authority-diagnostic' };
                const malformedError = yield* Effect.flip(prepare(malformed));
                expect(malformedError.reason).toBe('invalid');
                expect(JSON.stringify(malformedError)).not.toContain('private-authority-diagnostic');
                const denied = yield* Effect.flip(
                    prepareStockImport(source.id, [reference]).pipe(
                        Effect.provideService(CurrentTenant, { id: tenant }),
                        Effect.provideService(StockImportSources, {
                            /** A missing current grant is an explicit refusal, never an empty successful import. */
                            load: () => Effect.fail(new StockImportFailure({ reason: 'unavailable' })),
                        })
                    )
                );
                expect(denied.reason).toBe('unavailable');
            }
        )
);

it.effect(
    'rechecks exact expiry and maximum review age on every preparation with the Effect clock',
    /** An earlier review projection is not a reusable consent or import token. */ () =>
        Effect.gen(
            /** Both exclusive boundaries must refuse even when the source's nominal expiry is still later. */ function* () {
                // Adjacent milliseconds distinguish exact expiry and review-age gates from an always-stale implementation.
                const expiring = { ...source, evidence: { ...source.evidence, validUntil: 10 } };
                yield* TestClock.setTime(9);
                expect((yield* prepare(expiring)).state).toBe('reviewable');
                yield* TestClock.setTime(10);
                expect((yield* Effect.flip(prepare(expiring))).reason).toBe('denied');
                yield* TestClock.setTime(30 * day - 1);
                expect((yield* prepare()).state).toBe('reviewable');
                yield* TestClock.setTime(30 * day);
                expect((yield* Effect.flip(prepare())).reason).toBe('denied');
            }
        )
);

it.effect(
    'refuses malformed or oversized CSV without guessing headers, repairing quoting or echoing private contents',
    /** Whole-file structural errors cannot silently skip rows or change field alignment. */ () =>
        Effect.gen(
            /** Cover both terminal-record forms and both sides of the 1000-row bound, not just input rejection. */ function* () {
                // Accepted size controls isolate parser/budget failures from row-level corrections and prevent reject-all false passes.
                const row = 'S-1,Fixture Audio,A-10,,3';
                expect(
                    (yield* prepare({ ...source, csv: `${header}\n${Array(1000).fill(row).join('\n')}` })).rows.length
                ).toBe(1000);
                const suffix = ',Fixture Audio,A-10,,3';
                const atLimit = `${header}\n${'S'.repeat(1_000_000 - header.length - 1 - suffix.length)}${suffix}`;
                expect((yield* prepare({ ...source, csv: atLimit })).rows).toEqual([{ row: 1, state: 'invalid' }]);
                for (const body of [
                    '',
                    header,
                    `${header}\n`,
                    `${header}\n\n`,
                    `sku,manufacturer,model,variant,quantity\n${row}`,
                    `${header},extra\n${row},private`,
                    `${header}\n${row},private`,
                    `${header}\nS-1,Fixture Audio,A-10,3`,
                    `${header}\n"private,Fixture Audio,A-10,,3`,
                    `${header}\nS"private,Fixture Audio,A-10,,3`,
                    `${header}\n"private"x,Fixture Audio,A-10,,3`,
                    `${header}\r${row}`,
                    `${header}\n${Array(1001).fill(row).join('\n')}`,
                    `${header}\n${Array(1001).fill(row).join('\n')}\n`,
                    `${atLimit}\n`,
                    'private'.repeat(142858),
                ]) {
                    const error = yield* Effect.flip(prepare({ ...source, csv: body }));
                    expect(error.reason).toBe('invalid-csv');
                    expect(JSON.stringify(error)).not.toContain('private');
                }
                expect((yield* Effect.flip(prepare(source, [{ ...reference, price: 'private' }]))).reason).toBe(
                    'invalid'
                );
                expect((yield* Effect.flip(prepare(source, [reference], 'private-invalid-id'))).reason).toBe('invalid');
            }
        )
);

/** Acquire only disposable local databases; each open uses an independent SQL client, never a production test target. */
const importDatabase = (dialect: Dialect) =>
    Effect.gen(
        /** Keep database allocation outside writer scopes so closing a host cannot erase durable acceptance evidence. */ function* () {
            /** Build the approved PostgreSQL integration with explicit fixture configuration. */
            const pg = (url: string) =>
                client.pipe(
                    Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
                );
            /** Reopen the same database without retaining an in-memory product/import store. */
            let open: () => ReturnType<typeof pg> | ReturnType<typeof localFile>;
            if (dialect === 'postgres') {
                const url = new URL(
                    process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
                );
                if (url.hostname !== '127.0.0.1' || url.pathname !== '/eventiva_test')
                    return yield* Effect.dieMessage('Disposable loopback fixture required');
                const admin = Context.get(yield* Layer.build(pg(url.toString())), SqlClient.SqlClient);
                const name = `import_${randomUUID().replaceAll('-', '')}`;
                yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                yield* Effect.addFinalizer(
                    /** Drop only this test's database after its scoped pools close. */ () =>
                        admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                );
                url.pathname = '/' + name;
                open = /** The fixture URL contains no production authority. */ () => pg(url.toString());
            } else {
                const folder = fileURLToPath(new URL('../../../.amp/in/orb-backup/import-tests/', import.meta.url));
                mkdirSync(folder, { recursive: true });
                const filename = folder + randomUUID() + '.sqlite';
                open = /** A file survives closure of every host connection. */ () =>
                    localFile(Redacted.make(filename));
            }
            // Initial migration connection is scoped separately from all subsequent writers/readers.
            yield* Effect.scoped(
                Effect.gen(
                    /** Apply the ordinary storage history before declaring feature Resources. */ function* () {
                        // Close the migration client as well as writers before testing recovery from the retained file/database.
                        const sql = Context.get(yield* Layer.build(open()), SqlClient.SqlClient);
                        yield* migrate(
                            dialect,
                            yield* load(
                                fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
                            )
                        ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                    }
                )
            );
            return { open };
        }
    );

for (const dialect of ['sqlite', 'postgres'] as const) {
    it.scopedLive(
        `durable metadata import uses public nested host transactions and replay-safe rights: ${dialect}`,
        /** Test real SQL and common host dispatch; synthetic controls inject failures only through provider ports. */ () =>
            Effect.gen(
                /** Separate review, ambiguous reply and reconnect phases so volatile state cannot masquerade as persistence. */ function* () {
                    const db = yield* importDatabase(dialect);
                    const who = {
                        subject: SubjectId.make(id(70)),
                        tenant,
                        session: SessionId.make(id(71)),
                        kind: 'human' as const,
                    };
                    const now = yield* Clock.currentTimeMillis;
                    const current = {
                        ...source,
                        csv: `${header}\nS-1,Fixture Audio,A-10,,7\nS-2,Fixture Audio,A-10,,0`,
                        evidence: { ...source.evidence, reviewedAt: now, validUntil: now + day },
                    };
                    const rights = yield* Ref.make<StockImportSource>(current);
                    const disabled = yield* Ref.make('');
                    const permitted = yield* Ref.make(true);
                    const fault = yield* Ref.make<
                        'none' | 'fail-row' | 'interrupt-row' | 'revoke-product' | 'permission-product' | 'flag-product'
                    >('none');
                    const beforeSource = yield* Ref.make<Effect.Effect<void>>(Effect.void);
                    const holdRow = yield* Ref.make(false);
                    const arrivals = yield* Ref.make(0);
                    const locked = yield* Deferred.make<void>();
                    const releaseLock = yield* Deferred.make<void>();
                    const contender = yield* Deferred.make<void>();
                    const reached = yield* Deferred.make<void>();
                    const declarations = yield* importResources;
                    const products = yield* productResources;
                    const definitions = [declarations.plans, declarations.rows, products.products, products.guard];
                    const stage = {
                        id: id(100),
                        source: source.id,
                        references: [reference],
                        acknowledgement: 'metadata-only-no-stock',
                        reviews: [
                            {
                                row: 1,
                                id: id(101),
                                product: id(103),
                                name: 'Reviewed lead',
                                category: 'cables',
                                tracking: 'bulk',
                                unit: 'each',
                            },
                            {
                                row: 2,
                                id: id(102),
                                product: id(104),
                                name: 'Reviewed spare',
                                category: 'spares',
                                tracking: 'consumable',
                                unit: 'pack',
                            },
                        ],
                    };
                    const apply = {
                        id: stage.id,
                        revision: 1,
                        row: id(101),
                        rowRevision: 1,
                        acknowledgement: 'metadata-only-no-stock',
                    };

                    /** Create an independent public host over one exact provider owner, including nested product invocation and durable receipts. */
                    const hostFor = (database = db, identity = who, sharedSql?: typeof SqlClient.SqlClient.Service) =>
                        Effect.gen(
                            /** Migrations and resource acquisition precede host registration, never inherit an arbitrary ambient transaction. */ function* () {
                                // Every host owns one coherent Storage/Resources composition, not an independently constructed Integrity engine.
                                const sql =
                                    sharedSql ?? Context.get(yield* Layer.build(database.open()), SqlClient.SqlClient);
                                yield* migrateResources(dialect, identity.tenant, definitions, {
                                    kind: 'additive',
                                    restartRequired: false,
                                    retainedGenerations: 0,
                                }).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                                const base = yield* resourceProvider(
                                    dialect,
                                    identity.tenant,
                                    {
                                        key: { module: 'inventory.sql', instance: 'primary' },
                                        version: '1.0.0',
                                    },
                                    definitions
                                ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                                const provider: ResourceProvider = {
                                    ...base,
                                    storage: {
                                        ...base.storage,
                                        /** Delay one real SQL-locked callback and observe a competing key acquisition without replacing persistence. */
                                        commit: (request, execute) =>
                                            Effect.gen(
                                                /** The second PostgreSQL transaction reaches its real key lock before rights are revoked. */ function* () {
                                                    // Only the selected unapplied row is held; nested product commits retain the original transaction owner.
                                                    const selected =
                                                        (yield* Ref.get(holdRow)) &&
                                                        request.key.includes(ApplyImportRow.name) &&
                                                        request.key.includes(id(102));
                                                    const n = selected
                                                        ? yield* Ref.updateAndGet(
                                                              arrivals,
                                                              /** Track transaction admission solely to coordinate the deterministic wait. */ (
                                                                  n
                                                              ) => n + 1
                                                          )
                                                        : 0;
                                                    if (n === 2) yield* Deferred.succeed(contender, undefined);
                                                    return yield* base.storage.commit(
                                                        request,
                                                        Effect.gen(
                                                            /** The callback starts only after actual action-key acquisition in the SQL adapter. */ function* () {
                                                                // Revalidation must follow the lock wait, not reuse the earlier successful source check.
                                                                if (n === 1) {
                                                                    yield* Deferred.succeed(locked, undefined);
                                                                    yield* Deferred.await(releaseLock);
                                                                }
                                                                return yield* execute;
                                                            }
                                                        )
                                                    );
                                                }
                                            ),
                                    },
                                    driver: {
                                        ...base.driver,
                                        /** Faults follow real nested product writes and target the later row confirmation, not a fake product store. */
                                        write: (resource, key, revision, value) =>
                                            Effect.gen(
                                                /** External fault state is intentionally not rolled back with SQL. */ function* () {
                                                    // Write real history first so the rollback assertion cannot pass merely because no product was attempted.
                                                    const written = yield* base.driver.write(
                                                        resource,
                                                        key,
                                                        revision,
                                                        value
                                                    );
                                                    const mode = yield* Ref.get(fault);
                                                    if (
                                                        resource.id === products.products.id &&
                                                        mode === 'permission-product'
                                                    )
                                                        yield* Ref.set(permitted, false);
                                                    if (resource.id === products.products.id && mode === 'flag-product')
                                                        yield* Ref.set(disabled, stockImportFlag.key);
                                                    if (
                                                        resource.id === products.products.id &&
                                                        mode === 'revoke-product'
                                                    )
                                                        yield* Ref.update(
                                                            rights,
                                                            /** Simulate rights lost during nested product execution. */ (
                                                                source
                                                            ) => ({
                                                                ...source,
                                                                evidence: { ...source.evidence, revoked: true },
                                                            })
                                                        );
                                                    if (resource.id === declarations.rows.id && revision > 0) {
                                                        if (mode === 'fail-row')
                                                            return yield* new ResourceFailure({
                                                                reason: 'storage',
                                                                detail: 'Synthetic confirmation outage',
                                                            });
                                                        if (mode === 'interrupt-row') {
                                                            yield* Deferred.succeed(reached, undefined);
                                                            return yield* Effect.never;
                                                        }
                                                    }
                                                    return written;
                                                }
                                            ),
                                    },
                                };
                                const resources = Context.get(
                                    yield* Layer.build(
                                        resourceRuntime(
                                            provider,
                                            /** Built-in tenant enforcement remains active; application controls are in the common host. */ () =>
                                                Effect.void
                                        )
                                    ),
                                    Resources
                                );
                                const fixture = yield* makeTestOnlyHarness(identity);
                                const services = Layer.mergeAll(
                                    fixture.TestOnly,
                                    durable.pipe(
                                        Layer.provide(Layer.succeed(Storage, provider.storage)),
                                        Layer.provide(Layer.succeed(CurrentTenant, { id: identity.tenant }))
                                    ),
                                    Layer.succeed(InputDigest, {
                                        /** Durable evidence contains only cryptographic hashes of private inputs. */
                                        digest: (bytes) =>
                                            Effect.sync(
                                                /** Pinned native crypto is already used by the existing product conformance fixture. */ () =>
                                                    createHash('sha256').update(bytes).digest('hex')
                                            ),
                                    }),
                                    Layer.succeed(Flags, {
                                        /** Default declarations remain false; only this synthetic fixture enables them. */
                                        evaluate: (flag) =>
                                            Ref.get(disabled).pipe(
                                                Effect.map(
                                                    /** Vary the two gates independently to catch accidental aliasing. */ (
                                                        key
                                                    ) => ({
                                                        ...safeDefault(flag),
                                                        value: flag.key !== key,
                                                        fallback: false,
                                                    })
                                                )
                                            ),
                                    }),
                                    Layer.succeed(Authorizer, {
                                        /** Current permission is independent of trusted source rights. */
                                        canInvoke: (_caller, action) =>
                                            Ref.get(permitted).pipe(
                                                Effect.flatMap(
                                                    /** Never accept the plan itself as a grant. */ (allowed) =>
                                                        allowed
                                                            ? Effect.void
                                                            : Effect.fail(
                                                                  new Forbidden({
                                                                      action: action.name,
                                                                      reason: 'permission',
                                                                  })
                                                              )
                                                )
                                            ),
                                        /** Host and feature observers get isolated targets; mutation must not reach accepted mappings. */
                                        check: (_caller, _action, target) =>
                                            Effect.sync(
                                                /** Rewrite a detached policy view as a hostile adapter control. */ () => {
                                                    // Accepted names must come from the review snapshot, not this mutable observer view.
                                                    if (Schema.is(StageImport.input)(target))
                                                        Reflect.set(target.reviews[0] ?? {}, 'name', 'MUTATED');
                                                }
                                            ),
                                    }),
                                    Layer.succeed(StockImportSources, {
                                        /** A trusted source service may refuse tenant/ID selection, never accept submitted CSV as permission. */
                                        load: (requestedTenant, requestedSource) =>
                                            requestedTenant === tenant && requestedSource === source.id
                                                ? Ref.get(beforeSource).pipe(
                                                      Effect.flatten,
                                                      Effect.zipRight(Ref.get(rights))
                                                  )
                                                : Effect.fail(new StockImportFailure({ reason: 'denied' })),
                                    })
                                );
                                const context = yield* Layer.build(services);
                                const host = Context.get(
                                    yield* Layer.build(ActionHostLive.pipe(Layer.provide(services))),
                                    ActionHost
                                );
                                const route = Context.add(
                                    Context.add(Context.add(context, Resources, resources), CurrentTenant, {
                                        id: identity.tenant,
                                    }),
                                    ActionHost,
                                    host
                                );
                                yield* host.register(yield* productModule.pipe(Effect.provide(route)));
                                yield* host.register(yield* stockImportModule.pipe(Effect.provide(route)));
                                return { host, sql, resources, fixture };
                            }
                        );
                    let key = 200;
                    /** Ordinary mutations use fresh keys, while row confirmation always retains its allocated row identity. */
                    const invoke = (host: typeof ActionHost.Service, action: string, input: unknown, presented = who) =>
                        host
                            .invoke(action, input, {
                                idempotencyKey:
                                    action === ApplyImportRow.name && Schema.is(ApplyImportRow.input)(input)
                                        ? input.row
                                        : id(key++),
                            })
                            .pipe(Effect.provideService(Caller, presented));
                    /** Read and decode through the public contract rather than inspecting a private feature helper. */
                    const get = (host: typeof ActionHost.Service) =>
                        invoke(host, GetImport.name, { id: stage.id }).pipe(
                            Effect.flatMap(Schema.decodeUnknown(ImportPlan))
                        );

                    yield* Effect.scoped(
                        Effect.gen(
                            /** Close every initial writer before the recovery phase; persisted SQL is the only surviving business state. */ function* () {
                                // Inject after product success, not before it, to exercise the nested savepoint's real rollback window.
                                const first = yield* hostFor();
                                const staged = yield* invoke(first.host, StageImport.name, stage).pipe(
                                    Effect.flatMap(Schema.decodeUnknown(ImportPlan))
                                );
                                expect(staged).toMatchObject({
                                    revision: 1,
                                    state: 'staged',
                                    rows: [
                                        {
                                            name: 'Reviewed lead',
                                            quantity: 7,
                                            quantityStatus: 'not-applied',
                                            state: 'pending',
                                        },
                                        { name: 'Reviewed spare', quantity: 0, unit: 'pack', state: 'pending' },
                                    ],
                                });
                                expect(staged.sourceDigest).toMatch(/^[a-f0-9]{64}$/);
                                expect(staged.planDigest).not.toBe(staged.sourceDigest);
                                expect(yield* Effect.flip(invoke(first.host, StageImport.name, stage))).toMatchObject({
                                    _tag: 'ActionFailed',
                                    error: { reason: 'conflict' },
                                });
                                yield* Ref.set(fault, 'fail-row');
                                expect(
                                    yield* Effect.flip(invoke(first.host, ApplyImportRow.name, apply))
                                ).toMatchObject({ _tag: 'ActionFailed' });
                                expect(yield* get(first.host)).toEqual(staged);
                                expect(
                                    yield* Effect.flip(invoke(first.host, GetProduct.name, { id: id(103) }))
                                ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                                expect(
                                    yield* first.sql`SELECT result FROM action_commit WHERE key LIKE ${'%inventory.product.create%'}`
                                ).toHaveLength(0);
                                yield* Ref.set(fault, 'interrupt-row');
                                const fiber = yield* Effect.fork(invoke(first.host, ApplyImportRow.name, apply));
                                yield* Deferred.await(reached);
                                yield* Fiber.interrupt(fiber);
                                expect(yield* get(first.host)).toEqual(staged);
                                expect(
                                    yield* Effect.flip(invoke(first.host, GetProduct.name, { id: id(103) }))
                                ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                                yield* Ref.set(fault, 'revoke-product');
                                expect(
                                    yield* Effect.flip(invoke(first.host, ApplyImportRow.name, apply))
                                ).toMatchObject({ _tag: 'ActionFailed' });
                                yield* Ref.set(rights, current);
                                expect(yield* get(first.host)).toEqual(staged);
                                yield* Ref.set(fault, 'none');
                                for (const mode of ['permission-product', 'flag-product'] as const) {
                                    yield* Ref.set(fault, mode);
                                    expect(
                                        yield* Effect.flip(invoke(first.host, ApplyImportRow.name, apply))
                                    ).toMatchObject({ _tag: 'ActionFailed' });
                                    yield* Ref.set(permitted, true);
                                    yield* Ref.set(disabled, '');
                                    expect(yield* get(first.host)).toEqual(staged);
                                    expect(
                                        yield* Effect.flip(invoke(first.host, GetProduct.name, { id: id(103) }))
                                    ).toMatchObject({ error: { _tag: 'ProductNotFound' } });
                                }
                                yield* Ref.set(fault, 'none');
                            }
                        )
                    );

                    const recovered = yield* hostFor();
                    const competing = yield* hostFor(db, who, dialect === 'sqlite' ? recovered.sql : undefined);
                    // Same-row confirms share one stable outer host key; both replies reconcile to one retained business mutation.
                    const race = yield* Effect.all(
                        [
                            invoke(recovered.host, ApplyImportRow.name, apply),
                            invoke(competing.host, ApplyImportRow.name, apply),
                        ],
                        { concurrency: 2 }
                    );
                    expect(race[0]).toEqual(race[1]);
                    const applied = yield* Schema.decodeUnknown(ImportPlan)(race[0]);
                    expect(applied).toMatchObject({
                        revision: 2,
                        state: 'staged',
                        rows: [{ state: 'metadata-applied', stock: 'stock-pending' }, { state: 'pending' }],
                    });
                    expect(yield* invoke(recovered.host, GetProduct.name, { id: id(103) })).toEqual({
                        id: id(103),
                        revision: 1,
                        name: 'Reviewed lead',
                        sku: 'S-1',
                        category: 'cables',
                        tracking: 'bulk',
                        unit: 'each',
                        archived: false,
                    });
                    const original = yield* recovered.sql`SELECT key, result FROM action_commit ORDER BY key`;
                    // Simulate a lost acknowledgement by discarding the first reply and reopening an independent host before retrying its exact key/input.
                    const retry = yield* hostFor();
                    expect(yield* invoke(retry.host, ApplyImportRow.name, apply)).toEqual(applied);
                    expect(yield* retry.sql`SELECT key, result FROM action_commit ORDER BY key`).toEqual(original);
                    expect(
                        yield* invoke(retry.host, ListProducts.name, { limit: 100, includeArchived: true })
                    ).toMatchObject({ products: [{ id: id(103), revision: 1 }] });
                    expect(
                        yield* Effect.flip(invoke(retry.host, ApplyImportRow.name, { ...apply, revision: 2 }))
                    ).toMatchObject({ _tag: 'InvocationDenied', reason: 'input-changed' });
                    expect(
                        yield* Effect.flip(
                            invoke(retry.host, ApplyImportRow.name, { ...apply, row: id(102), revision: 1 })
                        )
                    ).toMatchObject({ _tag: 'ActionFailed', error: { reason: 'conflict' } });

                    // Identical replay is deliberately exercised for every independent live authority control.
                    for (const changed of [
                        { ...current, evidence: { ...current.evidence, revoked: true } },
                        { ...current, csv: current.csv.replace(',,7', ',,8') },
                        { ...current, evidence: { ...current.evidence, id: id(999) } },
                        { ...current, evidence: { ...current.evidence, validUntil: now } },
                        { ...current, evidence: { ...current.evidence, reviewedAt: now - 30 * day } },
                        { ...current, tenant: TenantId.make(id(888)) },
                        { ...current, csv: 'malformed', privateCanary: 'never-echo' },
                    ]) {
                        yield* Ref.set(rights, changed);
                        expect(yield* Effect.flip(invoke(retry.host, ApplyImportRow.name, apply))).toMatchObject({
                            _tag: 'Forbidden',
                        });
                        expect(
                            yield* Effect.flip(
                                invoke(retry.host, ApplyImportRow.name, { ...apply, row: id(102), revision: 2 })
                            )
                        ).toMatchObject({ _tag: 'Forbidden' });
                    }
                    yield* Ref.set(rights, current);
                    for (const flag of [stockImportFlag.key, inventoryFlag.key]) {
                        yield* Ref.set(disabled, flag);
                        expect((yield* Effect.flip(invoke(retry.host, ApplyImportRow.name, apply)))._tag).toBe(
                            'Unavailable'
                        );
                    }
                    yield* Ref.set(disabled, '');
                    yield* Ref.set(permitted, false);
                    expect((yield* Effect.flip(invoke(retry.host, ApplyImportRow.name, apply)))._tag).toBe('Forbidden');
                    yield* Ref.set(permitted, true);
                    yield* Ref.set(retry.fixture.identityActive, false);
                    expect((yield* Effect.flip(invoke(retry.host, ApplyImportRow.name, apply)))._tag).toBe(
                        'InvocationDenied'
                    );
                    yield* Ref.set(retry.fixture.identityActive, true);
                    yield* Ref.set(retry.fixture.identity, { ...who, subject: SubjectId.make(id(777)) });
                    expect((yield* Effect.flip(invoke(retry.host, ApplyImportRow.name, apply)))._tag).toBe('Forbidden');
                    yield* Ref.set(retry.fixture.identity, who);
                    // Revoke a gate/permission inside a suspended source authority call after initial admission.
                    for (const change of [Ref.set(disabled, stockImportFlag.key), Ref.set(permitted, false)]) {
                        const entered = yield* Deferred.make<void>();
                        const release = yield* Deferred.make<void>();
                        yield* Ref.set(
                            beforeSource,
                            Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Deferred.await(release)))
                        );
                        const replay = yield* Effect.fork(Effect.flip(invoke(retry.host, ApplyImportRow.name, apply)));
                        yield* Deferred.await(entered);
                        yield* change;
                        yield* Ref.set(beforeSource, Effect.void);
                        yield* Deferred.succeed(release, undefined);
                        expect((yield* Fiber.join(replay))._tag).toBe('Forbidden');
                        yield* Ref.set(disabled, '');
                        yield* Ref.set(permitted, true);
                    }
                    // Hold the actual action-key transaction before its revalidation callback, then revoke source rights.
                    yield* Ref.set(holdRow, true);
                    const lockedInput = { ...apply, row: id(102), revision: 2 };
                    const waiting = yield* Effect.fork(
                        Effect.flip(invoke(recovered.host, ApplyImportRow.name, lockedInput))
                    );
                    yield* Deferred.await(locked);
                    const secondWaiter =
                        dialect === 'postgres'
                            ? yield* Effect.fork(Effect.flip(invoke(competing.host, ApplyImportRow.name, lockedInput)))
                            : undefined;
                    if (secondWaiter) yield* Deferred.await(contender);
                    yield* Ref.set(rights, { ...current, evidence: { ...current.evidence, revoked: true } });
                    yield* Deferred.succeed(releaseLock, undefined);
                    expect((yield* Fiber.join(waiting))._tag).toBe('Forbidden');
                    if (secondWaiter) expect((yield* Fiber.join(secondWaiter))._tag).toBe('Forbidden');
                    yield* Ref.set(holdRow, false);
                    yield* Ref.set(rights, current);
                    expect(yield* get(retry.host)).toMatchObject({
                        revision: 2,
                        rows: [{ state: 'metadata-applied' }, { state: 'pending' }],
                    });
                    expect(yield* Effect.flip(invoke(retry.host, GetProduct.name, { id: id(104) }))).toMatchObject({
                        error: { _tag: 'ProductNotFound' },
                    });
                    expect(
                        yield* Effect.flip(invoke(retry.host, CancelImport.name, { id: stage.id, revision: 1 }))
                    ).toMatchObject({ error: { reason: 'conflict' } });
                    expect(yield* invoke(retry.host, CancelImport.name, { id: stage.id, revision: 2 })).toMatchObject({
                        state: 'cancelled',
                        revision: 3,
                    });
                    expect(
                        yield* Effect.flip(
                            invoke(retry.host, ApplyImportRow.name, { ...apply, row: id(102), revision: 3 })
                        )
                    ).toMatchObject({ error: { reason: 'cancelled' } });
                    expect(yield* invoke(retry.host, ApplyImportRow.name, apply)).toEqual(applied);
                    expect(yield* invoke(retry.host, GetProduct.name, { id: id(103) })).toMatchObject({ revision: 1 });
                    expect(yield* get((yield* hostFor()).host)).toMatchObject({ revision: 3, state: 'cancelled' });

                    // A new reviewed plan may not upsert an existing or archived SKU/ID; nested product authority stays the sole writer.
                    const conflictPlan = {
                        ...stage,
                        id: id(300),
                        reviews: stage.reviews.map(
                            /** Allocate distinct immutable identities without changing the evidence-derived SKUs. */ (
                                row,
                                index
                            ) => ({ ...row, id: id(301 + index), product: id(311 + index) })
                        ),
                    };
                    yield* invoke(retry.host, StageImport.name, conflictPlan);
                    expect(
                        (yield* Effect.either(
                            invoke(retry.host, ApplyImportRow.name, { ...apply, id: id(300), row: id(301) })
                        ))._tag
                    ).toBe('Left');
                    expect(yield* invoke(retry.host, GetImport.name, { id: id(300) })).toMatchObject({
                        revision: 1,
                        rows: [{ state: 'pending' }, { state: 'pending' }],
                    });
                    expect(
                        yield* Effect.flip(
                            invoke(retry.host, ApplyImportRow.name, {
                                ...apply,
                                id: id(300),
                                row: id(301),
                                rowRevision: 2,
                            })
                        )
                    ).toMatchObject({ error: { reason: 'conflict' } });

                    yield* invoke(retry.host, ArchiveProduct.name, { id: id(103), revision: 1 });
                    expect(
                        (yield* Effect.either(
                            invoke(retry.host, ApplyImportRow.name, { ...apply, id: id(300), row: id(301) })
                        ))._tag
                    ).toBe('Left');
                    expect(yield* invoke(retry.host, GetImport.name, { id: id(300) })).toMatchObject({ revision: 1 });
                    expect(yield* invoke(retry.host, GetProduct.name, { id: id(103) })).toMatchObject({
                        revision: 2,
                        archived: true,
                    });

                    // Resources intentionally binds one database to one tenant; refuse misrouting before opening its separate database.
                    const otherWho = { ...who, tenant: TenantId.make(id(800)) };
                    expect(yield* Effect.flip(hostFor(db, otherWho))).toMatchObject({
                        _tag: 'ResourceFailure',
                        reason: 'denied',
                    });
                    const otherDb = yield* importDatabase(dialect);
                    const other = yield* hostFor(otherDb, otherWho);
                    expect(
                        (yield* Effect.flip(invoke(other.host, GetImport.name, { id: stage.id }, otherWho)))._tag
                    ).toBe('Forbidden');
                    expect((yield* Effect.flip(invoke(other.host, ApplyImportRow.name, apply, otherWho)))._tag).toBe(
                        'Forbidden'
                    );
                    expect(
                        yield* invoke(
                            other.host,
                            CreateProduct.name,
                            {
                                id: id(103),
                                product: {
                                    name: 'Other tenant',
                                    sku: 'S-1',
                                    category: 'private',
                                    tracking: 'bulk',
                                    unit: 'each',
                                },
                            },
                            otherWho
                        )
                    ).toMatchObject({ revision: 1, name: 'Other tenant' });

                    const singleSource = { ...current, csv: `${header}\nS-3,Fixture Audio,A-10,,11` };
                    yield* Ref.set(rights, singleSource);
                    const single = {
                        ...stage,
                        id: id(400),
                        reviews: [{ ...stage.reviews[0], id: id(401), product: id(403) }],
                    };
                    yield* invoke(retry.host, StageImport.name, single);
                    expect(
                        yield* invoke(retry.host, ApplyImportRow.name, { ...apply, id: id(400), row: id(401) })
                    ).toMatchObject({
                        state: 'metadata-applied',
                        rows: [{ quantity: 11, quantityStatus: 'not-applied', stock: 'stock-pending' }],
                    });
                    yield* Ref.set(rights, current);

                    for (const invalid of [
                        { ...stage, id: id(500), reviews: [stage.reviews[0]] },
                        { ...stage, id: id(500), references: [] },
                        { ...stage, id: id(500), reviews: [stage.reviews[0], stage.reviews[0]] },
                        { ...stage, id: id(500), reviews: [{ ...stage.reviews[0], id: id(500) }, stage.reviews[1]] },
                        {
                            ...stage,
                            id: id(500),
                            reviews: [{ ...stage.reviews[0], product: id(101) }, stage.reviews[1]],
                        },
                    ])
                        expect((yield* Effect.either(invoke(retry.host, StageImport.name, invalid)))._tag).toBe('Left');

                    const manySource = {
                        ...current,
                        csv:
                            header +
                            '\n' +
                            Array.from(
                                { length: 101 },
                                /** Distinct SKU and asymmetric quantities catch truncated resource paging without duplicate-SKU refusal. */ (
                                    _,
                                    index
                                ) => `PAGE-${index},Fixture Audio,A-10,,${index}`
                            ).join('\n'),
                    };
                    yield* Ref.set(rights, manySource);
                    const many = {
                        ...stage,
                        id: id(600),
                        reviews: Array.from(
                            { length: 101 },
                            /** Product/row UUID namespaces remain disjoint across all source positions. */ (
                                _,
                                index
                            ) => ({
                                ...stage.reviews[0],
                                row: index + 1,
                                id: id(1000 + index),
                                product: id(2000 + index),
                            })
                        ),
                    };
                    const paged = yield* invoke(retry.host, StageImport.name, many).pipe(
                        Effect.flatMap(Schema.decodeUnknown(ImportPlan))
                    );
                    expect(paged.rows).toHaveLength(101);
                    expect(paged.rows[100]).toMatchObject({ row: 101, quantity: 100, sku: 'PAGE-100' });
                }
            ),
        120000
    );
}
