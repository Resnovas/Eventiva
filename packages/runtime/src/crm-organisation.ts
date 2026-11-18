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

import { Caller } from '@eventiva/contracts/caller';
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
} from '@eventiva/contracts/crm-organisation';
import { Resources, type ResourceFailure, type ResourceScope } from '@eventiva/contracts/resource';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Effect, Option, Schema } from 'effect';
import { implement } from './action.ts';
import type { ServerModule } from './host.ts';

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
    /** Capture tenant persistence only; every invocation supplies its freshly resolved Caller independently. */ function* () {
        // Capturing Caller here would pin the registration user's authority across later invocations and revocations.
        const api = yield* Resources;
        const tenant = yield* CurrentTenant;
        const { party, organisation } = yield* organisationResources;
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
                actions: organisationActions.map(
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
            ],
        } satisfies ServerModule;
    }
);
