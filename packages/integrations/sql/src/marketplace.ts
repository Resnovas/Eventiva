/**
 * @file packages/integrations/sql/src/marketplace.ts
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

import { SqlClient } from '@effect/sql';
import type { SqlError } from '@effect/sql/SqlError';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import {
    ClaimExchange,
    type ExchangeClaim,
    MarketplaceAdministration,
    MarketplaceAuditEvent,
    MarketplaceAuditQuery,
    MarketplaceOperatorPolicy,
    MarketplaceOutbox,
    ProvisionExchange,
    RevokeParticipant,
    SettleExchange,
} from '@eventiva/contracts/marketplace-durable';
import {
    ExchangeIntent,
    ExchangeScope,
    MarketplaceAuthority,
    MarketplaceFailure,
    MarketplaceStore,
    type MarketplaceTransaction,
    ParticipantGrant,
    SnapshotReference,
} from '@eventiva/contracts/marketplace';
import { CurrentTenant, EpochMillis } from '@eventiva/contracts/storage';
import { type Cause, Context, Data, Effect, Either, Layer, Option, Schema } from 'effect';
import type { Dialect } from './migrations.ts';
import { uuidV7 } from './values.ts';

const failure = (reason: MarketplaceFailure['reason']) => new MarketplaceFailure({ reason });
const decode = <A, I>(schema: Schema.Schema<A, I>, input: NoInfer<I>) =>
    Schema.decode(schema)(input, { onExcessProperty: 'error' }).pipe(Effect.mapError(() => failure('invalid')));
const encode = <A, I>(schema: Schema.Schema<A, I>, input: NoInfer<A>) =>
    Schema.encode(Schema.parseJson(schema))(input).pipe(Effect.mapError(() => failure('invalid')));
const safe = <A, R>(effect: Effect.Effect<A, MarketplaceFailure | SqlError, R>) =>
    effect.pipe(
        Effect.catchTag('SqlError', () => Effect.fail(failure('unavailable'))),
        Effect.catchAllDefect(() => Effect.fail(failure('unavailable')))
    );
const sameScope = (a: ExchangeScope, b: ExchangeScope) =>
    a.exchange === b.exchange &&
    a.ownerTenant === b.ownerTenant &&
    a.recipientTenant === b.recipientTenant &&
    a.resource === b.resource &&
    a.purpose === b.purpose;

class Origin extends Context.Tag('@eventiva/integrations.sql/marketplace/Origin')<Origin, symbol>() {}

/** Capture one trusted marketplace database, never a caller-selected tenant client.
 * Global guard serializes grant revocation, staging and local outbox transitions in this database only.
 */
