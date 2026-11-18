/**
 * @file packages/runtime/src/settings.ts
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

import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Resources, type ResourceFailure } from '@eventiva/contracts/resource';
import { CurrentTenant } from '@eventiva/contracts/storage';
import {
    SettingValue,
    SettingWireValue,
    SettingsTarget,
    SettingsFailure,
    declareSetting,
    decodeSettingValue,
    settingsRead,
    settingsWrite,
    settingsResource,
    type SettingDefinition,
} from '@eventiva/contracts/settings';
import { Effect, Option, Schema } from 'effect';
import { implement, type ActionBinding } from './action.ts';
import { InputDigest } from './invocation.ts';
import type { ServerModule } from './host.ts';

/** Canonical structured namespaces avoid delimiter aliases between independent module instances and scopes. */
const targetKey = (target: SettingsTarget) =>
    JSON.stringify([target.module, target.instance, target.key, target.scope]);

/** Bridge only settings' handler context to the canonical caller already admitted by host authorization; not a global host fix. */
const canonicalCaller = (binding: ActionBinding): ActionBinding => ({
    spec: binding.spec,
    /** Allocate authority inside each preparation, never on the shared registered binding. */
    prepare: (input) =>
        binding.prepare(input).pipe(
            Effect.map(
                /** Keep private authorization state for exactly this decoded invocation. */ (prepared) => {
                    let admitted: CallerIdentity | undefined;
                    let generation = 0;
                    return {
                        ...prepared,
                        /** Clear earlier authority before every recheck, including an interrupted or failed authorization. */
                        authorize: (authorizer, caller) =>
                            Effect.suspend(
                                /** Detach before an external authorizer can retain or mutate its argument. */ () => {
                                    admitted = undefined;
                                    const attempt = ++generation;
                                    const snapshot = Object.freeze({ ...caller });
                                    return prepared.authorize(authorizer, { ...snapshot }).pipe(
                                        Effect.tap(
                                            /** Publish authority only after successful live target authorization. */ () =>
                                                Effect.sync(
                                                    /** A later denial or run invalidates an earlier suspended authorization attempt. */ () => {
                                                        if (generation === attempt) admitted = snapshot;
                                                    }
                                                )
                                        )
                                    );
                                }
                            ),
                        run: Effect.suspend(
                            /** A failed or absent authorization cannot reuse a prior successful snapshot. */ () => {
                                const caller = admitted;
                                admitted = undefined;
                                generation++;
                                return caller
                                    ? prepared.run.pipe(Effect.provideService(Caller, caller))
                                    : Effect.dieMessage('Settings invocation requires canonical authorization.');
                            }
                        ),
                    };
                }
            )
        ),
});

