/**
 * @file packages/contracts/src/action.ts
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

import { Option, Schema } from 'effect';
import type { FlagKey } from './flags.ts';

/**
 * Portable action specifications. A specification describes an action and
 * holds no handler, so web, Expo, agents and the backend can all import it
 * without pulling in runtime code. Handlers are registered against a
 * specification in `@eventiva/runtime/action`.
 */

/** A canonical action name: dotted and lower case, such as `events.create`. */
export const ActionName = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/));
export type ActionName = typeof ActionName.Type;

/**
 * The permission a caller needs to invoke an action, dotted and lower case,
 * such as `events.tickets.create`. The `Authorizer` decides who holds it.
 */
export const Permission = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/));
export type Permission = typeof Permission.Type;

/** What running the action changes. */
export type SideEffect = 'read' | 'write' | 'external';

/** How the action behaves offline (2026-11-11 offline-first decision). Every action declares it. */
export type Offline = 'local' | 'queued' | 'online-only';

/** A schema that needs no services to decode or encode. */
type AnySchema = Schema.Schema.AnyNoContext;

/** A portable action specification. */
export interface ActionSpec<
    Name extends string = string,
    In extends AnySchema = AnySchema,
    Out extends AnySchema = AnySchema,
    Err extends AnySchema = AnySchema,
> {
    readonly _tag: 'ActionSpec';
    readonly name: Name;
    /** Bumped only on a breaking change to input, output or meaning. */
    readonly version: number;
    /** Agent-facing description in en-GB. */
    readonly description: string;
    readonly input: In;
    readonly output: Out;
    /** The action's own errors, if it declares any; platform errors are added by the runtime. */
    readonly error: Option.Option<Err>;
    /** Checked by the runtime's `Authorizer` on every invocation, before and after decoding. */
    readonly permission: Permission;
    readonly sideEffect: SideEffect;
    readonly offline: Offline;
    /** The flag that switches an optional capability on, declared in the module manifest. */
    readonly flag: Option.Option<FlagKey>;
}

/** The decoded input of a specification. */
export type Input<S extends ActionSpec> = Schema.Schema.Type<S['input']>;
/** The decoded output of a specification. */
export type Output<S extends ActionSpec> = Schema.Schema.Type<S['output']>;
/** The decoded error of a specification; `never` when it declares none. */
export type Failure<S extends ActionSpec> =
    S['error'] extends Option.Option<infer E extends AnySchema> ? Schema.Schema.Type<E> : never;

/** Declares a portable action specification. Pure: validation happens when a handler is registered. */
export const define = <
    const Name extends string,
    In extends AnySchema,
    Out extends AnySchema,
    Err extends AnySchema = never,
>(
    name: Name,
    options: {
        readonly version: number;
        readonly description: string;
        readonly input: In;
        readonly output: Out;
        readonly error?: Err;
        readonly permission: Permission;
        readonly sideEffect: SideEffect;
        readonly offline: Offline;
        readonly flag?: FlagKey;
    }
): ActionSpec<Name, In, Out, Err> => ({
    _tag: 'ActionSpec',
    name,
    version: options.version,
    description: options.description,
    input: options.input,
    output: options.output,
    error: Option.fromNullable(options.error),
    permission: options.permission,
    sideEffect: options.sideEffect,
    offline: options.offline,
    flag: Option.fromNullable(options.flag),
});

/** The tool name model providers accept: the canonical name with dots replaced by underscores. */
export const wireName = (name: string): string => name.replaceAll('.', '_');
