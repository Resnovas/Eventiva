/**
 * @file packages/runtime/src/invoice-draft.ts
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

import type { ActionSpec, Input } from '@eventiva/contracts/action';
import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { Organisation, organisationResources } from '@eventiva/contracts/crm-organisation';
import type { Forbidden } from '@eventiva/contracts/errors';
import { Flags } from '@eventiva/contracts/flags';
import {
    InvoiceDraft,
    InvoiceDraftFailure,
    InvoiceRevision,
    invoiceDraft,
    invoiceUpdate,
    invoiceGet,
    invoiceList,
    invoiceDraftActions,
    invoiceDraftFlag,
} from '@eventiva/contracts/invoice';
import { declareResource, Resources, type Fields, type ResourceRecord } from '@eventiva/contracts/resource';
import { CurrentTenant, UuidV7 } from '@eventiva/contracts/storage';
import { Effect, Option, type ParseResult, Schema } from 'effect';
import { implement } from './action.ts';
import type { ServerModule } from './host.ts';
import { IdentityResolver, type InvocationDenied } from './invocation.ts';

/** One complete canonical snapshot per resource revision; existing Resources owns immutable history and transactions. */
export const invoiceDraftResources = declareResource({
    id: 'accounting.invoice-draft',
    owner: 'accounting.drafts',
    moduleVersion: '1.0.0',
    fields: {
        snapshot: { type: 'text', optional: false },
        createdBy: { type: 'text', optional: false },
        owner: { type: 'text', optional: false },
        state: { type: 'text', optional: false },
    },
});
const stored = Schema.Struct({ format: Schema.Literal(1), snapshot: InvoiceRevision }).annotations({
    parseOptions: { onExcessProperty: 'error' },
});
const codec = Schema.parseJson(stored);
const maxBytes = 1024 * 1024;

/** Count actual UTF-8 bytes without DOM/Node dependencies; JSON encoding has already escaped lone surrogates. */
const utf8Bytes = (text: string) => {
    // Iteration visits Unicode code points, so supplementary characters count once at four bytes.
    let bytes = 0;
    for (const character of text) {
        const code = character.codePointAt(0) ?? 0;
        bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    }
    return bytes;
};

