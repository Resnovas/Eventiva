/**
 * @file packages/runtime/src/catalogue-import.ts
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

import {
    ApplyImportRow,
    CancelImport,
    GetImport,
    importActions,
    ImportFailure,
    ImportPlan,
    previewStockImport,
    ProductReference,
    StageImport,
    stockImportFlag,
    type StockImportEvidence,
    StockImportFailure,
    type StockImportPreview,
    StockImportSource,
    StockImportSources,
} from '@eventiva/contracts/catalogue';
import { type ActionSpec } from '@eventiva/contracts/action';
import { Authorizer, Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { ActionFailed, Forbidden } from '@eventiva/contracts/errors';
import { Flags } from '@eventiva/contracts/flags';
import { CreateProduct, inventoryFlag } from '@eventiva/contracts/inventory-product';
import { declareResource, Resources, type ResourceRecord } from '@eventiva/contracts/resource';
import { CurrentTenant, type JsonValue } from '@eventiva/contracts/storage';
import { Clock, Effect, Schema } from 'effect';
import { implement, type ActionBinding } from './action.ts';
import { ActionHost } from './host.ts';
import { canonicalJson, IdentityResolver, InputDigest, InvocationDenied } from './invocation.ts';

/** Private review projection only; readiness is neither a durable import token nor authorization for later writes. */
export interface StockImportPreparation {
    readonly source: string;
    readonly evidence: StockImportEvidence;
    readonly state: 'reviewable' | 'corrections-required';
    readonly rows: ReadonlyArray<StockImportPreview>;
}

const header = ['supplierSku', 'manufacturer', 'model', 'variant', 'quantity'];

/** Decode the bounded canonical template, preserving quoted commas, escaped quotes and embedded newlines without evaluation. */
const parseCsv = (
    input: string
): Effect.Effect<ReadonlyArray<readonly [string, string, string, string, string]>, StockImportFailure> =>
    Effect.suspend(
        /** Parse one complete source or refuse it; never guess column alignment after malformed quoting. */ () => {
            if (input.length > 1_000_000) return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
            const csv = input.startsWith('\uFEFF') ? input.slice(1) : input;
            const rows: Array<Array<string>> = [];
            let fields: Array<string> = [];
            let field = '';
            let quoted = false;
            let closed = false;
            // Delimiters are structural only outside quotes; fields remain literal private data, never spreadsheet formulas.
            for (let index = 0; index < csv.length; index++) {
                const character = csv.charAt(index);
                if (quoted) {
                    if (character === '"') {
                        if (csv[index + 1] === '"') {
                            field += '"';
                            index++;
                        } else {
                            quoted = false;
                            closed = true;
                        }
                    } else field += character;
                } else if (character === ',' || character === '\n' || character === '\r') {
                    fields.push(field);
                    field = '';
                    closed = false;
                    if (character !== ',') {
                        if (character === '\r') {
                            if (csv[index + 1] !== '\n')
                                return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
                            index++;
                        }
                        rows.push(fields);
                        fields = [];
                        if (rows.length > 1001) return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
                    }
                } else if (character === '"' && field === '' && !closed) quoted = true;
                else {
                    if (character === '"' || closed)
                        return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
                    field += character;
                }
            }
            if (quoted) return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
            if (fields.length > 0 || field !== '' || closed) rows.push([...fields, field]);
            if (
                rows.length < 2 ||
                rows.length > 1001 ||
                rows[0]?.length !== header.length ||
                !header.every(
                    /** Header spelling and order are explicit; an unknown supplier export requires mapping, not a guess. */
                    (column, index) => rows[0]?.[index] === column
                )
            )
                return Effect.fail(new StockImportFailure({ reason: 'invalid-csv' }));
            // Validate fixed field counts into tuples rather than asserting array indexes are present downstream.
            return Schema.decodeUnknown(
                Schema.Array(Schema.Tuple(Schema.String, Schema.String, Schema.String, Schema.String, Schema.String))
            )(rows.slice(1), { onExcessProperty: 'error' }).pipe(
                Effect.mapError(
                    /** Ragged records are whole-file failures; private cell values never leave in parser diagnostics. */ () =>
                        new StockImportFailure({ reason: 'invalid-csv' })
                )
            );
        }
    );

