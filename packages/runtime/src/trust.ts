/**
 * @file packages/runtime/src/trust.ts
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
    Assurance,
    BrokerGate,
    IdentityGate,
    ResourceGate,
    TrustEvidence,
    TrustFailure,
    TrustFailureReason,
    TrustPolicy,
    TrustPreflight,
    TrustReplay,
    TrustRequest,
    WorkloadGate,
    type TrustGate,
    type TrustVerifier,
} from '@eventiva/contracts/trust';
import { Cause, Effect, Option, Schema } from 'effect';

/** Bind evidence to every nonce, scope and key-version component, not just a resource or principal identifier. */
const sameRequest = (a: TrustRequest, b: TrustRequest): boolean =>
    a.nonce === b.nonce &&
    a.scope.tenant === b.scope.tenant &&
    a.scope.subject === b.scope.subject &&
    a.scope.audience === b.scope.audience &&
    a.scope.resource === b.scope.resource &&
    a.scope.resourceId === b.scope.resourceId &&
    a.scope.purpose === b.scope.purpose &&
    a.scope.profile === b.scope.profile &&
    a.scope.operation === b.scope.operation &&
    a.keys.root === b.keys.root &&
    a.keys.signingAuthority === b.keys.signingAuthority &&
    a.keys.encryptionAuthority === b.keys.encryptionAuthority &&
    a.keys.kek === b.keys.kek &&
    a.keys.kekVersion === b.keys.kekVersion &&
    a.keys.dek === b.keys.dek &&
    a.keys.dekVersion === b.keys.dekVersion;

/** Preserve pure interruption but sanitize adapter failures/defects into this gate's closed failure vocabulary. */
const observe = <A>(
    gate: TrustGate,
    /** Defer adapter invocation so construction defects are sanitized with execution failures. */ check: () => Effect.Effect<
        A,
        TrustFailure
    >
) =>
    Effect.suspend(check).pipe(
        Effect.catchAllCause(
            /** Reject adapter-controlled causes and gate labels without turning cancellation into a trust denial. */ (
                cause
            ) => {
                if (Cause.isInterruptedOnly(cause)) return Effect.interrupt;
                // Only a validated reason survives the boundary; stack traces, arbitrary identifiers and claimed gate labels do not.
                const failure = Cause.failureOption(cause);
                return Effect.fail(
                    new TrustFailure({
                        gate,
                        reason:
                            Option.isSome(failure) &&
                            failure.value instanceof TrustFailure &&
                            Schema.is(TrustFailureReason)(failure.value.reason)
                                ? failure.value.reason
                                : 'unavailable',
                    })
                );
            }
        )
    );

/** Validate one independent gate's exact evidence binding and freshness against trusted policy; return no release authority. */
const verify = (
    gate: TrustEvidence['gate'],
    port: TrustVerifier,
    request: TrustRequest,
    policy: TrustPolicy
): Effect.Effect<TrustEvidence, TrustFailure> =>
    Effect.gen(
        /** Check adapter output schema, request identity and time bounds before it contributes preflight evidence. */ function* () {
            // Do not propagate adapter-controlled causes, identifiers or gate labels.
            const observed = yield* observe(
                gate,
                /** Execute this verifier only inside its cause-sanitizing boundary. */ () =>
                    port.verify(request, policy)
            );
            const evidence = yield* Schema.decodeUnknown(TrustEvidence)(observed).pipe(
                Effect.mapError(
                    /** Hide malformed evidence details while retaining the host-selected gate attribution. */ () =>
                        new TrustFailure({ gate, reason: 'invalid' })
                )
            );
            if (evidence.gate !== gate || !sameRequest(evidence.request, request)) {
                return yield* Effect.fail(new TrustFailure({ gate, reason: 'binding' }));
            }
            const earliest = policy.freshAfter[gate];
            if (
                evidence.issuedAt < earliest ||
                evidence.issuedAt > policy.now ||
                evidence.expiresAt <= policy.now ||
                evidence.revocationCheckedAt < earliest ||
                evidence.revocationCheckedAt > policy.now ||
                evidence.revocationCheckedAt < evidence.issuedAt
            ) {
                return yield* Effect.fail(new TrustFailure({ gate, reason: 'stale' }));
            }
            return evidence;
        }
    );

/** Preflight only. Four live independent gates plus atomic replay are necessary but NOT
 * sufficient for release. Concrete custody/client-release policy is deliberately unresolved.
 * No hook policy, crypto implementation, decryption or broker release is called here.
 */
