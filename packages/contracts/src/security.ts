/**
 * @file packages/contracts/src/security.ts
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

import { Schema } from 'effect';

/**
 * Security profiles: a closed, ordered classification for data. Fields and
 * resources declare one; storage, sync, telemetry and agent context apply the
 * handling each profile requires. A profile can be raised, never lowered.
 */

/** The profiles, weakest first. */
export const SecurityProfile = Schema.Literal('baseline', 'sensitive', 'restricted', 'vault');
export type SecurityProfile = typeof SecurityProfile.Type;

const rank = (profile: SecurityProfile): number => SecurityProfile.literals.indexOf(profile);

/** True when `profile` gives less protection than `floor`. */
export const isWeaker = (profile: SecurityProfile, floor: SecurityProfile): boolean => rank(profile) < rank(floor);
