/**
 * @file ai-docs/src/24_trust/01_preflight.ts
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
 * @title Refuse preflight without approved verifiers
 * The policy comes from trusted composition, never from a caller's request.
 * This example fails unavailable. Even a fully verified metadata preflight
 * never grants key release or permission to decrypt.
 */
import { TrustUnavailable, type TrustPolicy, type TrustRequest } from '@eventiva/contracts/trust';
import { trustPreflight } from '@eventiva/runtime/trust';
import { Effect } from 'effect';

/** Demonstrate fail-closed metadata preflight with unavailable verifiers; no private release is authorized. */
export const refusedPreflight = (request: TrustRequest, trustedPolicy: TrustPolicy) =>
    trustPreflight(request, trustedPolicy).pipe(Effect.provide(TrustUnavailable));
