/**
 * @file tests/ui-modules/src/declarative-module.spec.tsx
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

import { it } from '@effect/vitest';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { I18n } from '@eventiva/contracts/i18n';
import { ActionInventory, type ActionMetadata } from '@eventiva/contracts/inventory';
import {
    UiActionBinding,
    UiConfig,
    UiModuleDefinition,
    UiModuleFailure,
    UiPlatform,
    UiProjection,
    UiScreenContext,
    type UiNode,
    type UiValue,
} from '@eventiva/contracts/ui-module';
import { Effect, Either, Exit, Layer, Option, Schema, Scope, Deferred, Fiber, Ref, type Context } from 'effect';
import { expect, expectTypeOf } from 'vitest';
import { createElement, isValidElement } from 'react';
import { DeclarativeModule, type UiRenderer, type UiRendererProps } from '@eventiva/ui-modules/DeclarativeModule';
import {
    DeclarativeRegistry,
    declarativeRegistry,
    type UiRegistration,
} from '@eventiva/ui-modules/declarative-registry';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: '00000000-0000-4000-8000-000000000001',
    session: '00000000-0000-4000-8000-000000000002',
    kind: 'human',
    tenant: '00000000-0000-4000-8000-000000000003',
});
const otherCaller = Schema.decodeUnknownSync(CallerIdentity)({
    ...caller,
    tenant: '00000000-0000-4000-8000-000000000004',
});

const binding: UiActionBinding = { action: 'sample.open', version: 1, input: { target: 'summary' } };
/** Build valid nodes with canonical bindings/field sources so each rejection case changes only its intended invariant. */
const node = (id: string, kind: UiNode['kind'], children: ReadonlyArray<string> = []): UiNode => ({
    id,
    kind,
    component: { id: 'approved.content', version: '1.0.0' },
    label: `sample.${id}`,
    protected: false,
    project: true,
    config: {},
    children,
    ...(kind === 'action' || kind === 'menu' ? { binding } : {}),
    ...(kind === 'field' ? { field: 'sample.total' } : {}),
});
/** Fresh admitted tree with one masked canary, one field and one canonical control for projection comparisons. */
const fixture = (): UiModuleDefinition => ({
    format: 1,
    id: 'sample',
    version: '1.0.0',
    flag: 'sample.enabled',
    root: 'screen',
    nodes: [
        node('screen', 'view', ['summary', 'open', 'private']),
        node('summary', 'field'),
        node('open', 'action'),
        node('private', 'text'),
    ],
    messages: {
        'sample.screen': 'Module summary',
        'sample.summary': 'Total',
        'sample.open': 'Open summary',
        'sample.private': 'PRIVATE-CANARY',
        'sample.offline': 'Reconnect to use this module.',
        'sample.unavailable': 'This module is unavailable.',
    },
    offline: 'sample.offline',
    unavailable: 'sample.unavailable',
});
/** Represent an installed adapter without executing the supplied lazy action capability. */
const Content = ({ node, children }: UiRendererProps) =>
    createElement('section', { 'aria-label': node.label }, children);
const renderer: UiRenderer = {
    id: 'approved.content',
    version: '1.0.0',
    kinds: ['view', 'layout', 'text', 'field', 'action', 'menu', 'slot'],
    config: UiConfig.pipe(
        Schema.filter(
            /** Deliberately narrow this installed adapter to empty configuration. */ (config) =>
                Object.keys(config).length === 0
        )
    ),
    component: Content,
};
const metadata: ActionMetadata = {
    id: binding.action,
    version: 1,
    description: 'Open the summary.',
    permission: 'sample.open',
    approval: 'confirm',
    risk: 'routine',
    sensitive: false,
    sideEffect: 'read',
    offline: 'online-only',
    providerSchemas: {
        anthropic: { input: { type: 'object' }, output: { type: 'null' } },
        openai: { input: { type: 'object' }, output: { type: 'null' } },
        google: { input: { type: 'object' }, output: { type: 'null' } },
    },
};

/** Assemble mutable platform gates around the real registry to test revocation after publication. */
const testServices = () => {
    // Every switch is read lazily so registration cannot accidentally stand in for later authorization.
    const state = {
        online: true,
        enabled: true,
        allowed: true,
        admitted: true,
        fieldAllowed: true,
        visible: true,
        calls: 0,
    };
    const platform = UiPlatform.of({
        /** Model admission revocation independently of action inventory. */
        admit: () =>
            Effect.suspend(
                /** Observe admission when the operation runs, not when the fixture is built. */ () =>
                    state.admitted ? Effect.void : Effect.fail(new UiModuleFailure({ reason: 'denied' }))
            ),
        /** Accept only the fixture's bound summary target. */
        checkInput: (entry) =>
            Schema.decodeUnknown(Schema.Struct({ target: Schema.Literal('summary') }))(entry.input).pipe(
                Effect.asVoid,
                Effect.mapError(
                    /** Match the platform's public invalid-input failure shape. */ () =>
                        new UiModuleFailure({ reason: 'invalid-config' })
                )
            ),
        /** Count actual dispatch only after caller/authorization checks. */
        invoke: () =>
            Effect.gen(
                /** Require the executing tenant and current permission before recording the side effect. */ function* () {
                    // This counter distinguishes a rejected projection from an unauthorized platform dispatch.
                    const activeCaller = yield* Caller;
                    if (!state.allowed || activeCaller.tenant !== caller.tenant)
                        return yield* new UiModuleFailure({ reason: 'denied' });
                    state.calls += 1;
                }
            ),
        /** Keep the private canary masked even while the general visibility switch is enabled. */
        visible: (_module, entry) =>
            Effect.sync(/** Apply current viewer policy to each node. */ () => state.visible && entry.id !== 'private'),
        /** Model field-level denial separately from node visibility. */
        value: () =>
            Effect.suspend(
                /** Expose the fixture scalar only while its field remains authorized. */ () =>
                    state.fieldAllowed ? Effect.succeed(37) : Effect.fail(new UiModuleFailure({ reason: 'denied' }))
            ),
        online: Effect.sync(/** Observe connectivity changes on each projection. */ () => state.online),
    });
    const services = Layer.mergeAll(
        Layer.succeed(UiPlatform, platform),
        Layer.succeed(Flags, {
            /** Toggle both required flags using the fixture state. */
            evaluate: (flag) =>
                Effect.sync(
                    /** Preserve the requested flag key while supplying the current test decision. */ () => ({
                        flag: flag.key,
                        value: state.enabled,
                        reason: 'TEST',
                        fallback: false
                    })
                ),
        }),
        Layer.succeed(I18n, {
            locale: 'en-GB',
            /** Keep projection expectations independent of translation catalogs. */ format: (message) =>
                message.defaultMessage
        }),
        Layer.succeed(ActionInventory, {
            /** Hide metadata on revocation as the caller-visible inventory would. */
            find: (_caller, id) =>
                Effect.sync(
                    /** Resolve only the canonical fixture action while allowed. */ () =>
                        (state.allowed && id === binding.action ? Option.some(metadata) : Option.none())
                ),
            /** Supply a stable singleton for inventory-list consumers. */
            list: () => Effect.succeed([metadata]),
        })
    );
    return { state, services, platform, layer: declarativeRegistry([renderer]).pipe(Layer.provide(services)) };
};
/** Compare bounded typed failures without catching defects or exposing input diagnostics. */
const reason = <A, R>(effect: Effect.Effect<A, UiModuleFailure, R>) =>
    effect.pipe(
        Effect.either,
        Effect.map(
            /** Preserve success as a distinct sentinel so unexpected acceptance fails rejection assertions. */ (
                result
            ) => (Either.isLeft(result) ? result.left.reason : 'success')
        )
    );

