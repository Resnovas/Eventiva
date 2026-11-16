/**
 * @file packages/contracts/src/ui-module.ts
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

import { Context, Effect, Schema, type Scope } from 'effect';
import { ActionName, Permission } from './action.ts';
import type { Caller } from './caller.ts';
import { FlagKey } from './flags.ts';
import { MessageKey } from './i18n.ts';

const Name = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]{0,63}$/));
const Version = Schema.String.pipe(Schema.pattern(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/));
// Text is inert, never interpreted. Executable-looking input is rejected as an
// additional admission restriction, not as a JavaScript sandbox or sanitizer.
const Text = Schema.String.pipe(
    Schema.maxLength(4096),
    Schema.filter((text) => !/(?:javascript\s*:|<\s*script\b|\beval\s*\(|\bimport\s*\(|=>)/i.test(text))
);
export const UiValue = Schema.Union(Text, Schema.Finite, Schema.Boolean, Schema.Null);
export type UiValue = typeof UiValue.Type;
export const UiConfig = Schema.Record({ key: Name, value: UiValue });
export type UiConfig = typeof UiConfig.Type;
const Component = Schema.Struct({ id: MessageKey, version: Version });

/** No UI-local handlers, input expressions, imports, URLs or alternate permissions. */
export const UiActionBinding = Schema.Struct({
    action: ActionName,
    version: Schema.Int.pipe(Schema.positive()),
    input: UiConfig,
});
export type UiActionBinding = typeof UiActionBinding.Type;

/** A flat, ordered tree. Fields are read-only in format 1; no implicit submit. */
export const UiNode = Schema.Struct({
    id: Name,
    kind: Schema.Literal('view', 'layout', 'text', 'field', 'action', 'menu', 'slot'),
    component: Component,
    label: MessageKey,
    terminology: Schema.optional(MessageKey),
    permission: Schema.optional(Permission),
    protected: Schema.Boolean,
    project: Schema.Boolean,
    config: UiConfig,
    children: Schema.Array(Name).pipe(Schema.maxItems(128)),
    binding: Schema.optional(UiActionBinding),
    field: Schema.optional(MessageKey),
});
export type UiNode = typeof UiNode.Type;

/** Format 1 deliberately admits only bounded flat JSON values, not expressions. */
export const UiModuleDefinition = Schema.Struct({
    format: Schema.Literal(1),
    id: Name,
    version: Version,
    flag: FlagKey,
    root: Name,
    nodes: Schema.Array(UiNode).pipe(Schema.minItems(1), Schema.maxItems(128)),
    messages: Schema.Record({ key: MessageKey, value: Text.pipe(Schema.minLength(1)) }),
    unavailable: MessageKey,
    offline: MessageKey,
});
export type UiModuleDefinition = typeof UiModuleDefinition.Type;

/** UI and agents consume exactly this viewer-specific, already-masked snapshot. */
export const UiProjection = Schema.Struct({
    format: Schema.Literal(1),
    module: Name,
    version: Version,
    state: Schema.Literal('available', 'offline', 'unavailable'),
    message: Schema.String,
    nodes: Schema.Array(
        Schema.Struct({
            id: Name,
            kind: UiNode.fields.kind,
            component: Component,
            label: Schema.String,
            terminology: Schema.optional(MessageKey),
            config: UiConfig,
            children: Schema.Array(Name),
            action: Schema.optional(Schema.Struct({ id: ActionName, version: Schema.Int.pipe(Schema.positive()) })),
            value: Schema.optional(UiValue),
        })
    ),
});
export type UiProjection = typeof UiProjection.Type;

/** Bounded codes only: no submitted JSON, field values, policy causes or secrets. */
export class UiModuleFailure extends Schema.TaggedError<UiModuleFailure>()('UiModuleFailure', {
    reason: Schema.Literal(
        'invalid-definition',
        'invalid-config',
        'invalid-projection',
        'unknown-component',
        'unknown-action',
        'unbound-action',
        'denied',
        'protected-node',
        'duplicate',
        'stale',
        'offline',
        'unavailable'
    ),
}) {}

/**
 * App-owned adapters, never supplied by a declarative package. checkInput must
 * decode against the canonical action schema without running it. invoke must
 * use the existing authorized host (including fresh identity, approval, audit,
 * offline policy and input checks); discovery is not invocation authority.
 * admit must recheck active profile, module consent and revocation. visible/value
 * must recheck tenant, field masking and current viewer policy on every call.
 * None of these ports grants protected release or a decrypt capability.
 */
export class UiPlatform extends Context.Tag('@eventiva/contracts/UiPlatform')<
    UiPlatform,
    {
        readonly admit: (definition: UiModuleDefinition) => Effect.Effect<void, UiModuleFailure, Caller>;
        readonly checkInput: (binding: UiActionBinding) => Effect.Effect<void, UiModuleFailure, Caller>;
        readonly invoke: (binding: UiActionBinding) => Effect.Effect<void, UiModuleFailure, Caller>;
        readonly visible: (module: string, node: UiNode) => Effect.Effect<boolean, UiModuleFailure, Caller>;
        readonly value: (module: string, field: string) => Effect.Effect<UiValue, UiModuleFailure, Caller>;
        readonly online: Effect.Effect<boolean>;
    }
>() {}

/**
 * Trusted EVE-50 application-state seam, not a second screen registry. A host
 * keeps only these lazy capabilities, never a cached viewer snapshot. It runs
 * read/invoke under the current authenticated Caller, treats denial/staleness
 * as absence, and removes its scoped registration without deleting replacements.
 */
export class UiScreenContext extends Context.Tag('@eventiva/contracts/UiScreenContext')<
    UiScreenContext,
    {
        readonly mount: (screen: {
            readonly read: Effect.Effect<UiProjection, UiModuleFailure, Caller>;
            readonly invoke: (node: string) => Effect.Effect<void, UiModuleFailure, Caller>;
        }) => Effect.Effect<void, UiModuleFailure, Caller | Scope.Scope>;
    }
>() {}
