/**
 * @file apps/server/src/identity-session-policy.ts
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

import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { type Cause, Clock, Config, Context, Data, Effect, Layer, Schema } from 'effect';

const duration = Schema.Number.pipe(Schema.int(), Schema.between(300_000, Number.MAX_SAFE_INTEGER));
const deadline = Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER));
const liveSession = Schema.Struct({ tenant: TenantId, expiresAt: deadline });

/** Trusted security policy, not request preferences: both required durations are integer milliseconds with no fallback. */
export const IdentitySessionPolicyValue = Schema.Struct({
    tenant: TenantId,
    sessionLifetimeMs: duration,
    approvalWindowMs: duration,
}).pipe(
    Schema.filter(
        /** A tenant's consent window cannot exceed the configured authentication maximum. */
        (value) => value.approvalWindowMs <= value.sessionLifetimeMs
    )
);
export type IdentitySessionPolicyValue = typeof IdentitySessionPolicyValue.Type;

/** Closed error fields contain no rejected configuration, provider diagnostics or purported session evidence. */
interface SessionPolicyFailureFields {
    readonly reason: 'unavailable' | 'invalid' | 'tenant' | 'expired';
}
/** Hide the vendor's open constructor generic from emitted declarations, matching the existing invocation denial boundary. */
const SessionPolicyFailureBase: new (
    fields: SessionPolicyFailureFields
) => Cause.YieldableError & SessionPolicyFailureFields & { readonly _tag: 'SessionPolicyFailure' } =
    Data.TaggedError('SessionPolicyFailure');
/** Public denial categories deliberately omit raw configuration values, source diagnostics and rejected session data. */
export class SessionPolicyFailure extends SessionPolicyFailureBase {}

/** Decode at every trust boundary, including typed server calls, without attaching the rejected value as a cause. */
const decode = <A, I>(schema: Schema.Schema<A, I>, value: unknown) =>
    Schema.decodeUnknown(schema)(value, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(
            /** Schema diagnostics can contain secrets supplied through a misconfigured source. */
            () => new SessionPolicyFailure({ reason: 'invalid' })
        )
    );

/**
 * Optional, unactivated trusted Config adapter. All three keys are mandatory; loading it selects no production duration
 * or configuration authority. Compose it only behind the trusted tenant route, never from a request's fields.
 */
export const sessionPolicyFromConfig = Effect.gen(
    /** Read one explicit configuration tuple per evaluation; constructing a layer must not freeze its values. */
    function* () {
        // Defer configuration reads until use so a trusted provider's changes are not frozen at module import.
        const configured = yield* Config.all({
            tenant: Config.string('IDENTITY_SESSION_POLICY_TENANT'),
            sessionLifetimeMs: Config.integer('IDENTITY_SESSION_MAXIMUM_MS'),
            approvalWindowMs: Config.integer('IDENTITY_APPROVAL_WINDOW_MS'),
        }).pipe(
            Effect.mapError(
                /** Missing or unparseable configuration denies without exposing ConfigError's paths or input text. */
                () => new SessionPolicyFailure({ reason: 'unavailable' })
            )
        );
        return yield* decode(IdentitySessionPolicyValue, configured);
    }
);

/** Policy-only capability. Session authentication, live SQL expiry resolution and atomic admission remain composition obligations. */
export class IdentitySessionPolicy extends Context.Tag('@eventiva/server/IdentitySessionPolicy')<
    IdentitySessionPolicy,
    {
        /** Reread and detach the trusted routed policy; callers must not retain it as permanent accepting authority. */
        readonly current: Effect.Effect<IdentitySessionPolicyValue, SessionPolicyFailure>;
        /** Calculate a fresh issuance cap from trusted clock and current maximum; this does not open or authenticate a session. */
        readonly sessionExpiresAt: Effect.Effect<number, SessionPolicyFailure>;
        /** Calculate the current approval cap from a separately authenticated, freshly resolved same-tenant live session deadline. */
        readonly approvalExpiresAt: (session: {
            readonly tenant: TenantId;
            readonly expiresAt: number;
        }) => Effect.Effect<number, SessionPolicyFailure>;
    }
>() {}

/** Bind a live trusted source to the routed tenant once, never its policy values; source evaluation occurs on every operation. */
export const identitySessionPolicy = (
    source: Effect.Effect<unknown, SessionPolicyFailure>
): Layer.Layer<IdentitySessionPolicy, never, CurrentTenant> =>
    Layer.effect(
        IdentitySessionPolicy,
        Effect.gen(
            /** Only the physical/trusted route supplies expected ownership; a policy body cannot switch its tenant. */
            function* () {
                // Capture the route's scalar identity, not a mutable policy snapshot or caller-controlled tenant field.
                const { id: tenant } = yield* CurrentTenant;
                const current = Effect.gen(
                    /** Fresh decoding makes trusted-source policy changes visible and prevents aliasing returned scalar records. */
                    function* () {
                        // Decode after each read; a previously valid source may now be absent, malformed or foreign.
                        const value = yield* decode(IdentitySessionPolicyValue, yield* source);
                        if (value.tenant !== tenant) return yield* new SessionPolicyFailure({ reason: 'tenant' });
                        return value;
                    }
                );
                return IdentitySessionPolicy.of({
                    current,
                    sessionExpiresAt: Effect.gen(
                        /** Reject unsafe arithmetic rather than silently rounding an expiry upward. */
                        function* () {
                            // Valid durations alone do not make their sum with an absolute clock safe.
                            const value = yield* current;
                            const now = yield* decode(deadline, yield* Clock.currentTimeMillis);
                            return yield* decode(deadline, now + value.sessionLifetimeMs);
                        }
                    ),
                    /** Revalidate current policy, session ownership and exact expiry boundary before applying the earlier cap. */
                    approvalExpiresAt: (session) =>
                        Effect.gen(
                            /** The argument is policy input, not proof: the caller must resolve actual live session authority separately. */
                            function* () {
                                // Never let an earlier session cap conceal malformed policy, foreign ownership or arithmetic overflow.
                                const value = yield* current;
                                const actual = yield* decode(liveSession, session);
                                if (actual.tenant !== tenant)
                                    return yield* new SessionPolicyFailure({ reason: 'tenant' });
                                const now = yield* decode(deadline, yield* Clock.currentTimeMillis);
                                if (actual.expiresAt <= now)
                                    return yield* new SessionPolicyFailure({ reason: 'expired' });
                                const configured = yield* decode(deadline, now + value.approvalWindowMs);
                                return Math.min(configured, actual.expiresAt);
                            }
                        ),
                });
            }
        )
    );
