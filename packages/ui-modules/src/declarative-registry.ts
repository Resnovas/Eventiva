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

/**
 * Foundation gate for declarative UI; it defaults off, so no admitted module projects until the platform owner enables it.
 *
 * @since 0.0.1
 * @example
 * const foundation = yield* flags.evaluate(declarativeUiFlag);
 */
export const declarativeUiFlag: Flag = {
    key: 'client.declarative-ui.enabled',
    owner: 'platform',
    description: 'Allow admitted data-only UI modules.',
    safeDefault: false,
};

/**
 * Scoped module handle whose lazy operations recheck caller admission and become stale after replacement or disposal.
 *
 * @since 0.0.1
 * @example
 * const projection = yield* registration.project.pipe(Effect.provideService(Caller, caller));
 */
export interface UiRegistration {
    readonly project: Effect.Effect<UiProjection, UiModuleFailure, Caller>;
    /** Execute a visible canonical node binding, never an action name or caller-supplied input. */
    readonly invoke: (node: string) => Effect.Effect<void, UiModuleFailure, Caller>;
    /** The target adapter mounts this within the active screen's Scope. */
    readonly mount: Effect.Effect<void, UiModuleFailure, Caller | Scope.Scope | UiScreenContext>;
}

/**
 * Host-local registry service; tenant-scoped publication does not make serialized definitions executable.
 *
 * @since 0.0.1
 * @example
 * const registration = yield* (yield* DeclarativeRegistry).register(json);
 */
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

/**
 * Expose only the bounded failure reason, not serialized input or private adapter details.
 *
 * @param reason - Bounded public reason code for the refusal.
 * @returns A typed module failure carrying only that reason.
 */
const failure = (reason: UiModuleFailure['reason']) => new UiModuleFailure({ reason });
/**
 * Identify the only node kinds permitted to carry canonical action bindings.
 *
 * @param node - Definition node to classify.
 * @returns Whether the node is an `action` or `menu` control.
 */
const control = (node: UiNode): boolean => node.kind === 'action' || node.kind === 'menu';
/**
 * Detach format-1 scalar input so adapter validation or dispatch cannot rewrite the canonical binding.
 *
 * @param binding - Canonical binding retained by the registry.
 * @returns A shallow copy whose input record is also copied.
 */
const copyBinding = (binding: UiActionBinding): UiActionBinding => ({ ...binding, input: { ...binding.input } });
/**
 * Copy every mutable node container before viewer policy receives it; config values are flat scalars.
 *
 * @param node - Retained definition node.
 * @returns A detached node with copied component, config, children and binding.
 */
const copyNode = (node: UiNode): UiNode => ({
    ...node,
    component: { ...node.component },
    config: { ...node.config },
    children: [...node.children],
    ...(node.binding === undefined ? {} : { binding: copyBinding(node.binding) }),
});
/**
 * Admission inspects a detached definition, never the registry's retained protection and identity floor.
 *
 * @param definition - Retained module definition.
 * @returns A detached definition with copied messages and nodes.
 */
const copyDefinition = (definition: UiModuleDefinition): UiModuleDefinition => ({
    ...definition,
    messages: { ...definition.messages },
    nodes: definition.nodes.map(copyNode),
});
/**
 * Trace lazy module operations and annotate typed failures without logging module payloads.
 *
 * @template A - Success value of the traced operation.
 * @template R - Services the traced operation requires.
 * @param effect - Module operation to trace.
 * @param span - Span name identifying the project, invoke or mount operation.
 * @returns The same effect wrapped in a span, logging the failure reason before re-failing.
 */
const observe = <A, R>(
    effect: Effect.Effect<A, UiModuleFailure, R>,
    span: 'ui.module.project' | 'ui.module.invoke' | 'ui.module.mount'
) =>
    effect.pipe(
        Effect.tapError(
            /**
             * Record a bounded reason while preserving the original failure channel.
             *
             * @param error - Typed module failure raised by the traced operation.
             * @returns A warning log effect annotated with the failure reason.
             */
            (error) =>
                Effect.logWarning('ui.module.failed').pipe(Effect.annotateLogs('ui.failure.reason', error.reason))
        ),
        Effect.withSpan(span)
    );

