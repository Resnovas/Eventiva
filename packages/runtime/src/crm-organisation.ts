/**
 * @file packages/runtime/src/crm-organisation.ts
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
import { Flags } from '@eventiva/contracts/flags';
import {
    crmFlag,
    Organisation,
    OrganisationFailure,
    organisationActions,
    organisationResources,
    organisationCreate,
    organisationUpdate,
    organisationArchive,
    organisationRestore,
    organisationGet,
    organisationList,
    ContactPoint,
    contactPointActions,
    contactPointAdd,
    contactPointUpdate,
    contactPointRemove,
    contactPointSetPrimary,
    contactPointGet,
    contactPointList,
} from '@eventiva/contracts/crm-organisation';
import { Resources, type ResourceFailure, type ResourceScope, type ResourceRecord } from '@eventiva/contracts/resource';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Effect, Option, Schema } from 'effect';
import { implement } from './action.ts';
import type { ServerModule } from './host.ts';
import { IdentityResolver } from './invocation.ts';

/** Translate resource errors into a finite private-data-free feature vocabulary. */
const resourceError = (error: ResourceFailure) =>
    new OrganisationFailure({
        reason: error.reason === 'conflict' ? 'conflict' : error.reason === 'denied' ? 'denied' : 'unavailable',
    });

/**
 * Assemble within a trusted tenant route using the same Resources/Storage owner as durable Integrity.
 * Composition supplies live crm.read/write action and resource policy; this module never grants authority.
 * Caller is read at execution, not captured at registration. No import registers or activates the capability.
 */
