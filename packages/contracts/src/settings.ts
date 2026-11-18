/**
 * @file packages/contracts/src/settings.ts
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

import { Effect, Schema } from 'effect';
import { define } from './action.ts';
import { declareResource, resourceFieldSchema } from './resource.ts';
import type { JsonValue } from './storage.ts';

const Namespace = Schema.String.pipe(Schema.maxLength(100), Schema.pattern(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/));
const strict = { parseOptions: { onExcessProperty: 'error' } } as const;
export const SettingValue = Schema.Union(Schema.String.pipe(Schema.maxLength(4096)), Schema.Int, Schema.Boolean);
export type SettingValue = typeof SettingValue.Type;
export const SettingScope = Schema.Literal('user', 'tenant', 'app');

/** Explicit non-secret preference declarations only; there is no plaintext secret or arbitrary-key mode. */
export const SettingDefinition = Schema.Struct({
    module: Namespace,
    instance: Namespace,
    key: Namespace,
    scope: SettingScope,
    classification: Schema.Literal('non-secret'),
    purpose: Schema.Literal('preference'),
    type: Schema.Literal('text', 'integer', 'boolean'),
    default: SettingValue,
}).annotations(strict);
export type SettingDefinition = typeof SettingDefinition.Type;

/** Safe action/declaration diagnostics deliberately retain neither rejected input nor parser causes. */
export class SettingsFailure extends Schema.TaggedError<SettingsFailure>()('SettingsFailure', {
    reason: Schema.Literal(
        'invalid-definition',
        'undeclared',
        'invalid-value',
        'denied',
        'app-scope-unavailable',
        'conflict',
        'storage'
    ),
}) {}

/** Validate a declared scalar family in addition to the universal bounded non-secret wire shape. */
export const decodeSettingValue = (definition: SettingDefinition, value: SettingValue) =>
    Schema.decodeUnknown(resourceFieldSchema({ type: definition.type, optional: false }))(value).pipe(
        Effect.flatMap(Schema.decodeUnknown(SettingValue)),
        Effect.mapError(
            /** Never retain the rejected preference in public errors. */ () =>
                new SettingsFailure({ reason: 'invalid-value' })
        )
    );

/** Detach and validate declaration defaults before any registration or resource publication occurs. */
export const declareSetting = (input: JsonValue) =>
    Schema.decodeUnknown(SettingDefinition)(input).pipe(
        Effect.flatMap(
            /** A declaration is unusable if its explicit default violates its own scalar schema. */ (definition) =>
                decodeSettingValue(definition, definition.default).pipe(Effect.as(definition))
        ),
        Effect.mapError(
            /** Invalid metadata must not disclose defaults or unsupported secret declarations. */ () =>
                new SettingsFailure({ reason: 'invalid-definition' })
        )
    );

export const SettingsTarget = Schema.Struct({
    module: Namespace,
    instance: Namespace,
    key: Namespace,
    scope: SettingScope,
}).annotations(strict);
export type SettingsTarget = typeof SettingsTarget.Type;
/** JSON-encoded scalar keeps generic action schemas within every current inventory provider's common subset. */
export const SettingWireValue = Schema.String.pipe(Schema.maxLength(24578));
// Provider discovery deliberately supports no string constraints for every provider. Domain decoding below the host enforces names and byte-independent string bounds.
const WireTarget = Schema.Struct({
    module: Schema.String,
    instance: Schema.String,
    key: Schema.String,
    scope: SettingScope,
});
export const SettingsResult = Schema.Struct({
    value: Schema.String,
    source: Schema.Literal('default', 'stored'),
    revision: Schema.Int,
}).annotations(strict);

/** Existing Resources owns persistence and revisions; this declaration adds no SQL migration or alternate store. */
export const settingsResource = declareResource({
    id: 'settings.value',
    owner: 'settings',
    moduleVersion: '1.0.0',
    fields: { binding: { type: 'text', optional: false }, value: { type: 'text', optional: false } },
});

export const settingsRead = define('settings.read', {
    version: 1,
    description: 'Read a declared non-secret preference in the authenticated scope.',
    input: WireTarget,
    output: SettingsResult,
    error: SettingsFailure,
    permission: 'settings.read',
    sideEffect: 'read',
    offline: 'online-only',
    flag: 'settings.enabled',
});
export const settingsWrite = define('settings.write', {
    version: 1,
    description: 'Replace a declared non-secret preference at its expected revision.',
    input: Schema.Struct({
        ...WireTarget.fields,
        value: Schema.String,
        expectedRevision: Schema.Int,
    }).annotations(strict),
    output: SettingsResult,
    error: SettingsFailure,
    permission: 'settings.write',
    sideEffect: 'write',
    offline: 'online-only',
    flag: 'settings.enabled',
});
