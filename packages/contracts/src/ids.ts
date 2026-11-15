/**
 * @file packages/contracts/src/ids.ts
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
 * Canonical identifiers. Every id is a UUID (RFC 9562) branded with its kind,
 * so a tenant id cannot be passed where a subject id is expected. Generating
 * ids is a platform capability (secure randomness differs on Hermes), so it
 * belongs to a service in an integration, never to a contract.
 */

/** The tenant a call acts in. Each tenant has its own database, so domain rows carry no tenant id. */
export const TenantId = Schema.UUID.pipe(Schema.brand('TenantId'));
export type TenantId = typeof TenantId.Type;

/** A person, agent or service that can act. */
export const SubjectId = Schema.UUID.pipe(Schema.brand('SubjectId'));
export type SubjectId = typeof SubjectId.Type;

/** One signed-in or delegated session of a subject. */
export const SessionId = Schema.UUID.pipe(Schema.brand('SessionId'));
export type SessionId = typeof SessionId.Type;