export const crmOrganisationModule = Effect.gen(
    /** Capture tenant persistence and live security services, never a registration-time Caller snapshot. */ function* () {
        // Capturing Caller here would pin the registration user's authority across later invocations and revocations.
        const api = yield* Resources;
        const tenant = yield* CurrentTenant;
        const identity = yield* IdentityResolver;
        const authorizer = yield* Authorizer;
        const flags = yield* Flags;
        const { party, organisation, contactPoint, emailPrimary, phonePrimary } = yield* organisationResources;
        /** Bind current caller scope without making an absent or mismatched host identity authoritative. */
        const run = <A>(operation: Effect.Effect<A, ResourceFailure | OrganisationFailure, ResourceScope>) =>
            Effect.gen(
                /** Refuse direct handler execution without canonical host context, then sanitize storage failures. */ function* () {
                    // Ambient tenant replacement must not select another route's captured resource provider.
                    const caller = yield* Effect.serviceOption(Caller);
                    if (Option.isNone(caller) || caller.value.tenant !== tenant.id)
                        return yield* new OrganisationFailure({ reason: 'denied' });
                    return yield* operation.pipe(
                        Effect.provideService(Caller, caller.value),
                        Effect.provideService(CurrentTenant, tenant),
                        Effect.catchTag('ResourceFailure', resourceError)
                    );
                }
            );
        /** Read a consistent pair; a missing half, unsupported Party kind or diverged revision is never repaired silently. */
        const load = (id: string) =>
            Effect.gen(
                /** Validate persistence projections before they can become action output or input to another mutation. */ function* () {
                    // Returning either half alone could publish a torn Party identity after corrupt persistence.
                    const p = yield* api.get(party, id);
                    const o = yield* api.get(organisation, id);
                    if (!p && !o) return yield* new OrganisationFailure({ reason: 'not-found' });
                    if (!p || !o || p.revision !== o.revision)
                        return yield* new OrganisationFailure({ reason: 'unavailable' });
                    return yield* Schema.decodeUnknown(Organisation)({
                        id,
                        revision: p.revision,
                        ...p.value,
                        ...o.value,
                    }).pipe(
                        Effect.mapError(
                            /** Corrupt stored names and identities must not enter public schema-error diagnostics. */ () =>
                                new OrganisationFailure({ reason: 'unavailable' })
                        )
                    );
                }
            );
        /** Decode contact storage without exposing corrupt values or parser diagnostics. */
        const contactOutput = (row: ResourceRecord<typeof contactPoint.fields>) =>
            Schema.decodeUnknown(ContactPoint)({ id: row.id, revision: row.revision, ...row.value }).pipe(
                Effect.mapError(
                    /** Stored contact corruption is not a public validation diagnostic. */ () =>
                        new OrganisationFailure({ reason: 'unavailable' })
                )
            );
        /** Every fresh contact operation reads its active parent under the same provider transaction and live policy. */
        const activeParent = (organisationId: string) =>
            load(organisationId).pipe(
                Effect.flatMap(
                    /** Archived parents hide contacts; an authorized durable replay is deliberately not this fresh read. */ (
                        parent
                    ) => (parent.archived ? Effect.fail(new OrganisationFailure({ reason: 'not-found' })) : Effect.void)
                )
            );
        /** Refuse reparenting and tombstones before a contact can become mutation input or a public live result. */
        const loadContact = (id: string, organisationId: string) =>
            Effect.gen(
                /** Compare the stored parent, never trusting a submitted organisation to authorize a foreign contact. */ function* () {
                    // Foreign-parent and removed identities use the absent-row refusal rather than exposing another organisation's values.
                    const row = yield* api.get(contactPoint, id);
                    if (!row) return yield* new OrganisationFailure({ reason: 'not-found' });
                    const contact = yield* contactOutput(row);
                    if (contact.organisationId !== organisationId || contact.removed)
                        return yield* new OrganisationFailure({ reason: 'not-found' });
                    return contact;
                }
            );
        /** Acquire the kind-specific organisation CAS guard; losers fail closed and roll back their complete invocation. */
        const lockContacts = (organisationId: string, kind: ContactPoint['kind']) =>
            Effect.gen(
                /** Use separate declarations, not derived UUID hashes, to keep groups independent without touching parent revisions. */ function* () {
                    // The revision-checked write is the serialization point even when two first-use calls observe no guard row.
                    const guard = kind === 'email' ? emailPrimary : phonePrimary;
                    const previous = yield* api.get(guard, organisationId);
                    yield* previous
                        ? api.update(guard, organisationId, previous.revision, { marker: true })
                        : api.create(guard, organisationId, { marker: true });
                }
            );
        /** Read every relevant storage page; filtering after a single limited page cannot prove primary uniqueness. */
        const contacts = (organisationId: string, after?: string, maximum = Number.POSITIVE_INFINITY) =>
            Effect.gen(
                /** Apply live/tombstone filtering before the public limit, advancing through even fully filtered storage pages. */ function* () {
                    // A fully filtered page is not end-of-data; only exhaustion of the resource cursor terminates the scan.
                    const items: Array<ContactPoint> = [];
                    let cursor = after;
                    while (items.length < maximum) {
                        const rows = yield* api.query(contactPoint, {
                            where: { field: 'organisationId', equals: organisationId },
                            limit: 100,
                            ...(cursor === undefined ? {} : { after: cursor }),
                        });
                        for (const row of rows) {
                            const contact = yield* contactOutput(row);
                            if (!contact.removed) items.push(contact);
                            if (items.length === maximum) return items;
                        }
                        if (rows.length < 100) return items;
                        cursor = rows.at(-1)?.id;
                    }
                    return items;
                }
            );
        /** Refresh identity, flag and target policy on entry and after guard waits without changing durable replay semantics. */
        const contactRun = <S extends ActionSpec, A>(
            spec: S & { readonly input: Schema.Schema<Input<S>, Schema.Schema.Encoded<S['input']>> },
            input: Input<S>,
            /** The second authorization runs only inside the acquired primary group, before contact state is changed. */
            work: (
                refresh: Effect.Effect<void, OrganisationFailure>
            ) => Effect.Effect<A, ResourceFailure | OrganisationFailure, ResourceScope>
        ) =>
            run(
                Effect.gen(
                    /** Detach target input before policy observers receive it, preserving exact canonical mutation intent. */ function* () {
                        // Canonical bytes prevent a policy observer from retaining and mutating the handler's live target.
                        const presented = yield* Caller;
                        const encoded = yield* Schema.encode(Schema.parseJson(spec.input))(input).pipe(
                            Effect.mapError(
                                /** Broken internal encoding must not disclose contact bytes. */ () =>
                                    new OrganisationFailure({ reason: 'unavailable' })
                            )
                        );
                        const refresh = Effect.gen(
                            /** A lock wait can outlive permission/session/flag authority; admission alone is insufficient. */ function* () {
                                // Refreshed identity may revoke the original authority but cannot reroute the captured provider or delegation.
                                const live = yield* identity.resolve(presented);
                                if (
                                    live.tenant !== tenant.id ||
                                    live.subject !== presented.subject ||
                                    live.session !== presented.session ||
                                    live.kind !== presented.kind ||
                                    live.onBehalfOf !== presented.onBehalfOf ||
                                    !(yield* flags.evaluate(crmFlag)).value
                                )
                                    return yield* new OrganisationFailure({ reason: 'denied' });
                                yield* authorizer.canInvoke(live, spec);
                                yield* authorizer.check(
                                    live,
                                    spec,
                                    yield* Schema.decode(Schema.parseJson(spec.input))(encoded)
                                );
                            }
                        ).pipe(
                            Effect.mapError(
                                /** Identity, flag and target-policy diagnostics stay outside the public contact error. */ () =>
                                    new OrganisationFailure({ reason: 'denied' })
                            )
                        );
                        return yield* api.transaction(refresh.pipe(Effect.zipRight(work(refresh))));
                    }
                )
            );
        /** Serialize every contact mutation with its primary group, preserving immutable identity and unrelated parent revisions. */
        const changeContact = (
            input: {
                readonly id: string;
                readonly organisationId: string;
                readonly expectedRevision: number;
                readonly value?: string;
            },
            mode: 'update' | 'remove' | 'primary',
            refresh: Effect.Effect<void, OrganisationFailure>
        ) =>
            Effect.gen(
                /** Reread after guard acquisition so stale revisions and an intervening removal cannot be overwritten. */ function* () {
                    const before = yield* loadContact(input.id, input.organisationId);
                    yield* lockContacts(input.organisationId, before.kind);
                    yield* refresh;
                    yield* activeParent(input.organisationId);
                    const current = yield* loadContact(input.id, input.organisationId);
                    if (current.revision !== input.expectedRevision || (mode === 'primary' && current.primary))
                        return yield* new OrganisationFailure({ reason: 'conflict' });
                    const next = yield* Schema.decodeUnknown(ContactPoint)({
                        ...current,
                        ...(mode === 'update'
                            ? { value: input.value }
                            : { primary: mode === 'primary', removed: mode === 'remove' }),
                    }).pipe(
                        Effect.mapError(
                            /** Validate replacement syntax against immutable stored kind without leaking the submitted value. */ () =>
                                new OrganisationFailure({ reason: 'invalid-value' })
                        )
                    );
                    if (mode === 'primary') {
                        // Complete pagination and the shared guard make this an atomic switch, including a previous primary on a later page.
                        for (const other of yield* contacts(input.organisationId))
                            if (other.kind === current.kind && other.primary)
                                yield* api.update(contactPoint, other.id, other.revision, { primary: false });
                    }
                    return yield* contactOutput(
                        yield* api.update(contactPoint, current.id, current.revision, {
                            value: next.value,
                            primary: next.primary,
                            removed: next.removed,
                        })
                    );
                }
            );
        /** Advance both halves at one optimistic revision, including archive-only changes, inside the provider transaction. */
        const change = (
            input: { readonly id: string; readonly expectedRevision: number },
            fields: {
                readonly displayName?: string;
                readonly legalName?: string;
                readonly tradingName?: string;
            },
            archived: boolean
        ) =>
            run(
                api.transaction(
                    Effect.gen(
                        /** Compare state before paired writes; a second-half conflict rolls the first half and its history back. */ function* () {
                            // Validate the shared revision and state transition before creating either tentative history entry.
                            const current = yield* load(input.id);
                            if (
                                current.revision !== input.expectedRevision ||
                                (current.archived === archived && fields.displayName === undefined) ||
                                (fields.displayName !== undefined && current.archived)
                            )
                                return yield* new OrganisationFailure({ reason: 'conflict' });
                            yield* api.update(party, input.id, input.expectedRevision, {
                                ...(fields.displayName === undefined ? {} : { displayName: fields.displayName }),
                                archived,
                            });
                            yield* api.update(organisation, input.id, input.expectedRevision, {
                                ...(fields.legalName === undefined ? {} : { legalName: fields.legalName }),
                                ...(fields.tradingName === undefined ? {} : { tradingName: fields.tradingName }),
                            });
                            return yield* load(input.id);
                        }
                    )
                )
            );
        return {
            manifest: {
                format: 1,
                id: 'crm',
                version: '1.0.0',
                description: 'Tenant-private CRM organisations.',
                flag: crmFlag.key,
                flags: [crmFlag],
                actions: [...organisationActions, ...contactPointActions].map(
                    /** Keep registration bound to the exported portable specifications. */ (spec) => spec.name
                ),
            },
            actions: [
                implement(
                    organisationCreate,
                    /** Create distinct records even when another organisation has identical names. */ (input) =>
                        run(
                            api.transaction(
                                Effect.gen(
                                    /** Persist creator and owner from this invocation's resolved identity, never submitted fields. */ function* () {
                                        // Delegation belongs to the live host identity, not to the session that composed this module.
                                        const caller = yield* Caller;
                                        yield* api.create(party, input.id, {
                                            kind: 'organisation',
                                            displayName: input.displayName,
                                            visibility: 'tenant',
                                            createdBy: caller.subject,
                                            owner: caller.onBehalfOf ?? caller.subject,
                                            archived: false,
                                        });
                                        yield* api.create(organisation, input.id, {
                                            legalName: input.legalName,
                                            ...(input.tradingName === undefined
                                                ? {}
                                                : { tradingName: input.tradingName }),
                                        });
                                        return yield* load(input.id);
                                    }
                                )
                            )
                        )
                ),
                implement(
                    organisationUpdate,
                    /** Omitted trading name retains its stored value; names never change Party identity. */ (input) =>
                        change(input, input, false)
                ),
                implement(
                    organisationArchive,
                    /** Preserve the paired immutable history while hiding the record from default reads. */ (input) =>
                        change(input, {}, true)
                ),
                implement(
                    organisationRestore,
                    /** Restore only a currently archived record at the expected revision. */ (input) =>
                        change(input, {}, false)
                ),
                implement(
                    organisationGet,
                    /** Read inside the provider transaction; reject diverged revisions rather than return a torn pair. */ (
                        input
                    ) =>
                        run(
                            api.transaction(
                                Effect.gen(
                                    /** Archived existence is disclosed only through the explicit already-authorized option. */ function* () {
                                        // Use the same refusal as an absent row so ordinary reads do not reveal archived existence.
                                        const record = yield* load(input.id);
                                        if (record.archived && !input.includeArchived)
                                            return yield* new OrganisationFailure({ reason: 'not-found' });
                                        return record;
                                    }
                                )
                            )
                        )
                ),
                implement(
                    organisationList,
                    /** Return a bounded ID-ordered page; its last ID is an exclusive continuation cursor. */ (input) =>
                        run(
                            api.transaction(
                                Effect.gen(
                                    /** Filter archive state in the resource query before limiting, avoiding empty/missing page boundaries. */ function* () {
                                        // Filtering after the limit would lose page slots around archived IDs and truncate active results.
                                        const rows = yield* api.query(party, {
                                            limit: input.limit ?? 50,
                                            ...(input.after === undefined ? {} : { after: input.after }),
                                            ...(input.includeArchived
                                                ? {}
                                                : { where: { field: 'archived', equals: false } }),
                                        });
                                        const items = yield* Effect.forEach(
                                            rows,
                                            /** Validate the matching subtype under the same read transaction before returning any page. */ (
                                                row
                                            ) => load(row.id)
                                        );
                                        const last = rows.at(-1);
                                        return { items, ...(last === undefined ? {} : { after: last.id }) };
                                    }
                                )
                            )
                        )
                ),
                implement(
                    contactPointAdd,
                    /** Creation never deduplicates values or infers primary/verified status from submitted text. */ (
                        input
                    ) =>
                        contactRun(
                            contactPointAdd,
                            input,
                            /** Guard before checking parent state; all contact/history writes join the existing durable owner. */ (
                                refresh
                            ) =>
                                Effect.gen(
                                    /** Keep parent validation and contact persistence in one provider transaction without rewriting the parent. */ function* () {
                                        // All mutations use guard-first ordering so add/remove and primary selection share one concurrency boundary.
                                        yield* lockContacts(input.organisationId, input.kind);
                                        yield* refresh;
                                        yield* activeParent(input.organisationId);
                                        return yield* contactOutput(
                                            yield* api.create(contactPoint, input.id, {
                                                organisationId: input.organisationId,
                                                kind: input.kind,
                                                label: 'work',
                                                value: input.value,
                                                primary: false,
                                                removed: false,
                                            })
                                        );
                                    }
                                )
                        )
                ),
                implement(
                    contactPointUpdate,
                    /** Retain parent, kind, label and primary state while revisioning only the value. */ (input) =>
                        contactRun(
                            contactPointUpdate,
                            input,
                            /** Reauthorize after acquiring this contact's immutable group. */ (refresh) =>
                                changeContact(input, 'update', refresh)
                        )
                ),
                implement(
                    contactPointRemove,
                    /** Tombstone the contact without promoting a replacement. */ (input) =>
                        contactRun(
                            contactPointRemove,
                            input,
                            /** Removal uses the same group as primary selection so it cannot race a new selection. */ (
                                refresh
                            ) => changeContact(input, 'remove', refresh)
                        )
                ),
                implement(
                    contactPointSetPrimary,
                    /** Atomically clear all previous live same-kind primaries before selecting this revision. */ (
                        input
                    ) =>
                        contactRun(
                            contactPointSetPrimary,
                            input,
                            /** Never use a registration-time authority snapshot after waiting for the guard. */ (
                                refresh
                            ) => changeContact(input, 'primary', refresh)
                        )
                ),
                implement(
                    contactPointGet,
                    /** Fresh reads refuse archived/denied parents and removed or foreign contacts. */ (input) =>
                        contactRun(
                            contactPointGet,
                            input,
                            /** Parent and contact reads share the transaction, with all storage projections decoded. */ () =>
                                Effect.gen(
                                    /** Require the parent route before looking up a possibly foreign contact identity. */ function* () {
                                        // A contact ID alone never authorizes bypassing current organisation visibility or archive state.
                                        yield* activeParent(input.organisationId);
                                        return yield* loadContact(input.id, input.organisationId);
                                    }
                                )
                        )
                ),
                implement(
                    contactPointList,
                    /** Return live contacts only, with an exclusive last-returned-ID cursor. */ (input) =>
                        contactRun(
                            contactPointList,
                            input,
                            /** Scan past tombstones before applying the caller's bounded page size. */ () =>
                                Effect.gen(
                                    /** Fresh parent authority is required even for empty pages, preventing a contact-existence oracle. */ function* () {
                                        // Check the parent before scanning, including after an exclusive cursor beyond the last contact.
                                        yield* activeParent(input.organisationId);
                                        const items = yield* contacts(
                                            input.organisationId,
                                            input.after,
                                            input.limit ?? 50
                                        );
                                        const last = items.at(-1);
                                        return { items, ...(last === undefined ? {} : { after: last.id }) };
                                    }
                                )
                        )
                ),
            ],
        } satisfies ServerModule;
    }
);
