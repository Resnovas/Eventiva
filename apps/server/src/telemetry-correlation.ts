/**
 * @file apps/server/src/telemetry-correlation.ts
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

import { type Flag, Flags } from '@eventiva/contracts/flags';
import type { TelemetryPolicy } from '@eventiva/runtime/telemetry';
import { Config, Effect, Option, Schema, type Scope } from 'effect';

/** Optional synthetic correlation; missing providers must never enable identifier annotations. */
export const correlationFlag: Flag = {
    key: 'telemetry.correlation.enabled',
    description: 'Attach approved synthetic correlation pairs to local request telemetry.',
    owner: 'Eventiva server',
    safeDefault: false,
};

const token = Schema.String.pipe(Schema.minLength(1), Schema.maxLength(96), Schema.pattern(/^[a-zA-Z0-9._-]+$/));
const pair = Schema.Struct({ 'posthog.distinct_id': token, 'posthog.session_id': token });

/**
 * Decode the complete synthetic pair without retaining decoder failures. Keep raw header
 * entries until here so adapters can preserve duplicates; normalized comma joins also reject.
 * Header names match @posthog/core 1.64.1 tracing-headers.js, not authenticated identity.
 */
const admittedPair = (headers: Iterable<readonly [string, string]>, policy: TelemetryPolicy) => {
    // Never learn an allowlist from request data, including syntactically valid identifiers.
    const distinct: string[] = [];
    const session: string[] = [];
    for (const [name, value] of headers) {
        if (name.toLowerCase() === 'x-posthog-distinct-id') distinct.push(value);
        if (name.toLowerCase() === 'x-posthog-session-id') session.push(value);
    }
    if (distinct.length !== 1 || session.length !== 1) return Option.none();
    const decoded = Schema.decodeUnknownOption(pair)({
        'posthog.distinct_id': distinct[0],
        'posthog.session_id': session[0],
    });
    return Option.filter(
        decoded,
        /** Require both exact values in the same trusted policy supplied to the minimizing telemetry layer. */
        (value) =>
            Object.hasOwn(policy.attributes, 'posthog.distinct_id') &&
            Object.hasOwn(policy.attributes, 'posthog.session_id') &&
            policy.attributes['posthog.distinct_id']?.includes(value['posthog.distinct_id']) === true &&
            policy.attributes['posthog.session_id']?.includes(value['posthog.session_id']) === true
    );
};

/**
 * Run an inner request under a local request.received span and a fresh child scope.
 * Preserve its value/error/interruption; failure emits only request.failed, never Cause text.
 * Supply the composition-owned policy also used by telemetryLayer. Headers are hints only:
 * this wrapper cannot authenticate, select a tenant or authorize export. Detached work is unsupported.
 * Config errors fail correlation closed, without failing business work or exposing diagnostics.
 */
export const withRequestCorrelation = <A, E, R>(
    headers: Iterable<readonly [string, string]>,
    policy: TelemetryPolicy,
    request: Effect.Effect<A, E, R>
): Effect.Effect<A, E, Exclude<R, Scope.Scope> | Flags> =>
    Effect.gen(
        /** Evaluate opt-outs before decoding any header and install annotations outside span construction/error handling. */
        function* () {
            const enabled = yield* Config.boolean('enabled').pipe(
                Config.nested('telemetry'),
                Config.withDefault(true),
                Effect.orElseSucceed(
                    /** Invalid telemetry configuration must not admit request identifiers. */
                    () => false
                )
            );
            const flags = yield* Flags;
            const correlate = enabled && (yield* flags.evaluate(correlationFlag)).value;
            const annotations = correlate ? admittedPair(headers, policy) : Option.none();
            // Cleanup and failure logging stay inside correlation; withSpan observes the original failed Exit.
            const scoped = request.pipe(
                Effect.scoped,
                Effect.tapErrorCause(
                    /** Emit a fixed code without forwarding business failure payloads to any logger. */
                    () => Effect.logError('request.failed')
                ),
                Effect.withSpan('request.received')
            );
            return yield* Option.isSome(annotations)
                ? scoped.pipe(Effect.annotateLogs(annotations.value), Effect.annotateSpans(annotations.value))
                : scoped;
        }
    );
