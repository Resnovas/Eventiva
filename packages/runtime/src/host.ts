/**
 * @file packages/runtime/src/host.ts
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

import { ActionName, type ActionSpec } from '@eventiva/contracts/action';
import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { ActionFailed, type Forbidden, InvalidInput, UnknownAction, Unavailable } from '@eventiva/contracts/errors';
import { type Flag, Flags } from '@eventiva/contracts/flags';
import { Attributes, type Outcome, actionSpan } from '@eventiva/contracts/telemetry';
import { type ComposeError, type Composed, type Contribution, compose } from '@eventiva/schema/compose';
import { ModuleManifest } from '@eventiva/schema/manifest';
import type { Resource } from '@eventiva/schema/resource';
import {
    Cause,
    Context,
    Data,
    Effect,
    Either,
    ExecutionStrategy,
    Exit,
    HashMap,
    Layer,
    Option,
    ParseResult,
    Ref,
    Schema,
    Scope,
} from 'effect';
import type { Implementation } from './action.ts';

/**
 * The action host: modules register handlers for portable specifications,
 * and every surface invokes them through one authorised path. Registration is
 * scoped and all-or-nothing: a module is checked completely before anything
 * starts, its layer is built in its own scope, and closing the registering
 * scope first removes its actions and resources, then releases its layer.
 */

/** Two registrations claim the same canonical action name. */
export class DuplicateAction extends Data.TaggedError('DuplicateAction')<{
    readonly action: string;
    readonly module: string;
    readonly registeredBy: string;
}> {}

/** A module's manifest, implementations or resources are not consistent. Nothing was registered. */
export class InvalidModule extends Data.TaggedError('InvalidModule')<{
    readonly module: string;
    readonly reason: string;
}> {}

/** A module's layer failed to build. Whatever it had acquired was released and nothing was registered. */
export class ActivationFailed extends Data.TaggedError('ActivationFailed')<{
    readonly module: string;
    readonly cause: unknown;
}> {}

interface ModuleParts<R> {
    /** The manifest as data; it is decoded and checked on registration. */
    readonly manifest: unknown;
    readonly actions: ReadonlyArray<Implementation<ActionSpec, R>>;
    /** Resources the module owns, each listed in the manifest. */
    readonly resources?: ReadonlyArray<Resource>;
    /** Fields the module adds to resources other modules own. */
    readonly contributions?: ReadonlyArray<Contribution>;
}

/**
 * A backend module. When its handlers need services, `layer` provides them;
 * the layer is built once per registration and released once on removal.
 */
export type ServerModule<R = never> = ModuleParts<R> &
    // `never`, or `unknown` inferred from a module without actions, means no services are needed.
    ([R] extends [never]
        ? { readonly layer?: Layer.Layer<never, unknown> }
        : unknown extends R
          ? { readonly layer?: Layer.Layer<never, unknown> }
          : { readonly layer: Layer.Layer<R, unknown> });

/** Every error registering a module can fail with. */
export type RegistrationError = DuplicateAction | InvalidModule | ActivationFailed | ComposeError;

/** Every error invoking an action can fail with. */
export type InvocationError = UnknownAction | InvalidInput | Unavailable | Forbidden | ActionFailed;

/** Runs registered actions. */
export class ActionHost extends Context.Tag('@eventiva/runtime/ActionHost')<
    ActionHost,
    {
        /** Registers a module until the surrounding scope closes. */
        readonly register: <R = never>(
            module: ServerModule<R>
        ) => Effect.Effect<ModuleManifest, RegistrationError, Scope.Scope>;
        /** Canonical names of every registered action, sorted. */
        readonly actions: Effect.Effect<ReadonlyArray<string>>;
        /** Every registered resource with its own and contributed fields. */
        readonly schema: Effect.Effect<Composed, ComposeError>;
        /**
         * Invokes an action with wire input for the current `Caller`: flag
         * gates, permission, decode, policy check, handler, encode, all inside
         * the span `action.<name>`. The output and any declared error are encoded.
         */
        readonly invoke: (action: string, input: unknown) => Effect.Effect<unknown, InvocationError, Caller>;
    }
>() {}

interface Entry {
    readonly module: string;
    readonly spec: ActionSpec;
    /** The handler with its module's services provided. */
    readonly run: (input: unknown) => Effect.Effect<unknown, unknown>;
    /** The module flag and the action flag, each of which must be on. */
    readonly gates: ReadonlyArray<Flag>;
}

interface Registered {
    readonly actions: ReadonlyArray<string>;
    readonly resources: ReadonlyArray<Resource>;
    readonly contributions: ReadonlyArray<Contribution>;
}

interface State {
    readonly modules: HashMap.HashMap<string, Registered>;
    readonly actions: HashMap.HashMap<string, Entry>;
}

type Parts<R> = Required<Omit<ModuleParts<R>, 'manifest'>>;

type Planned<R> = ReadonlyArray<readonly [string, Omit<Entry, 'run'>, Implementation<ActionSpec, R>]>;

