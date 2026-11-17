/**
 * @file ai-docs/src/15_identity/01_host.ts
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

/** @title Register a host INSIDE one already authorized tenant route */
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identityModule, identitySecurity } from '@eventiva/runtime/identity';
import { InvocationDenied } from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import { Effect, Layer } from 'effect';

/** The composition root supplies IdentityStore and Storage around the SAME authorized tenant SQL client. */
export const readOrganization = (caller: CallerIdentity) => {
    const host = ActionHostLive.pipe(Layer.provide(identitySecurity), Layer.provide(durable));
    // IdentityStore, Storage, Approvals, InputDigest, Flags and CurrentTenant remain REQUIRED.
    // Supply production implementations at the trusted root, never a permissive fallback.
    return Effect.scoped(
        Effect.gen(
            /** Reject a mismatched route before registering and invoking identity actions with the supplied caller. */ function* () {
                // Host construction is not route authorization; verify the caller against the already bound tenant.
                const tenant = yield* CurrentTenant;
                if (caller.tenant !== tenant.id)
                    return yield* new InvocationDenied({ action: '<route>', reason: 'tenant-scope-mismatch' });
                const actions = yield* ActionHost;
                yield* actions.register(yield* identityModule);
                return yield* actions
                    .execute('identity.organization.get', {})
                    .pipe(Effect.provideService(Caller, caller));
            }
        ).pipe(Effect.provide(host))
    );
};
