/**
 * @file ai-docs/src/36_session_renewal/01_sign_in.ts
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
 * Open a session at sign-in; refreshing a token must not reset its activity deadline.
 *
 * @title Record bounded sign-in anchors without treating token refresh as user activity
 */
import { openOidcSession } from '@eventiva/integrations.oidc/session';
import type { OidcAccessClaims } from '@eventiva/integrations.oidc/token';

/**
 * Lower-level example with explicit selected bounds, not production configuration. Supply freshly verified claims
 * inside the trusted tenant Storage transaction with its required audit; server login normally uses the policy wrapper.
 *
 * @param claims - Freshly verified access-token claims for the linked subject.
 * @returns The opening Effect with a one-hour idle bound and an eight-hour absolute bound.
 * @since 0.0.0
 * @example
 * const session = openBoundedSession(verifiedClaims);
 */
export const openBoundedSession = (claims: OidcAccessClaims) =>
    openOidcSession(claims, { idleMs: 3_600_000, absoluteMs: 28_800_000 });