export const marketplace = (
    dialect: Dialect
): Layer.Layer<MarketplaceStore | MarketplaceAdministration | MarketplaceOutbox, never, SqlClient.SqlClient> =>
    Layer.unwrapEffect(
        Effect.gen(function* () {
            const sql = yield* SqlClient.SqlClient;
            const now = safe(
                Effect.gen(function* () {
                    const [row] = yield* dialect === 'postgres'
                        ? sql<{
                              now: string | number;
                          }>`SELECT CAST(EXTRACT(EPOCH FROM clock_timestamp()) * 1000 AS bigint) AS now`
                        : sql<{
                              now: string | number;
                          }>`SELECT CAST((julianday('now') - 2440587.5) * 86400000 AS integer) AS now`;
                    return yield* decode(EpochMillis, Number(row?.now));
                })
            );
            const atomic = <A, E, R>(use: Effect.Effect<A, E, R>): Effect.Effect<A, E | MarketplaceFailure, R> => {
                class CallbackFailure extends Data.TaggedError('MarketplaceCallbackFailure')<{
                    readonly original: Cause.Cause<E>;
                }> {}
                return Effect.gen(function* () {
                    if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                        return yield* failure('unavailable');
                    return yield* sql.withTransaction(
                        Effect.gen(function* () {
                            const guard =
                                yield* sql`UPDATE marketplace_guard SET version = version WHERE id = 1 RETURNING id`;
                            if (guard.length !== 1) return yield* failure('unavailable');
                            return yield* use.pipe(
                                Effect.catchAllCause((original) => Effect.fail(new CallbackFailure({ original })))
                            );
                        })
                    );
                }).pipe(
                    Effect.catchTag('SqlError', () => Effect.fail(failure('unavailable'))),
                    Effect.catchAllDefect(() => Effect.fail(failure('unavailable'))),
                    Effect.catchTag('MarketplaceCallbackFailure', (error) => Effect.failCause(error.original))
                );
            };
            const read = <A extends { readonly id: string } | { readonly command: string }, I>(
                table: 'marketplace_snapshot' | 'marketplace_grant' | 'marketplace_intent',
                schema: Schema.Schema<A, I>,
                key: string
            ) =>
                Effect.gen(function* () {
                    const [row] = yield* sql<{ body: string }>`SELECT body FROM ${sql(table)} WHERE id = ${key}`;
                    if (row === undefined) return undefined;
                    const value = yield* decode(Schema.parseJson(schema), row.body);
                    if (('id' in value ? value.id : value.command) !== key) return yield* failure('invalid');
                    return value;
                }).pipe(Effect.catchTag('SqlError', () => Effect.fail(failure('unavailable'))));
            const grant = (key: string) =>
                safe(
                    Effect.gen(function* () {
                        const value = yield* read('marketplace_grant', ParticipantGrant, key);
                        if (value === undefined) return undefined;
                        const [row] = yield* sql<{
                            revoked: number;
                        }>`SELECT revoked FROM marketplace_grant WHERE id = ${key}`;
                        return { ...value, revoked: Number(row?.revoked) === 1 };
                    })
                );
            const audit = (event: MarketplaceAuditEvent) =>
                Effect.gen(function* () {
                    const body = yield* encode(MarketplaceAuditEvent, event);
                    const scope = yield* encode(ExchangeScope, event.scope);
                    yield* sql`INSERT INTO marketplace_audit (id, scope_key, body) VALUES (${event.id}, ${scope}, ${body})`;
                });
            const operator = (scope: ExchangeScope, operation: 'provision' | 'revoke' | 'audit' | 'process') =>
                Effect.gen(function* () {
                    const caller = yield* decode(CallerIdentity, yield* Caller);
                    const tenant = yield* CurrentTenant;
                    if (
                        caller.tenant !== tenant.id ||
                        (tenant.id !== scope.ownerTenant && tenant.id !== scope.recipientTenant) ||
                        ((operation === 'provision' || operation === 'revoke') && tenant.id !== scope.ownerTenant)
                    )
                        return yield* failure('denied');
                    yield* (yield* MarketplaceOperatorPolicy).authorize(caller, operation, scope);
                    return caller;
                });
            const administration = MarketplaceAdministration.of({
                provision: (input) =>
                    safe(
                        atomic(
                            Effect.gen(function* () {
                                const request = yield* decode(ProvisionExchange, input);
                                const { snapshot, grant: value } = request;
                                const caller = yield* operator(snapshot.scope, 'provision');
                                if (
                                    !sameScope(snapshot.scope, value.scope) ||
                                    value.revoked ||
                                    (value.participantTenant !== snapshot.scope.ownerTenant &&
                                        value.participantTenant !== snapshot.scope.recipientTenant) ||
                                    value.expiresAt <= (yield* now)
                                )
                                    return yield* failure('invalid');
                                const body = yield* encode(ProvisionExchange, request);
                                const actor = yield* encode(CallerIdentity, caller);
                                const [previous] = yield* sql<{
                                    body: string;
                                    actor: string;
                                }>`SELECT body, actor FROM marketplace_request WHERE id = ${request.request}`;
                                if (previous !== undefined) {
                                    if (previous.body !== body || previous.actor !== actor)
                                        return yield* failure('conflict');
                                    return;
                                }
                                const snapshotBody = yield* encode(SnapshotReference, snapshot);
                                const existingSnapshot = yield* read(
                                    'marketplace_snapshot',
                                    SnapshotReference,
                                    snapshot.id
                                );
                                if (
                                    existingSnapshot !== undefined &&
                                    (yield* encode(SnapshotReference, existingSnapshot)) !== snapshotBody
                                )
                                    return yield* failure('conflict');
                                if ((yield* grant(value.id)) !== undefined) return yield* failure('conflict');
                                yield* sql`INSERT INTO marketplace_snapshot (id, body) VALUES (${snapshot.id}, ${snapshotBody}) ON CONFLICT (id) DO NOTHING`;
                                const grantBody = yield* encode(ParticipantGrant, value);
                                yield* sql`INSERT INTO marketplace_grant (id, body, revoked) VALUES (${value.id}, ${grantBody}, 0)`;
                                yield* sql`INSERT INTO marketplace_request (id, body, actor) VALUES (${request.request}, ${body}, ${actor})`;
                                yield* audit({
                                    id: `request:${request.request}`,
                                    scope: snapshot.scope,
                                    actor: caller.subject,
                                    at: yield* now,
                                    operation: 'provision',
                                    reference: value.id,
                                });
                            })
                        )
                    ),
                revoke: (input) =>
                    safe(
                        atomic(
                            Effect.gen(function* () {
                                const request = yield* decode(RevokeParticipant, input);
                                const caller = yield* operator(request.scope, 'revoke');
                                const value = yield* grant(request.grant);
                                if (value === undefined || !sameScope(value.scope, request.scope))
                                    return yield* failure('denied');
                                const body = yield* encode(RevokeParticipant, request);
                                const actor = yield* encode(CallerIdentity, caller);
                                const [previous] = yield* sql<{
                                    body: string;
                                    actor: string;
                                }>`SELECT body, actor FROM marketplace_request WHERE id = ${request.request}`;
                                if (previous !== undefined) {
                                    if (previous.body !== body || previous.actor !== actor)
                                        return yield* failure('conflict');
                                    return;
                                }
                                yield* sql`UPDATE marketplace_grant SET revoked = 1 WHERE id = ${value.id}`;
                                yield* sql`INSERT INTO marketplace_request (id, body, actor) VALUES (${request.request}, ${body}, ${actor})`;
                                yield* audit({
                                    id: `request:${request.request}`,
                                    scope: request.scope,
                                    actor: caller.subject,
                                    at: yield* now,
                                    operation: 'revoke',
                                    reference: value.id,
                                });
                            })
                        )
                    ),
                audit: (input) =>
                    safe(
                        atomic(
                            Effect.gen(function* () {
                                const request = yield* decode(MarketplaceAuditQuery, input);
                                yield* operator(request.scope, 'audit');
                                const key = yield* encode(ExchangeScope, request.scope);
                                const rows = yield* sql<{
                                    body: string;
                                }>`SELECT body FROM marketplace_audit WHERE scope_key = ${key} ORDER BY id LIMIT ${request.limit}`;
                                return yield* Effect.forEach(rows, (row) =>
                                    decode(Schema.parseJson(MarketplaceAuditEvent), row.body)
                                );
                            })
                        )
                    ),
            });
            const store = MarketplaceStore.of({
                transaction: (use) =>
                    atomic(
                        Effect.gen(function* () {
                            const connection = yield* Effect.serviceOption(SqlClient.TransactionConnection);
                            if (Option.isNone(connection)) return yield* failure('unavailable');
                            const token = Symbol();
                            let active = true;
                            const pending = new Set<string>();
                            const required = Effect.gen(function* () {
                                const current = yield* Effect.serviceOption(SqlClient.TransactionConnection);
                                const origin = yield* Effect.serviceOption(Origin);
                                if (
                                    !active ||
                                    Option.isNone(current) ||
                                    current.value[0] !== connection.value[0] ||
                                    Option.isNone(origin) ||
                                    origin.value !== token
                                )
                                    return yield* failure('unavailable');
                            });
                            const checked = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                                required.pipe(Effect.zipRight(effect));
                            const tx: MarketplaceTransaction = {
                                grant: (id) => checked(grant(id)),
                                snapshot: (id) => checked(read('marketplace_snapshot', SnapshotReference, id)),
                                intent: (id) => checked(read('marketplace_intent', ExchangeIntent, id)),
                                insertIntent: (input) =>
                                    checked(
                                        Effect.gen(function* () {
                                            const value = yield* decode(ExchangeIntent, input);
                                            const body = yield* encode(ExchangeIntent, value);
                                            yield* sql`INSERT INTO marketplace_intent (id, grant_id, snapshot_id, body) VALUES (${value.command}, ${value.grant}, ${value.snapshot.id}, ${body})`;
                                            pending.add(value.command);
                                        })
                                    ).pipe(Effect.catchTag('SqlError', () => Effect.fail(failure('unavailable')))),
                                enqueue: (input) =>
                                    checked(
                                        Effect.gen(function* () {
                                            const value = yield* decode(ExchangeIntent, input);
                                            const stored = yield* read(
                                                'marketplace_intent',
                                                ExchangeIntent,
                                                value.command
                                            );
                                            if (
                                                stored === undefined ||
                                                (yield* encode(ExchangeIntent, stored)) !==
                                                    (yield* encode(ExchangeIntent, value))
                                            )
                                                return yield* failure('conflict');
                                            yield* sql`INSERT INTO marketplace_delivery (command, state, attempt, available_at) VALUES (${value.command}, 'pending', 0, 0)`;
                                            yield* audit({
                                                id: `intent:${value.command}`,
                                                scope: value.snapshot.scope,
                                                actor: value.subject,
                                                at: yield* now,
                                                operation: 'stage',
                                                reference: value.command,
                                            });
                                            pending.delete(value.command);
                                        })
                                    ).pipe(Effect.catchTag('SqlError', () => Effect.fail(failure('unavailable')))),
                            };
                            return yield* use(tx).pipe(
                                Effect.provideService(Origin, token),
                                Effect.tap(() =>
                                    pending.size === 0 ? Effect.void : Effect.fail(failure('unavailable'))
                                ),
                                Effect.ensuring(
                                    Effect.sync(() => {
                                        active = false;
                                    })
                                )
                            );
                        })
                    ),
            });
            const live = (value: ExchangeIntent) =>
                Effect.gen(function* () {
                    const current = yield* grant(value.grant);
                    const reference = yield* read('marketplace_snapshot', SnapshotReference, value.snapshot.id);
                    if (
                        reference === undefined ||
                        (yield* encode(SnapshotReference, reference)) !==
                            (yield* encode(SnapshotReference, value.snapshot))
                    )
                        return yield* failure('invalid');
                    const caller = yield* Caller;
                    if (
                        current === undefined ||
                        current.revoked ||
                        current.expiresAt <= (yield* now) ||
                        current.action !== 'stage' ||
                        current.participantTenant !== value.tenant ||
                        current.subject !== value.subject ||
                        !sameScope(current.scope, value.snapshot.scope) ||
                        caller.tenant !== value.tenant ||
                        caller.subject !== value.subject ||
                        (caller.onBehalfOf ?? null) !== value.onBehalfOf
                    )
                        return yield* failure('denied');
                    yield* (yield* MarketplaceAuthority).authorize(caller, value.snapshot, 'stage');
                    if (current.expiresAt <= (yield* now)) return yield* failure('denied');
                });
            const processing = (command: string) =>
                Effect.gen(function* () {
                    const value = yield* read('marketplace_intent', ExchangeIntent, command);
                    if (value === undefined) return yield* failure('denied');
                    const caller = yield* operator(value.snapshot.scope, 'process');
                    if (
                        caller.tenant !== value.tenant ||
                        caller.subject !== value.subject ||
                        (caller.onBehalfOf ?? null) !== value.onBehalfOf
                    )
                        return yield* failure('denied');
                    return value;
                });
            const block = (value: ExchangeIntent, operation: 'blocked' | 'exhausted', key: string) =>
                Effect.gen(function* () {
                    yield* sql`UPDATE marketplace_delivery SET state = ${operation}, lease = NULL, lease_until = NULL WHERE command = ${value.command}`;
                    yield* audit({
                        id: `block:${key}`,
                        scope: value.snapshot.scope,
                        actor: value.subject,
                        at: yield* now,
                        operation,
                        reference: value.command,
                    });
                });
            const outbox = MarketplaceOutbox.of({
                claim: (input) =>
                    safe(
                        atomic(
                            Effect.gen(function* () {
                                const request = yield* decode(ClaimExchange, input);
                                const value = yield* processing(request.command);
                                const [row] = yield* sql<{
                                    state: string;
                                    attempt: number | string;
                                    max_attempts: number | string | null;
                                    lease_until: number | string | null;
                                    available_at: number | string;
                                }>`SELECT state, attempt, max_attempts, lease_until, available_at FROM marketplace_delivery WHERE command = ${request.command}`;
                                if (row === undefined) return yield* failure('unavailable');
                                const authorization = yield* live(value).pipe(Effect.either);
                                if (Either.isLeft(authorization)) {
                                    if (authorization.left.reason !== 'denied') return yield* authorization.left;
                                    if (!['recorded', 'blocked', 'exhausted'].includes(row.state)) {
                                        const key = yield* uuidV7.pipe(Effect.mapError(() => failure('unavailable')));
                                        yield* block(value, 'blocked', key);
                                    }
                                    return authorization;
                                }
                                if (row.max_attempts !== null && Number(row.max_attempts) !== request.maxAttempts)
                                    return yield* failure('conflict');
                                const time = yield* now;
                                const attempt = Number(row.attempt);
                                if (
                                    ['recorded', 'blocked', 'exhausted'].includes(row.state) ||
                                    Number(row.available_at) > time ||
                                    (row.state === 'running' && Number(row.lease_until) > time)
                                )
                                    return Either.right(undefined);
                                const token = yield* uuidV7.pipe(Effect.mapError(() => failure('unavailable')));
                                if (attempt >= request.maxAttempts) {
                                    yield* block(value, 'exhausted', token);
                                    return Either.right(undefined);
                                }
                                const until = yield* decode(EpochMillis, time + request.leaseMs);
                                const claim: ExchangeClaim = {
                                    command: request.command,
                                    lease: token,
                                    attempt: attempt + 1,
                                };
                                yield* sql`UPDATE marketplace_delivery SET state = 'running', lease = ${token}, lease_until = ${until}, attempt = ${claim.attempt}, max_attempts = ${request.maxAttempts} WHERE command = ${request.command}`;
                                yield* audit({
                                    id: `claim:${token}`,
                                    scope: value.snapshot.scope,
                                    actor: value.subject,
                                    at: time,
                                    operation: 'claim',
                                    reference: value.command,
                                });
                                return Either.right(claim);
                            })
                        )
                    ).pipe(Effect.flatMap((result) => result)),
                settle: (input) =>
                    safe(
                        atomic(
                            Effect.gen(function* () {
                                const request = yield* decode(SettleExchange, input);
                                const value = yield* processing(request.claim.command);
                                const body = yield* encode(SettleExchange, request);
                                const [previous] = yield* sql<{
                                    body: string;
                                }>`SELECT body FROM marketplace_settlement WHERE lease = ${request.claim.lease}`;
                                if (previous !== undefined) {
                                    yield* live(value);
                                    if (previous.body !== body) return yield* failure('conflict');
                                    return Either.right(undefined);
                                }
                                const [row] = yield* sql<{
                                    state: string;
                                    lease: string | null;
                                    lease_until: string | number | null;
                                    attempt: string | number;
                                    max_attempts: string | number;
                                }>`SELECT state, lease, lease_until, attempt, max_attempts FROM marketplace_delivery WHERE command = ${request.claim.command}`;
                                if (
                                    row === undefined ||
                                    row.state !== 'running' ||
                                    row.lease !== request.claim.lease ||
                                    Number(row.attempt) !== request.claim.attempt ||
                                    Number(row.lease_until) <= (yield* now)
                                )
                                    return yield* failure('conflict');
                                const authorization = yield* live(value).pipe(Effect.either);
                                if (Either.isLeft(authorization)) {
                                    if (authorization.left.reason !== 'denied') return yield* authorization.left;
                                    yield* block(value, 'blocked', `settle:${request.claim.lease}`);
                                    return authorization;
                                }
                                // Live policy may take time; an expired fence cannot record new evidence.
                                if (Number(row.lease_until) <= (yield* now)) return yield* failure('conflict');
                                const state =
                                    request.outcome.state === 'retry' && Number(row.attempt) >= Number(row.max_attempts)
                                        ? 'exhausted'
                                        : request.outcome.state;
                                yield* sql`UPDATE marketplace_delivery SET state = ${state}, available_at = ${request.outcome.state === 'retry' ? request.outcome.availableAt : 0}, lease = NULL, lease_until = NULL WHERE command = ${request.claim.command}`;
                                yield* sql`INSERT INTO marketplace_settlement (lease, command, body) VALUES (${request.claim.lease}, ${request.claim.command}, ${body})`;
                                yield* audit({
                                    id: `settle:${request.claim.lease}`,
                                    scope: value.snapshot.scope,
                                    actor: value.subject,
                                    at: yield* now,
                                    operation: state,
                                    reference: value.command,
                                });
                                return Either.right(undefined);
                            })
                        )
                    ).pipe(Effect.flatMap((result) => result)),
            });
            return Layer.mergeAll(
                Layer.succeed(MarketplaceStore, store),
                Layer.succeed(MarketplaceAdministration, administration),
                Layer.succeed(MarketplaceOutbox, outbox)
            );
        })
    );
