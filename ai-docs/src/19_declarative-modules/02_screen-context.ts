/**
 * @file ai-docs/src/19_declarative-modules/02_screen-context.ts
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

import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { UiScreenContext } from '@eventiva/contracts/ui-module';
import type { UiRegistration } from '@eventiva/ui-modules/declarative-registry';
import { makeScreenContext } from '@eventiva/ui-modules/screen-context';
import { Effect, Exit, Scope } from 'effect';

/**
 * Portable state only. The trusted host has already authenticated both callers
 * and admitted the registration. Keep its registration scope alive throughout.
 * Callers sharing a tenant/session share selection, not field masking authority.
 *
 * @param registration - Admitted screen registration with a live owner scope.
 * @param mountingCaller - Authenticated identity that mounts the screen.
 * @param currentViewer - Identity whose permissions apply to each subsequent read and invocation.
 * @returns Visible state and invocation outcome before unmount, plus the result of reading after scope closure.
 * @since 0.0.0
 * @example
 * const inspection = inspectMountedScreen(admitted, owner, viewer);
 */
export const inspectMountedScreen = (
    registration: UiRegistration,
    mountingCaller: CallerIdentity,
    currentViewer: CallerIdentity
) =>
    Effect.scoped(
        Effect.gen(
            /** Mount in a child scope, read as the current viewer and demonstrate revocation after unmount. */ function* () {
                const context = yield* makeScreenContext;
                const screenScope = yield* Scope.make();
                yield* Effect.addFinalizer(
                    /**
                     * Release the child even if inspection fails before the explicit unmount.
                     *
                     * @returns The Effect that closes the screen scope.
                     */ () =>
                        Scope.close(screenScope, Exit.void)
                );
                yield* registration.mount.pipe(
                    Effect.provideService(UiScreenContext, context.service),
                    Effect.provideService(Scope.Scope, screenScope),
                    Effect.provideService(Caller, mountingCaller)
                );
                const visible = yield* context.read.pipe(Effect.provideService(Caller, currentViewer));
                const invoked = yield* context.invoke('open').pipe(Effect.provideService(Caller, currentViewer));
                yield* Scope.close(screenScope, Exit.void);
                const afterClose = yield* context.read.pipe(Effect.provideService(Caller, currentViewer));
                return { visible, invoked, afterClose };
            }
        )
    );
