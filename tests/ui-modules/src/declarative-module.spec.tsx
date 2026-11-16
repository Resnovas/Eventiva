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
const Content = ({ node, children }: UiRendererProps) =>
    createElement('section', { 'aria-label': node.label }, children);
const renderer: UiRenderer = {
    id: 'approved.content',
    version: '1.0.0',
    kinds: ['view', 'layout', 'text', 'field', 'action', 'menu', 'slot'],
    config: UiConfig.pipe(Schema.filter((config) => Object.keys(config).length === 0)),
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

const testServices = () => {
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
        admit: () =>
            Effect.suspend(() =>
                state.admitted ? Effect.void : Effect.fail(new UiModuleFailure({ reason: 'denied' }))
            ),
        checkInput: (entry) =>
            Schema.decodeUnknown(Schema.Struct({ target: Schema.Literal('summary') }))(entry.input).pipe(
                Effect.asVoid,
                Effect.mapError(() => new UiModuleFailure({ reason: 'invalid-config' }))
            ),
        invoke: () =>
            Effect.gen(function* () {
                const activeCaller = yield* Caller;
                if (!state.allowed || activeCaller.tenant !== caller.tenant)
                    return yield* new UiModuleFailure({ reason: 'denied' });
                state.calls += 1;
            }),
        visible: (_module, entry) => Effect.sync(() => state.visible && entry.id !== 'private'),
        value: () =>
            Effect.suspend(() =>
                state.fieldAllowed ? Effect.succeed(37) : Effect.fail(new UiModuleFailure({ reason: 'denied' }))
            ),
        online: Effect.sync(() => state.online),
    });
    const services = Layer.mergeAll(
        Layer.succeed(UiPlatform, platform),
        Layer.succeed(Flags, {
            evaluate: (flag) =>
                Effect.sync(() => ({ flag: flag.key, value: state.enabled, reason: 'TEST', fallback: false })),
        }),
        Layer.succeed(I18n, { locale: 'en-GB', format: (message) => message.defaultMessage }),
        Layer.succeed(ActionInventory, {
            find: (_caller, id) =>
                Effect.sync(() => (state.allowed && id === binding.action ? Option.some(metadata) : Option.none())),
            list: () => Effect.succeed([metadata]),
        })
    );
    return { state, services, platform, layer: declarativeRegistry([renderer]).pipe(Layer.provide(services)) };
};
const reason = <A, R>(effect: Effect.Effect<A, UiModuleFailure, R>) =>
    effect.pipe(
        Effect.either,
        Effect.map((result) => (Either.isLeft(result) ? result.left.reason : 'success'))
    );