/**
 * Prepare a private bulk-stock CSV for review using router-owned CurrentTenant and a trusted source authority.
 * Rights must be current, unrevoked and reviewed within 30 days. No source, evidence or tenant is accepted beside caller CSV.
 * This performs no stock write; a later commit must reauthorize/reload current rights and use the existing Resources path.
 */
export const prepareStockImport = (
    sourceId: string,
    references: JsonValue
): Effect.Effect<StockImportPreparation, StockImportFailure, CurrentTenant | StockImportSources> =>
    Effect.gen(
        /** Snapshot public inputs before the authority lookup can suspend, then validate its tenant-bound source response. */ function* () {
            // Detach references before source IO; a retained request must not change the reviewed match while loading rights.
            const id = yield* Schema.decodeUnknown(Schema.UUID)(sourceId).pipe(
                Effect.mapError(
                    /** Discard parser context; public error channels must never echo submitted values. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            const catalogue = yield* Schema.decodeUnknown(Schema.Array(ProductReference).pipe(Schema.maxItems(10000)))(
                references
            ).pipe(
                Effect.mapError(
                    /** Even a mistaken private field in the reference container must not leak in diagnostics. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            const source = yield* checkedSource(id);
            const evidence = source.evidence;
            const records = yield* parseCsv(source.csv);
            const rows = yield* previewStockImport(
                records.map(
                    /** Blank variant means no variant; strict integer text rejects exponent, decimal and leading-zero coercion. */
                    (record) => ({
                        supplierSku: record[0],
                        manufacturer: record[1],
                        model: record[2],
                        variant: record[3] === '' ? null : record[3],
                        quantity: /^(0|[1-9][0-9]*)$/.test(record[4]) ? Number(record[4]) : -1,
                    })
                ),
                catalogue
            ).pipe(
                Effect.mapError(
                    /** Container/ref failures are bounded here; invalid individual rows retain the existing correction states. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            return {
                source: id,
                evidence,
                state: rows.every(
                    /** Only an exact match for every row may proceed to human review, never directly to an inventory write. */
                    (row) => row.state === 'matched'
                )
                    ? 'reviewable'
                    : 'corrections-required',
                rows,
            };
        }
    );

/** Recheck coherent rights and content after each authority suspension; return detached strictly decoded source data. */
const checkedSource = (id: string) =>
    Effect.gen(
        /** Validate routing and exact clock boundaries before any private projection or source digest can escape. */ function* () {
            const tenant = (yield* CurrentTenant).id;
            const authority = yield* StockImportSources;
            const source = yield* Schema.decodeUnknown(StockImportSource)(yield* authority.load(tenant, id)).pipe(
                Effect.mapError(
                    /** Never expose malformed authority values through decoder diagnostics. */ () =>
                        new StockImportFailure({ reason: 'invalid' })
                )
            );
            if (source.csv.length > 1_000_000) return yield* new StockImportFailure({ reason: 'invalid-csv' });
            const now = yield* Clock.currentTimeMillis;
            const evidence = source.evidence;
            // Neither an earlier preview nor a committed row grants lasting rights to source data.
            if (
                source.id !== id ||
                source.tenant !== tenant ||
                evidence.revoked ||
                evidence.reviewedAt > now ||
                evidence.validUntil <= now ||
                now - evidence.reviewedAt >= 30 * 86_400_000
            )
                return yield* new StockImportFailure({ reason: 'denied' });
            return source;
        }
    );

