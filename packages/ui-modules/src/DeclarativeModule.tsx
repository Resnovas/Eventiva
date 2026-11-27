/**
 * @file packages/ui-modules/src/DeclarativeModule.tsx
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

import type { Caller } from '@eventiva/contracts/caller';
import type { UiConfig, UiModuleFailure, UiNode, UiProjection } from '@eventiva/contracts/ui-module';
import type { Effect, Schema } from 'effect';
import { createElement, type ComponentType, type ReactNode } from 'react';

/**
 * Trusted, preinstalled adapter only. No component implementation arrives in JSON.
 *
 * @since 0.0.1
 * @example
 * const text: UiRenderer = { id: 'text', version: '1.0.0', kinds: ['text'], config: TextConfig, component: TextView };
 */
export interface UiRenderer {
    readonly id: string;
    readonly version: string;
    readonly kinds: ReadonlyArray<UiNode['kind']>;
    readonly config: Schema.Schema<UiConfig>;
    readonly component: ComponentType<UiRendererProps>;
}

/**
 * Masked node data and lazy action capability supplied to an installed adapter; children are already interpreted.
 *
 * @since 0.0.1
 * @example
 * const TextView = ({ node, children }: UiRendererProps) => createElement(Text, null, node.id, children);
 */
export interface UiRendererProps {
    readonly node: UiProjection['nodes'][number];
    readonly children: ReactNode;
    /** A trusted target adapter runs this in the authenticated caller runtime. */
    readonly action: Effect.Effect<void, UiModuleFailure, Caller>;
}

/**
 * Stateless interpreter, not a component library. The app owns refresh,
 * authenticated Effect execution, accessible unavailable/error components and
 * mount/error telemetry. UI and agents must use the same fresh projection.
 * Installed adapters and the host own interaction and focus; this interpreter
 * neither moves focus nor manages DOM lifetimes.
 *
 * @param props - Projection, installed adapters and host callbacks for one interpreted module.
 * @param props.projection - Fresh, already masked projection whose first node is the root.
 * @param props.renderers - Preinstalled adapters matched by exact component id and version.
 * @param props.invoke - Resolves a canonical node id to a lazy action effect without running it.
 * @param props.unavailable - Host fallback rendered for unavailable projections or missing adapters.
 * @returns The root node's adapter tree, the host fallback when the projection or an adapter is unavailable, or `null` for an empty projection.
 * @since 0.0.1
 * @example
 * createElement(DeclarativeModule, { projection, renderers: [textRenderer], invoke: screen.invoke, unavailable: (message) => message });
 */
export const DeclarativeModule = ({
    projection,
    renderers,
    invoke,
    unavailable,
}: {
    readonly projection: UiProjection;
    readonly renderers: ReadonlyArray<UiRenderer>;
    /** Resolve a canonical node id to a lazy effect; rendering must not execute it. */
    readonly invoke: (id: string) => Effect.Effect<void, UiModuleFailure, Caller>;
    /** Let the host own accessible fallback presentation for unavailable projections or missing adapters. */
    readonly unavailable: (message: string) => ReactNode;
}): ReactNode => {
    // Interpret only supplied projection data; admission and viewer masking belong to its producer.
    if (projection.state !== 'available') return unavailable(projection.message);
    /**
     * Interpret descendants by projected id using exact installed component versions; absent nodes render nothing.
     *
     * @param id - Projected node id to interpret, taken from the root or a parent's children.
     * @returns The matching adapter element with interpreted children, the host fallback when no exact adapter is installed, or `null` when the id is absent.
     */
    const render = (id: string): ReactNode => {
        // Do not substitute another adapter version when the approved implementation is absent.
        const node = projection.nodes.find(
            /**
             * Match the child reference within this projection only.
             *
             * @param entry - Candidate node from the same projection.
             * @returns Whether the candidate carries the requested id.
             */
            (entry) => entry.id === id
        );
        if (node === undefined) return null;
        const renderer = renderers.find(
            /**
             * Require both catalog identity and version; JSON cannot supply component code.
             *
             * @param entry - Installed adapter being considered for the node.
             * @returns Whether the adapter's id and version both equal the node's component reference.
             */
            (entry) => entry.id === node.component.id && entry.version === node.component.version
        );
        if (renderer === undefined) return unavailable(projection.message);
        return createElement(renderer.component, {
            node,
            key: node.id,
            action: invoke(node.id),
            children: node.children.map(render),
        });
    };
    return projection.nodes[0] === undefined ? null : render(projection.nodes[0].id);
};