it.effect(
    'publishes one masked UI/agent projection and invokes the canonical binding',
    /** Check projection wire shape, secrecy, canonical dispatch and post-publication revocation together. */ () => {
        const { layer, state } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Verify serialized projections omit private input and match the action node used for invocation. */ function* () {
                    // Schema round-trip and a negative version control establish wire validation before masking assertions.
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(fixture()));
                    const projection = yield* registration.project;
                    expect(Schema.is(UiProjection)(projection)).toBe(true);
                    const encoded = yield* Schema.encode(Schema.parseJson(UiProjection))(projection);
                    expect(yield* Schema.decodeUnknown(Schema.parseJson(UiProjection))(encoded)).toEqual(projection);
                    const invalidVersion = {
                        ...projection,
                        nodes: projection.nodes.map(
                            /** Corrupt only emitted action versions to test the projection schema's lower bound. */ (
                                entry
                            ) =>
                                entry.action === undefined
                                    ? entry
                                    : { ...entry, action: { ...entry.action, version: -1 } }
                        ),
                    };
                    expect(Schema.is(UiProjection)(invalidVersion)).toBe(false);
                    expect(
                        projection.nodes.map(
                            /** Compare traversal order and absence of the private canary node. */ (node) => node.id
                        )
                    ).toEqual(['screen', 'summary', 'open']);
                    expect(projection.nodes[0]?.children).toEqual(['summary', 'open']);
                    expect(
                        projection.nodes.find(
                            /** Select masked field output rather than raw binding input. */ (node) =>
                                node.id === 'summary'
                        )?.value
                    ).toBe(37);
                    expect(
                        projection.nodes.find(
                            /** Select the canonical control metadata visible to UI and agents. */ (node) =>
                                node.id === 'open'
                        )?.action
                    ).toEqual({
                        id: 'sample.open',
                        version: 1,
                    });
                    expect(JSON.stringify(projection)).not.toMatch(/PRIVATE-CANARY|target|permission|input/);
                    yield* registration.invoke('open');
                    expect(state.calls).toBe(1);
                    expect(yield* reason(registration.invoke('private'))).toBe('unbound-action');
                    state.allowed = false;
                    expect(yield* reason(registration.project)).toBe('unknown-action');
                    expect(yield* reason(registration.invoke('open'))).toBe('unknown-action');
                    expect(state.calls).toBe(1);
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'fails closed on revoked admission, masked fields, tenant mismatch and offline/disabled state',
    /** Prove each independent gate blocks data or dispatch without a platform side effect. */ () => {
        const { layer, state } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Mutate access and availability after registration to expose stale authorization snapshots. */ function* () {
                    // Restore independent switches between cases so each assertion isolates its named boundary.
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(fixture()));
                    state.fieldAllowed = false;
                    expect(yield* reason(registration.project)).toBe('denied');
                    state.fieldAllowed = true;
                    state.online = false;
                    expect(yield* registration.project).toMatchObject({
                        state: 'offline',
                        message: 'Reconnect to use this module.',
                        nodes: [],
                    });
                    expect(yield* reason(registration.invoke('open'))).toBe('offline');
                    state.enabled = false;
                    expect(yield* registration.project).toMatchObject({ state: 'unavailable', nodes: [] });
                    expect(yield* reason(registration.invoke('open'))).toBe('unavailable');
                    state.online = true;
                    state.enabled = true;
                    expect(
                        yield* reason(registration.invoke('open').pipe(Effect.provideService(Caller, otherCaller)))
                    ).toBe('denied');
                    state.admitted = false;
                    expect(yield* reason(registration.project)).toBe('denied');
                    expect(state.calls).toBe(0);
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'safe defaults never enable the foundation or a module',
    /** Ensure fallback flag service cannot activate declarative projection. */ () => {
        const { services } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Register valid input under safe defaults and require an empty unavailable projection. */ function* () {
                    // Valid input separates flag denial from schema or admission rejection.
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(fixture()));
                    expect(yield* registration.project).toMatchObject({ state: 'unavailable', nodes: [] });
                }
            )
        ).pipe(
            Effect.provide(
                declarativeRegistry([renderer]).pipe(Layer.provide(Layer.merge(services, FlagsSafeDefaults)))
            ),
            Effect.provideService(Caller, caller)
        );
    }
);

