/**
 * @file packages/contracts/src/caller.ts
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

import { Context, type Effect, Schema } from 'effect';
import type { ActionSpec, Input } from './action.ts';
import type { Forbidden } from './errors.ts';
import { SessionId, SubjectId, TenantId } from './ids.ts';

/**
 * Who is calling, and who decides what they may do. Every surface (UI,
 * HTTP, MCP, ACP, first-party and external agents) resolves the caller for
 * each call and invokes actions through the same authorised path; there is no
 * privileged agent or UI route.
 */

/** The kind of subject behind a call. */
export const CallerKind = Schema.Literal('human', 'first-party-agent', 'external-agent', 'service');
export type CallerKind = typeof CallerKind.Type;

/** The identity of one call. It carries identifiers only, never credentials or personal data. */
export const CallerIdentity = Schema.Struct({
    subject: SubjectId,
    kind: CallerKind,
    /** Absent only for platform services acting outside any tenant. */
    tenant: Schema.optional(TenantId),
    /** The person an agent acts for, when the session is delegated. */
    onBehalfOf: Schema.optional(SubjectId),
    session: SessionId,
});
export type CallerIdentity = typeof CallerIdentity.Type;

/** The caller of the current invocation. A surface provides it per call. */
export class Caller extends Context.Tag('@eventiva/contracts/Caller')<Caller, CallerIdentity>() {}

/**
 * Decides whether a caller may run an action. The runtime asks twice per
 * call: `canInvoke` before decoding, from the specification's permission, and
 * `check` after decoding, so a policy can look at the target the input names.
 * It looks permissions up on every call, so a revoked grant stops working
 * inside a running session.
 */
export class Authorizer extends Context.Tag('@eventiva/contracts/Authorizer')<
    Authorizer,
    {
        /** Check current permission before input decoding; success grants no authority over an input target. */
        readonly canInvoke: (caller: CallerIdentity, action: ActionSpec) => Effect.Effect<void, Forbidden>;
        /** Authorize the decoded target using live grants; retain the action's exact input type. */
        readonly check: <S extends ActionSpec>(
            caller: CallerIdentity,
            action: S,
            input: Input<NoInfer<S>>
        ) => Effect.Effect<void, Forbidden>;
    }
>() {}