/**
 * Only lower-level contracts are imported. No kernel/runtime/feature reverse
 * edge, no global registry, no route/listener side effects. A single scoped
 * publication owns the complete view/menu/slot/projection graph.
 *
 * @param renderers - Trusted preinstalled adapters that definitions may select by exact id and version.
 * @returns A layer providing a fresh registry whose publications are owned by their registering scopes.
 * @since 0.0.1
 * @example
 * const RegistryLive = declarativeRegistry([textRenderer, actionRenderer]);
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

                /**
                 * Require foundation and module flags on every projection, both with disabled fallback.
                 *
                 * @param definition - Admitted definition whose own flag is evaluated next to the foundation flag.
                 * @returns An effect yielding true only when both flags are on.
                 */
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

                /**
                 * Resolve caller-visible action metadata and validate the bound version and input before use.
                 *
                 * @param node - Control node whose binding is resolved.
                 * @returns An effect yielding the inventory entry for the bound action.
                 * @fails {UiModuleFailure} When the node is unbound, the action is unknown, inaccessible or of another version, or its input is rejected.
                 */
                const action = (node: UiNode) =>
                    Effect.gen(
                        /** Reject unknown or inaccessible inventory entries before delegating input validation to the platform. */ function* () {
                            // Inventory lookup is caller-scoped; a JSON binding is not authorization to execute it.
                            if (node.binding === undefined) return yield* failure('unbound-action');
                            const caller = yield* Caller;
                            const found = yield* inventory.find(caller, node.binding.action).pipe(
                                Effect.mapError(
                                    /**
                                     * Hide inventory failure details behind the public denial reason.
                                     *
                                     * @returns A `denied` module failure.
                                     */
                                    () => failure('denied')
                                )
                            );
                            if (Option.isNone(found)) return yield* failure('unknown-action');
                            if (found.value.version !== node.binding.version) return yield* failure('unknown-action');
                            yield* platform.checkInput(copyBinding(node.binding));
                            return found.value;
                        }
                    );

                /**
                 * Validate catalog, tree, message ownership and canonical bindings without publishing partial state.
                 *
                 * @param definition - Decoded definition to check before registration.
                 * @returns An effect that succeeds with no value when the definition is valid.
                 * @fails {UiModuleFailure} When the catalog, tree, adapters, configs, bindings, protection or messages are invalid.
                 */
                const validate = (definition: UiModuleDefinition) =>
                    Effect.gen(
                        /** Enforce a bounded rooted tree and installed adapter schemas before registration becomes visible. */ function* () {
                            const keys = renderers.map(
                                /**
                                 * Detect ambiguous identity/version pairs in the trusted catalog.
                                 *
                                 * @param entry - Installed adapter in the catalog.
                                 * @returns The adapter's `id@version` key.
                                 */
                                (entry) => `${entry.id}@${entry.version}`
                            );
                            if (new Set(keys).size !== keys.length) return yield* failure('invalid-config');
                            const nodes = new Map(
                                definition.nodes.map(
                                    /**
                                     * Index identifiers so duplicate declarations cannot silently overwrite.
                                     *
                                     * @param node - Declared node to index.
                                     * @returns The node paired with its id for the lookup map.
                                     */
                                    (node) => [node.id, node]
                                )
                            );
                            if (nodes.size !== definition.nodes.length) return yield* failure('invalid-definition');
                            if (nodes.get(definition.root)?.kind !== 'view')
                                return yield* failure('invalid-definition');
                            const messages = [definition.unavailable, definition.offline];
                            const reached = new Set<string>();
                            /**
                             * Reject missing, multiply reached or over-depth nodes; shared descendants are not a tree.
                             *
                             * @param id - Node id reached from the root or a parent.
                             * @param depth - Distance from the root; nodes deeper than 16 are rejected.
                             * @returns Whether this node and all its descendants form a valid subtree.
                             */
                            const visit = (id: string, depth: number): boolean => {
                                // One global reached set catches cycles and multiple-parent aliases alike.
                                const node = nodes.get(id);
                                if (node === undefined || reached.has(id) || depth > 16) return false;
                                reached.add(id);
                                return node.children.every(
                                    /**
                                     * Apply the same depth budget to every descendant edge.
                                     *
                                     * @param child - Child id referenced by the current node.
                                     * @returns Whether the child's subtree is valid one level deeper.
                                     */
                                    (child) => visit(child, depth + 1)
                                );
                            };
                            if (!visit(definition.root, 0) || reached.size !== nodes.size) {
                                return yield* failure('invalid-definition');
                            }
                            for (const node of definition.nodes) {
                                messages.push(node.label);
                                if (node.terminology !== undefined) messages.push(node.terminology);
                                const renderer = renderers.find(
                                    /**
                                     * Accept only the exact preinstalled adapter selected by the definition.
                                     *
                                     * @param entry - Installed adapter being considered for the node.
                                     * @returns Whether the adapter's id and version both equal the node's component reference.
                                     */
                                    (entry) =>
                                        entry.id === node.component.id && entry.version === node.component.version
                                );
                                if (renderer === undefined || !renderer.kinds.includes(node.kind)) {
                                    return yield* failure('unknown-component');
                                }
                                yield* Schema.decodeUnknown(renderer.config)(node.config, {
                                    onExcessProperty: 'error',
                                }).pipe(
                                    Effect.mapError(
                                        /**
                                         * Keep renderer schema diagnostics out of the public failure payload.
                                         *
                                         * @returns An `invalid-config` module failure.
                                         */
                                        () => failure('invalid-config')
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
                                        /**
                                         * Detect modules whose protected content must remain structurally visible.
                                         *
                                         * @param entry - Node in the definition.
                                         * @returns Whether the node is protected.
                                         */
                                        (entry) => entry.protected
                                    ) &&
                                    definition.nodes.some(
                                        /**
                                         * Reject author-controlled hiding anywhere in a protected module.
                                         *
                                         * @param entry - Node in the definition.
                                         * @returns Whether the node is excluded from projection or gated by a declared permission.
                                         */
                                        (entry) => !entry.project || entry.permission !== undefined
                                    )
                                ) {
                                    return yield* failure('protected-node');
                                }
                            }
                            if (
                                Object.keys(definition.messages).some(
                                    /**
                                     * Prevent messages from claiming another module's namespace.
                                     *
                                     * @param key - Message id declared by the definition.
                                     * @returns Whether the id falls outside the module's own prefix.
                                     */
                                    (key) => !key.startsWith(`${definition.id}.`)
                                ) ||
                                messages.some(
                                    /**
                                     * Every referenced label and state message needs a nonblank owned default.
                                     *
                                     * @param key - Message id referenced by a node or state.
                                     * @returns Whether the id is foreign or lacks a nonblank default.
                                     */
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
                    /**
                     * Decode and validate JSON before atomically acquiring scoped publication ownership.
                     *
                     * @param json - Untrusted definition text, at most 131072 characters.
                     * @param replace - Whether an existing unprotected publication with the same tenant and id may be replaced; defaults to false.
                     * @returns A scoped effect yielding the registration handle.
                     * @fails {UiModuleFailure} When decoding, admission or validation fails, the module is a duplicate, or a protected publication would be replaced.
                     */
                    register: (json, replace = false) =>
                        Effect.gen(
                            /** Build a lazy handle only after admission; invalid replacement attempts preserve the old publication. */ function* () {
                                // Bound untrusted text before decoding; neither error mapping nor telemetry echoes it.
                                if (json.length > 131072) return yield* failure('invalid-definition');
                                const definition = yield* decode(json, { onExcessProperty: 'error' }).pipe(
                                    Effect.mapError(
                                        /**
                                         * Collapse malformed input diagnostics to the safe public reason.
                                         *
                                         * @returns An `invalid-definition` module failure.
                                         */
                                        () => failure('invalid-definition')
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
                                /**
                                 * Preserve canonical protected defaults; localize only labels the module may customize.
                                 *
                                 * @param key - Message id owned by the module.
                                 * @param protectedLabel - Whether to return the canonical default without localization; defaults to false.
                                 * @returns The localized message, or the declared default for protected labels.
                                 */
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
                                            /**
                                             * Traverse visible descendants in definition order without exposing bindings or hidden child references.
                                             *
                                             * @param id - Node id to release, starting from the root.
                                             * @returns An effect that appends the visible node and its visible descendants to the projection.
                                             * @fails {UiModuleFailure} When the node is missing, a protected module would be suppressed, or action, visibility or value checks fail.
                                             */
                                            const walk = (id: string): Effect.Effect<void, UiModuleFailure, Caller> =>
                                                Effect.gen(
                                                    /** Apply platform visibility and field masking under the current caller before appending a node. */ function* () {
                                                        // Skipping an ancestor prunes its subtree; protected modules refuse such suppression entirely.
                                                        const node = definition.nodes.find(
                                                            /**
                                                             * Resolve only validated definition ids.
                                                             *
                                                             * @param entry - Definition node being matched.
                                                             * @returns Whether the node has the requested id.
                                                             */
                                                            (entry) => entry.id === id
                                                        );
                                                        if (node === undefined)
                                                            return yield* failure('invalid-definition');
                                                        if (!node.project) return;
                                                        if (!(yield* platform.visible(definition.id, copyNode(node)))) {
                                                            if (
                                                                definition.nodes.some(
                                                                    /**
                                                                     * Any protected node makes viewer suppression a module-level failure.
                                                                     *
                                                                     * @param entry - Node in the definition.
                                                                     * @returns Whether the node is protected.
                                                                     */
                                                                    (entry) => entry.protected
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
                                                                          version: metadata.version,
                                                                      },
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
                                                    /**
                                                     * Build the allow-set from nodes actually released to this viewer.
                                                     *
                                                     * @param node - Released projection node.
                                                     * @returns The node's id.
                                                     */
                                                    (node) => node.id
                                                )
                                            );
                                            return yield* Schema.decode(UiProjection)({
                                                format: 1,
                                                module: definition.id,
                                                version: definition.version,
                                                state,
                                                message: message(definition.unavailable),
                                                nodes: nodes.map(
                                                    /**
                                                     * Preserve masked node data while removing references to suppressed children.
                                                     *
                                                     * @param node - Released projection node.
                                                     * @returns The node with only released child ids.
                                                     */
                                                    (node) => ({
                                                        ...node,
                                                        children: node.children.filter(
                                                            /**
                                                             * Retain only references resolvable in the released projection.
                                                             *
                                                             * @param id - Child id referenced by the node.
                                                             * @returns Whether the child was released to this viewer.
                                                             */
                                                            (id) => visible.has(id)
                                                        ),
                                                    })
                                                ),
                                            }).pipe(
                                                Effect.mapError(
                                                    /**
                                                     * Reject invalid adapter output rather than releasing malformed masked data.
                                                     *
                                                     * @returns An `invalid-projection` module failure.
                                                     */
                                                    () => failure('invalid-projection')
                                                )
                                            );
                                        }
                                    ),
                                    'ui.module.project'
                                );
                                const registration: UiRegistration = {
                                    project,
                                    /**
                                     * Serialize a fresh projection and canonical dispatch against publication replacement.
                                     *
                                     * @param id - Canonical node id of a visible control.
                                     * @returns A traced effect that dispatches the node's retained binding through the platform.
                                     * @fails {UiModuleFailure} When the projection is unavailable, the node is not a visible bound control, or the platform refuses the action.
                                     */
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
                                                            /**
                                                             * A matching action name is insufficient; the requested node itself must be visible and interactive.
                                                             *
                                                             * @param node - Released projection node.
                                                             * @returns Whether it is the requested node and carries action metadata.
                                                             */
                                                            (node) => node.id === id && node.action !== undefined
                                                        );
                                                        const node = definition.nodes.find(
                                                            /**
                                                             * Recover canonical input from the admitted definition, never projected/client input.
                                                             *
                                                             * @param node - Admitted definition node.
                                                             * @returns Whether it is the requested node.
                                                             */
                                                            (node) => node.id === id
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
                                                    /**
                                                     * Forward canonical node ids through the same revalidating registration path.
                                                     *
                                                     * @param id - Canonical node id requested by the screen.
                                                     * @returns The registration's revalidating invoke effect.
                                                     */
                                                    invoke: (id) => registration.invoke(id),
                                                });
                                                yield* Effect.addFinalizer(
                                                    /**
                                                     * Record scope release without retaining projection data or performing screen disposal twice.
                                                     *
                                                     * @returns An empty effect traced as `ui.module.unmount`.
                                                     */
                                                    () => Effect.withSpan(Effect.void, 'ui.module.unmount')
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
                                                        /**
                                                         * Protected content cannot be replaced, even by an otherwise valid definition.
                                                         *
                                                         * @param node - Node of the existing publication.
                                                         * @returns Whether the node is protected.
                                                         */
                                                        (node) => node.protected
                                                    )
                                                ) {
                                                    return yield* failure('protected-node');
                                                }
                                                entries.set(key, { token, definition, tenant: owner.tenant });
                                            }
                                        )
                                    ),
                                    /**
                                     * Dispose only the publication acquired by this scope, not a later replacement.
                                     *
                                     * @returns An effect that removes the entry under the lock when this scope still owns it.
                                     */
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