export const trustPreflight = (
    input: TrustRequest,
    trustedPolicy: TrustPolicy
): Effect.Effect<TrustPreflight, TrustFailure> =>
    Effect.gen(
        /** Collect four live gate proofs and consume replay protection, while explicitly denying any custody or data release. */ function* () {
            // Policy is trusted input but still shape-checked; impossible freshness windows and vault server-decryption fail before adapters run.
            const request = yield* Schema.decodeUnknown(TrustRequest)(input).pipe(
                Effect.mapError(
                    /** Reject malformed requests without exposing their scope or key material in diagnostics. */ () =>
                        new TrustFailure({ gate: 'preflight', reason: 'invalid' })
                )
            );
            const policy = yield* Schema.decodeUnknown(TrustPolicy)(trustedPolicy).pipe(
                Effect.mapError(
                    /** Treat malformed trusted policy as preflight failure, not permission to use weaker defaults. */ () =>
                        new TrustFailure({ gate: 'preflight', reason: 'invalid' })
                )
            );
            if (
                Object.values(policy.freshAfter).some(
                    /** Reject gate freshness floors that lie beyond the trusted evaluation instant. */ (time) =>
                        time > policy.now
                )
            ) {
                return yield* Effect.fail(new TrustFailure({ gate: 'preflight', reason: 'invalid' }));
            }
            if (request.scope.profile === 'vault' && request.scope.operation === 'server-decrypt') {
                return yield* Effect.fail(new TrustFailure({ gate: 'preflight', reason: 'vault' }));
            }
            const identityPort = yield* Effect.serviceOption(IdentityGate);
            const resourcePort = yield* Effect.serviceOption(ResourceGate);
            const workloadPort = yield* Effect.serviceOption(WorkloadGate);
            const brokerPort = yield* Effect.serviceOption(BrokerGate);
            const replayPort = yield* Effect.serviceOption(TrustReplay);
            if (Option.isNone(identityPort))
                return yield* Effect.fail(new TrustFailure({ gate: 'identity', reason: 'unavailable' }));
            if (Option.isNone(resourcePort))
                return yield* Effect.fail(new TrustFailure({ gate: 'resource', reason: 'unavailable' }));
            if (Option.isNone(workloadPort))
                return yield* Effect.fail(new TrustFailure({ gate: 'workload', reason: 'unavailable' }));
            if (Option.isNone(brokerPort))
                return yield* Effect.fail(new TrustFailure({ gate: 'broker', reason: 'unavailable' }));
            if (Option.isNone(replayPort))
                return yield* Effect.fail(new TrustFailure({ gate: 'replay', reason: 'unavailable' }));
            const identity = yield* verify('identity', identityPort.value, request, policy);
            const resource = yield* verify('resource', resourcePort.value, request, policy);
            const workload = yield* verify('workload', workloadPort.value, request, policy);
            const broker = yield* verify('broker', brokerPort.value, request, policy);
            /** Compare only validated assurance literals in their declared increasing-strength order. */
            const rank = (value: Assurance): number => Assurance.literals.indexOf(value);
            const mandatory =
                request.scope.profile === 'restricted' && request.scope.operation === 'server-decrypt'
                    ? 'A4'
                    : request.scope.profile === 'baseline'
                      ? 'A1'
                      : 'A2';
            if (rank(workload.assurance) < Math.max(rank(mandatory), rank(policy.minimumAssurance))) {
                return yield* Effect.fail(new TrustFailure({ gate: 'workload', reason: 'assurance' }));
            }
            // Consume the one-use replay token only after every independent proof and the strongest assurance floor succeeds.
            const replay = yield* observe(
                'replay',
                /** Consume through the replay boundary so provider failures cannot escape as arbitrary causes. */ () =>
                    replayPort.value.consume(request, policy)
            );
            return yield* Schema.decodeUnknown(TrustPreflight)({
                decision: 'metadata-preflight-only',
                release: 'denied',
                audit: {
                    identity: identity.reference,
                    resource: resource.reference,
                    workload: workload.reference,
                    broker: broker.reference,
                    replay,
                },
            }).pipe(
                Effect.mapError(
                    /** Reject malformed replay references instead of emitting an unchecked preflight record. */ () =>
                        new TrustFailure({ gate: 'replay', reason: 'invalid' })
                )
            );
        }
    );
