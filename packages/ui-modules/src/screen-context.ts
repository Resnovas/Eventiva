/**
 * @file packages/ui-modules/src/screen-context.ts
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

import { Caller } from '@eventiva/contracts/caller';
import { UiScreenContext, UiModuleFailure, type UiProjection } from '@eventiva/contracts/ui-module';
import { Deferred, Effect, Option, type Context, type Scope } from 'effect';

type MountService = Context.Tag.Service<UiScreenContext>;
type Screen = Parameters<MountService['mount']>[0];
/** One mounted capability and its cancellation signal; object identity determines whether results remain current. */
interface Entry {
    readonly screen: Screen;
    readonly invalidated: Deferred.Deferred<void>;
}

/** Host-owned portable state; provide Caller separately for every operation. */
export interface ScreenContext {
    readonly service: MountService;
    readonly read: Effect.Effect<Option.Option<UiProjection>, never, Caller>;
    /** Invoke against the caller's current screen, mapping typed refusal or invalidation to absence, not defects. */
    readonly invoke: (node: string) => Effect.Effect<Option.Option<void>, never, Caller>;
}

/**
 * One active capability per tenant/session, not a viewer snapshot or runtime.
 * Create once within the host's scope; mount within each screen's own scope.
 * Closing either scope invalidates pending operations without restoring history.
 */
export const makeScreenContext: Effect.Effect<ScreenContext, never, Scope.Scope> = Effect.gen(
    /** Allocate isolated host state and invalidate every session when its owning scope closes. */ function* () {
        // Subjects may change within a session; tenant and session, not the mounting viewer, own the slot.
        const entries = new Map<string, Entry>();
        let open = true;
        const key = Effect.map(
            Caller,
            /** Keep tenantless service sessions distinct from tenant-bound sessions. */ (caller) =>
                JSON.stringify([caller.tenant ?? null, caller.session])
        );
        yield* Effect.addFinalizer(
            /** Invalidate mounted capabilities on host teardown, including operations already in flight. */ () =>
                Effect.gen(
                    /** Clear ownership before signaling waiters so no delayed result can remain current. */ function* () {
                        // Closing the factory forbids later mounts even if a caller still retains the service.
                        open = false;
                        const active = [...entries.values()];
                        entries.clear();
                        for (const entry of active) yield* Deferred.succeed(entry.invalidated, undefined);
                    }
                )
        );

        /** Race the current capability against invalidation; typed failures become absence while defects remain visible. */
        const current = <A>(
            /** Run lazily with the operation's Caller rather than capturing the mounting subject. */
            operation: (screen: Screen) => Effect.Effect<A, UiModuleFailure, Caller>
        ): Effect.Effect<Option.Option<A>, never, Caller> =>
            Effect.gen(
                /** Release a result only while the original entry still owns this tenant/session slot. */ function* () {
                    const session = yield* key;
                    const entry = entries.get(session);
                    if (entry === undefined) return Option.none<A>();
                    const result = yield* Effect.raceFirst(
                        Effect.suspend(
                            /** Recheck ownership at execution time before starting the capability. */ () =>
                                entries.get(session) === entry
                                    ? operation(entry.screen).pipe(Effect.option)
                                    : Effect.succeed(Option.none<A>())
                        ),
                        Deferred.await(entry.invalidated).pipe(Effect.as(Option.none<A>()))
                    );
                    // Even a capability which delays interruption cannot release old data.
                    return entries.get(session) === entry ? result : Option.none<A>();
                }
            );

        return {
            service: UiScreenContext.of({
                /** Replace the caller's slot for this scope; disposal never restores an older screen. */
                mount: (screen) =>
                    Effect.acquireRelease(
                        Effect.gen(
                            /** Publish a fresh identity and wake operations belonging to the replaced screen. */ function* () {
                                // The host-open guard prevents publication after factory cleanup has completed.
                                const session = yield* key;
                                const entry: Entry = { screen, invalidated: yield* Deferred.make<void>() };
                                if (!open) return yield* new UiModuleFailure({ reason: 'stale' });
                                const previous = entries.get(session);
                                entries.set(session, entry);
                                if (previous !== undefined) yield* Deferred.succeed(previous.invalidated, undefined);
                                return { session, entry };
                            }
                        ),
                        /** Release only this acquisition, leaving a newer mount intact. */
                        ({ session, entry }) =>
                            Effect.gen(
                                /** Remove current ownership before waking readers; stale releases still signal their own waiters. */ function* () {
                                    // Scope finalization for A must not delete its replacement B.
                                    if (entries.get(session) === entry) entries.delete(session);
                                    yield* Deferred.succeed(entry.invalidated, undefined);
                                }
                            )
                    ).pipe(Effect.asVoid),
            }),
            read: current(
                /** Defer viewer masking to the mounted capability's fresh read. */ (screen) => screen.read
            ).pipe(
                Effect.map(
                    Option.filter(
                        /** Unavailable and offline screens expose no active screen projection. */ (projection) =>
                            projection.state === 'available'
                    )
                )
            ),
            /** Resolve the screen at execution time rather than retaining a stale mounted action. */
            invoke: (node) =>
                current(
                    /** Forward only the canonical node id to the current capability. */ (screen) => screen.invoke(node)
                ),
        } satisfies ScreenContext;
    }
);
