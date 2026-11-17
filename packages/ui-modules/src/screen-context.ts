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
interface Entry {
    readonly screen: Screen;
    readonly invalidated: Deferred.Deferred<void>;
}

/** Host-owned portable state; provide Caller separately for every operation. */
export interface ScreenContext {
    readonly service: MountService;
    readonly read: Effect.Effect<Option.Option<UiProjection>, never, Caller>;
    readonly invoke: (node: string) => Effect.Effect<Option.Option<void>, never, Caller>;
}

/**
 * One active capability per tenant/session, not a viewer snapshot or runtime.
 * Create once within the host's scope; mount within each screen's own scope.
 * Closing either scope invalidates pending operations without restoring history.
 */
export const makeScreenContext: Effect.Effect<ScreenContext, never, Scope.Scope> = Effect.gen(function* () {
    const entries = new Map<string, Entry>();
    let open = true;
    const key = Effect.map(Caller, (caller) => JSON.stringify([caller.tenant ?? null, caller.session]));
    yield* Effect.addFinalizer(() =>
        Effect.gen(function* () {
            open = false;
            const active = [...entries.values()];
            entries.clear();
            for (const entry of active) yield* Deferred.succeed(entry.invalidated, undefined);
        })
    );

    const current = <A>(
        operation: (screen: Screen) => Effect.Effect<A, UiModuleFailure, Caller>
    ): Effect.Effect<Option.Option<A>, never, Caller> =>
        Effect.gen(function* () {
            const session = yield* key;
            const entry = entries.get(session);
            if (entry === undefined) return Option.none<A>();
            const result = yield* Effect.raceFirst(
                Effect.suspend(() =>
                    entries.get(session) === entry
                        ? operation(entry.screen).pipe(Effect.option)
                        : Effect.succeed(Option.none<A>())
                ),
                Deferred.await(entry.invalidated).pipe(Effect.as(Option.none<A>()))
            );
            // Even a capability which delays interruption cannot release old data.
            return entries.get(session) === entry ? result : Option.none<A>();
        });

    return {
        service: UiScreenContext.of({
            mount: (screen) =>
                Effect.acquireRelease(
                    Effect.gen(function* () {
                        const session = yield* key;
                        const entry: Entry = { screen, invalidated: yield* Deferred.make<void>() };
                        if (!open) return yield* new UiModuleFailure({ reason: 'stale' });
                        const previous = entries.get(session);
                        entries.set(session, entry);
                        if (previous !== undefined) yield* Deferred.succeed(previous.invalidated, undefined);
                        return { session, entry };
                    }),
                    ({ session, entry }) =>
                        Effect.gen(function* () {
                            if (entries.get(session) === entry) entries.delete(session);
                            yield* Deferred.succeed(entry.invalidated, undefined);
                        })
                ).pipe(Effect.asVoid),
        }),
        read: current((screen) => screen.read).pipe(
            Effect.map(Option.filter((projection) => projection.state === 'available'))
        ),
        invoke: (node) => current((screen) => screen.invoke(node)),
    } satisfies ScreenContext;
});
