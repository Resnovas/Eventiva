/**
 * @file packages/contracts/src/telemetry.ts
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

/**
 * OpenTelemetry-ready names. Instrumentation uses Effect's own tracer, logger
 * and metrics (`Effect.withSpan`); an exporter is chosen by the application,
 * never by a contract. Attribute values carry identifiers, never personal data.
 */

/** Span and attribute names, in the style of the OpenTelemetry semantic conventions. */
export const Attributes = {
    actionName: 'eventiva.action.name',
    actionVersion: 'eventiva.action.version',
    actionOutcome: 'eventiva.action.outcome',
    moduleId: 'eventiva.module.id',
    /** OpenTelemetry semantic convention for feature flags. */
    flagKey: 'feature_flag.key',
} as const;

/** The outcome recorded on an action span. */
export type Outcome = 'succeeded' | 'failed' | 'invalid-input' | 'unavailable' | 'forbidden' | 'unknown-action';

/** The span name for one invocation of an action. */
export const actionSpan = (name: string): string => `action.${name}`;