const emptyState: State = { modules: HashMap.empty(), actions: HashMap.empty() };

const idOf = (manifest: unknown): string =>
    typeof manifest === 'object' && manifest !== null && 'id' in manifest && typeof manifest.id === 'string'
        ? manifest.id
        : '<unknown>';

const invalid = (module: string, reason: string) => Either.left(new InvalidModule({ module, reason }));

const mismatch = (
    module: string,
    kind: string,
    declared: ReadonlyArray<string>,
    provided: ReadonlyArray<string>
): Option.Option<InvalidModule> => {
    const missing = declared.filter((name) => !provided.includes(name));
    if (missing.length > 0)
        return Option.some(new InvalidModule({ module, reason: `declared but not ${kind}: ${missing.join(', ')}` }));
    const undeclared = provided.filter((name) => !declared.includes(name));
    if (undeclared.length > 0)
        return Option.some(new InvalidModule({ module, reason: `${kind} but not declared: ${undeclared.join(', ')}` }));
    return Option.none();
};

const composeState = (state: State, extra: ReadonlyArray<Registered> = []) => {
    const all = [...HashMap.values(state.modules), ...extra];
    return compose(
        all.flatMap((registered) => registered.resources),
        all.flatMap((registered) => registered.contributions)
    );
};

/**
 * Checks a decoded module against the current registrations. Pure, so the
 * host runs it once before building the module's layer and again inside
 * `Ref.modify` to commit atomically.
 */
const plan = <R>(
    state: State,
    manifest: ModuleManifest,
    parts: Parts<R>
): Either.Either<Planned<R>, RegistrationError> => {
    const module = manifest.id;
    if (HashMap.has(state.modules, module)) return invalid(module, 'the module is already registered');
    const declaredFlags = new Map(manifest.flags.map((flag) => [flag.key, flag]));
    const moduleGates: Array<Flag> = [];
    if (manifest.flag !== undefined) {
        const flag = declaredFlags.get(manifest.flag);
        if (flag === undefined) return invalid(module, `module flag ${manifest.flag} is not declared in flags`);
        moduleGates.push(flag);
    }
    const entries: Array<Planned<R>[number]> = [];
    const seen = new Set<string>();
    for (const implementation of parts.actions) {
        const { spec } = implementation;
        const { name, description, flag } = spec;
        if (!Schema.is(ActionName)(name)) return invalid(module, `${name} is not a canonical action name`);
        if (description.trim() === '') return invalid(module, `${name} has no description`);
        if (seen.has(name)) return Either.left(new DuplicateAction({ action: name, module, registeredBy: module }));
        const existing = HashMap.get(state.actions, name);
        if (Option.isSome(existing)) {
            return Either.left(new DuplicateAction({ action: name, module, registeredBy: existing.value.module }));
        }
        seen.add(name);
        const gates = [...moduleGates];
        if (Option.isSome(flag)) {
            const declared = declaredFlags.get(flag.value);
            if (declared === undefined)
                return invalid(module, `${name} uses flag ${flag.value}, which is not declared`);
            gates.push(declared);
        }
        entries.push([name, { module, spec, gates }, implementation]);
    }
    const actions = mismatch(module, 'implemented', manifest.actions, [...seen]);
    if (Option.isSome(actions)) return Either.left(actions.value);
    const foreign = [...parts.resources, ...parts.contributions].find((part) => part.module !== module);
    if (foreign !== undefined)
        return invalid(module, `${foreign._tag.toLowerCase()} belongs to module ${foreign.module}`);
    const resources = mismatch(
        module,
        'provided',
        manifest.resources ?? [],
        parts.resources.map((resource) => resource.name)
    );
    if (Option.isSome(resources)) return Either.left(resources.value);
    const composed = composeState(state, [
        { actions: [], resources: parts.resources, contributions: parts.contributions },
    ]);
    if (Either.isLeft(composed)) return Either.left(composed.left);
    return Either.right(entries);
};

const remove = (state: State, module: string): State =>
    Option.match(HashMap.get(state.modules, module), {
        onNone: () => state,
        onSome: (registered) => ({
            modules: HashMap.remove(state.modules, module),
            actions: registered.actions.reduce((actions, name) => HashMap.remove(actions, name), state.actions),
        }),
    });

const outcomes: Readonly<Record<string, Outcome>> = {
    UnknownAction: 'unknown-action',
    InvalidInput: 'invalid-input',
    Unavailable: 'unavailable',
    Forbidden: 'forbidden',
};

const outcomeOf = (exit: Exit.Exit<unknown, { readonly _tag: string }>): Outcome =>
    Exit.match(exit, {
        onSuccess: () => 'succeeded',
        onFailure: (cause) =>
            Option.match(Cause.failureOption(cause), {
                onNone: () => 'failed',
                onSome: (error) => outcomes[error._tag] ?? 'failed',
            }),
    });

