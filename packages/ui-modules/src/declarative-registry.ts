/**
 * @file packages/ui-modules/src/declarative-registry.ts
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
import { Flags, type Flag } from '@eventiva/contracts/flags';
import { I18n } from '@eventiva/contracts/i18n';
import { ActionInventory } from '@eventiva/contracts/inventory';
import {
    UiModuleDefinition,
    UiModuleFailure,
    UiPlatform,
    UiProjection,
    UiScreenContext,
    type UiNode,
} from '@eventiva/contracts/ui-module';
import { Context, Effect, Layer, Option, Schema, type Scope } from 'effect';
import type { UiRenderer } from './DeclarativeModule.tsx';

export const declarativeUiFlag: Flag = {
    key: 'client.declarative-ui.enabled',
    owner: 'platform',
    description: 'Allow admitted data-only UI modules.',
    safeDefault: false,
};

export interface UiRegistration {
    readonly project: Effect.Effect<UiProjection, UiModuleFailure, Caller>;
    readonly invoke: (node: string) => Effect.Effect<void, UiModuleFailure, Caller>;
    /** The target adapter mounts this within the active screen's Scope. */
    readonly mount: Effect.Effect<void, UiModuleFailure, Caller | Scope.Scope | UiScreenContext>;
}

export class DeclarativeRegistry extends Context.Tag('@eventiva/client/DeclarativeRegistry')<
    DeclarativeRegistry,
    {
        /** JSON text only. Replacement is explicit and never inferred from order. */
        readonly register: (
            json: string,
            replace?: boolean
        ) => Effect.Effect<UiRegistration, UiModuleFailure, Caller | Scope.Scope>;
        readonly modules: Effect.Effect<ReadonlyArray<string>, never, Caller>;
    }
>() {}

const failure = (reason: UiModuleFailure['reason']) => new UiModuleFailure({ reason });
const control = (node: UiNode): boolean => node.kind === 'action' || node.kind === 'menu';
const observe = <A, R>(
    effect: Effect.Effect<A, UiModuleFailure, R>,
    span: 'ui.module.project' | 'ui.module.invoke' | 'ui.module.mount'
) =>
    effect.pipe(
        Effect.tapError((error) =>
            Effect.logWarning('ui.module.failed').pipe(Effect.annotateLogs('ui.failure.reason', error.reason))
        ),
        Effect.withSpan(span)
    );

/**
 * Only lower-level contracts are imported. No kernel/runtime/feature reverse
 * edge, no global registry, no route/listener side effects. A single scoped
 * publication owns the complete view/menu/slot/projection graph.
 */