it.effect(
    'isolates discovery, handles and same-named replacements between tenants',
    /** Verify module ids are tenant-local and handles do not grant cross-tenant access. */ () => {
        const { layer, state } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Publish identical ids in two tenants, dispose one, then revoke admission for discovery. */ function* () {
                    // Explicit replacement in the second tenant must not stale or remove the first tenant's publication.
                    const registry = yield* DeclarativeRegistry;
                    const first = yield* registry.register(JSON.stringify(fixture()));
                    expect(yield* registry.modules.pipe(Effect.provideService(Caller, otherCaller))).toEqual([]);
                    expect(yield* reason(first.project.pipe(Effect.provideService(Caller, otherCaller)))).toBe(
                        'denied'
                    );
                    const otherScope = yield* Scope.make();
                    const second = yield* registry
                        .register(JSON.stringify({ ...fixture(), version: '2.0.0' }), true)
                        .pipe(
                            Effect.provideService(Caller, otherCaller),
                            Effect.provideService(Scope.Scope, otherScope)
                        );
                    expect((yield* first.project).version).toBe('1.0.0');
                    expect((yield* second.project.pipe(Effect.provideService(Caller, otherCaller))).version).toBe(
                        '2.0.0'
                    );
                    yield* Scope.close(otherScope, Exit.void);
                    expect((yield* first.project).version).toBe('1.0.0');
                    expect(yield* registry.modules).toEqual(['sample']);
                    state.admitted = false;
                    expect(yield* registry.modules).toEqual([]);
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'rejects invalid scalar output from a masking adapter before releasing a projection',
    /** Ensure invalid platform data blocks both projection and projection-dependent dispatch. */ () => {
        const { platform, services } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Require invalid-projection instead of releasing NaN from an otherwise admitted module. */ function* () {
                    // Registration succeeds; output validation, not input validation, must reject this adapter.
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(fixture()));
                    expect(yield* reason(registration.project)).toBe('invalid-projection');
                    expect(yield* reason(registration.invoke('open'))).toBe('invalid-projection');
                }
            )
        ).pipe(
            Effect.provide(
                declarativeRegistry([renderer]).pipe(
                    Layer.provide(
                        Layer.merge(
                            services,
                            Layer.succeed(UiPlatform, {
                                ...platform,
                                /** Inject a non-wire scalar without changing admission or visibility. */ value: () =>
                                    Effect.succeed(NaN)
                            })
                        )
                    )
                )
            ),
            Effect.provideService(Caller, caller)
        );
    }
);

it.effect(
    'rechecks admission after an asynchronous projection read before releasing fields',
    /** Prove admission revoked during field acquisition is checked again before data release. */ () => {
        const { platform, services, state } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Trigger revocation inside the platform value read and require the final admission barrier to deny. */ function* () {
                    // Initial admission succeeds, so only the post-read check can enforce this refusal.
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(fixture()));
                    expect(yield* reason(registration.project)).toBe('denied');
                }
            )
        ).pipe(
            Effect.provide(
                declarativeRegistry([renderer]).pipe(
                    Layer.provide(
                        Layer.merge(
                            services,
                            Layer.succeed(UiPlatform, {
                                ...platform,
                                /** Simulate an adapter whose field acquisition races with admission revocation. */
                                value: () =>
                                    Effect.sync(
                                        /** Revoke admission before returning an otherwise valid field value. */ () => {
                                            state.admitted = false;
                                            return 37;
                                        }
                                    ),
                            })
                        )
                    )
                )
            ),
            Effect.provideService(Caller, caller)
        );
    }
);

