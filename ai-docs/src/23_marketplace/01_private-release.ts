/**
 * @file ai-docs/src/23_marketplace/01_private-release.ts
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
 * @title Refuse private marketplace release
 * Metadata authorization and pending local intents never grant private processing.
 * This result is always Left with the closed trust-unapproved reason.
 */
import { privateExchangeUnavailable } from '@eventiva/runtime/marketplace';
import { Effect } from 'effect';

export const privateReleaseResult = privateExchangeUnavailable.pipe(Effect.either);
