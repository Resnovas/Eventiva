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
    type UiActionBinding,
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

/** Scoped module handle whose lazy operations recheck caller admission and become stale after replacement or disposal. */
export interface UiRegistration {
    readonly project: Effect.Effect<UiProjection, UiModuleFailure, Caller>;
    /** Execute a visible canonical node binding, never an action name or caller-supplied input. */
    readonly invoke: (node: string) => Effect.Effect<void, UiModuleFailure, Caller>;
    /** The target adapter mounts this within the active screen's Scope. */
    readonly mount: Effect.Effect<void, UiModuleFailure, Caller | Scope.Scope | UiScreenContext>;
}

/** Host-local registry service; tenant-scoped publication does not make serialized definitions executable. */
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

/** Expose only the bounded failure reason, not serialized input or private adapter details. */
const failure = (reason: UiModuleFailure['reason']) => new UiModuleFailure({ reason });
/** Identify the only node kinds permitted to carry canonical action bindings. */
const control = (node: UiNode): boolean => node.kind === 'action' || node.kind === 'menu';
/** Detach format-1 scalar input so adapter validation or dispatch cannot rewrite the canonical binding. */
const copyBinding = (binding: UiActionBinding): UiActionBinding => ({ ...binding, input: { ...binding.input } });
/** Copy every mutable node container before viewer policy receives it; config values are flat scalars. */
const copyNode = (node: UiNode): UiNode => ({
    ...node,
    component: { ...node.component },
    config: { ...node.config },
    children: [...node.children],
    ...(node.binding === undefined ? {} : { binding: copyBinding(node.binding) }),
});
/** Admission inspects a detached definition, never the registry's retained protection and identity floor. */
const copyDefinition = (definition: UiModuleDefinition): UiModuleDefinition => ({
    ...definition,
    messages: { ...definition.messages },
    nodes: definition.nodes.map(copyNode),
});
/** Trace lazy module operations and annotate typed failures without logging module payloads. */
const observe = <A, R>(
    effect: Effect.Effect<A, UiModuleFailure, R>,
    span: 'ui.module.project' | 'ui.module.invoke' | 'ui.module.mount'
) =>
    effect.pipe(
        Effect.tapError(
            /** Record a bounded reason while preserving the original failure channel. */ (error) =>
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
        Effect.gen(
            /** Allocate publication state inside this layer, sharing one serialization lock across invokes and replacement. */ function* () {
                // No registry state escapes across independent layer acquisitions.
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

                /** Require foundation and module flags on every projection, both with disabled fallback. */
                const enabled = (definition: UiModuleDefinition) =>
                    Effect.gen(
                        /** Evaluate both gates with their declared ownership rather than caching registration-time values. */ function* () {
                            // Foundation enablement alone cannot activate a module whose own owner has left its gate disabled.
                            const foundation = yield* flags.evaluate(declarativeUiFlag);
                            const module = yield* flags.evaluate({
                                key: definition.flag,
                                owner: definition.id,
                                description: 'Enable this admitted declarative module.',
                                safeDefault: false,
                            });
                            return foundation.value && module.value;
                        }
                    );

                /** Resolve caller-visible action metadata and validate the bound version and input before use. */
                const action = (node: UiNode) =>
                    Effect.gen(
                        /** Reject unknown or inaccessible inventory entries before delegating input validation to the platform. */ function* () {
                            // Inventory lookup is caller-scoped; a JSON binding is not authorization to execute it.
                            if (node.binding === undefined) return yield* failure('unbound-action');
                            const caller = yield* Caller;
                            const found = yield* inventory
                                .find(caller, node.binding.action)
                                .pipe(
                                    Effect.mapError(
                                        /** Hide inventory failure details behind the public denial reason. */ () =>
                                            failure('denied')
                                    )
                                );
                            if (Option.isNone(found)) return yield* failure('unknown-action');
                            if (found.value.version !== node.binding.version) return yield* failure('unknown-action');
                            yield* platform.checkInput(copyBinding(node.binding));
                            return found.value;
                        }
                    );

                /** Validate catalog, tree, message ownership and canonical bindings without publishing partial state. */
                const validate = (definition: UiModuleDefinition) =>
                    Effect.gen(
                        /** Enforce a bounded rooted tree and installed adapter schemas before registration becomes visible. */ function* () {
                            const keys = renderers.map(
                                /** Detect ambiguous identity/version pairs in the trusted catalog. */ (entry) =>
                                    `${entry.id}@${entry.version}`
                            );
                            if (new Set(keys).size !== keys.length) return yield* failure('invalid-config');
                            const nodes = new Map(
                                definition.nodes.map(
                                    /** Index identifiers so duplicate declarations cannot silently overwrite. */ (
                                        node
                                    ) => [node.id, node]
                                )
                            );
                            if (nodes.size !== definition.nodes.length) return yield* failure('invalid-definition');
                            if (nodes.get(definition.root)?.kind !== 'view')
                                return yield* failure('invalid-definition');
                            const messages = [definition.unavailable, definition.offline];
                            const reached = new Set<string>();
                            /** Reject missing, multiply reached or over-depth nodes; shared descendants are not a tree. */
                            const visit = (id: string, depth: number): boolean => {
                                // One global reached set catches cycles and multiple-parent aliases alike.
                                const node = nodes.get(id);
                                if (node === undefined || reached.has(id) || depth > 16) return false;
                                reached.add(id);
                                return node.children.every(
                                    /** Apply the same depth budget to every descendant edge. */ (child) =>
                                        visit(child, depth + 1)
                                );
                            };
                            if (!visit(definition.root, 0) || reached.size !== nodes.size) {
                                return yield* failure('invalid-definition');
                            }
                            for (const node of definition.nodes) {
                                messages.push(node.label);
                                if (node.terminology !== undefined) messages.push(node.terminology);
                                const renderer = renderers.find(
                                    /** Accept only the exact preinstalled adapter selected by the definition. */
                                    (entry) =>
                                        entry.id === node.component.id && entry.version === node.component.version
                                );
                                if (renderer === undefined || !renderer.kinds.includes(node.kind)) {
                                    return yield* failure('unknown-component');
                                }
                                yield* Schema.decodeUnknown(renderer.config)(node.config, {
                                    onExcessProperty: 'error'
                                }).pipe(
                                    Effect.mapError(
                                        /** Keep renderer schema diagnostics out of the public failure payload. */ () =>
                                            failure('invalid-config')
                                    )
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
                                    definition.nodes.some(
                                        /** Detect modules whose protected content must remain structurally visible. */ (
                                            entry
                                        ) => entry.protected
                                    ) &&
                                    definition.nodes.some(
                                        /** Reject author-controlled hiding anywhere in a protected module. */ (
                                            entry
                                        ) => !entry.project || entry.permission !== undefined
                                    )
                                ) {
                                    return yield* failure('protected-node');
                                }
                            }
                            if (
                                Object.keys(definition.messages).some(
                                    /** Prevent messages from claiming another module's namespace. */ (key) =>
                                        !key.startsWith(`${definition.id}.`)
                                ) ||
                                messages.some(
                                    /** Every referenced label and state message needs a nonblank owned default. */
                                    (key) => !key.startsWith(`${definition.id}.`) || !definition.messages[key]?.trim()
                                )
                            ) {
                                return yield* failure('invalid-definition');
                            }
                        }
                    );

                return DeclarativeRegistry.of({
                    modules: Effect.gen(
                        /** Discover current tenant entries that still pass admission after asynchronous checks. */ function* () {
                            const caller = yield* Caller;
                            const visible: Array<string> = [];
                            for (const [key, entry] of [...entries]) {
                                if (entry.tenant !== caller.tenant) continue;
                                // Discovery intentionally omits typed denials without exposing reasons.
                                if (yield* Effect.isSuccess(platform.admit(copyDefinition(entry.definition)))) {
                                    if (entries.get(key)?.token === entry.token) visible.push(entry.definition.id);
                                }
                            }
                            return visible.sort();
                        }
                    ),
                    /** Decode and validate JSON before atomically acquiring scoped publication ownership. */
                    register: (json, replace = false) =>
                        Effect.gen(
                            /** Build a lazy handle only after admission; invalid replacement attempts preserve the old publication. */ function* () {
                                // Bound untrusted text before decoding; neither error mapping nor telemetry echoes it.
                                if (json.length > 131072) return yield* failure('invalid-definition');
                                const definition = yield* decode(json, { onExcessProperty: 'error' }).pipe(
                                    Effect.mapError(
                                        /** Collapse malformed input diagnostics to the safe public reason. */ () =>
                                            failure('invalid-definition')
                                    )
                                );
                                // Adapter authority is evaluated live, but its writable arguments never own registry state.
                                yield* platform.admit(copyDefinition(definition));
                                yield* validate(definition);
                                const owner = yield* Caller;
                                const key = JSON.stringify([owner.tenant ?? null, definition.id]);
                                const token = Symbol();
                                const current = Effect.gen(
                                    /** Enforce tenant ownership and exact publication identity on each handle use. */ function* () {
                                        // A same-named replacement must invalidate every old handle, even within the same tenant.
                                        const caller = yield* Caller;
                                        if (caller.tenant !== owner.tenant) return yield* failure('denied');
                                        if (entries.get(key)?.token !== token) return yield* failure('stale');
                                    }
                                );
                                /** Preserve canonical protected defaults; localize only labels the module may customize. */
                                const message = (key: string, protectedLabel = false): string => {
                                    const defaultMessage = definition.messages[key] ?? '';
                                    return protectedLabel ? defaultMessage : i18n.format({ id: key, defaultMessage });
                                };
                                const project: UiRegistration['project'] = observe(
                                    Effect.gen(
                                        /** Produce fresh caller-masked data, with admission and identity checks before release. */ function* () {
                                            yield* current;
                                            yield* platform.admit(copyDefinition(definition));
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
                                                        state === 'offline'
                                                            ? definition.offline
                                                            : definition.unavailable
                                                    ),
                                                    nodes: [],
                                                } satisfies UiProjection;
                                            const nodes: Array<UiProjection['nodes'][number]> = [];
                                            /** Traverse visible descendants in definition order without exposing bindings or hidden child references. */
                                            const walk = (id: string): Effect.Effect<void, UiModuleFailure, Caller> =>
                                                Effect.gen(
                                                    /** Apply platform visibility and field masking under the current caller before appending a node. */ function* () {
                                                        // Skipping an ancestor prunes its subtree; protected modules refuse such suppression entirely.
                                                        const node = definition.nodes.find(
                                                            /** Resolve only validated definition ids. */ (entry) =>
                                                                entry.id === id
                                                        );
                                                        if (node === undefined)
                                                            return yield* failure('invalid-definition');
                                                        if (!node.project) return;
                                                        if (!(yield* platform.visible(definition.id, copyNode(node)))) {
                                                            if (
                                                                definition.nodes.some(
                                                                    /** Any protected node makes viewer suppression a module-level failure. */ (
                                                                        entry
                                                                    ) => entry.protected
                                                                )
                                                            )
                                                                return yield* failure('protected-node');
                                                            return;
                                                        }
                                                        const metadata = control(node)
                                                            ? yield* action(node)
                                                            : undefined;
                                                        const value =
                                                            node.field === undefined
                                                                ? undefined
                                                                : yield* platform.value(definition.id, node.field);
                                                        nodes.push({
                                                            id: node.id,
                                                            kind: node.kind,
                                                            component: { ...node.component },
                                                            label: message(
                                                                node.protected
                                                                    ? node.label
                                                                    : (node.terminology ?? node.label),
                                                                node.protected
                                                            ),
                                                            config: { ...node.config },
                                                            children: node.children,
                                                            ...(node.terminology === undefined
                                                                ? {}
                                                                : { terminology: node.terminology }),
                                                            ...(metadata === undefined
                                                                ? {}
                                                                : {
                                                                      action: {
                                                                          id: metadata.id,
                                                                          version: metadata.version
                                                                      }
                                                                  }),
                                                            ...(value === undefined ? {} : { value }),
                                                        });
                                                        for (const child of node.children) yield* walk(child);
                                                    }
                                                );
                                            yield* walk(definition.root);
                                            yield* current;
                                            yield* platform.admit(copyDefinition(definition));
                                            // Remove even references to nodes suppressed by viewer policy.
                                            const visible = new Set(
                                                nodes.map(
                                                    /** Build the allow-set from nodes actually released to this viewer. */ (
                                                        node
                                                    ) => node.id
                                                )
                                            );
                                            return yield* Schema.decode(UiProjection)({
                                                format: 1,
                                                module: definition.id,
                                                version: definition.version,
                                                state,
                                                message: message(definition.unavailable),
                                                nodes: nodes.map(
                                                    /** Preserve masked node data while removing references to suppressed children. */ (
                                                        node
                                                    ) => ({
                                                        ...node,
                                                        children: node.children.filter(
                                                            /** Retain only references resolvable in the released projection. */ (
                                                                id
                                                            ) => visible.has(id)
                                                        ),
                                                    })
                                                ),
                                            }).pipe(
                                                Effect.mapError(
                                                    /** Reject invalid adapter output rather than releasing malformed masked data. */ () =>
                                                        failure('invalid-projection')
                                                )
                                            );
                                        }
                                    ),
                                    'ui.module.project'
                                );
                                const registration: UiRegistration = {
                                    project,
                                    /** Serialize a fresh projection and canonical dispatch against publication replacement. */
                                    invoke: (id) =>
                                        observe(
                                            mutex.withPermits(1)(
                                                Effect.gen(
                                                    /** Resolve a visible control node, revalidate its binding, then delegate authorization to platform invocation. */ function* () {
                                                        // The projection is not an executable command: use only the binding retained in the definition.
                                                        const projection = yield* project;
                                                        if (projection.state !== 'available')
                                                            return yield* failure(projection.state);
                                                        const visible = projection.nodes.find(
                                                            /** A matching action name is insufficient; the requested node itself must be visible and interactive. */
                                                            (node) => node.id === id && node.action !== undefined
                                                        );
                                                        const node = definition.nodes.find(
                                                            /** Recover canonical input from the admitted definition, never projected/client input. */ (
                                                                node
                                                            ) => node.id === id
                                                        );
                                                        if (visible === undefined || node?.binding === undefined)
                                                            return yield* failure('unbound-action');
                                                        yield* action(node);
                                                        yield* platform.invoke(copyBinding(node.binding));
                                                    }
                                                )
                                            ),
                                            'ui.module.invoke'
                                        ),
                                    mount: observe(
                                        Effect.gen(
                                            /** Validate an initial projection and hand lazy capabilities to the host-owned screen scope. */ function* () {
                                                // Validate now, but give the screen service only fresh lazy reads.
                                                yield* project;
                                                const screens = yield* UiScreenContext;
                                                yield* screens.mount({
                                                    read: project,
                                                    /** Forward canonical node ids through the same revalidating registration path. */ invoke: (
                                                        id
                                                    ) => registration.invoke(id)
                                                });
                                                yield* Effect.addFinalizer(
                                                    /** Record scope release without retaining projection data or performing screen disposal twice. */ () =>
                                                        Effect.withSpan(Effect.void, 'ui.module.unmount')
                                                );
                                            }
                                        ),
                                        'ui.module.mount'
                                    ),
                                };
                                yield* Effect.acquireRelease(
                                    mutex.withPermits(1)(
                                        Effect.gen(
                                            /** Atomically reject duplicates/protected replacements or install this publication token. */ function* () {
                                                // Publication and invocation share the lock so an admitted invocation finishes before replacement.
                                                const previous = entries.get(key);
                                                if (previous !== undefined && !replace)
                                                    return yield* failure('duplicate');
                                                if (
                                                    previous?.definition.nodes.some(
                                                        /** Protected content cannot be replaced, even by an otherwise valid definition. */ (
                                                            node
                                                        ) => node.protected
                                                    )
                                                ) {
                                                    return yield* failure('protected-node');
                                                }
                                                entries.set(key, { token, definition, tenant: owner.tenant });
                                            }
                                        )
                                    ),
                                    /** Dispose only the publication acquired by this scope, not a later replacement. */
                                    () =>
                                        mutex.withPermits(1)(
                                            Effect.sync(
                                                /** A stale scope cannot unregister a newer publication with the same tenant/module key. */ () => {
                                                    // Keys are reusable; only this scope's unique publication token proves disposal ownership.
                                                    if (entries.get(key)?.token === token) entries.delete(key);
                                                }
                                            )
                                        )
                                );
                                return registration;
                            }
                        ),
                });
            }
        )
    );