it.effect(
    'mounts only fresh caller-masked capabilities and releases the scoped screen context',
    /** Verify mount hands off lazy viewer-sensitive reads and scope-owned cleanup, not a projection snapshot. */ () => {
        // Both viewers share tenant/session; changing subject must affect masking but not mount ownership.
        const { platform, services, state } = testServices();
        const viewer = Schema.decodeUnknownSync(CallerIdentity)({
            ...caller,
            subject: '00000000-0000-4000-8000-000000000005',
        });
        const layer = declarativeRegistry([renderer]).pipe(
            Layer.provide(
                Layer.merge(
                    services,
                    Layer.succeed(UiPlatform, {
                        ...platform,
                        /** Derive the scalar from the operation's subject rather than the mounting caller. */
                        value: () =>
                            Effect.gen(
                                /** Distinguish same-session viewers through their current Caller service. */ function* () {
                                    const current = yield* Caller;
                                    return current.subject === caller.subject ? 37 : 5;
                                }
                            ),
                    })
                )
            )
        );
        type Screen = Parameters<Context.Tag.Service<UiScreenContext>['mount']>[0];
        return Effect.scoped(
            Effect.gen(
                /** Capture mounted capabilities and exercise fresh masking, revocation and finalizer cleanup. */ function* () {
                    // The adapter stub models identity-bound disposal so an old screen cannot clear a newer one.
                    const active = yield* Ref.make(Option.none<Screen>());
                    const screens = UiScreenContext.of({
                        /** Retain the capability only for the supplied mount scope. */
                        mount: (screen) =>
                            Effect.acquireRelease(
                                Ref.set(active, Option.some(screen)),
                                /** Dispose only this mount, leaving a replacement untouched. */ () =>
                                    Ref.update(
                                        active,
                                        /** Preserve the currently active screen unless this scope owns it. */ (
                                            current
                                        ) =>
                                            Option.filter(
                                                current,
                                                /** Match by capability identity, not projection contents. */ (value) =>
                                                    value !== screen
                                            )
                                    )
                            ),
                    });
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(fixture()));
                    const scope = yield* Scope.make();
                    yield* registration.mount.pipe(
                        Effect.provideService(UiScreenContext, screens),
                        Effect.provideService(Scope.Scope, scope)
                    );
                    const mounted = yield* Ref.get(active);
                    expect(Option.isSome(mounted)).toBe(true);
                    if (Option.isNone(mounted)) return;
                    expect(
                        (yield* mounted.value.read).nodes.map(
                            /** Confirm mounted reads retain registry masking and traversal order. */ (node) => node.id
                        )
                    ).toEqual(['screen', 'summary', 'open']);
                    const viewerProjection = yield* mounted.value.read.pipe(Effect.provideService(Caller, viewer));
                    expect(
                        viewerProjection.nodes.find(
                            /** Compare the alternate subject's masked field. */ (node) => node.id === 'summary'
                        )?.value
                    ).toBe(5);
                    expect(
                        (yield* mounted.value.read).nodes.find(
                            /** Confirm alternate reads did not replace owner masking with cached data. */ (node) =>
                                node.id === 'summary'
                        )?.value
                    ).toBe(37);
                    yield* mounted.value.invoke('open');
                    expect(state.calls).toBe(1);
                    state.online = false;
                    expect(yield* mounted.value.read).toMatchObject({ state: 'offline', nodes: [] });
                    expect(yield* reason(mounted.value.invoke('open'))).toBe('offline');
                    state.online = true;
                    expect(yield* reason(mounted.value.read.pipe(Effect.provideService(Caller, otherCaller)))).toBe(
                        'denied'
                    );
                    state.admitted = false;
                    expect(yield* reason(mounted.value.read)).toBe('denied');
                    expect(yield* reason(mounted.value.invoke('open'))).toBe('denied');
                    expect(state.calls).toBe(1);
                    yield* Scope.close(scope, Exit.void);
                    expect(Option.isNone(yield* Ref.get(active))).toBe(true);
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'correlates projection, action and screen mount through the existing Effect tracer',
    /** Verify module operations join the caller's trace while preserving distinct operation span names. */ () => {
        const { platform, services } = testServices();
        const captured: Array<{ readonly name: string; readonly trace: string }> = [];
        const capture = Effect.orDie(Effect.currentSpan).pipe(
            Effect.flatMap(
                /** Capture only the current span's public identity, not module payloads. */ (span) =>
                    Effect.sync(
                        /** Record deterministic trace evidence at platform/screen adapter execution points. */ () => {
                            captured.push({ name: span.name, trace: span.traceId });
                        }
                    )
            )
        );
        return Effect.scoped(
            Effect.gen(
                /** Compare observed adapter spans with the parent trace across mount and invocation. */ function* () {
                    // Invocation projects again, so the expected order includes two distinct project observations.
                    const parent = yield* Effect.orDie(Effect.currentSpan);
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(fixture()));
                    yield* registration.mount;
                    yield* registration.invoke('open');
                    expect(
                        captured.map(
                            /** Assert operation nesting through the adapter observation order. */ (span) => span.name
                        )
                    ).toEqual([
                        'ui.module.project',
                        'ui.module.mount',
                        'ui.module.project',
                        'ui.module.invoke',
                    ]);
                    expect(
                        captured.every(
                            /** Require propagation of the existing parent trace, not fresh isolated traces. */ (
                                span
                            ) => span.trace === parent.traceId
                        )
                    ).toBe(true);
                }
            )
        ).pipe(
            Effect.provide(
                declarativeRegistry([renderer]).pipe(
                    Layer.provide(
                        Layer.merge(
                            services,
                            Layer.succeed(UiPlatform, {
                                ...platform,
                                /** Observe projection tracing without changing valid field output. */
                                value: () => capture.pipe(Effect.as(37)),
                                /** Observe the actual dispatch span. */
                                invoke: () => capture,
                            })
                        )
                    )
                )
            ),
            Effect.provideService(UiScreenContext, {
                /** Observe the handoff span without installing unrelated screen state. */ mount: () => capture
            }),
            Effect.provideService(Caller, caller),
            Effect.withSpan('test.execution')
        );
    }
);

// Optional pre-encoding properties disappear in JSON.stringify; production
// boundary types still accept only JSON text and decode every value.
type Json = UiValue | ReadonlyArray<Json> | { readonly [key: string]: Json | undefined };
const invalid: ReadonlyArray<{
    readonly name: string;
    /** Produce one deliberately invalid wire candidate without mutating the valid baseline. */
    readonly edit: (definition: UiModuleDefinition) => Json;
    readonly reason: UiModuleFailure['reason'];
}> = [
    {
        name: 'unknown component',
        /** Select an uninstalled adapter while preserving the valid tree and config. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Replace each component identity with an unavailable catalog entry. */ (n) => ({
                    ...n,
                    component: { id: 'unknown.html', version: '1.0.0' }
                })
            ),
        }),
        reason: 'unknown-component',
    },
    {
        name: 'wrong component version',
        /** Distinguish a known component id from an approved exact version. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Keep the id but request an uninstalled implementation version. */ (n) => ({
                    ...n,
                    component: { ...n.component, version: '2.0.0' }
                })
            )
        }),
        reason: 'unknown-component',
    },
    {
        name: 'unbound interaction',
        /** Leave an interactive node with no canonical action binding. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Strip bindings without changing node kinds or tree edges. */ ({ binding: _binding, ...n }) => n
            )
        }),
        reason: 'unbound-action',
    },
    {
        name: 'unknown action',
        /** Point existing controls at an inventory-absent action id. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Corrupt only bound controls, preserving noninteractive node structure. */ (n) =>
                    (n.binding ? { ...n, binding: { ...n.binding, action: 'sample.unknown' } } : n)
            ),
        }),
        reason: 'unknown-action',
    },
    {
        name: 'wrong action version',
        /** Request an unavailable version of an otherwise known action. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Change only control binding versions so input and id remain valid. */ (n) =>
                    (n.binding ? { ...n, binding: { ...n.binding, version: 2 } } : n)
            ),
        }),
        reason: 'unknown-action',
    },
    {
        name: 'bad action input',
        /** Supply wire-valid input that the canonical action's schema refuses. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Target input validation without changing action identity or version. */ (n) =>
                    n.binding ? { ...n, binding: { ...n.binding, input: { target: 'secret' } } } : n
            ),
        }),
        reason: 'invalid-config',
    },
    {
        name: 'duplicate node',
        /** Reuse the root identifier to expose map overwrite ambiguity. */
        edit: (d) => ({ ...d, nodes: [...d.nodes, node('screen', 'view')] }),
        reason: 'invalid-definition',
    },
    {
        name: 'unreachable node',
        /** Add a valid node outside the rooted tree. */
        edit: (d) => ({ ...d, nodes: [...d.nodes, node('orphan', 'text')] }),
        reason: 'invalid-definition',
    },
    {
        name: 'tree cycle',
        /** Introduce a root self-edge without relying on missing references. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Make the root its own child to test cycle rejection. */ (n) =>
                    (n.id === 'screen' ? { ...n, children: ['screen'] } : n)
            )
        }),
        reason: 'invalid-definition',
    },
    {
        name: 'missing default',
        /** Remove every owned default while retaining message references. */ edit: (d) => ({ ...d, messages: {} }),
        reason: 'invalid-definition'
    },
    {
        name: 'foreign message namespace',
        /** Add an unused but foreign-owned message key to test namespace enforcement. */
        edit: (d) => ({ ...d, messages: { ...d.messages, 'other.title': 'Wrong owner' } }),
        reason: 'invalid-definition',
    },
    {
        name: 'invalid component config',
        /** Use scalar wire-valid config that the installed adapter does not accept. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Violate the empty adapter schema without introducing non-JSON data. */ (n) => ({
                    ...n,
                    config: { hidden: true }
                })
            )
        }),
        reason: 'invalid-config',
    },
    {
        name: 'executable handler field',
        /** Add a forbidden executable-shaped property outside the closed definition schema. */ edit: (d) => ({
            ...d,
            onPress: 'run()'
        }),
        reason: 'invalid-definition'
    },
    {
        name: 'executable string',
        /** Put code-shaped text into an otherwise owned message to test safe-text validation. */
        edit: (d) => ({ ...d, messages: { ...d.messages, 'sample.open': 'eval(secret)' } }),
        reason: 'invalid-definition',
    },
    {
        name: 'raw import',
        /** Attempt to supply module loading instructions through an excess definition property. */ edit: (d) => ({
            ...d,
            imports: ['react-native']
        }),
        reason: 'invalid-definition'
    },
    {
        name: 'invalid config scalar',
        /** Violate the flat scalar config grammar before adapter-specific validation. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Introduce nested data forbidden by the portable config schema. */ (n) => ({
                    ...n,
                    config: { nested: { js: 'secret' } }
                })
            )
        }),
        reason: 'invalid-definition',
    },
    {
        name: 'invalid module version',
        /** Supply a range where the wire contract requires an exact version. */ edit: (d) => ({
            ...d,
            version: '^1.0.0'
        }),
        reason: 'invalid-definition'
    },
    {
        name: 'field without source',
        /** Keep field node kinds but remove their platform source identifiers. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Strip source references without changing non-field properties. */ ({ field: _field, ...n }) => n
            )
        }),
        reason: 'invalid-definition',
    },
    {
        name: 'interactive parent',
        /** Keep a reachable tree but make an action own a child, violating container-only parenting. */
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map(
                /** Reparent the private leaf under the action while removing its root edge. */ (n) =>
                    n.id === 'open'
                        ? { ...n, children: ['private'] }
                        : n.id === 'screen'
                          ? { ...n, children: ['summary', 'open'] }
                          : n
            ),
        }),
        reason: 'invalid-definition',
    },
];
for (const example of invalid)
    it.effect(
        `rejects ${example.name} without publication`,
        /** Check the precise rejection category and absence of partially published registry state. */ () => {
            const { layer } = testServices();
            return Effect.scoped(
                Effect.gen(
                    /** Reject the single invalid candidate under otherwise accepting platform services. */ function* () {
                        // Discovery remaining empty proves validation is completed before publication.
                        const registry = yield* DeclarativeRegistry;
                        const rejected = yield* reason(registry.register(JSON.stringify(example.edit(fixture()))));
                        expect(rejected).toBe(example.reason);
                        expect(yield* registry.modules).toEqual([]);
                    }
                )
            ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
        }
    );

it.effect(
    'rejects raw functions, malformed JSON and oversize input without leaking input',
    /** Verify the text boundary refuses executable/malformed/oversize content without echoing the canary. */ () => {
        const { layer } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Compare failure serialization and registry emptiness for rejected raw input strings. */ function* () {
                    // Inspect failures as data so accidental inclusion of raw input is observable.
                    const registry = yield* DeclarativeRegistry;
                    for (const json of ['() => SECRET-CANARY', '{"function": function() {}}', 'x'.repeat(131073)]) {
                        const result = yield* Effect.either(registry.register(json));
                        expect(Either.isLeft(result)).toBe(true);
                        expect(JSON.stringify(result)).not.toContain('SECRET-CANARY');
                    }
                    expect(yield* registry.modules).toEqual([]);
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'preserves replacements when an older scope closes and stales old handles',
    /** Verify replacement ownership survives stale finalizers and subsequent invalid replacement attempts. */ () => {
        const { layer } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Contrast duplicate rejection, explicit replacement, old-scope cleanup and validation failure. */ function* () {
                    // Separate scopes expose accidental cleanup by key instead of publication token.
                    const registry = yield* DeclarativeRegistry;
                    const oldScope = yield* Scope.make();
                    const old = yield* registry
                        .register(JSON.stringify(fixture()))
                        .pipe(Effect.provideService(Scope.Scope, oldScope));
                    expect(yield* reason(registry.register(JSON.stringify(fixture())))).toBe('duplicate');
                    const replacement = yield* registry.register(
                        JSON.stringify({ ...fixture(), version: '1.0.1' }),
                        true
                    );
                    expect(yield* reason(old.project)).toBe('stale');
                    expect(yield* reason(old.invoke('open'))).toBe('stale');
                    yield* Scope.close(oldScope, Exit.void);
                    expect(yield* registry.modules).toEqual(['sample']);
                    expect((yield* replacement.project).version).toBe('1.0.1');
                    expect(yield* reason(registry.register(JSON.stringify({ ...fixture(), messages: {} }), true))).toBe(
                        'invalid-definition'
                    );
                    expect((yield* replacement.project).version).toBe('1.0.1');
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'disposes once and refuses all stale operations after scope release',
    /** Check repeated scope close leaves no publication and a stale projection handle. */ () => {
        const { layer } = testServices();
        return Effect.gen(
            /** Close the same acquisition twice to establish idempotent cleanup behavior. */ function* () {
                // Discovery and retained-handle checks cover both registry membership and capability validity.
                const registry = yield* DeclarativeRegistry;
                const scope = yield* Scope.make();
                const registration = yield* registry
                    .register(JSON.stringify(fixture()))
                    .pipe(Effect.provideService(Scope.Scope, scope));
                yield* Scope.close(scope, Exit.void);
                yield* Scope.close(scope, Exit.void);
                expect(yield* registry.modules).toEqual([]);
                expect(yield* reason(registration.project)).toBe('stale');
            }
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'does not leak a registration acquired in an already closed scope',
    /** Check immediate finalization when acquisition is provided an already closed lifetime. */ () => {
        const { layer } = testServices();
        return Effect.gen(
            /** Acquire after close and require no live registry entry or usable retained handle. */ function* () {
                // A closed scope is not a reason to leave a just-published entry without a finalizer.
                const registry = yield* DeclarativeRegistry;
                const scope = yield* Scope.make();
                yield* Scope.close(scope, Exit.void);
                const registration = yield* registry
                    .register(JSON.stringify(fixture()))
                    .pipe(Effect.provideService(Scope.Scope, scope));
                expect(yield* registry.modules).toEqual([]);
                expect(yield* reason(registration.project)).toBe('stale');
            }
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'rejects ambiguous approved catalogs instead of choosing the first renderer',
    /** Require deterministic catalog identity rather than order-dependent adapter selection. */ () => {
        const { services } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Reject duplicated installed identity/version pairs before any module is published. */ function* () {
                    // A valid definition isolates the catalog ambiguity from wire validation.
                    const registry = yield* DeclarativeRegistry;
                    expect(yield* reason(registry.register(JSON.stringify(fixture())))).toBe('invalid-config');
                    expect(yield* registry.modules).toEqual([]);
                }
            )
        ).pipe(
            Effect.provide(declarativeRegistry([renderer, renderer]).pipe(Layer.provide(services))),
            Effect.provideService(Caller, caller)
        );
    }
);

it.effect(
    'supports namespaced slots and canonical menu actions without hidden descendants',
    /** Positive control for slot traversal, terminology override and menu dispatch through canonical bindings. */ () => {
        // The custom tree uses only reachable nodes so container/menu validation is the behavior under test.
        const { layer } = testServices();
        const definition = fixture();
        const slot = node('tools', 'slot', ['open']);
        return Effect.scoped(
            Effect.gen(
                /** Publish the slot/menu tree and compare projected order, localized label and action metadata. */ function* () {
                    // Terminology may customize unprotected labels without changing the canonical action.
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(
                        JSON.stringify({
                            ...definition,
                            messages: { ...definition.messages, 'sample.tools': 'Tools' },
                            nodes: [
                                node('screen', 'view', ['tools']),
                                slot,
                                { ...node('open', 'menu'), terminology: 'sample.summary' },
                            ],
                        })
                    );
                    const projection = yield* registration.project;
                    expect(
                        projection.nodes.map(
                            /** Pin the visible root-to-slot-to-menu traversal. */ (entry) => entry.kind
                        )
                    ).toEqual(['view', 'slot', 'menu']);
                    expect(projection.nodes[2]).toMatchObject({
                        label: 'Total',
                        terminology: 'sample.summary',
                        action: { id: 'sample.open', version: 1 },
                    });
                    yield* registration.invoke('open');
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'protects canonical labels, ancestry and every replacement of protected modules',
    /** Verify protected content keeps canonical labels and refuses replacement or viewer suppression. */ () => {
        // Remove the normally hidden canary so the baseline protected module is fully visible.
        const { layer, state, services } = testServices();
        const definition = {
            ...fixture(),
            nodes: fixture()
                .nodes.filter(
                    /** Exclude the fixture's intentionally masked node from the protected baseline. */ (n) =>
                        n.id !== 'private'
                )
                .map(
                    /** Protect the action while attempting an otherwise permitted terminology override. */ (n) => ({
                        ...n,
                        protected: n.id === 'open',
                        children: n.children.filter(
                            /** Remove the deleted canary edge so the baseline stays a complete tree. */ (id) =>
                                id !== 'private'
                        ),
                        terminology: 'sample.summary',
                    })
                ),
        };
        return Effect.scoped(
            Effect.gen(
                /** Assert canonical wording and reject both replacement shapes before testing visibility denial. */ function* () {
                    // Replacing with an unprotected definition must not erase an existing module's protection.
                    const registry = yield* DeclarativeRegistry;
                    const registration = yield* registry.register(JSON.stringify(definition));
                    expect(
                        (yield* registration.project).nodes.find(
                            /** Compare the protected action label rather than the unprotected field label. */ (n) =>
                                n.id === 'open'
                        )?.label
                    ).toBe('Open summary');
                    for (const candidate of [fixture(), { ...definition, version: '2.0.0' }])
                        expect(yield* reason(registry.register(JSON.stringify(candidate), true))).toBe(
                            'protected-node'
                        );
                    state.visible = false;
                    expect(yield* reason(registration.project)).toBe('protected-node');
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller), Effect.provide(services));
    }
);

it.effect(
    'denies author-hidden protected ancestors before publication',
    /** Reject a definition that could hide protected content by suppressing its ancestor. */ () => {
        const { layer } = testServices();
        const definition = fixture();
        return Effect.scoped(
            Effect.gen(
                /** Hide the root while protecting its action descendant and require registration-time refusal. */ function* () {
                    // The ancestor, not the protected node itself, carries the author-controlled suppression.
                    const registry = yield* DeclarativeRegistry;
                    const json = JSON.stringify({
                        ...definition,
                        nodes: definition.nodes.map(
                            /** Introduce ancestor suppression without removing the protected descendant. */ (n) => ({
                                ...n,
                                protected: n.id === 'open',
                                project: n.id !== 'screen'
                            })
                        ),
                    });
                    expect(yield* reason(registry.register(json))).toBe('protected-node');
                }
            )
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    }
);

it.effect(
    'waits for admitted invocation before publishing a replacement',
    /** Exercise the serialization boundary between an in-flight platform invocation and replacement publication. */ () => {
        const { platform, services } = testServices();
        return Effect.scoped(
            Effect.gen(
                /** Install an invocation barrier so replacement cannot complete until dispatch settles. */ function* () {
                    // Deferred barriers locate the operation inside platform invocation rather than relying on timing.
                    const started = yield* Deferred.make<void>();
                    const finish = yield* Deferred.make<void>();
                    const custom = Layer.succeed(UiPlatform, {
                        ...platform,
                        /** Signal admitted dispatch, then retain its lock until the test explicitly permits settlement. */
                        invoke: () =>
                            Deferred.succeed(started, undefined).pipe(Effect.zipRight(Deferred.await(finish))),
                    });
                    const result = Effect.gen(
                        /** Fork replacement during dispatch and assert pending publication followed by old-handle invalidation. */ function* () {
                            // Polling before release checks the lock boundary; joining afterward observes completed publication.
                            const registry = yield* DeclarativeRegistry;
                            const first = yield* registry.register(JSON.stringify(fixture()));
                            const running = yield* Effect.fork(first.invoke('open'));
                            yield* Deferred.await(started);
                            const replacement = yield* Effect.fork(
                                registry.register(JSON.stringify({ ...fixture(), version: '1.0.1' }), true)
                            );
                            expect(Option.isNone(yield* Fiber.poll(replacement))).toBe(true);
                            yield* Deferred.succeed(finish, undefined);
                            yield* Fiber.join(running);
                            yield* Fiber.join(replacement);
                            expect(yield* reason(first.project)).toBe('stale');
                        }
                    );
                    yield* result.pipe(
                        Effect.provide(
                            declarativeRegistry([renderer]).pipe(Layer.provide(Layer.merge(services, custom)))
                        )
                    );
                }
            )
        ).pipe(Effect.provideService(Caller, caller));
    }
);

it('keeps concrete input/output/error/environment types with negative assignability fixtures', /** Pin public Effect channels and reject executable config, version ranges and erased failure/environment types. */ () => {
    // Positive equalities prevent widening; negative controls ensure the API has not collapsed to permissive types.
    type Register = Context.Tag.Service<DeclarativeRegistry>['register'];
    expectTypeOf<Parameters<Register>>().toEqualTypeOf<[json: string, replace?: boolean | undefined]>();
    expectTypeOf<Effect.Effect.Success<ReturnType<Register>>>().toEqualTypeOf<UiRegistration>();
    expectTypeOf<Effect.Effect.Error<ReturnType<Register>>>().toEqualTypeOf<UiModuleFailure>();
    expectTypeOf<Effect.Effect.Context<ReturnType<Register>>>().toEqualTypeOf<Caller | Scope.Scope>();
    expectTypeOf<Effect.Effect.Success<ReturnType<UiRegistration['invoke']>>>().toEqualTypeOf<void>();
    expectTypeOf<Effect.Effect.Error<ReturnType<UiRegistration['invoke']>>>().toEqualTypeOf<UiModuleFailure>();
    expectTypeOf<Effect.Effect.Context<ReturnType<UiRegistration['invoke']>>>().toEqualTypeOf<Caller>();
    expectTypeOf<UiRegistration['mount']>().toEqualTypeOf<
        Effect.Effect<void, UiModuleFailure, Caller | Scope.Scope | UiScreenContext>
    >();
    expectTypeOf<Parameters<Context.Tag.Service<UiScreenContext>['mount']>[0]>().toEqualTypeOf<{
        readonly read: Effect.Effect<UiProjection, UiModuleFailure, Caller>;
        /** Expected screen capability requires the executing Caller and retains typed module failures. */
        readonly invoke: (node: string) => Effect.Effect<void, UiModuleFailure, Caller>;
    }>();
    expectTypeOf<UiRegistration['mount']>().not.toExtend<Effect.Effect<void, UiModuleFailure, Caller>>();
    expectTypeOf<UiRegistration['mount']>().not.toExtend<
        Effect.Effect<void, never, Caller | Scope.Scope | UiScreenContext>
    >();
    expectTypeOf<Context.Tag.Service<DeclarativeRegistry>['modules']>().toEqualTypeOf<
        Effect.Effect<ReadonlyArray<string>, never, Caller>
    >();
    expectTypeOf<typeof UiModuleDefinition.Type>().toEqualTypeOf<typeof UiModuleDefinition.Encoded>();
    expectTypeOf<typeof UiProjection.Type>().toEqualTypeOf<typeof UiProjection.Encoded>();
    expectTypeOf<UiActionBinding['input']>().toEqualTypeOf<UiConfig>();
    expectTypeOf<Context.Tag.Service<UiPlatform>['value']>().toEqualTypeOf<
        /** Expected platform value reads are caller-scoped and return only portable scalar values. */
        (module: string, field: string) => Effect.Effect<UiValue, UiModuleFailure, Caller>
    >();
    expectTypeOf<Context.Tag.Service<UiPlatform>['invoke']>().toEqualTypeOf<
        /** Expected platform dispatch accepts the canonical binding and preserves authorization requirements. */
        (binding: UiActionBinding) => Effect.Effect<void, UiModuleFailure, Caller>
    >();
    expectTypeOf<ReturnType<Context.Tag.Service<UiScreenContext>['mount']>>().toEqualTypeOf<
        Effect.Effect<void, UiModuleFailure, Caller | Scope.Scope>
    >();
    expectTypeOf<UiRenderer['config']>().toEqualTypeOf<Schema.Schema<UiConfig, UiConfig, never>>();
    expectTypeOf<Effect.Effect.Success<UiRegistration['project']>>().toEqualTypeOf<UiProjection>();
    expectTypeOf<Effect.Effect.Error<UiRegistration['project']>>().toEqualTypeOf<UiModuleFailure>();
    expectTypeOf<Effect.Effect.Context<UiRegistration['project']>>().toEqualTypeOf<Caller>();
    expectTypeOf<ReturnType<typeof declarativeRegistry>>().toEqualTypeOf<
        Layer.Layer<DeclarativeRegistry, never, UiPlatform | Flags | I18n | ActionInventory>
    >();
    expectTypeOf<{ action: string; version: string; input: UiConfig }>().not.toExtend<UiActionBinding>();
    expectTypeOf<{
        /** Deliberately executable type used to prove config rejects callable values. */ callback: () => void
    }>().not.toExtend<UiConfig>();
    expectTypeOf<{ nested: { secret: string } }>().not.toExtend<UiConfig>();
    expectTypeOf<{ format: 2 }>().not.toExtend<UiModuleDefinition>();
    expectTypeOf<Effect.Effect<UiProjection, UiModuleFailure, Caller>>().not.toExtend<
        Effect.Effect<UiProjection, never, never>
    >();
    expectTypeOf<Effect.Effect<UiProjection, UiModuleFailure, Caller>>().not.toExtend<
        Effect.Effect<string, UiModuleFailure, Caller>
    >();
});

it('interprets exact installed components and uses injected unavailable rendering', /** Compare installed rendering, host-owned fallbacks and the empty available projection without mounting a DOM. */ () => {
    // React element equality establishes interpreter selection only, not browser accessibility or focus behavior.
    const projection: UiProjection = {
        format: 1,
        module: 'sample',
        version: '1.0.0',
        state: 'available',
        message: '',
        nodes: [
            {
                id: 'screen',
                kind: 'view',
                component: { id: 'approved.content', version: '1.0.0' },
                label: 'Module summary',
                config: {},
                children: [],
            },
        ],
    };
    const props = {
        projection,
        renderers: [renderer],
        /** Supply an inert lazy capability; element construction must not need authenticated execution. */
        invoke: () => Effect.void,
        /** Make fallback selection and message propagation observable in the returned element. */
        unavailable: (message: string) => createElement('p', { role: 'status' }, message),
    };
    expect(isValidElement(DeclarativeModule(props))).toBe(true);
    expect(
        DeclarativeModule({ ...props, projection: { ...projection, state: 'offline', message: 'Offline' } })
    ).toEqual(createElement('p', { role: 'status' }, 'Offline'));
    expect(DeclarativeModule({ ...props, renderers: [] })).toEqual(createElement('p', { role: 'status' }, ''));
    expect(DeclarativeModule({ ...props, projection: { ...projection, nodes: [] } })).toBeNull();
});

/** Audit resolved local source edges for DFS back-edges, including type-only and dynamic literal imports. */
const auditSources = (
    entry: string,
    /** Supply source text independently of disk so cycle fixtures can use an in-memory graph. */
    read: (file: string) => string,
    /** Resolve only audit-owned sources; undefined deliberately stops traversal at external/unresolved edges. */
    resolveImport: (name: string, from: string) => string | undefined
) => {
    // Active-path and completed sets must remain separate: a shared dependency is not a cycle.
    const active = new Set<string>();
    const done = new Set<string>();
    const visited: Array<string> = [];
    const failures: Array<string> = [];
    /** Traverse each resolved file once while keeping the active DFS path distinct from completed files. */
    const visit = (file: string): void => {
        // Completed shared dependencies are legal; only an edge into the active path proves a cycle.
        if (done.has(file)) return;
        active.add(file);
        visited.push(file);
        const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
        /** Follow literal module edges and record the importing source line for active-path cycles. */
        const edge = (specifier: ts.Node): void => {
            // Dynamic computed specifiers cannot be resolved statically and are outside this literal-edge audit.
            if (!ts.isStringLiteral(specifier)) return;
            const target = resolveImport(specifier.text, file);
            if (target === undefined) return;
            const line = source.getLineAndCharacterOfPosition(specifier.getStart(source)).line + 1;
            if (active.has(target)) failures.push(`${file}:${line} -> ${target}`);
            else visit(target);
        };
        /** Recognize import/export declarations, import types and literal dynamic import/require calls. */
        const walk = (node: ts.Node): void => {
            // Type-only edges still constrain architecture even though emit removes them.
            if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
                if (node.moduleSpecifier !== undefined) edge(node.moduleSpecifier);
            } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
                edge(node.argument.literal);
            } else if (
                ts.isCallExpression(node) &&
                (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
                    (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
                node.arguments[0] !== undefined
            ) {
                edge(node.arguments[0]);
            }
            ts.forEachChild(node, walk);
        };
        walk(source);
        active.delete(file);
        done.add(file);
    };
    visit(entry);
    return { failures, visited };
};

it('audits transitive source edges including type-only imports, aliases and reexports without cycles', /** Check the real registry's resolved dependency closure reaches contracts but never backend runtime or extensions. */ () => {
    // Use the test compiler configuration so aliases and source conditions match the compilation being checked.
    const root = resolve(import.meta.dirname, '../../..');
    const configPath = resolve(root, 'tests/ui-modules/tsconfig.json');
    const diagnostics: Array<ts.Diagnostic> = [];
    const config = ts.getParsedCommandLineOfConfigFile(
        configPath,
        {},
        {
            ...ts.sys,
            /** Preserve configuration failures so a broken resolver cannot masquerade as an empty successful graph. */
            onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
                diagnostics.push(diagnostic);
            },
        }
    );
    expect(diagnostics).toEqual([]);
    expect(config).toBeDefined();
    if (config === undefined) return;
    const { failures, visited } = auditSources(
        resolve(root, 'packages/ui-modules/src/declarative-registry.ts'),
        /** Inspect authored source rather than emitted JavaScript, retaining type-only dependency edges. */
        (file) => readFileSync(file, 'utf8'),
        /** Follow compiler-resolved workspace files but stop at installed dependencies. */
        (name, file) => {
            const options = config.options;
            const target = ts.resolveModuleName(name, file, options, ts.sys).resolvedModule?.resolvedFileName;
            return target !== undefined && target.startsWith(root) && !target.includes('/node_modules/')
                ? target
                : undefined;
        }
    );
    expect(failures).toEqual([]);
    expect(
        visited.some(
            /** Positive traversal control: the registry must actually reach its UI contract dependency. */ (file) =>
                file.endsWith('/contracts/src/ui-module.ts')
        )
    ).toBe(true);
    expect(
        visited.some(
            /** Detect forbidden reverse-layer imports anywhere in the transitive closure. */ (file) =>
                file.includes('/runtime/') || file.includes('/extensions/')
        )
    ).toBe(false);
});

it('detects aliased type-only/reexport cycles with exact source lines and accepts A -> C <- B', /** Calibrate cycle detection across import forms and distinguish shared dependencies from active-path back-edges. */ () => {
    // Reuse the same graph while changing C's edge syntax, then remove its back-edge as a negative control.
    const files = new Map([
        ['/a.ts', 'import type { B } from "@lane/b";\nexport type A = B;'],
        ['/b.ts', 'export type { C as B } from "./c.ts";'],
        ['/c.ts', 'export type { A as C } from "./a.ts";'],
    ]);
    const options: ts.CompilerOptions = {
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        paths: { '@lane/*': ['/*.ts'] },
    };
    const host: ts.ModuleResolutionHost = {
        /** Restrict compiler lookup to the in-memory fixture graph. */
        fileExists: (file) => files.has(file),
        /** Supply current fixture edits to compiler resolution. */
        readFile: (file) => files.get(file),
        /** Keep fixture paths deterministic and independent of the checkout location. */
        getCurrentDirectory: () => '/',
    };
    /** Reaudit the edited graph with fresh traversal state after each edge mutation. */
    const run = () =>
        auditSources(
            '/a.ts',
            /** Supply the currently selected source spelling for the import-form controls. */
            (file) => files.get(file) ?? '',
            /** Exercise TypeScript alias resolution rather than hand-coded fixture edge mapping. */
            (name, file) => ts.resolveModuleName(name, file, options, host).resolvedModule?.resolvedFileName
        );
    expect(run().failures).toEqual(['/c.ts:1 -> /a.ts']);
    files.set('/c.ts', 'export type C = import("./a.ts").A;');
    expect(run().failures).toEqual(['/c.ts:1 -> /a.ts']);
    files.set('/c.ts', 'import("./a.ts");');
    expect(run().failures).toEqual(['/c.ts:1 -> /a.ts']);
    files.set('/c.ts', 'require("./a.ts");');
    expect(run().failures).toEqual(['/c.ts:1 -> /a.ts']);
    files.set('/c.ts', 'export type { C } from "./c.ts";');
    expect(run().failures).toEqual(['/c.ts:1 -> /c.ts']);
    files.set('/c.ts', 'export type C = string;');
    expect(run().failures).toEqual([]);
    expect(run().visited.sort()).toEqual(['/a.ts', '/b.ts', '/c.ts']);
    files.set('/a.ts', 'import type { C } from "./c.ts"; import type { B } from "@lane/b";');
    expect(run().failures).toEqual([]);
    expect(run().visited.sort()).toEqual(['/a.ts', '/b.ts', '/c.ts']);
});