export const declarativeRegistry = (
    renderers: ReadonlyArray<UiRenderer>
): Layer.Layer<DeclarativeRegistry, never, UiPlatform | Flags | I18n | ActionInventory> =>
    Layer.effect(
        DeclarativeRegistry,
        Effect.gen(function* () {
            const platform = yield* UiPlatform;
            const flags = yield* Flags;
            const i18n = yield* I18n;
            const inventory = yield* ActionInventory;
            const mutex = yield* Effect.makeSemaphore(1);
            const entries = new Map<
                string,
                {
                    readonly token: symbol;
                    readonly definition: UiModuleDefinition;
                    readonly tenant: CallerIdentity['tenant'];
                }
            >();
            const decode = Schema.decodeUnknown(Schema.parseJson(UiModuleDefinition));

            const enabled = (definition: UiModuleDefinition) =>
                Effect.gen(function* () {
                    const foundation = yield* flags.evaluate(declarativeUiFlag);
                    const module = yield* flags.evaluate({
                        key: definition.flag,
                        owner: definition.id,
                        description: 'Enable this admitted declarative module.',
                        safeDefault: false,
                    });
                    return foundation.value && module.value;
                });

            const action = (node: UiNode) =>
                Effect.gen(function* () {
                    if (node.binding === undefined) return yield* failure('unbound-action');
                    const caller = yield* Caller;
                    const found = yield* inventory
                        .find(caller, node.binding.action)
                        .pipe(Effect.mapError(() => failure('denied')));
                    if (Option.isNone(found)) return yield* failure('unknown-action');
                    if (found.value.version !== node.binding.version) return yield* failure('unknown-action');
                    yield* platform.checkInput(node.binding);
                    return found.value;
                });

            const validate = (definition: UiModuleDefinition) =>
                Effect.gen(function* () {
                    const keys = renderers.map((entry) => `${entry.id}@${entry.version}`);
                    if (new Set(keys).size !== keys.length) return yield* failure('invalid-config');
                    const nodes = new Map(definition.nodes.map((node) => [node.id, node]));
                    if (nodes.size !== definition.nodes.length) return yield* failure('invalid-definition');
                    if (nodes.get(definition.root)?.kind !== 'view') return yield* failure('invalid-definition');
                    const messages = [definition.unavailable, definition.offline];
                    const reached = new Set<string>();
                    const visit = (id: string, depth: number): boolean => {
                        const node = nodes.get(id);
                        if (node === undefined || reached.has(id) || depth > 16) return false;
                        reached.add(id);
                        return node.children.every((child) => visit(child, depth + 1));
                    };
                    if (!visit(definition.root, 0) || reached.size !== nodes.size) {
                        return yield* failure('invalid-definition');
                    }
                    for (const node of definition.nodes) {
                        messages.push(node.label);
                        if (node.terminology !== undefined) messages.push(node.terminology);
                        const renderer = renderers.find(
                            (entry) => entry.id === node.component.id && entry.version === node.component.version
                        );
                        if (renderer === undefined || !renderer.kinds.includes(node.kind)) {
                            return yield* failure('unknown-component');
                        }
                        yield* Schema.decodeUnknown(renderer.config)(node.config, { onExcessProperty: 'error' }).pipe(
                            Effect.mapError(() => failure('invalid-config'))
                        );
                        if (node.kind === 'field' ? node.field === undefined : node.field !== undefined) {
                            return yield* failure('invalid-definition');
                        }
                        const container = ['view', 'layout', 'slot'].includes(node.kind);
                        if (
                            (!container && node.children.length > 0) ||
                            (node.kind === 'view' && node.id !== definition.root)
                        ) {
                            return yield* failure('invalid-definition');
                        }
                        if (control(node)) yield* action(node);
                        else if (node.binding !== undefined) return yield* failure('invalid-definition');
                        // A hidden ancestor would also remove a protected descendant.
                        if (
                            definition.nodes.some((entry) => entry.protected) &&
                            definition.nodes.some((entry) => !entry.project || entry.permission !== undefined)
                        ) {
                            return yield* failure('protected-node');
                        }
                    }
                    if (
                        Object.keys(definition.messages).some((key) => !key.startsWith(`${definition.id}.`)) ||
                        messages.some(
                            (key) => !key.startsWith(`${definition.id}.`) || !definition.messages[key]?.trim()
                        )
                    ) {
                        return yield* failure('invalid-definition');
                    }
                });

            return DeclarativeRegistry.of({
                modules: Effect.gen(function* () {
                    const caller = yield* Caller;
                    const visible: Array<string> = [];
                    for (const [key, entry] of [...entries]) {
                        if (entry.tenant !== caller.tenant) continue;
                        // Discovery intentionally omits typed denials without exposing reasons.
                        if (yield* Effect.isSuccess(platform.admit(entry.definition))) {
                            if (entries.get(key)?.token === entry.token) visible.push(entry.definition.id);
                        }
                    }
                    return visible.sort();
                }),
                register: (json, replace = false) =>
                    Effect.gen(function* () {
                        if (json.length > 131072) return yield* failure('invalid-definition');
                        const definition = yield* decode(json, { onExcessProperty: 'error' }).pipe(
                            Effect.mapError(() => failure('invalid-definition'))
                        );
                        yield* platform.admit(definition);
                        yield* validate(definition);
                        const owner = yield* Caller;
                        const key = JSON.stringify([owner.tenant ?? null, definition.id]);
                        const token = Symbol();
                        const current = Effect.gen(function* () {
                            const caller = yield* Caller;
                            if (caller.tenant !== owner.tenant) return yield* failure('denied');
                            if (entries.get(key)?.token !== token) return yield* failure('stale');
                        });
                        const message = (key: string, protectedLabel = false): string => {
                            const defaultMessage = definition.messages[key] ?? '';
                            return protectedLabel ? defaultMessage : i18n.format({ id: key, defaultMessage });
                        };
                        const project: UiRegistration['project'] = observe(
                            Effect.gen(function* () {
                                yield* current;
                                yield* platform.admit(definition);
                                const online = yield* platform.online;
                                const active = yield* enabled(definition);
                                const state: UiProjection['state'] = !active
                                    ? 'unavailable'
                                    : !online
                                      ? 'offline'
                                      : 'available';
                                if (state !== 'available')
                                    return {
                                        format: 1,
                                        module: definition.id,
                                        version: definition.version,
                                        state,
                                        message: message(
                                            state === 'offline' ? definition.offline : definition.unavailable
                                        ),
                                        nodes: [],
                                    } satisfies UiProjection;
                                const nodes: Array<UiProjection['nodes'][number]> = [];
                                const walk = (id: string): Effect.Effect<void, UiModuleFailure, Caller> =>
                                    Effect.gen(function* () {
                                        const node = definition.nodes.find((entry) => entry.id === id);
                                        if (node === undefined) return yield* failure('invalid-definition');
                                        if (!node.project) return;
                                        if (!(yield* platform.visible(definition.id, node))) {
                                            if (definition.nodes.some((entry) => entry.protected))
                                                return yield* failure('protected-node');
                                            return;
                                        }
                                        const metadata = control(node) ? yield* action(node) : undefined;
                                        const value =
                                            node.field === undefined
                                                ? undefined
                                                : yield* platform.value(definition.id, node.field);
                                        nodes.push({
                                            id: node.id,
                                            kind: node.kind,
                                            component: { ...node.component },
                                            label: message(
                                                node.protected ? node.label : (node.terminology ?? node.label),
                                                node.protected
                                            ),
                                            config: { ...node.config },
                                            children: node.children,
                                            ...(node.terminology === undefined
                                                ? {}
                                                : { terminology: node.terminology }),
                                            ...(metadata === undefined
                                                ? {}
                                                : { action: { id: metadata.id, version: metadata.version } }),
                                            ...(value === undefined ? {} : { value }),
                                        });
                                        for (const child of node.children) yield* walk(child);
                                    });
                                yield* walk(definition.root);
                                yield* current;
                                yield* platform.admit(definition);
                                // Remove even references to nodes suppressed by viewer policy.
                                const visible = new Set(nodes.map((node) => node.id));
                                return yield* Schema.decode(UiProjection)({
                                    format: 1,
                                    module: definition.id,
                                    version: definition.version,
                                    state,
                                    message: message(definition.unavailable),
                                    nodes: nodes.map((node) => ({
                                        ...node,
                                        children: node.children.filter((id) => visible.has(id)),
                                    })),
                                }).pipe(Effect.mapError(() => failure('invalid-projection')));
                            }),
                            'ui.module.project'
                        );
                        const registration: UiRegistration = {
                            project,
                            invoke: (id) =>
                                observe(
                                    mutex.withPermits(1)(
                                        Effect.gen(function* () {
                                            const projection = yield* project;
                                            if (projection.state !== 'available')
                                                return yield* failure(projection.state);
                                            const visible = projection.nodes.find(
                                                (node) => node.id === id && node.action !== undefined
                                            );
                                            const node = definition.nodes.find((node) => node.id === id);
                                            if (visible === undefined || node?.binding === undefined)
                                                return yield* failure('unbound-action');
                                            yield* action(node);
                                            yield* platform.invoke(node.binding);
                                        })
                                    ),
                                    'ui.module.invoke'
                                ),
                            mount: observe(
                                Effect.gen(function* () {
                                    // Validate now, but give the screen service only fresh lazy reads.
                                    yield* project;
                                    const screens = yield* UiScreenContext;
                                    yield* screens.mount({ read: project, invoke: (id) => registration.invoke(id) });
                                    yield* Effect.addFinalizer(() => Effect.withSpan(Effect.void, 'ui.module.unmount'));
                                }),
                                'ui.module.mount'
                            ),
                        };
                        yield* Effect.acquireRelease(
                            mutex.withPermits(1)(
                                Effect.gen(function* () {
                                    const previous = entries.get(key);
                                    if (previous !== undefined && !replace) return yield* failure('duplicate');
                                    if (previous?.definition.nodes.some((node) => node.protected)) {
                                        return yield* failure('protected-node');
                                    }
                                    entries.set(key, { token, definition, tenant: owner.tenant });
                                })
                            ),
                            () =>
                                mutex.withPermits(1)(
                                    Effect.sync(() => {
                                        if (entries.get(key)?.token === token) entries.delete(key);
                                    })
                                )
                        );
                        return registration;
                    }),
            });
        })
    );
