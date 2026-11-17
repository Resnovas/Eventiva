/**
 * @file apps/server/src/access.ts
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

import type { Permission } from '@eventiva/contracts/action';
import { Authorizer, Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { SessionId, SubjectId } from '@eventiva/contracts/ids';
import { IdentityResolver, InvocationDenied } from '@eventiva/runtime/invocation';
import { Effect, Layer } from 'effect';

/**
 * Who the server shell acts as, and what it may do. Until the authorisation
 * issue brings real policy, the shell runs as one platform service and grants
 * exactly the permissions listed here; everything else is forbidden.
 */

/** The shell's own identity: a platform service outside any tenant. */
export const shellCaller: CallerIdentity = {
    subject: SubjectId.make('0193a4f0-0000-7000-8000-000000000001'),
    kind: 'service',
    session: SessionId.make('0193a4f0-0000-7000-8000-000000000002'),
};

/** Grants each subject a fixed list of permissions and denies the rest. */
export const staticGrants = (grants: ReadonlyMap<string, ReadonlyArray<Permission>>): Layer.Layer<Authorizer> =>
    Layer.succeed(Authorizer, {
        /** Deny invocation unless this subject's explicit grant contains the action permission. */
        canInvoke: (caller, action) =>
            grants.get(caller.subject)?.includes(action.permission) === true
                ? Effect.void
                : Effect.fail(
                      new Forbidden({ action: action.name, reason: `missing permission ${action.permission}` })
                  ),
        /** Permit resource checks in this shell stub; this is not a production resource policy. */
        check: () => Effect.void,
    });

/** Runs the shell's own calls as `shellCaller`. */
export const ShellCaller: Layer.Layer<Caller> = Layer.succeed(Caller, shellCaller);

/** No credential provider yet: recognize only this exact, process-owned service session. */
export const ShellIdentity = Layer.succeed(IdentityResolver, {
    /** Reject tenant/delegation claims and sessions other than the process-owned service identity. */
    resolve: (caller) =>
        caller.subject === shellCaller.subject &&
        caller.session === shellCaller.session &&
        caller.kind === 'service' &&
        caller.tenant === undefined &&
        caller.onBehalfOf === undefined
            ? Effect.succeed(shellCaller)
            : Effect.fail(new InvocationDenied({ action: '<identity>', reason: 'unknown-session' })),
});
