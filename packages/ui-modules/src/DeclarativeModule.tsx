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

/** Trusted, preinstalled adapter only. No component implementation arrives in JSON. */
export interface UiRenderer {
    readonly id: string;
    readonly version: string;
    readonly kinds: ReadonlyArray<UiNode['kind']>;
    readonly config: Schema.Schema<UiConfig>;
    readonly component: ComponentType<UiRendererProps>;
}

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
 */
export const DeclarativeModule = ({
    projection,
    renderers,
    invoke,
    unavailable,
}: {
    readonly projection: UiProjection;
    readonly renderers: ReadonlyArray<UiRenderer>;
    readonly invoke: (id: string) => Effect.Effect<void, UiModuleFailure, Caller>;
    readonly unavailable: (message: string) => ReactNode;
}): ReactNode => {
    if (projection.state !== 'available') return unavailable(projection.message);
    const render = (id: string): ReactNode => {
        const node = projection.nodes.find((entry) => entry.id === id);
        if (node === undefined) return null;
        const renderer = renderers.find(
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