/** Assemble on the exact tenant Resources/Storage/Integrity owner; importing this module never registers or activates actions. */
export const invoiceDraftModule = Effect.gen(
    /** Retain infrastructure only, never the user who assembles the module or mutable policy snapshots. */ function* () {
        // The provider route cannot be redirected by ambient identity replacement during an invocation.
        const api = yield* Resources;
        const route = Object.freeze({ ...(yield* CurrentTenant) });
        const identity = yield* IdentityResolver;
        const policy = yield* Authorizer;
        const flags = yield* Flags;
        const drafts = yield* invoiceDraftResources;
        const { party, organisation } = yield* organisationResources;

        /** Strictly decode the fixed persisted codec, with an actual UTF-8 bound before JSON parsing. */
        const decode = (text: string) =>
            Effect.gen(
                /** Refuse oversized or corrupt history instead of truncating financial data. */ function* () {
                    // Text length is not a byte bound for multibyte descriptions.
                    if (utf8Bytes(text) > maxBytes) return yield* new InvoiceDraftFailure({ reason: 'limit' });
                    return (yield* Schema.decode(codec)(text)).snapshot;
                }
            );

        /** Validate current stored state and alignment; never silently repair corrupt canonical/resource revisions. */
        const project = (row: ResourceRecord<Fields>) =>
            Effect.gen(
                /** Keep the persisted projection schema-checked before returning any private financial content. */ function* () {
                    // Canonical revision and resource revision represent the same immutable complete replacement.
                    if (typeof row.value['snapshot'] !== 'string')
                        return yield* new InvoiceDraftFailure({ reason: 'unavailable' });
                    const snapshot = yield* decode(row.value['snapshot']);
                    if (snapshot.invoice !== row.id || snapshot.revision !== row.revision)
                        return yield* new InvoiceDraftFailure({ reason: 'unavailable' });
                    return yield* Schema.decodeUnknown(InvoiceDraft)({
                        id: row.id,
                        revision: row.revision,
                        state: row.value['state'],
                        owner: row.value['owner'],
                        createdBy: row.value['createdBy'],
                        snapshot,
                    });
                }
            );

        /** Require accessible active paired Organisation records; references are not legal or merchant-ownership evidence. */
        const reference = (id: string) =>
            Effect.gen(
                /** Reuse the canonical CRM declaration without writing or inventing Party data. */ function* () {
                    // Both halves must exist at one revision; a Person or torn pair cannot become an invoice party.
                    const p = yield* api.get(party, id);
                    const o = yield* api.get(organisation, id);
                    if (!p || !o || p.revision !== o.revision)
                        return yield* new InvoiceDraftFailure({ reason: 'reference' });
                    const value = yield* Schema.decodeUnknown(Organisation)({
                        id,
                        revision: p.revision,
                        ...p.value,
                        ...o.value,
                    });
                    if (value.archived) return yield* new InvoiceDraftFailure({ reason: 'reference' });
                }
            );

        /** Bind a detached per-invocation identity/input and refresh all policy gates inside the owned transaction. */
        const run = <S extends ActionSpec, A, E>(
            spec: S & { readonly input: Schema.Schema<Input<S>, Schema.Schema.Encoded<S['input']>> },
            input: Input<S>,
            /** Run only with the private decoded input and a fresh live admission effect. */
            work: (
                value: Input<S>,
                recheck: Effect.Effect<
                    Caller['Type'],
                    InvoiceDraftFailure | InvocationDenied | Forbidden | ParseResult.ParseError
                >
            ) => Effect.Effect<A, E, Caller | CurrentTenant>
        ) =>
            Effect.gen(
                /** A shared binding or policy observer must never retain reusable authority or the eventual mutation input. */ function* () {
                    // The protected host seam does not propagate a replacement canonical Caller: refuse mismatch locally.
                    const ambient = yield* Effect.serviceOption(Caller);
                    if (Option.isNone(ambient)) return yield* new InvoiceDraftFailure({ reason: 'denied' });
                    const presented = Object.freeze({ ...ambient.value });
                    const encoded = yield* Schema.encode(Schema.parseJson(spec.input))(input);
                    const detached = yield* Schema.decode(Schema.parseJson(spec.input))(encoded);
                    const authorize = Effect.gen(
                        /** Fresh disposable views prevent retained observer mutations from rewriting enforced identity or input. */ function* () {
                            // Revocation is checked again after reads/lock waits, not cached as registration authority.
                            const caller = Object.freeze({ ...(yield* identity.resolve({ ...presented })) });
                            if (
                                caller.subject !== presented.subject ||
                                caller.session !== presented.session ||
                                caller.kind !== presented.kind ||
                                caller.onBehalfOf !== presented.onBehalfOf ||
                                caller.tenant !== presented.tenant ||
                                caller.tenant !== route.id
                            )
                                return yield* new InvoiceDraftFailure({ reason: 'denied' });
                            if (!(yield* flags.evaluate(invoiceDraftFlag)).value)
                                return yield* new InvoiceDraftFailure({ reason: 'denied' });
                            yield* policy.canInvoke({ ...caller }, spec);
                            yield* policy.check(
                                { ...caller },
                                spec,
                                yield* Schema.decode(Schema.parseJson(spec.input))(encoded)
                            );
                            return Object.freeze({ ...caller });
                        }
                    );
                    const caller = yield* authorize;
                    return yield* api
                        .transaction(
                            Effect.gen(
                                /** Reauthorize at transaction admission and let every Resource access apply its own current policy. */ function* () {
                                    // The same Storage owner encloses domain writes, history and the host's durable successful receipt.
                                    yield* authorize;
                                    return yield* work(detached, authorize);
                                }
                            )
                        )
                        .pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentTenant, route));
                }
            ).pipe(
                Effect.mapError(
                    /** Domain categories are safe; raw parser, SQL and identity diagnostics are not feature output. */ (
                        error
                    ): InvoiceDraftFailure =>
                        Schema.is(InvoiceDraftFailure)(error)
                            ? error
                            : new InvoiceDraftFailure({
                                  reason:
                                      typeof error === 'object' &&
                                      error !== null &&
                                      '_tag' in error &&
                                      error._tag === 'ResourceFailure' &&
                                      'reason' in error &&
                                      error.reason === 'conflict'
                                          ? 'conflict'
                                          : 'unavailable',
                              })
                )
            );

        /** Complete replacement only; no totals, tax, currency, commission or identity may be inferred or corrected. */
        const save = (
            snapshot: InvoiceRevision,
            expected: number,
            recheck: Effect.Effect<
                Caller['Type'],
                InvoiceDraftFailure | InvocationDenied | Forbidden | ParseResult.ParseError
            >
        ) =>
            Effect.gen(
                /** Validate before mutation, then use one CAS write to align canonical state, history and resource revision. */ function* () {
                    // The storage pilot uses UUIDv7 without narrowing the existing provider-neutral InvoiceRevision schema.
                    if (!Schema.is(UuidV7)(snapshot.invoice) || snapshot.revision !== expected + 1)
                        return yield* new InvoiceDraftFailure({ reason: 'invalid' });
                    const text = yield* Schema.encode(codec)({ format: 1, snapshot });
                    if (utf8Bytes(text) > maxBytes) return yield* new InvoiceDraftFailure({ reason: 'limit' });
                    const previous = yield* api.get(drafts, snapshot.invoice);
                    if ((previous?.revision ?? 0) !== expected)
                        return yield* new InvoiceDraftFailure({ reason: 'conflict' });
                    const original = previous ? yield* project(previous) : undefined;
                    if (
                        original &&
                        (original.snapshot.supplier !== snapshot.supplier ||
                            original.snapshot.customer !== snapshot.customer)
                    )
                        return yield* new InvoiceDraftFailure({ reason: 'conflict' });
                    yield* reference(snapshot.supplier);
                    yield* reference(snapshot.customer);
                    const caller = yield* recheck;
                    const row = previous
                        ? yield* api.update(drafts, snapshot.invoice, expected, { snapshot: text })
                        : yield* api.create(drafts, snapshot.invoice, {
                              snapshot: text,
                              state: 'draft',
                              createdBy: caller.subject,
                              owner: caller.onBehalfOf ?? caller.subject,
                          });
                    // Recheck after CAS/SQL lock contention too; revocation rolls back the tentative write and history.
                    yield* recheck;
                    return yield* project(row);
                }
            );

        return {
            manifest: {
                format: 1,
                id: 'accounting.drafts',
                version: '1.0.0',
                description: 'Private preparation-only canonical invoice drafts.',
                flags: [invoiceDraftFlag],
                actions: invoiceDraftActions.map(
                    /** Use portable declarations as inventory authority. */ (a) => a.name
                ),
            },
            actions: [
                implement(
                    invoiceDraft,
                    /** Creation is revision one, not an implicit upsert. */ (input) =>
                        run(
                            invoiceDraft,
                            input,
                            /** Work receives only the private decoded invocation snapshot. */ (value, check) =>
                                save(value.snapshot, 0, check)
                        )
                ),
                implement(
                    invoiceUpdate,
                    /** Preserve immutable prior snapshots at each optimistic next revision. */ (input) =>
                        run(
                            invoiceUpdate,
                            input,
                            /** Expected revision is an explicit complete-replacement precondition. */ (value, check) =>
                                save(value.snapshot, value.expectedRevision, check)
                        )
                ),
                implement(
                    invoiceGet,
                    /** Reads do not revalidate archived party contents or claim legal validity. */ (input) =>
                        run(
                            invoiceGet,
                            input,
                            /** Return a strict private projection under current access. */ (value, check) =>
                                Effect.gen(
                                    /** Recheck after the read before returning content, without changing historical references. */ function* () {
                                        // A missing row and inaccessible content must not disclose stored financial fields.
                                        const row = yield* api.get(drafts, value.id);
                                        if (!row) return yield* new InvoiceDraftFailure({ reason: 'not-found' });
                                        yield* check;
                                        return yield* project(row);
                                    }
                                )
                        )
                ),
                implement(
                    invoiceList,
                    /** Exclusive bounded pages use existing tenant resource policy, never a process-local index. */ (
                        input
                    ) =>
                        run(
                            invoiceList,
                            input,
                            /** Preserve exact ID ordering and fail closed on corrupt rows. */ (value, check) =>
                                Effect.gen(
                                    /** All rows are read and validated on the same tenant transaction owner. */ function* () {
                                        // Do not filter after paging or silently truncate invalid stored documents.
                                        const rows = yield* api.query(drafts, {
                                            limit: value.limit ?? 50,
                                            ...(value.after ? { after: value.after } : {}),
                                        });
                                        const items = yield* Effect.forEach(rows, project);
                                        yield* check;
                                        const last = rows.at(-1);
                                        return { items, ...(last ? { after: last.id } : {}) };
                                    }
                                )
                        )
                ),
            ],
        } satisfies ServerModule;
    }
);
