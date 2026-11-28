/**
 * @file ai-docs/src/24_trust/05_profile.ts
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
 * Ed25519 over RFC 8785, five-minute lifetime, thirty-second skew, payload SHA-256.
 * Consume the nonce through TrustReplay after verification; verifyRequest never does.
 * Freshness floors come from trustPolicyAt, never from caller input.
 * See docs/trust-profile.md for every parameter and its reason.
 *
 * @title Verify an M2 signed request and build the approved preflight policy
 */
import type { TrustRequest } from '@eventiva/contracts/trust';
import { type SignedRequest, trustPolicyAt } from '@eventiva/contracts/trust-profile';
import { verifyRequest } from '@eventiva/integrations.trust.server/crypto';
import { trustPreflight } from '@eventiva/runtime/trust';
import { Effect } from 'effect';

/**
 * Verify the signed payload before preflight. Signature validity alone does not release a resource.
 *
 * @param signed - M2 envelope presented to the directory-backed verifier.
 * @param body - Exact payload bytes whose digest must match the signed envelope.
 * @param request - Exchange metadata evaluated by independent preflight gates.
 * @param now - Trusted clock reading for signature verification and policy freshness.
 * @returns The gated preflight Effect, not a decryption capability.
 * @since 0.0.0
 * @example
 * const decision = admit(envelope, payload, exchange, trustedNow);
 */
export const admit = (signed: SignedRequest, body: Uint8Array, request: TrustRequest, now: number) =>
    Effect.gen(
        /** Authenticate the transport request first, then run the independent release preflight. */ function* () {
            const claims = yield* verifyRequest(signed, body, { audience: 'marketplace.cell', now });
            const preflight = yield* trustPreflight(request, trustPolicyAt(now, 'A4'));
            return { claims, preflight };
        }
    );
