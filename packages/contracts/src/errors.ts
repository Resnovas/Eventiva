/**
 * @file packages/contracts/src/errors.ts
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

import { Schema } from 'effect';
import { JsonValue } from './storage.ts';

/**
 * Platform errors every action surface can return. They cross HTTP, RPC, MCP
 * and agent transports, so they are `Schema.TaggedError` classes that encode.
 */

/** No action with this canonical name is registered. */
export class UnknownAction extends Schema.TaggedError<UnknownAction>()('UnknownAction', {
    action: Schema.String,
}) {}

/** The wire input does not decode against the action's input schema. */
export class InvalidInput extends Schema.TaggedError<InvalidInput>()('InvalidInput', {
    action: Schema.String,
    message: Schema.String,
}) {}

/** The action exists but its controlling feature flag is off. */
export class Unavailable extends Schema.TaggedError<Unavailable>()('Unavailable', {
    action: Schema.String,
    reason: Schema.Literal('flag-off'),
}) {}

/**
 * The caller may not invoke the action, or may not act on the target it named.
 * Raised before decoding when the caller lacks the permission, so an
 * unauthorised caller learns nothing about whether its input was valid.
 */
export class Forbidden extends Schema.TaggedError<Forbidden>()('Forbidden', {
    action: Schema.String,
    reason: Schema.String,
}) {}

/** The handler failed with one of the action's declared errors, carried encoded. */
export class ActionFailed extends Schema.TaggedError<ActionFailed>()('ActionFailed', {
    action: Schema.String,
    error: JsonValue,
}) {}

/** Every platform error an invocation can fail with. */
export const PlatformError = Schema.Union(UnknownAction, InvalidInput, Unavailable, Forbidden, ActionFailed);
export type PlatformError = typeof PlatformError.Type;
