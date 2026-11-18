/**
 * @file tests/runtime/src/settings.spec.ts
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

import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, it } from '@effect/vitest';
import { Authorizer, Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { ActionInventory, validateParity } from '@eventiva/contracts/inventory';
import { ResourceFailure } from '@eventiva/contracts/resource';
import { type SettingDefinition, settingsRead, settingsWrite, settingsResource } from '@eventiva/contracts/settings';
import { CurrentTenant, Storage } from '@eventiva/contracts/storage';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { migrateResources, resourceProvider } from '@eventiva/integrations.sql/resource';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { InputDigest } from '@eventiva/runtime/invocation';
import { resourceRuntime } from '@eventiva/runtime/resource';
import { settingsModule } from '@eventiva/runtime/settings';
import { durable } from '@eventiva/runtime/storage';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { Deferred, Effect, Exit, Fiber, Layer, Redacted, Ref } from 'effect';

/** Stable, asymmetric UUID identities make tenant and principal substitution observable. */
const id = (suffix: string) => `019b0000-0000-7000-8000-${suffix.padStart(12, '0')}`;
const tenant = TenantId.make(id('a'));
const alice = { subject: SubjectId.make(id('ab')), tenant, kind: 'human' as const, session: SessionId.make(id('c')) };
const target = { module: 'calendar', instance: 'primary', key: 'page-size', scope: 'user' } as const;
const definitions: ReadonlyArray<SettingDefinition> = [
    { ...target, classification: 'non-secret', purpose: 'preference', type: 'integer', default: 25 },
    {
        ...target,
        instance: 'secondary',
        classification: 'non-secret',
        purpose: 'preference',
        type: 'integer',
        default: 50,
    },
    { ...target, scope: 'tenant', classification: 'non-secret', purpose: 'preference', type: 'integer', default: 10 },
    { ...target, scope: 'app', classification: 'non-secret', purpose: 'preference', type: 'integer', default: 100 },
    { ...target, module: 'contacts', classification: 'non-secret', purpose: 'preference', type: 'integer', default: 8 },
    { ...target, key: 'compact', classification: 'non-secret', purpose: 'preference', type: 'boolean', default: false },
    { ...target, key: 'label', classification: 'non-secret', purpose: 'preference', type: 'text', default: 'Agenda' },
];

/** Allocate an orb-private disposable real SQLite directory and always remove it after client finalizers close. */
const database = <A, E, R>(
    /** Run against one private filename; reconnects must open it independently. */
    run: (filename: string) => Effect.Effect<A, E, R>
) =>
    Effect.acquireUseRelease(
        Effect.sync(
            /** Keep synthetic database files outside tracked source and user review artifacts. */ () => {
                // Only this newly allocated directory belongs to the fixture; cleanup must not remove shared backup state.
                const root = fileURLToPath(new URL('../../../.amp/in/orb-backup/', import.meta.url));
                mkdirSync(root, { recursive: true });
                return mkdtempSync(`${root}settings-`);
            }
        ),
        /** Share only the filename across separately scoped client acquisitions. */ (directory) =>
            run(`${directory}/tenant.sqlite`),
        /** Remove synthetic records only after every scoped connection is released. */ (directory) =>
            Effect.sync(
                /** Cleanup never touches another fixture's directory. */ () =>
                    rmSync(directory, { recursive: true, force: true })
            )
    );

