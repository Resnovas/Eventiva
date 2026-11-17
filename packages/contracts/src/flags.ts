/**
 * @file packages/contracts/src/flags.ts
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

import { Context, Effect, Layer, Schema } from 'effect';

/**
 * Feature flags as Eventiva-owned contracts. Domain and UI code evaluate flags
 * only through the `Flags` service; OpenFeature and PostHog stay behind
 * integration packages. Evaluation never fails: any missing value, provider
 * error or offline cold start yields the flag's safe default.
 */

/** A canonical flag key: dotted, lower case, such as `client.shell.offline-banner`. */
export const FlagKey = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/));
export type FlagKey = typeof FlagKey.Type;

/**
 * Where a flag value comes from, highest precedence first (2026-11-11 feature
 * configuration decision). A higher source always wins over a lower one.
 */
export const FlagSource = Schema.Literal(
    'core-invariant',
    'emergency-policy',
    'entitlement',
    'deployment-policy',
    'git-baseline',
    'remote',
    'targeting'
);
export type FlagSource = typeof FlagSource.Type;

/** A boolean capability flag as declared in a module manifest. */
export const FlagDefinition = Schema.Struct({
    key: FlagKey,
    description: Schema.NonEmptyTrimmedString,
    owner: Schema.NonEmptyTrimmedString,
    /** The value used whenever no source answers. Optional capabilities default off. */
    safeDefault: Schema.Boolean,
    /** ISO 8601 date after which the flag must be removed. */
    expires: Schema.optional(Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}$/))),
});
export type Flag = typeof FlagDefinition.Type;

/** Targeting input for one evaluation. It carries opaque identifiers only, never personal data. */
export interface EvaluationContext {
    readonly targetingKey?: string;
    readonly attributes?: Readonly<Record<string, string | number | boolean>>;
}

/** The outcome of one evaluation. */
export interface Evaluation {
    readonly flag: FlagKey;
    readonly value: boolean;
    /** The provider's reason, such as `STATIC`, `TARGETING_MATCH` or `SAFE_DEFAULT`. */
    readonly reason: string;
    /** True when the safe default was used because no source answered. */
    readonly fallback: boolean;
}

/** Evaluates flags. Implementations never fail and never block on the network for longer than they must. */
export class Flags extends Context.Tag('@eventiva/contracts/Flags')<
    Flags,
    {
        /** Resolve one flag for this targeting context, returning its safe default when no provider can answer. */
        readonly evaluate: (flag: Flag, context?: EvaluationContext) => Effect.Effect<Evaluation>;
    }
>() {}

/** The evaluation that falls back to the flag's safe default. */
export const safeDefault = (flag: Flag, reason = 'SAFE_DEFAULT'): Evaluation => ({
    flag: flag.key,
    value: flag.safeDefault,
    reason,
    fallback: true,
});

/** Orders sourced entries by precedence, highest first, keeping the given order within one source. */
export const byPrecedence = <A extends { readonly source: FlagSource }>(entries: ReadonlyArray<A>): ReadonlyArray<A> =>
    [...entries].sort(
        /** Compare only source rank so stable sorting preserves order among entries from the same source. */
        (a, b) => FlagSource.literals.indexOf(a.source) - FlagSource.literals.indexOf(b.source)
    );

/** A `Flags` service that answers every flag with its safe default: tests, offline cold start, no provider. */
export const FlagsSafeDefaults: Layer.Layer<Flags> = Layer.succeed(Flags, {
    /** Ignore targeting when no provider is configured; the declaration remains the safe source of truth. */
    evaluate: (flag) => Effect.succeed(safeDefault(flag)),
});