it.effect('publishes one masked UI/agent projection and invokes the canonical binding', () => {
    const { layer, state } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(fixture()));
            const projection = yield* registration.project;
            expect(Schema.is(UiProjection)(projection)).toBe(true);
            const encoded = yield* Schema.encode(Schema.parseJson(UiProjection))(projection);
            expect(yield* Schema.decodeUnknown(Schema.parseJson(UiProjection))(encoded)).toEqual(projection);
            const invalidVersion = {
                ...projection,
                nodes: projection.nodes.map((entry) =>
                    entry.action === undefined ? entry : { ...entry, action: { ...entry.action, version: -1 } }
                ),
            };
            expect(Schema.is(UiProjection)(invalidVersion)).toBe(false);
            expect(projection.nodes.map((node) => node.id)).toEqual(['screen', 'summary', 'open']);
            expect(projection.nodes[0]?.children).toEqual(['summary', 'open']);
            expect(projection.nodes.find((node) => node.id === 'summary')?.value).toBe(37);
            expect(projection.nodes.find((node) => node.id === 'open')?.action).toEqual({
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
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('fails closed on revoked admission, masked fields, tenant mismatch and offline/disabled state', () => {
    const { layer, state } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
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
            expect(yield* reason(registration.invoke('open').pipe(Effect.provideService(Caller, otherCaller)))).toBe(
                'denied'
            );
            state.admitted = false;
            expect(yield* reason(registration.project)).toBe('denied');
            expect(state.calls).toBe(0);
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('safe defaults never enable the foundation or a module', () => {
    const { services } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(fixture()));
            expect(yield* registration.project).toMatchObject({ state: 'unavailable', nodes: [] });
        })
    ).pipe(
        Effect.provide(declarativeRegistry([renderer]).pipe(Layer.provide(Layer.merge(services, FlagsSafeDefaults)))),
        Effect.provideService(Caller, caller)
    );
});

it.effect('isolates discovery, handles and same-named replacements between tenants', () => {
    const { layer, state } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const first = yield* registry.register(JSON.stringify(fixture()));
            expect(yield* registry.modules.pipe(Effect.provideService(Caller, otherCaller))).toEqual([]);
            expect(yield* reason(first.project.pipe(Effect.provideService(Caller, otherCaller)))).toBe('denied');
            const otherScope = yield* Scope.make();
            const second = yield* registry
                .register(JSON.stringify({ ...fixture(), version: '2.0.0' }), true)
                .pipe(Effect.provideService(Caller, otherCaller), Effect.provideService(Scope.Scope, otherScope));
            expect((yield* first.project).version).toBe('1.0.0');
            expect((yield* second.project.pipe(Effect.provideService(Caller, otherCaller))).version).toBe('2.0.0');
            yield* Scope.close(otherScope, Exit.void);
            expect((yield* first.project).version).toBe('1.0.0');
            expect(yield* registry.modules).toEqual(['sample']);
            state.admitted = false;
            expect(yield* registry.modules).toEqual([]);
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('rejects invalid scalar output from a masking adapter before releasing a projection', () => {
    const { platform, services } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(fixture()));
            expect(yield* reason(registration.project)).toBe('invalid-projection');
            expect(yield* reason(registration.invoke('open'))).toBe('invalid-projection');
        })
    ).pipe(
        Effect.provide(
            declarativeRegistry([renderer]).pipe(
                Layer.provide(
                    Layer.merge(services, Layer.succeed(UiPlatform, { ...platform, value: () => Effect.succeed(NaN) }))
                )
            )
        ),
        Effect.provideService(Caller, caller)
    );
});

it.effect('rechecks admission after an asynchronous projection read before releasing fields', () => {
    const { platform, services, state } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(fixture()));
            expect(yield* reason(registration.project)).toBe('denied');
        })
    ).pipe(
        Effect.provide(
            declarativeRegistry([renderer]).pipe(
                Layer.provide(
                    Layer.merge(
                        services,
                        Layer.succeed(UiPlatform, {
                            ...platform,
                            value: () =>
                                Effect.sync(() => {
                                    state.admitted = false;
                                    return 37;
                                }),
                        })
                    )
                )
            )
        ),
        Effect.provideService(Caller, caller)
    );
});