/** Reopen actual Resources plus its matching durable host transaction owner, with independently mutable live test policy. */
const session = <A, E, R>(
    filename: string,
    currentTenant: TenantId,
    /** Exercise only the public host and inventory; fixture controls simulate trusted-state changes. */
    run: (
        host: typeof ActionHost.Service,
        fixture: Effect.Effect.Success<ReturnType<typeof makeTestOnlyHarness>>,
        enabled: Ref.Ref<boolean>,
        allowed: Ref.Ref<boolean>,
        module: Effect.Effect.Success<ReturnType<typeof settingsModule>>
    ) => Effect.Effect<A, E, R | ActionInventory>
) =>
    Effect.scoped(
        Effect.gen(
            /** Compose a fresh client/host without carrying any preference cache across reconnects. */ function* () {
                // Resources and the durable ledger share one SQL owner; reconnect passes only a filename, never retained services.
                const resource = yield* settingsResource;
                const migrations = yield* load(
                    fileURLToPath(new URL('../../../storage/migrations/sqlite', import.meta.url))
                );
                yield* migrate('sqlite', migrations);
                yield* migrateResources('sqlite', currentTenant, [resource], {
                    kind: 'additive',
                    restartRequired: false,
                    retainedGenerations: 0,
                });
                const provider = yield* resourceProvider(
                    'sqlite',
                    currentTenant,
                    { key: { module: 'eventiva.sql', instance: 'primary' }, version: '1.0.0' },
                    [resource]
                );
                const enabled = yield* Ref.make(true);
                const allowed = yield* Ref.make(true);
                const resourceContext = yield* Layer.build(
                    resourceRuntime(
                        provider,
                        /** Recheck fixture resource policy on every storage operation. */ () =>
                            Ref.get(allowed).pipe(
                                Effect.flatMap(
                                    /** A revoked storage grant cannot be replaced by action permission. */ (value) =>
                                        value
                                            ? Effect.void
                                            : Effect.fail(
                                                  new ResourceFailure({ reason: 'denied', detail: 'Fixture denial' })
                                              )
                                )
                            )
                    )
                );
                const fixture = yield* makeTestOnlyHarness({ ...alice, tenant: currentTenant });
                const durableContext = yield* Layer.build(
                    durable.pipe(
                        Layer.provide(Layer.succeed(Storage, provider.storage)),
                        Layer.provide(Layer.succeed(CurrentTenant, { id: currentTenant }))
                    )
                );
                const services = Layer.mergeAll(
                    fixture.TestOnly,
                    Layer.succeedContext(durableContext),
                    Layer.succeedContext(resourceContext),
                    Layer.succeed(CurrentTenant, { id: currentTenant }),
                    Layer.succeed(InputDigest, {
                        /** Use real SHA-256 rather than the harness's deliberately noncryptographic digest. */ digest: (
                            text
                        ) =>
                            Effect.sync(
                                /** Hash synthetic canonical bytes without logging them. */ () =>
                                    createHash('sha256').update(text).digest('hex')
                            ),
                    }),
                    Layer.succeed(Flags, {
                        /** Model a live provider while preserving the declaration's safe default in production. */ evaluate:
                            (flag) =>
                                Ref.get(enabled).pipe(
                                    Effect.map(
                                        /** Return the current explicit fixture targeting value. */ (value) => ({
                                            flag: flag.key,
                                            value,
                                            reason: 'STATIC',
                                            fallback: false,
                                        })
                                    )
                                ),
                    })
                );
                return yield* Effect.gen(
                    /** Register real settings actions, never handler-only or metadata-only stand-ins. */ function* () {
                        // Check duplicate rejection before installing the valid control so partial registration cannot explain later results.
                        const host = yield* ActionHost;
                        expect((yield* settingsModule([...definitions, ...definitions]).pipe(Effect.flip)).reason).toBe(
                            'invalid-definition'
                        );
                        const module = yield* settingsModule(definitions);
                        yield* host.register(module);
                        return yield* run(host, fixture, enabled, allowed, module);
                    }
                ).pipe(
                    Effect.provide(ActionHostLive.pipe(Layer.provideMerge(services))),
                    Effect.provideService(Caller, { ...alice, tenant: currentTenant })
                );
            }
        ).pipe(Effect.provide(localFile(Redacted.make(filename))))
    );