/** Only normalized scalar records are persisted; import owns no product or stock resource. */
export const importResources = Effect.gen(
    /** Bind immutable review provenance separately from mutable row progress and optimistic plan revision. */ function* () {
        // Normalize into scalar declarations so import does not invent a generic JSON field or bypass Resources validation.
        const plans = yield* declareResource({
            id: 'inventory-import.plan',
            owner: 'inventory-import',
            moduleVersion: '1.0.0',
            fields: {
                source: { type: 'uuid', optional: false },
                evidence: { type: 'uuid', optional: false },
                artifact: { type: 'uuid', optional: false },
                reviewer: { type: 'uuid', optional: false },
                basis: { type: 'text', optional: false },
                reviewedAt: { type: 'timestamp', optional: false },
                validUntil: { type: 'timestamp', optional: false },
                actor: { type: 'text', optional: false },
                sourceDigest: { type: 'text', optional: false },
                planDigest: { type: 'text', optional: false },
                state: { type: 'text', optional: false },
                total: { type: 'integer', optional: false },
                applied: { type: 'integer', optional: false },
            },
        });
        const rows = yield* declareResource({
            id: 'inventory-import.row',
            owner: 'inventory-import',
            moduleVersion: '1.0.0',
            fields: {
                plan: { type: 'uuid', optional: false },
                position: { type: 'integer', optional: false },
                product: { type: 'uuid', optional: false },
                reference: { type: 'uuid', optional: false },
                name: { type: 'text', optional: false },
                sku: { type: 'text', optional: false },
                category: { type: 'text', optional: false },
                tracking: { type: 'text', optional: false },
                unit: { type: 'text', optional: false },
                quantity: { type: 'integer', optional: false },
                state: { type: 'text', optional: false },
            },
        });
        return { plans, rows };
    }
);

/** Bind ownership to canonical principal/session/delegation, never to the request's ambient Caller object. */
const actorKey = (caller: CallerIdentity) =>
    JSON.stringify([caller.tenant, caller.subject, caller.session, caller.kind, caller.onBehalfOf ?? null]);

/** Fixed feature errors retain no private competing value or underlying storage diagnostic. */
const refused = (reason: ImportFailure['reason']): ImportFailure => ({ _tag: 'ImportFailure', reason });