it.effect('mounts only fresh caller-masked capabilities and releases the scoped screen context', () => {
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
                    value: () =>
                        Effect.gen(function* () {
                            const current = yield* Caller;
                            return current.subject === caller.subject ? 37 : 5;
                        }),
                })
            )
        )
    );
    type Screen = Parameters<Context.Tag.Service<UiScreenContext>['mount']>[0];
    return Effect.scoped(
        Effect.gen(function* () {
            const active = yield* Ref.make(Option.none<Screen>());
            const screens = UiScreenContext.of({
                mount: (screen) =>
                    Effect.acquireRelease(Ref.set(active, Option.some(screen)), () =>
                        Ref.update(active, (current) => Option.filter(current, (value) => value !== screen))
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
            expect((yield* mounted.value.read).nodes.map((node) => node.id)).toEqual(['screen', 'summary', 'open']);
            const viewerProjection = yield* mounted.value.read.pipe(Effect.provideService(Caller, viewer));
            expect(viewerProjection.nodes.find((node) => node.id === 'summary')?.value).toBe(5);
            expect((yield* mounted.value.read).nodes.find((node) => node.id === 'summary')?.value).toBe(37);
            yield* mounted.value.invoke('open');
            expect(state.calls).toBe(1);
            state.online = false;
            expect(yield* mounted.value.read).toMatchObject({ state: 'offline', nodes: [] });
            expect(yield* reason(mounted.value.invoke('open'))).toBe('offline');
            state.online = true;
            expect(yield* reason(mounted.value.read.pipe(Effect.provideService(Caller, otherCaller)))).toBe('denied');
            state.admitted = false;
            expect(yield* reason(mounted.value.read)).toBe('denied');
            expect(yield* reason(mounted.value.invoke('open'))).toBe('denied');
            expect(state.calls).toBe(1);
            yield* Scope.close(scope, Exit.void);
            expect(Option.isNone(yield* Ref.get(active))).toBe(true);
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('correlates projection, action and screen mount through the existing Effect tracer', () => {
    const { platform, services } = testServices();
    const captured: Array<{ readonly name: string; readonly trace: string }> = [];
    const capture = Effect.orDie(Effect.currentSpan).pipe(
        Effect.flatMap((span) =>
            Effect.sync(() => {
                captured.push({ name: span.name, trace: span.traceId });
            })
        )
    );
    return Effect.scoped(
        Effect.gen(function* () {
            const parent = yield* Effect.orDie(Effect.currentSpan);
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(fixture()));
            yield* registration.mount;
            yield* registration.invoke('open');
            expect(captured.map((span) => span.name)).toEqual([
                'ui.module.project',
                'ui.module.mount',
                'ui.module.project',
                'ui.module.invoke',
            ]);
            expect(captured.every((span) => span.trace === parent.traceId)).toBe(true);
        })
    ).pipe(
        Effect.provide(
            declarativeRegistry([renderer]).pipe(
                Layer.provide(
                    Layer.merge(
                        services,
                        Layer.succeed(UiPlatform, {
                            ...platform,
                            value: () => capture.pipe(Effect.as(37)),
                            invoke: () => capture,
                        })
                    )
                )
            )
        ),
        Effect.provideService(UiScreenContext, { mount: () => capture }),
        Effect.provideService(Caller, caller),
        Effect.withSpan('test.execution')
    );
});

// Optional pre-encoding properties disappear in JSON.stringify; production
// boundary types still accept only JSON text and decode every value.
type Json = UiValue | ReadonlyArray<Json> | { readonly [key: string]: Json | undefined };
const invalid: ReadonlyArray<{
    readonly name: string;
    readonly edit: (definition: UiModuleDefinition) => Json;
    readonly reason: UiModuleFailure['reason'];
}> = [
    {
        name: 'unknown component',
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map((n) => ({ ...n, component: { id: 'unknown.html', version: '1.0.0' } })),
        }),
        reason: 'unknown-component',
    },
    {
        name: 'wrong component version',
        edit: (d) => ({ ...d, nodes: d.nodes.map((n) => ({ ...n, component: { ...n.component, version: '2.0.0' } })) }),
        reason: 'unknown-component',
    },
    {
        name: 'unbound interaction',
        edit: (d) => ({ ...d, nodes: d.nodes.map(({ binding: _binding, ...n }) => n) }),
        reason: 'unbound-action',
    },
    {
        name: 'unknown action',
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map((n) => (n.binding ? { ...n, binding: { ...n.binding, action: 'sample.unknown' } } : n)),
        }),
        reason: 'unknown-action',
    },
    {
        name: 'wrong action version',
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map((n) => (n.binding ? { ...n, binding: { ...n.binding, version: 2 } } : n)),
        }),
        reason: 'unknown-action',
    },
    {
        name: 'bad action input',
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map((n) =>
                n.binding ? { ...n, binding: { ...n.binding, input: { target: 'secret' } } } : n
            ),
        }),
        reason: 'invalid-config',
    },
    {
        name: 'duplicate node',
        edit: (d) => ({ ...d, nodes: [...d.nodes, node('screen', 'view')] }),
        reason: 'invalid-definition',
    },
    {
        name: 'unreachable node',
        edit: (d) => ({ ...d, nodes: [...d.nodes, node('orphan', 'text')] }),
        reason: 'invalid-definition',
    },
    {
        name: 'tree cycle',
        edit: (d) => ({ ...d, nodes: d.nodes.map((n) => (n.id === 'screen' ? { ...n, children: ['screen'] } : n)) }),
        reason: 'invalid-definition',
    },
    { name: 'missing default', edit: (d) => ({ ...d, messages: {} }), reason: 'invalid-definition' },
    {
        name: 'foreign message namespace',
        edit: (d) => ({ ...d, messages: { ...d.messages, 'other.title': 'Wrong owner' } }),
        reason: 'invalid-definition',
    },
    {
        name: 'invalid component config',
        edit: (d) => ({ ...d, nodes: d.nodes.map((n) => ({ ...n, config: { hidden: true } })) }),
        reason: 'invalid-config',
    },
    { name: 'executable handler field', edit: (d) => ({ ...d, onPress: 'run()' }), reason: 'invalid-definition' },
    {
        name: 'executable string',
        edit: (d) => ({ ...d, messages: { ...d.messages, 'sample.open': 'eval(secret)' } }),
        reason: 'invalid-definition',
    },
    { name: 'raw import', edit: (d) => ({ ...d, imports: ['react-native'] }), reason: 'invalid-definition' },
    {
        name: 'invalid config scalar',
        edit: (d) => ({ ...d, nodes: d.nodes.map((n) => ({ ...n, config: { nested: { js: 'secret' } } })) }),
        reason: 'invalid-definition',
    },
    { name: 'invalid module version', edit: (d) => ({ ...d, version: '^1.0.0' }), reason: 'invalid-definition' },
    {
        name: 'field without source',
        edit: (d) => ({ ...d, nodes: d.nodes.map(({ field: _field, ...n }) => n) }),
        reason: 'invalid-definition',
    },
    {
        name: 'interactive parent',
        edit: (d) => ({
            ...d,
            nodes: d.nodes.map((n) =>
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
    it.effect(`rejects ${example.name} without publication`, () => {
        const { layer } = testServices();
        return Effect.scoped(
            Effect.gen(function* () {
                const registry = yield* DeclarativeRegistry;
                const rejected = yield* reason(registry.register(JSON.stringify(example.edit(fixture()))));
                expect(rejected).toBe(example.reason);
                expect(yield* registry.modules).toEqual([]);
            })
        ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    });

it.effect('rejects raw functions, malformed JSON and oversize input without leaking input', () => {
    const { layer } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            for (const json of ['() => SECRET-CANARY', '{"function": function() {}}', 'x'.repeat(131073)]) {
                const result = yield* Effect.either(registry.register(json));
                expect(Either.isLeft(result)).toBe(true);
                expect(JSON.stringify(result)).not.toContain('SECRET-CANARY');
            }
            expect(yield* registry.modules).toEqual([]);
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('preserves replacements when an older scope closes and stales old handles', () => {
    const { layer } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const oldScope = yield* Scope.make();
            const old = yield* registry
                .register(JSON.stringify(fixture()))
                .pipe(Effect.provideService(Scope.Scope, oldScope));
            expect(yield* reason(registry.register(JSON.stringify(fixture())))).toBe('duplicate');
            const replacement = yield* registry.register(JSON.stringify({ ...fixture(), version: '1.0.1' }), true);
            expect(yield* reason(old.project)).toBe('stale');
            expect(yield* reason(old.invoke('open'))).toBe('stale');
            yield* Scope.close(oldScope, Exit.void);
            expect(yield* registry.modules).toEqual(['sample']);
            expect((yield* replacement.project).version).toBe('1.0.1');
            expect(yield* reason(registry.register(JSON.stringify({ ...fixture(), messages: {} }), true))).toBe(
                'invalid-definition'
            );
            expect((yield* replacement.project).version).toBe('1.0.1');
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('disposes once and refuses all stale operations after scope release', () => {
    const { layer } = testServices();
    return Effect.gen(function* () {
        const registry = yield* DeclarativeRegistry;
        const scope = yield* Scope.make();
        const registration = yield* registry
            .register(JSON.stringify(fixture()))
            .pipe(Effect.provideService(Scope.Scope, scope));
        yield* Scope.close(scope, Exit.void);
        yield* Scope.close(scope, Exit.void);
        expect(yield* registry.modules).toEqual([]);
        expect(yield* reason(registration.project)).toBe('stale');
    }).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('does not leak a registration acquired in an already closed scope', () => {
    const { layer } = testServices();
    return Effect.gen(function* () {
        const registry = yield* DeclarativeRegistry;
        const scope = yield* Scope.make();
        yield* Scope.close(scope, Exit.void);
        const registration = yield* registry
            .register(JSON.stringify(fixture()))
            .pipe(Effect.provideService(Scope.Scope, scope));
        expect(yield* registry.modules).toEqual([]);
        expect(yield* reason(registration.project)).toBe('stale');
    }).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('rejects ambiguous approved catalogs instead of choosing the first renderer', () => {
    const { services } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            expect(yield* reason(registry.register(JSON.stringify(fixture())))).toBe('invalid-config');
            expect(yield* registry.modules).toEqual([]);
        })
    ).pipe(
        Effect.provide(declarativeRegistry([renderer, renderer]).pipe(Layer.provide(services))),
        Effect.provideService(Caller, caller)
    );
});

it.effect('supports namespaced slots and canonical menu actions without hidden descendants', () => {
    const { layer } = testServices();
    const definition = fixture();
    const slot = node('tools', 'slot', ['open']);
    return Effect.scoped(
        Effect.gen(function* () {
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
            expect(projection.nodes.map((entry) => entry.kind)).toEqual(['view', 'slot', 'menu']);
            expect(projection.nodes[2]).toMatchObject({
                label: 'Total',
                terminology: 'sample.summary',
                action: { id: 'sample.open', version: 1 },
            });
            yield* registration.invoke('open');
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('protects canonical labels, ancestry and every replacement of protected modules', () => {
    const { layer, state, services } = testServices();
    const definition = {
        ...fixture(),
        nodes: fixture()
            .nodes.filter((n) => n.id !== 'private')
            .map((n) => ({
                ...n,
                protected: n.id === 'open',
                children: n.children.filter((id) => id !== 'private'),
                terminology: 'sample.summary',
            })),
    };
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(definition));
            expect((yield* registration.project).nodes.find((n) => n.id === 'open')?.label).toBe('Open summary');
            for (const candidate of [fixture(), { ...definition, version: '2.0.0' }])
                expect(yield* reason(registry.register(JSON.stringify(candidate), true))).toBe('protected-node');
            state.visible = false;
            expect(yield* reason(registration.project)).toBe('protected-node');
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller), Effect.provide(services));
});

it.effect('denies author-hidden protected ancestors before publication', () => {
    const { layer } = testServices();
    const definition = fixture();
    return Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const json = JSON.stringify({
                ...definition,
                nodes: definition.nodes.map((n) => ({ ...n, protected: n.id === 'open', project: n.id !== 'screen' })),
            });
            expect(yield* reason(registry.register(json))).toBe('protected-node');
        })
    ).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.effect('waits for admitted invocation before publishing a replacement', () => {
    const { platform, services } = testServices();
    return Effect.scoped(
        Effect.gen(function* () {
            const started = yield* Deferred.make<void>();
            const finish = yield* Deferred.make<void>();
            const custom = Layer.succeed(UiPlatform, {
                ...platform,
                invoke: () => Deferred.succeed(started, undefined).pipe(Effect.zipRight(Deferred.await(finish))),
            });
            const result = Effect.gen(function* () {
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
            });
            yield* result.pipe(
                Effect.provide(declarativeRegistry([renderer]).pipe(Layer.provide(Layer.merge(services, custom))))
            );
        })
    ).pipe(Effect.provideService(Caller, caller));
});

it('keeps concrete input/output/error/environment types with negative assignability fixtures', () => {
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
        (module: string, field: string) => Effect.Effect<UiValue, UiModuleFailure, Caller>
    >();
    expectTypeOf<Context.Tag.Service<UiPlatform>['invoke']>().toEqualTypeOf<
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
    expectTypeOf<{ callback: () => void }>().not.toExtend<UiConfig>();
    expectTypeOf<{ nested: { secret: string } }>().not.toExtend<UiConfig>();
    expectTypeOf<{ format: 2 }>().not.toExtend<UiModuleDefinition>();
    expectTypeOf<Effect.Effect<UiProjection, UiModuleFailure, Caller>>().not.toExtend<
        Effect.Effect<UiProjection, never, never>
    >();
    expectTypeOf<Effect.Effect<UiProjection, UiModuleFailure, Caller>>().not.toExtend<
        Effect.Effect<string, UiModuleFailure, Caller>
    >();
});

it('interprets exact installed components and uses injected unavailable rendering', () => {
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
        invoke: () => Effect.void,
        unavailable: (message: string) => createElement('p', { role: 'status' }, message),
    };
    expect(isValidElement(DeclarativeModule(props))).toBe(true);
    expect(
        DeclarativeModule({ ...props, projection: { ...projection, state: 'offline', message: 'Offline' } })
    ).toEqual(createElement('p', { role: 'status' }, 'Offline'));
    expect(DeclarativeModule({ ...props, renderers: [] })).toEqual(createElement('p', { role: 'status' }, ''));
    expect(DeclarativeModule({ ...props, projection: { ...projection, nodes: [] } })).toBeNull();
});

const auditSources = (
    entry: string,
    read: (file: string) => string,
    resolveImport: (name: string, from: string) => string | undefined
) => {
    const active = new Set<string>();
    const done = new Set<string>();
    const visited: Array<string> = [];
    const failures: Array<string> = [];
    const visit = (file: string): void => {
        if (done.has(file)) return;
        active.add(file);
        visited.push(file);
        const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
        const edge = (specifier: ts.Node): void => {
            if (!ts.isStringLiteral(specifier)) return;
            const target = resolveImport(specifier.text, file);
            if (target === undefined) return;
            const line = source.getLineAndCharacterOfPosition(specifier.getStart(source)).line + 1;
            if (active.has(target)) failures.push(`${file}:${line} -> ${target}`);
            else visit(target);
        };
        const walk = (node: ts.Node): void => {
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

it('audits transitive source edges including type-only imports, aliases and reexports without cycles', () => {
    const root = resolve(import.meta.dirname, '../../..');
    const configPath = resolve(root, 'tests/ui-modules/tsconfig.json');
    const diagnostics: Array<ts.Diagnostic> = [];
    const config = ts.getParsedCommandLineOfConfigFile(
        configPath,
        {},
        {
            ...ts.sys,
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
        (file) => readFileSync(file, 'utf8'),
        (name, file) => {
            const options = config.options;
            const target = ts.resolveModuleName(name, file, options, ts.sys).resolvedModule?.resolvedFileName;
            return target !== undefined && target.startsWith(root) && !target.includes('/node_modules/')
                ? target
                : undefined;
        }
    );
    expect(failures).toEqual([]);
    expect(visited.some((file) => file.endsWith('/contracts/src/ui-module.ts'))).toBe(true);
    expect(visited.some((file) => file.includes('/runtime/') || file.includes('/extensions/'))).toBe(false);
});

it('detects aliased type-only/reexport cycles with exact source lines and accepts A -> C <- B', () => {
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
        fileExists: (file) => files.has(file),
        readFile: (file) => files.get(file),
        getCurrentDirectory: () => '/',
    };
    const run = () =>
        auditSources(
            '/a.ts',
            (file) => files.get(file) ?? '',
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