it.scoped(
    'persists defaults versus stored values and isolates canonical users, tenants and module instances across reconnect',
    /** The second host opens a new SQL client after the first has closed. */ () =>
        database(
            /** Retain no first-session services between writer and reader. */ (filename) =>
                Effect.gen(
                    /** Assert independently specified values for every identity boundary. */ function* () {
                        // Distinct stored values, defaults and fresh connections distinguish scope isolation from a shared preference cache.
                        yield* session(
                            filename,
                            tenant,
                            /** Write as canonical Alice even when presented claims name Bob. */ (host, fixture) =>
                                Effect.gen(
                                    /** Exercise whitelist, defaults, revisions and canonical user binding through public actions. */ function* () {
                                        // Keep presented claims different from resolved identity; the already-authorized canonical subject must own the row.
                                        expect(yield* host.invoke(settingsRead.name, target)).toEqual({
                                            value: '25',
                                            source: 'default',
                                            revision: 0,
                                        });
                                        expect(
                                            yield* host.invoke(
                                                settingsWrite.name,
                                                { ...target, value: '25', expectedRevision: 0 },
                                                { idempotencyKey: 'create' }
                                            )
                                        ).toEqual({ value: '25', source: 'stored', revision: 1 });
                                        expect(
                                            yield* host.invoke(
                                                settingsWrite.name,
                                                { ...target, value: '37', expectedRevision: 1 },
                                                { idempotencyKey: 'change' }
                                            )
                                        ).toEqual({ value: '37', source: 'stored', revision: 2 });
                                        expect(
                                            yield* host.invoke(settingsRead.name, target).pipe(
                                                Effect.provideService(Caller, {
                                                    ...alice,
                                                    subject: SubjectId.make(id('ff')),
                                                })
                                            )
                                        ).toEqual({ value: '37', source: 'stored', revision: 2 });
                                        yield* Ref.set(fixture.identity, {
                                            ...alice,
                                            subject: SubjectId.make(alice.subject.toUpperCase()),
                                        });
                                        expect(yield* host.invoke(settingsRead.name, target)).toEqual({
                                            value: '37',
                                            source: 'stored',
                                            revision: 2,
                                        });
                                        yield* Ref.set(fixture.identity, {
                                            ...alice,
                                            subject: SubjectId.make(id('dd')),
                                        });
                                        expect(yield* host.invoke(settingsRead.name, target)).toEqual({
                                            value: '25',
                                            source: 'default',
                                            revision: 0,
                                        });
                                        yield* host.invoke(
                                            settingsWrite.name,
                                            { ...target, value: '62', expectedRevision: 0 },
                                            { idempotencyKey: 'bob' }
                                        );
                                        expect(
                                            yield* host.invoke(settingsRead.name, { ...target, instance: 'secondary' })
                                        ).toEqual({ value: '50', source: 'default', revision: 0 });
                                        yield* host.invoke(
                                            settingsWrite.name,
                                            { ...target, instance: 'secondary', value: '59', expectedRevision: 0 },
                                            { idempotencyKey: 'secondary' }
                                        );
                                        expect(
                                            yield* host.invoke(settingsRead.name, { ...target, module: 'contacts' })
                                        ).toEqual({ value: '8', source: 'default', revision: 0 });
                                        yield* host.invoke(
                                            settingsWrite.name,
                                            { ...target, module: 'contacts', value: '86', expectedRevision: 0 },
                                            { idempotencyKey: 'contacts' }
                                        );
                                        for (const [key, value] of [
                                            ['compact', 'true'],
                                            ['label', JSON.stringify('\u0000'.repeat(4096))],
                                        ] as const) {
                                            expect(
                                                yield* host.invoke(
                                                    settingsWrite.name,
                                                    { ...target, key, value, expectedRevision: 0 },
                                                    { idempotencyKey: key }
                                                )
                                            ).toEqual({ value, source: 'stored', revision: 1 });
                                            expect(yield* host.invoke(settingsRead.name, { ...target, key })).toEqual({
                                                value,
                                                source: 'stored',
                                                revision: 1,
                                            });
                                        }
                                        yield* host.invoke(
                                            settingsWrite.name,
                                            { ...target, scope: 'tenant', value: '18', expectedRevision: 0 },
                                            { idempotencyKey: 'tenant' }
                                        );
                                        yield* Ref.set(fixture.identity, alice);
                                        expect(
                                            yield* host.invoke(settingsRead.name, { ...target, scope: 'tenant' })
                                        ).toEqual({ value: '18', source: 'stored', revision: 1 });
                                        expect(yield* host.invoke(settingsRead.name, target)).toEqual({
                                            value: '37',
                                            source: 'stored',
                                            revision: 2,
                                        });
                                    }
                                )
                        );
                        yield* session(
                            filename,
                            tenant,
                            /** Reconnect must preserve both explicit stored-default and changed values. */ (host) =>
                                Effect.gen(
                                    /** Verify persistence without reusing the old SQL pool or module. */ function* () {
                                        // Independently specified user and tenant results catch both lost persistence and accidental scope conflation.
                                        expect(yield* host.invoke(settingsRead.name, target)).toEqual({
                                            value: '37',
                                            source: 'stored',
                                            revision: 2,
                                        });
                                        expect(
                                            yield* host.invoke(settingsRead.name, { ...target, scope: 'tenant' })
                                        ).toEqual({ value: '18', source: 'stored', revision: 1 });
                                    }
                                )
                        );
                        yield* database(
                            /** A separate database models the existing database-per-tenant route contract. */ (
                                other
                            ) =>
                                session(
                                    other,
                                    TenantId.make(id('ee')),
                                    /** The same principal and declaration must not observe Alice's first tenant value. */ (
                                        host
                                    ) =>
                                        host.invoke(settingsRead.name, target).pipe(
                                            Effect.tap(
                                                /** Tenant isolation has a concrete default/revision oracle. */ (
                                                    value
                                                ) =>
                                                    Effect.sync(
                                                        /** Compare the complete absence result. */ () =>
                                                            expect(value).toEqual({
                                                                value: '25',
                                                                source: 'default',
                                                                revision: 0,
                                                            })
                                                    )
                                            )
                                        )
                                )
                        );
                    }
                )
        )
);