/** The in-process action host. It evaluates flag gates with `Flags` and asks `Authorizer` on every call. */
export const ActionHostLive: Layer.Layer<ActionHost, never, Flags | Authorizer> = Layer.effect(
    ActionHost,
    Effect.gen(function* () {
        const flags = yield* Flags;
        const authorizer = yield* Authorizer;
        const state = yield* Ref.make(emptyState);

        const register = <R = never>(
            module: ServerModule<R>
        ): Effect.Effect<ModuleManifest, RegistrationError, Scope.Scope> =>
            Effect.gen(function* () {
                const manifest = yield* Schema.decodeUnknown(ModuleManifest)(module.manifest).pipe(
                    Effect.mapError(
                        (error) =>
                            new InvalidModule({
                                module: idOf(module.manifest),
                                reason: ParseResult.TreeFormatter.formatErrorSync(error),
                            })
                    )
                );
                const parts: Parts<R> = {
                    actions: module.actions,
                    resources: module.resources ?? [],
                    contributions: module.contributions ?? [],
                };
                // Check first, so an invalid module never starts its layer.
                yield* plan(yield* Ref.get(state), manifest, parts);

                // The module scope is a child of the caller's scope. Its finalizer is added
                // before the registration's, so removal runs first and release second.
                const moduleScope = yield* Scope.fork(yield* Effect.scope, ExecutionStrategy.sequential);
                const release = <E>(cause: Cause.Cause<E>) => Scope.close(moduleScope, Exit.failCause(cause));
                // A module without a layer needs no services (ServerModule<never>).
                const layer = (module.layer ?? Layer.empty) as Layer.Layer<R, unknown>;
                const context = yield* Layer.buildWithScope(layer, moduleScope).pipe(
                    Effect.mapError((cause) => new ActivationFailed({ module: manifest.id, cause })),
                    Effect.onError(release)
                );

                const commit = (current: State): readonly [Either.Either<Planned<R>, RegistrationError>, State] => {
                    const result = plan(current, manifest, parts);
                    if (Either.isLeft(result)) return [result, current];
                    const next: State = {
                        modules: HashMap.set(current.modules, manifest.id, {
                            actions: result.right.map(([name]) => name),
                            resources: parts.resources,
                            contributions: parts.contributions,
                        }),
                        actions: result.right.reduce(
                            (actions, [name, entry, implementation]) =>
                                HashMap.set(actions, name, {
                                    ...entry,
                                    run: (input: unknown) => Effect.provide(implementation.handler(input), context),
                                }),
                            current.actions
                        ),
                    };
                    return [result, next];
                };
                yield* Effect.acquireRelease(
                    Ref.modify(state, commit).pipe(
                        Effect.flatMap((result): Effect.Effect<Planned<R>, RegistrationError> => result)
                    ),
                    () => Ref.update(state, (current) => remove(current, manifest.id))
                ).pipe(Effect.onError(release));
                return manifest;
            });

        const invoke = (action: string, input: unknown) =>
            Effect.gen(function* () {
                const entry = HashMap.get((yield* Ref.get(state)).actions, action);
                if (Option.isNone(entry)) return yield* new UnknownAction({ action });
                const { spec, run, gates, module } = entry.value;
                yield* Effect.annotateCurrentSpan(Attributes.moduleId, module);
                yield* Effect.annotateCurrentSpan(Attributes.actionVersion, spec.version);
                for (const gate of gates) {
                    const evaluation = yield* flags.evaluate(gate);
                    if (!evaluation.value) return yield* new Unavailable({ action, reason: 'flag-off' });
                }
                // The caller is read per call, so a revoked grant stops working mid-session.
                const caller = yield* Caller;
                // Permission before decoding: an unauthorised caller learns nothing about its input.
                yield* authorizer.canInvoke(caller, spec);
                const decoded = yield* Schema.decodeUnknown(spec.input)(input).pipe(
                    Effect.mapError(
                        (error) =>
                            new InvalidInput({ action, message: ParseResult.TreeFormatter.formatErrorSync(error) })
                    )
                );
                yield* authorizer.check(caller, spec, decoded);
                const output = yield* run(decoded).pipe(
                    Effect.catchAll((error) =>
                        Option.match(spec.error, {
                            // A handler that declares no errors and fails anyway has a defect.
                            onNone: () => Effect.die(error),
                            onSome: (schema) =>
                                Schema.encode(schema)(error).pipe(
                                    Effect.orDie,
                                    Effect.flatMap((encoded) =>
                                        Effect.fail(new ActionFailed({ action, error: encoded }))
                                    )
                                ),
                        })
                    )
                );
                return yield* Schema.encode(spec.output)(output).pipe(Effect.orDie);
            }).pipe(
                Effect.onExit((exit) => Effect.annotateCurrentSpan(Attributes.actionOutcome, outcomeOf(exit))),
                Effect.withSpan(actionSpan(action), { attributes: { [Attributes.actionName]: action } })
            );

        return ActionHost.of({
            register,
            actions: Ref.get(state).pipe(Effect.map((current) => [...HashMap.keys(current.actions)].sort())),
            schema: Ref.get(state).pipe(Effect.flatMap((current) => composeState(current))),
            invoke,
        });
    })
);