/** Build one whitelist-backed action module. Resources and digest are trusted tenant composition, never action input. */
export const settingsModule = (inputs: ReadonlyArray<SettingDefinition>) =>
    Effect.gen(
        /** Validate every declaration before capturing services or exposing either action. */ function* () {
            // Copy scalar metadata so caller mutation cannot change an admitted namespace or default.
            const definitions = new Map<string, SettingDefinition>();
            for (const input of inputs) {
                const definition = yield* declareSetting(input);
                const key = targetKey(definition);
                if (definitions.has(key)) return yield* new SettingsFailure({ reason: 'invalid-definition' });
                definitions.set(key, definition);
            }
            const resources = yield* Resources;
            const digest = yield* InputDigest;
            const route = Object.freeze({ ...(yield* CurrentTenant) });
            const resource = yield* settingsResource;

            /** Obtain live canonical identity, never a registration-time caller or request-submitted owner. */
            const authenticated = <A, E>(effect: Effect.Effect<A, E, Caller | CurrentTenant>) =>
                Effect.gen(
                    /** Bind the actual handler's resource calls to refreshed identity and the immutable composed route. */ function* () {
                        const presented = yield* Effect.serviceOption(Caller);
                        if (Option.isNone(presented)) return yield* new SettingsFailure({ reason: 'denied' });
                        const caller = yield* Schema.decodeUnknown(CallerIdentity)(presented.value).pipe(
                            Effect.mapError(
                                /** Do not expose resolver or schema internals through settings failures. */ () =>
                                    new SettingsFailure({ reason: 'denied' })
                            )
                        );
                        if (!caller.tenant || caller.tenant !== route.id)
                            return yield* new SettingsFailure({ reason: 'denied' });
                        // The private preparation bridge supplies host-authorized identity; never resolve a different identity after its policy checks.
                        return yield* effect.pipe(
                            Effect.provideService(Caller, Object.freeze(caller)),
                            Effect.provideService(CurrentTenant, route)
                        );
                    }
                );

            /** Resolve only declared targets using the host's refreshed canonical principal and router's tenant. */
            const resolve = (target: SettingsTarget) =>
                Effect.gen(
                    /** Refuse app-global access rather than misrepresent a tenant-bound provider as application authority. */ function* () {
                        yield* Schema.decodeUnknown(SettingsTarget)({
                            module: target.module,
                            instance: target.instance,
                            key: target.key,
                            scope: target.scope,
                        }).pipe(
                            Effect.mapError(
                                /** Refuse invalid namespaces before digest or storage work. */ () =>
                                    new SettingsFailure({ reason: 'invalid-value' })
                            )
                        );
                        const definition = definitions.get(targetKey(target));
                        if (!definition) return yield* new SettingsFailure({ reason: 'undeclared' });
                        const caller = yield* Caller;
                        const tenant = yield* CurrentTenant;
                        if (target.scope === 'app')
                            return yield* new SettingsFailure({ reason: 'app-scope-unavailable' });
                        const owner = target.scope === 'user' ? caller.subject.toLowerCase() : null;
                        const binding = JSON.stringify([
                            tenant.id.toLowerCase(),
                            target.module,
                            target.instance,
                            target.key,
                            target.scope,
                            owner,
                        ]);
                        const hash = yield* digest.digest(binding);
                        if (!/^[a-f0-9]{64}$/.test(hash)) return yield* new SettingsFailure({ reason: 'storage' });
                        // Stable 122-bit UUID-shaped addressing fits Resources' identifier grammar. Verify the complete binding on read to fail closed on collisions.
                        const variant = (8 + (Number.parseInt(hash.slice(16, 17), 16) % 4)).toString(16);
                        const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-7${hash.slice(13, 16)}-${variant}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
                        const previous = yield* resources.get(resource, id);
                        if (previous && previous.value.binding !== binding)
                            return yield* new SettingsFailure({ reason: 'denied' });
                        return { definition, binding, id, previous };
                    }
                );
            /** Project only sanitized domain categories, never resource diagnostics or persisted preference contents. */
            const safe = <A, R>(effect: Effect.Effect<A, SettingsFailure | ResourceFailure, R>) =>
                effect.pipe(
                    Effect.mapError(
                        /** Preserve optimistic conflicts without exposing infrastructure causes. */ (error) =>
                            error._tag === 'SettingsFailure'
                                ? error
                                : new SettingsFailure({
                                      reason:
                                          error.reason === 'conflict'
                                              ? 'conflict'
                                              : error.reason === 'denied'
                                                ? 'denied'
                                                : 'storage',
                                  })
                    )
                );
            return {
                manifest: {
                    format: 1,
                    id: 'settings',
                    version: '1.0.0',
                    description: 'Declared non-secret preferences.',
                    actions: [settingsRead.name, settingsWrite.name],
                    flags: [
                        {
                            key: 'settings.enabled',
                            owner: 'settings',
                            description: 'Enable declared non-secret preference actions.',
                            safeDefault: false,
                        },
                    ],
                },
                actions: [
                    implement(
                        settingsRead,
                        /** Explicit defaults never create a row or conceal the absence revision. */ (target) =>
                            authenticated(
                                safe(
                                    Effect.gen(
                                        /** Validate stored bytes through the current declaration before returning a preference. */ function* () {
                                            const { definition, previous } = yield* resolve(target);
                                            if (!previous)
                                                return {
                                                    value: JSON.stringify(definition.default),
                                                    source: 'default' as const,
                                                    revision: 0,
                                                };
                                            const value = yield* Schema.decodeUnknown(Schema.parseJson(SettingValue))(
                                                previous.value.value
                                            ).pipe(
                                                Effect.mapError(
                                                    /** Refuse corrupt stored bytes without leaking their contents. */ () =>
                                                        new SettingsFailure({ reason: 'storage' })
                                                )
                                            );
                                            return {
                                                value: JSON.stringify(yield* decodeSettingValue(definition, value)),
                                                source: 'stored' as const,
                                                revision: previous.revision,
                                            };
                                        }
                                    )
                                )
                            )
                    ),
                    implement(
                        settingsWrite,
                        /** Compare-and-set inside the existing Resources transaction; callers cannot choose owner, tenant or row id. */ (
                            input
                        ) =>
                            authenticated(
                                safe(
                                    resources.transaction(
                                        Effect.gen(
                                            /** Validate and recheck the expected revision before writing the exact namespace. */ function* () {
                                                const { definition, binding, id, previous } = yield* resolve(input);
                                                if (input.expectedRevision < 0 || input.expectedRevision > 2147483646)
                                                    return yield* new SettingsFailure({ reason: 'invalid-value' });
                                                const decoded = yield* Schema.decodeUnknown(SettingWireValue)(
                                                    input.value
                                                ).pipe(
                                                    Effect.flatMap(
                                                        Schema.decodeUnknown(Schema.parseJson(SettingValue))
                                                    ),
                                                    Effect.mapError(
                                                        /** Hide malformed JSON and rejected scalar contents. */ () =>
                                                            new SettingsFailure({ reason: 'invalid-value' })
                                                    )
                                                );
                                                const value = yield* decodeSettingValue(definition, decoded);
                                                if ((previous?.revision ?? 0) !== input.expectedRevision)
                                                    return yield* new SettingsFailure({ reason: 'conflict' });
                                                const data = { binding, value: JSON.stringify(value) };
                                                const stored = previous
                                                    ? yield* resources.update(
                                                          resource,
                                                          id,
                                                          input.expectedRevision,
                                                          data
                                                      )
                                                    : yield* resources.create(resource, id, data);
                                                return {
                                                    value: JSON.stringify(value),
                                                    source: 'stored' as const,
                                                    revision: stored.revision,
                                                };
                                            }
                                        )
                                    )
                                )
                            )
                    ),
                ].map(canonicalCaller),
            } satisfies ServerModule;
        }
    );