it.scoped(
    'enforces schema, conflict, app-scope refusal, inventory parity and live authorization/flag gates',
    /** Exercise actual action dispatch and discovery against the same registered module. */ () =>
        database(
            /** Every case uses a disposable durable owner rather than a volatile ledger. */ (filename) =>
                session(
                    filename,
                    tenant,
                    /** Independently revoke flag, action and resource permissions. */ (
                        host,
                        fixture,
                        enabled,
                        allowed
                    ) =>
                        Effect.gen(
                            /** Deliberately choose both sides of every admission boundary. */ function* () {
                                // Establish successful discovery and writes before revoking independent gates, avoiding reject-all false passes.
                                const inventory = yield* ActionInventory;
                                const listed = yield* inventory.list(alice);
                                expect(
                                    listed.map(/** Compare canonical advertised action names. */ (action) => action.id)
                                ).toEqual(['settings.read', 'settings.write']);
                                yield* validateParity(
                                    listed,
                                    {
                                        server: [settingsRead, settingsWrite].map(
                                            /** Use the actual specifications, not a duplicate inventory list. */ (
                                                spec
                                            ) => ({ id: spec.name, version: spec.version, permission: spec.permission })
                                        ),
                                    },
                                    ['server']
                                );
                                for (const [input, reason] of [
                                    [{ ...target, key: 'missing', value: '3', expectedRevision: 0 }, 'undeclared'],
                                    [{ ...target, value: 'false', expectedRevision: 0 }, 'invalid-value'],
                                    [{ ...target, value: '{bad-json', expectedRevision: 0 }, 'invalid-value'],
                                    [{ ...target, value: 'null', expectedRevision: 0 }, 'invalid-value'],
                                    [{ ...target, value: '{}', expectedRevision: 0 }, 'invalid-value'],
                                    [
                                        { ...target, value: `${' '.repeat(24578)}1`, expectedRevision: 0 },
                                        'invalid-value',
                                    ],
                                    [
                                        { ...target, value: JSON.stringify('x'.repeat(4097)), expectedRevision: 0 },
                                        'invalid-value',
                                    ],
                                    [{ ...target, value: '1', expectedRevision: -1 }, 'invalid-value'],
                                    [{ ...target, value: '1', expectedRevision: 2147483647 }, 'invalid-value'],
                                    [{ ...target, module: 'BAD', value: '1', expectedRevision: 0 }, 'invalid-value'],
                                    [
                                        { ...target, scope: 'app', value: '7', expectedRevision: 0 },
                                        'app-scope-unavailable',
                                    ],
                                    [{ ...target, value: '3', expectedRevision: 1 }, 'conflict'],
                                ] as const) {
                                    expect(
                                        yield* host
                                            .invoke(settingsWrite.name, input, {
                                                idempotencyKey: `${reason}-${input.value.length}-${input.module}-${input.expectedRevision}`,
                                            })
                                            .pipe(Effect.flip)
                                    ).toMatchObject({ _tag: 'ActionFailed', error: { reason } });
                                }
                                expect(
                                    yield* host
                                        .invoke(settingsRead.name, { ...target, owner: alice.subject })
                                        .pipe(Effect.flip)
                                ).toMatchObject({ _tag: 'InvalidInput' });
                                expect(
                                    yield* host.invoke(settingsRead.name, { ...target, scope: 'app' }).pipe(Effect.flip)
                                ).toMatchObject({ error: { reason: 'app-scope-unavailable' } });
                                yield* host.invoke(
                                    settingsWrite.name,
                                    { ...target, value: '91', expectedRevision: 0 },
                                    { idempotencyKey: 'winner' }
                                );
                                expect(
                                    yield* host
                                        .invoke(
                                            settingsWrite.name,
                                            { ...target, value: '92', expectedRevision: 0 },
                                            { idempotencyKey: 'stale' }
                                        )
                                        .pipe(Effect.flip)
                                ).toMatchObject({ error: { reason: 'conflict' } });
                                expect(
                                    yield* host.invoke(
                                        settingsWrite.name,
                                        { ...target, value: '91', expectedRevision: 0 },
                                        { idempotencyKey: 'winner' }
                                    )
                                ).toEqual({ value: '91', source: 'stored', revision: 1 });
                                const competitors = yield* Effect.all(
                                    ['63', '84'].map(
                                        /** Compete with the same expected revision but distinct valid write intents. */ (
                                            value
                                        ) =>
                                            host
                                                .invoke(
                                                    settingsWrite.name,
                                                    { ...target, instance: 'secondary', value, expectedRevision: 0 },
                                                    { idempotencyKey: `race-${value}` }
                                                )
                                                .pipe(Effect.either)
                                    ),
                                    { concurrency: 'unbounded' }
                                );
                                expect(
                                    competitors.filter(
                                        /** Count committed public results. */ (result) => result._tag === 'Right'
                                    )
                                ).toHaveLength(1);
                                const loser = competitors.find(
                                    /** Identify the independently rejected contender. */ (result) =>
                                        result._tag === 'Left'
                                );
                                expect(loser).toMatchObject({ _tag: 'Left', left: { error: { reason: 'conflict' } } });
                                const winner = competitors.find(
                                    /** Recover the actual winner without assuming scheduling order. */ (result) =>
                                        result._tag === 'Right'
                                );
                                expect(winner).toMatchObject({
                                    _tag: 'Right',
                                    right: { source: 'stored', revision: 1 },
                                });
                                if (winner?._tag === 'Right')
                                    expect(
                                        yield* host.invoke(settingsRead.name, { ...target, instance: 'secondary' })
                                    ).toEqual(winner.right);
                                yield* Ref.set(enabled, false);
                                expect(yield* inventory.list(alice)).toEqual([]);
                                expect(yield* host.invoke(settingsRead.name, target).pipe(Effect.flip)).toMatchObject({
                                    _tag: 'Unavailable',
                                    reason: 'flag-off',
                                });
                                yield* Ref.set(enabled, true);
                                yield* Ref.set(fixture.authorization, { invoke: false, input: true });
                                expect(yield* inventory.list(alice)).toEqual([]);
                                expect(
                                    yield* host
                                        .invoke(
                                            settingsWrite.name,
                                            { ...target, value: '91', expectedRevision: 0 },
                                            { idempotencyKey: 'winner' }
                                        )
                                        .pipe(Effect.flip)
                                ).toMatchObject({ _tag: 'Forbidden' });
                                yield* Ref.set(fixture.authorization, { invoke: true, input: false });
                                expect(yield* host.invoke(settingsRead.name, target).pipe(Effect.flip)).toMatchObject({
                                    _tag: 'Forbidden',
                                });
                                yield* Ref.set(fixture.authorization, { invoke: true, input: true });
                                yield* Ref.set(allowed, false);
                                expect(yield* host.invoke(settingsRead.name, target).pipe(Effect.flip)).toMatchObject({
                                    error: { reason: 'denied' },
                                });
                                yield* Ref.set(allowed, true);
                                expect(yield* host.invoke(settingsRead.name, target)).toEqual({
                                    value: '91',
                                    source: 'stored',
                                    revision: 1,
                                });
                            }
                        )
                )
        )
);