/** Compose an uninstalled import module on the SAME tenant Resources, durable Integrity and common host as products. */
export const stockImportModule = Effect.gen(
    /** Capture provider capabilities only; each prepared invocation captures its own refreshed canonical authority. */ function* () {
        // The captured host and Resources must share the durable provider owner; sharing a database name alone is insufficient.
        const resources = yield* Resources;
        const tenant = { ...(yield* CurrentTenant) };
        const sources = yield* StockImportSources;
        const digest = yield* InputDigest;
        const flags = yield* Flags;
        const identity = yield* IdentityResolver;
        const authority = yield* Authorizer;
        const host = yield* ActionHost;
        const { plans, rows } = yield* importResources;
        type Plan = ResourceRecord<typeof plans.fields>;

        /** Hash canonical detached source/evidence bytes, not caller-supplied claims or lossy CSV projections. */
        const sourceBinding = (id: string) =>
            checkedSource(id).pipe(
                Effect.flatMap(
                    /** Retain the exact validated evidence alongside its cryptographic binding. */ (source) =>
                        canonicalJson(source).pipe(
                            Effect.flatMap(digest.digest),
                            Effect.map(
                                /** Private bytes never enter resource values or public diagnostics. */ (hash) => ({
                                    source,
                                    hash,
                                })
                            )
                        )
                ),
                Effect.provideService(CurrentTenant, tenant),
                Effect.provideService(StockImportSources, sources)
            );

        /** Refuse absent or foreign-principal plans without disclosing which condition occurred. */
        const owned = (id: string, caller: CallerIdentity) =>
            resources
                .get(plans, id)
                .pipe(
                    Effect.flatMap(
                        /** Ownership includes the authenticated tenant and delegation/session identity. */ (plan) =>
                            plan && plan.value.actor === actorKey(caller)
                                ? Effect.succeed(plan)
                                : Effect.fail(refused('denied'))
                    )
                );

        /** Enforce both default-off gates and exact current source binding, including host commit replay. */
        const validate = (id: string, caller: CallerIdentity, stagingSource?: string) =>
            Effect.gen(
                /** A refreshed source cannot silently replace reviewed bytes, evidence identity or expiry under the same source ID. */ function* () {
                    // A source ID is only a lookup key: immutable reviewed bytes and evidence are separately digest-bound.
                    if (
                        caller.tenant !== tenant.id ||
                        !(yield* flags.evaluate(inventoryFlag)).value ||
                        !(yield* flags.evaluate(stockImportFlag)).value
                    )
                        return yield* Effect.fail(refused('denied'));
                    const plan = yield* resources.get(plans, id);
                    if ((!plan && stagingSource === undefined) || (plan && plan.value.actor !== actorKey(caller)))
                        return yield* Effect.fail(refused('denied'));
                    const binding = yield* sourceBinding(plan?.value.source ?? stagingSource ?? '');
                    if (
                        plan &&
                        (binding.hash !== plan.value.sourceDigest ||
                            (stagingSource !== undefined && stagingSource !== plan.value.source))
                    )
                        return yield* Effect.fail(refused('denied'));
                }
            ).pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentTenant, tenant));

        /** Read all bounded normalized rows in one transaction; never truncate a staged review at a query page boundary. */
        const output = (plan: Plan) =>
            Effect.gen(
                /** Exact count and row membership are internal integrity invariants, not caller-controlled filters. */ function* () {
                    // Resource queries cap each page at 100; failing to consume the cursor would silently drop accepted rows.
                    const found: Array<ResourceRecord<typeof rows.fields>> = [];
                    let after: string | undefined;
                    do {
                        const page = yield* resources.query(rows, {
                            where: { field: 'plan', equals: plan.id },
                            limit: 100,
                            ...(after ? { after } : {}),
                        });
                        found.push(...page);
                        if (found.length > 1000) return yield* Effect.fail(refused('unavailable'));
                        after = page.length === 100 ? page.at(-1)?.id : undefined;
                    } while (after);
                    if (found.length !== plan.value.total) return yield* Effect.fail(refused('unavailable'));
                    // PostgreSQL READ COMMITTED is not a repeatable snapshot: refuse if a row/plan transition crossed the paged read.
                    const current = yield* resources.get(plans, plan.id);
                    if (current?.revision !== plan.revision) return yield* Effect.fail(refused('conflict'));
                    return yield* Schema.decodeUnknown(ImportPlan)({
                        id: plan.id,
                        revision: plan.revision,
                        source: plan.value.source,
                        evidence: {
                            id: plan.value.evidence,
                            artifact: plan.value.artifact,
                            reviewer: plan.value.reviewer,
                            basis: plan.value.basis,
                            purpose: 'private-stock-import',
                            reviewedAt: plan.value.reviewedAt,
                            validUntil: plan.value.validUntil,
                            revoked: false,
                        },
                        sourceDigest: plan.value.sourceDigest,
                        planDigest: plan.value.planDigest,
                        state: plan.value.state,
                        rows: found
                            .sort(
                                /** Preserve source position independently from UUID allocation order. */ (a, b) =>
                                    a.value.position - b.value.position
                            )
                            .map(
                                /** Expose metadata progress with explicit unapplied quantities; no stock record is ever created. */ (
                                    row
                                ) => ({
                                    id: row.id,
                                    revision: row.revision,
                                    row: row.value.position,
                                    product: row.value.product,
                                    reference: row.value.reference,
                                    name: row.value.name,
                                    sku: row.value.sku,
                                    category: row.value.category,
                                    tracking: row.value.tracking,
                                    unit: row.value.unit,
                                    quantity: row.value.quantity,
                                    quantityStatus: 'not-applied',
                                    stock: 'stock-pending',
                                    state: row.value.state,
                                })
                            ),
                    });
                }
            );

        /** Attach source reauthorization to the host's existing replay-safe hook, not just its skipped-on-replay handler. */
        const bind = (spec: ActionSpec, binding: ActionBinding<Caller | CurrentTenant>): ActionBinding => ({
            spec,
            /** Capture an immutable encoded target before any external authorizer can retain decoded references. */
            prepare: (wire) =>
                Effect.gen(
                    /** Scope canonical authority to this preparation and invalidate it before every potentially suspended check. */ function* () {
                        // Use the already snapshotted canonical input, never the mutable wire or a policy adapter's decoded view.
                        const prepared = yield* binding.prepare(wire);
                        const encoded = yield* prepared.canonicalInput;
                        const target = yield* Schema.decode(
                            Schema.parseJson(
                                Schema.Struct({
                                    id: Schema.String,
                                    source: Schema.optional(Schema.String),
                                    row: Schema.optional(Schema.String),
                                })
                            )
                        )(encoded).pipe(Effect.orDie);
                        let admitted: CallerIdentity | undefined;
                        /** Reload source first, then refresh identity/grants/gates after that possibly suspended authority call. */
                        const recheck = (caller: CallerIdentity) =>
                            Effect.gen(
                                /** Post-wait authority cannot inherit an earlier source lookup's principal or gate snapshot. */ function* () {
                                    // Source access may suspend, so it must not be the last permission check before acknowledgement.
                                    yield* validate(target.id, caller, target.source);
                                    const fresh = yield* identity.resolve({ ...caller });
                                    if (
                                        actorKey(fresh) !== actorKey(caller) ||
                                        !(yield* flags.evaluate(inventoryFlag)).value ||
                                        !(yield* flags.evaluate(stockImportFlag)).value
                                    )
                                        return yield* Effect.fail(refused('denied'));
                                    yield* authority.canInvoke({ ...fresh }, spec);
                                    yield* prepared.authorize(authority, { ...fresh });
                                }
                            );
                        return {
                            ...prepared,
                            /** Recheck source rights on first execution, after host waits and on identical saved-result replay. */
                            authorize: (authorizer, caller) =>
                                Effect.gen(
                                    /** Disposable authority prevents a mutating policy adapter from changing plan ownership. */ function* () {
                                        // Clear admission before a suspended or failed recheck so stale authority cannot reach the handler.
                                        admitted = undefined;
                                        const snapshot = Object.freeze({ ...caller });
                                        yield* prepared.authorize(authorizer, { ...snapshot });
                                        yield* recheck(snapshot).pipe(
                                            Effect.mapError(
                                                /** A denial never discloses source identity, contents or persistence diagnostics. */ () =>
                                                    new Forbidden({ action: spec.name, reason: 'import-authority' })
                                            )
                                        );
                                        admitted = snapshot;
                                    }
                                ),
                            /** Require exactly the preallocated row key so acknowledgement loss cannot generate a replacement mutation. */
                            inspect: (policy, caller, intent) =>
                                spec.name === ApplyImportRow.name && intent.idempotencyKey !== target.row
                                    ? Effect.fail(
                                          new InvocationDenied({ action: spec.name, reason: 'row-key-required' })
                                      )
                                    : prepared.inspect(policy, caller, intent),
                            run: Effect.suspend(
                                /** Consume canonical authority once; the host still refreshes identity and policy before each run/replay. */ () => {
                                    // Feature transactions deliberately join the outer Integrity owner, including nested product savepoints.
                                    const caller = admitted;
                                    admitted = undefined;
                                    if (!caller) return Effect.dieMessage('Import requires canonical authorization.');
                                    return resources
                                        .transaction(
                                            prepared.run.pipe(
                                                Effect.tap(
                                                    /** Recheck immediately before transaction completion, including source revocation during nested product writes. */ () =>
                                                        recheck(caller)
                                                )
                                            )
                                        )
                                        .pipe(
                                            Effect.provideService(Caller, caller),
                                            Effect.provideService(CurrentTenant, tenant),
                                            Effect.mapError(
                                                /** Retain declared wire failures; sanitize post-handler validation and transaction failures. */ (
                                                    error
                                                ) =>
                                                    error instanceof ActionFailed
                                                        ? error
                                                        : new ActionFailed({
                                                              action: spec.name,
                                                              error: refused('unavailable'),
                                                          })
                                            )
                                        );
                                }
                            ),
                        };
                    }
                ),
        });

        /** Sanitize infrastructure errors while preserving bounded conflicts and declared feature failures. */
        const safe = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
            effect.pipe(
                Effect.mapError(
                    /** Raw schema, source and SQL failures never become action error payloads. */ (
                        error
                    ): ImportFailure =>
                        Schema.is(ImportFailure)(error)
                            ? error
                            : typeof error === 'object' &&
                                error !== null &&
                                'reason' in error &&
                                error.reason === 'conflict'
                              ? refused('conflict')
                              : refused('unavailable')
                )
            );

        return {
            manifest: {
                format: 1,
                id: 'inventory-import',
                version: '1.0.0',
                description: 'Reviewed private metadata imports; no stock or real-source acceptance.',
                flags: [inventoryFlag, stockImportFlag],
                flag: inventoryFlag.key,
                actions: importActions.map(
                    /** Retain the portable action registration list. */ (action) => action.name
                ),
            },
            actions: [
                bind(
                    StageImport,
                    implement(
                        StageImport,
                        /** Persist one immutable reviewed plan and its normalized rows in the host's existing transaction. */ (
                            input
                        ) =>
                            safe(
                                Effect.gen(
                                    /** Source binding and product proposals are snapshots; all rows must match before any durable review exists. */ function* () {
                                        const caller = yield* Caller;
                                        if (yield* resources.get(plans, input.id))
                                            return yield* Effect.fail(refused('conflict'));
                                        const binding = yield* sourceBinding(input.source);
                                        const preparation = yield* prepareStockImport(
                                            input.source,
                                            input.references
                                        ).pipe(
                                            Effect.provideService(StockImportSources, {
                                                /** Reuse the exact validated authority snapshot, avoiding a second incoherent source load. */
                                                load: () => Effect.succeed(binding.source),
                                            })
                                        );
                                        if (
                                            preparation.state !== 'reviewable' ||
                                            preparation.rows.length !== input.reviews.length
                                        )
                                            return yield* Effect.fail(refused('invalid'));
                                        const positions = new Set<number>();
                                        const identities = new Set<string>([input.id]);
                                        const planDigest = yield* canonicalJson({
                                            input,
                                            sourceDigest: binding.hash,
                                        }).pipe(Effect.flatMap(digest.digest));
                                        // All normalized rows and the plan share the outer success receipt's transaction owner.
                                        for (const review of input.reviews) {
                                            const matched = preparation.rows[review.row - 1];
                                            if (
                                                !matched ||
                                                matched.state !== 'matched' ||
                                                positions.has(review.row) ||
                                                identities.has(review.id) ||
                                                identities.has(review.product) ||
                                                review.id === review.product
                                            )
                                                return yield* Effect.fail(refused('invalid'));
                                            positions.add(review.row);
                                            identities.add(review.id);
                                            identities.add(review.product);
                                            yield* resources.create(rows, review.id, {
                                                plan: input.id,
                                                position: review.row,
                                                product: review.product,
                                                reference: matched.reference,
                                                name: review.name,
                                                sku: matched.stock.supplierSku,
                                                category: review.category,
                                                tracking: review.tracking,
                                                unit: review.unit,
                                                quantity: matched.stock.quantity,
                                                state: 'pending',
                                            });
                                        }
                                        const evidence = binding.source.evidence;
                                        const plan = yield* resources.create(plans, input.id, {
                                            source: input.source,
                                            evidence: evidence.id,
                                            artifact: evidence.artifact,
                                            reviewer: evidence.reviewer,
                                            basis: evidence.basis,
                                            reviewedAt: evidence.reviewedAt,
                                            validUntil: evidence.validUntil,
                                            actor: actorKey(caller),
                                            sourceDigest: binding.hash,
                                            planDigest,
                                            state: 'staged',
                                            total: input.reviews.length,
                                            applied: 0,
                                        });
                                        return yield* output(plan);
                                    }
                                )
                            )
                    )
                ),
                bind(
                    GetImport,
                    implement(
                        GetImport,
                        /** Read private progress only through the replay-safe canonical ownership/source check. */ (
                            input
                        ) =>
                            safe(
                                Effect.gen(
                                    /** Read plan and rows on the same provider transaction for a coherent revision. */ function* () {
                                        return yield* output(yield* owned(input.id, yield* Caller));
                                    }
                                )
                            )
                    )
                ),
                bind(
                    CancelImport,
                    implement(
                        CancelImport,
                        /** Advance only the plan revision; committed row/product history is deliberately retained. */ (
                            input
                        ) =>
                            safe(
                                Effect.gen(
                                    /** Compete with row confirmation through the plan CAS, not a second uncoordinated status store. */ function* () {
                                        // A stale cancel must not hide a concurrently committed row; retain every earlier product and row revision.
                                        const plan = yield* owned(input.id, yield* Caller);
                                        if (plan.revision !== input.revision || plan.value.state !== 'staged')
                                            return yield* Effect.fail(refused('conflict'));
                                        return yield* output(
                                            yield* resources.update(plans, input.id, input.revision, {
                                                state: 'cancelled',
                                            })
                                        );
                                    }
                                )
                            )
                    )
                ),
                bind(
                    ApplyImportRow,
                    implement(
                        ApplyImportRow,
                        /** Invoke the sole product writer and atomically confirm this row; never call a product driver directly. */ (
                            input
                        ) =>
                            safe(
                                Effect.gen(
                                    /** Plan CAS precedes product lock acquisition so cancel/apply use one lock order without partial progress. */ function* () {
                                        const caller = yield* Caller;
                                        const plan = yield* owned(input.id, caller);
                                        if (plan.value.state === 'cancelled')
                                            return yield* Effect.fail(refused('cancelled'));
                                        const row = yield* resources.get(rows, input.row);
                                        if (
                                            plan.revision !== input.revision ||
                                            !row ||
                                            row.value.plan !== input.id ||
                                            row.revision !== input.rowRevision ||
                                            row.value.state !== 'pending'
                                        )
                                            return yield* Effect.fail(refused('conflict'));
                                        const updated = yield* resources.update(plans, input.id, input.revision, {
                                            applied: plan.value.applied + 1,
                                            state:
                                                plan.value.applied + 1 === plan.value.total
                                                    ? 'metadata-applied'
                                                    : 'staged',
                                        });
                                        yield* validate(input.id, caller);
                                        // The nested public host joins this provider's fiber-local SQL savepoints, including success receipts.
                                        yield* host.invoke(
                                            CreateProduct.name,
                                            {
                                                id: row.value.product,
                                                product: {
                                                    name: row.value.name,
                                                    sku: row.value.sku,
                                                    category: row.value.category,
                                                    tracking: row.value.tracking,
                                                    unit: row.value.unit,
                                                },
                                            },
                                            { idempotencyKey: row.id }
                                        );
                                        yield* resources.update(rows, row.id, input.rowRevision, {
                                            state: 'metadata-applied',
                                        });
                                        return yield* output(updated);
                                    }
                                )
                            )
                    )
                ),
            ],
        };
    }
);