it.scoped(
    'keeps canonical authority private per preparation and clears failed, stale and consumed admission',
    /** Interleave real settings bindings independently of the host sequence to challenge the local bridge. */ () =>
        database(
            /** Keep distinct stored values so crossover is observable rather than merely an absence check. */ (
                filename
            ) =>
                session(
                    filename,
                    tenant,
                    /** Prepare two callers against one registered binding and reverse their run order. */ (
                        host,
                        fixture,
                        _enabled,
                        allowed,
                        module
                    ) =>
                        Effect.gen(
                            /** Capture and corrupt caller references while preserving independently authorized identities. */ function* () {
                                const bob = { ...alice, subject: SubjectId.make(id('dd')) };
                                yield* host.invoke(
                                    settingsWrite.name,
                                    { ...target, value: '41', expectedRevision: 0 },
                                    { idempotencyKey: 'alice' }
                                );
                                yield* Ref.set(fixture.identity, bob);
                                yield* host.invoke(
                                    settingsWrite.name,
                                    { ...target, value: '72', expectedRevision: 0 },
                                    { idempotencyKey: 'bob' }
                                );
                                yield* Ref.set(fixture.identity, alice);
                                const binding = module.actions.find(
                                    /** Select the real read binding, not an exported private helper. */ (action) =>
                                        action.spec.name === settingsRead.name
                                );
                                if (!binding) return yield* Effect.dieMessage('Missing settings read binding');
                                const retained: Array<CallerIdentity> = [];
                                const allow = Authorizer.of({
                                    /** The prepared boundary delegates coarse permission to its host; this test isolates decoded-target admission. */ canInvoke:
                                        () => Effect.void,
                                    /** Retain an external reference to challenge snapshot ownership after successful authorization. */ check: (
                                        caller
                                    ) =>
                                        Effect.sync(
                                            /** Mutating this reference later must not affect the private snapshot. */ () => {
                                                retained.push(caller);
                                            }
                                        ),
                                });
                                const deny = Authorizer.of({
                                    /** Model a revoked grant without providing reusable successful authority. */ canInvoke:
                                        () =>
                                            Effect.fail(
                                                new Forbidden({ action: settingsRead.name, reason: 'revoked' })
                                            ),
                                    /** Fail the live target recheck, including after a previous success. */ check: () =>
                                        Effect.fail(new Forbidden({ action: settingsRead.name, reason: 'revoked' })),
                                });
                                const first = yield* binding.prepare(target);
                                const second = yield* binding.prepare(target);
                                const mutableAlice = { ...alice };
                                yield* first.authorize(allow, mutableAlice);
                                yield* second.authorize(allow, bob);
                                Object.defineProperty(mutableAlice, 'subject', { value: bob.subject });
                                for (const caller of retained)
                                    Object.defineProperty(caller, 'subject', { value: SubjectId.make(id('ff')) });
                                expect(yield* second.run).toEqual({ value: '72', source: 'stored', revision: 1 });
                                expect(yield* first.run).toEqual({ value: '41', source: 'stored', revision: 1 });
                                expect(Exit.isFailure(yield* first.run.pipe(Effect.exit))).toBe(true);
                                const failed = yield* binding.prepare(target);
                                expect(Exit.isFailure(yield* failed.run.pipe(Effect.exit))).toBe(true);
                                yield* failed.authorize(allow, alice);
                                expect((yield* failed.authorize(deny, alice).pipe(Effect.flip))._tag).toBe('Forbidden');
                                expect(Exit.isFailure(yield* failed.run.pipe(Effect.exit))).toBe(true);

                                // A suspended older success must not republish authority after a newer revocation on the same preparation.
                                const waiting = yield* Deferred.make<void>();
                                const resume = yield* Deferred.make<void>();
                                const slow = Authorizer.of({
                                    ...allow,
                                    /** Suspend only this admitted target check at a deterministic barrier. */ check: () =>
                                        Deferred.succeed(waiting, undefined).pipe(
                                            Effect.zipRight(Deferred.await(resume))
                                        ),
                                });
                                const stale = yield* binding.prepare(target);
                                const pending = yield* stale.authorize(slow, alice).pipe(Effect.fork);
                                yield* Deferred.await(waiting);
                                yield* stale.authorize(deny, bob).pipe(Effect.flip);
                                yield* Deferred.succeed(resume, undefined);
                                yield* Fiber.join(pending);
                                expect(Exit.isFailure(yield* stale.run.pipe(Effect.exit))).toBe(true);
                                const rejected = yield* binding.prepare(target);
                                yield* rejected.authorize(allow, { ...alice, tenant: TenantId.make(id('ee')) });
                                expect(yield* rejected.run.pipe(Effect.flip)).toMatchObject({
                                    error: { reason: 'denied' },
                                });
                                const revoked = yield* binding.prepare(target);
                                yield* revoked.authorize(allow, alice);
                                yield* Ref.set(allowed, false);
                                expect(yield* revoked.run.pipe(Effect.flip)).toMatchObject({
                                    error: { reason: 'denied' },
                                });
                                yield* Ref.set(allowed, true);
                                expect(Exit.isFailure(yield* revoked.run.pipe(Effect.exit))).toBe(true);
                            }
                        )
                )
        )
);
