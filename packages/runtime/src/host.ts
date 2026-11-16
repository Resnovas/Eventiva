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
import { Authorizer, Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden, UnknownAction, Unavailable } from '@eventiva/contracts/errors';
import { type Flag, Flags } from '@eventiva/contracts/flags';
import { ActionInventory, validateDefinitions, validateInventory } from '@eventiva/contracts/inventory';
import type { JsonValue } from '@eventiva/contracts/storage';
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
    Ref,
    Schema,
    Scope,
} from 'effect';
import type { ActionBinding } from './action.ts';
import { type InvocationError, makeExecutor } from './execution.ts';
import {
    Approvals,
    Audit,
    ExecutionPolicy,
    IdentityResolver,
    InputDigest,
    Integrity,
    type InvokeOptions,
    type InvocationResult,
    type AuditUnavailable,
} from './invocation.ts';

/**
 * The action host: modules register handlers for portable specifications,
 * and every surface invokes them through one authorised path. Registration is
 * scoped and all-or-nothing: a module is checked completely before anything
 * starts, its layer is built in its own scope, and closing the registering
 * scope first removes its actions and resources, then releases its layer.
 */

interface DuplicateActionFields {
    readonly action: string;
    readonly module: string;
    readonly registeredBy: string;
}
const DuplicateActionBase: new (args: DuplicateActionFields) => Cause.YieldableError &
    DuplicateActionFields & {
        readonly _tag: 'DuplicateAction';
    } = Data.TaggedError('DuplicateAction');
/** Two registrations claim the same canonical action name. */
export class DuplicateAction extends DuplicateActionBase {}

interface InvalidModuleFields {
    readonly module: string;
    readonly reason: string;
}
const InvalidModuleBase: new (args: InvalidModuleFields) => Cause.YieldableError &
    InvalidModuleFields & {
        readonly _tag: 'InvalidModule';
    } = Data.TaggedError('InvalidModule');
/** A module's manifest, implementations or resources are not consistent. Nothing was registered. */
export class InvalidModule extends InvalidModuleBase {}

interface ActivationFailedFields {
    readonly module: string;
    readonly reason: 'layer-failed';
}
const ActivationFailedBase: new (args: ActivationFailedFields) => Cause.YieldableError &
    ActivationFailedFields & {
        readonly _tag: 'ActivationFailed';
    } = Data.TaggedError('ActivationFailed');
/** A module's layer failed to build. Whatever it had acquired was released and nothing was registered. */
export class ActivationFailed extends ActivationFailedBase {}

interface ModuleParts<R> {
    /** The manifest as data; it is decoded and checked on registration. */
    readonly manifest: JsonValue;
    readonly actions: ReadonlyArray<ActionBinding<R>>;
    /** Resources the module owns, each listed in the manifest. */
    readonly resources?: ReadonlyArray<Resource>;
    /** Fields the module adds to resources other modules own. */
    readonly contributions?: ReadonlyArray<Contribution>;
}

/**
 * A backend module. When its handlers need services, `layer` provides them;
 * the layer is built once per registration and released once on removal.
 */
export type ServerModule<R = never, E = never> =
    (ModuleParts<R> & { readonly layer: Layer.Layer<R, E> }) | (ModuleParts<never> & { readonly layer?: undefined });

/** Every error registering a module can fail with. */
export type RegistrationError = DuplicateAction | InvalidModule | ActivationFailed | ComposeError;

/** Every error invoking an action can fail with. */
export type { InvocationError } from './execution.ts';

/** Runs registered actions. */
export class ActionHost extends Context.Tag('@eventiva/runtime/ActionHost')<
    ActionHost,
    {
        /** Registers a module until the surrounding scope closes. */
        readonly register: <R = never, E = never>(
            module: ServerModule<R, E>
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
        readonly invoke: <Wire>(
            action: string,
            input: Wire,
            options?: InvokeOptions
        ) => Effect.Effect<JsonValue, InvocationError, Caller>;
        /** Every outcome carries a durable receipt; persistence failure is never disguised as success. */
        readonly execute: <Wire>(
            action: string,
            input: Wire,
            options?: InvokeOptions
        ) => Effect.Effect<InvocationResult<InvocationError>, AuditUnavailable, Caller>;
    }
>() {}

interface Entry extends ActionBinding {
    readonly module: string;
    readonly spec: ActionSpec;
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

type Planned<R> = ReadonlyArray<readonly [string, Omit<Entry, 'prepare'>, ActionBinding<R>]>;

const emptyState: State = { modules: HashMap.empty(), actions: HashMap.empty() };

const idOf = <Manifest>(manifest: Manifest): string =>
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

const outcomeOf = <A>(exit: Exit.Exit<A, { readonly _tag: string }>): Outcome =>
    Exit.match(exit, {
        onSuccess: () => 'succeeded',
        onFailure: (cause) =>
            Option.match(Cause.failureOption(cause), {
                onNone: () => 'failed',
                onSome: (error) => outcomes[error._tag] ?? 'failed',
            }),
    });

/** The in-process action host. It evaluates flag gates with `Flags` and asks `Authorizer` on every call. */
export const ActionHostLive: Layer.Layer<
    ActionHost | ActionInventory,
    never,
    Flags | Authorizer | IdentityResolver | InputDigest | ExecutionPolicy | Approvals | Audit | Integrity
> = Layer.effectContext(
    Effect.gen(function* () {
        const flags = yield* Flags;
        const authorizer = yield* Authorizer;
        const identity = yield* IdentityResolver;
        const executor = yield* makeExecutor;
        const state = yield* Ref.make(emptyState);

        const register = <R = never, E = never>(
            module: ServerModule<R, E>
        ): Effect.Effect<ModuleManifest, RegistrationError, Scope.Scope> =>
            Effect.gen(function* () {
                const manifest = yield* Schema.decodeUnknown(ModuleManifest)(module.manifest).pipe(
                    Effect.mapError(
                        () =>
                            new InvalidModule({
                                module: idOf(module.manifest),
                                reason: 'Manifest does not match its schema.',
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
                yield* validateDefinitions(parts.actions.map(({ spec }) => spec)).pipe(
                    Effect.mapError((error) => new InvalidModule({ module: manifest.id, reason: error.message }))
                );

                // The module scope is a child of the caller's scope. Its finalizer is added
                // before the registration's, so removal runs first and release second.
                const moduleScope = yield* Scope.fork(yield* Effect.scope, ExecutionStrategy.sequential);
                const release = <E>(cause: Cause.Cause<E>) => Scope.close(moduleScope, Exit.failCause(cause));
                // The no-layer union member can contain only service-free actions.
                const bindings: ReadonlyArray<ActionBinding> =
                    module.layer === undefined
                        ? module.actions
                        : yield* Layer.buildWithScope(module.layer, moduleScope).pipe(
                              Effect.catchAllDefect(() => Effect.dieMessage('Module activation defect.')),
                              Effect.mapError(
                                  () => new ActivationFailed({ module: manifest.id, reason: 'layer-failed' })
                              ),
                              Effect.onError(release),
                              Effect.map((context) =>
                                  module.actions.map((implementation): ActionBinding => ({
                                      spec: implementation.spec,
                                      prepare: (input) =>
                                          implementation.prepare(input).pipe(
                                              Effect.map((prepared) => ({
                                                  ...prepared,
                                                  run: Effect.provide(prepared.run, context),
                                              }))
                                          ),
                                  }))
                              )
                          );
                const boundParts: Parts<never> = { ...parts, actions: bindings };

                const commit = (current: State): readonly [Either.Either<Planned<never>, RegistrationError>, State] => {
                    const result = plan(current, manifest, boundParts);
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
                                    prepare: implementation.prepare,
                                }),
                            current.actions
                        ),
                    };
                    return [result, next];
                };
                yield* Effect.acquireRelease(
                    Ref.modify(state, commit).pipe(
                        Effect.flatMap((result): Effect.Effect<Planned<never>, RegistrationError> => result)
                    ),
                    () => Ref.update(state, (current) => remove(current, manifest.id))
                ).pipe(Effect.onError(release));
                return manifest;
            });

        const execute = <Wire>(action: string, input: Wire, options?: InvokeOptions) =>
            executor(
                action,
                input,
                Effect.gen(function* () {
                    const entry = HashMap.get((yield* Ref.get(state)).actions, action);
                    if (Option.isNone(entry)) return yield* new UnknownAction({ action });
                    const { spec, prepare, gates, module } = entry.value;
                    // Compare the intent with this captured entry, never a separate inventory lookup.
                    // Resource-state expectedVersion is an unrelated policy gate.
                    const expectedActionVersion = options?.expectedActionVersion;
                    if (expectedActionVersion !== undefined && expectedActionVersion !== spec.version)
                        return yield* new Forbidden({ action, reason: 'action-version-conflict' });
                    yield* Effect.annotateCurrentSpan(Attributes.moduleId, module);
                    yield* Effect.annotateCurrentSpan(Attributes.actionVersion, spec.version);
                    return {
                        spec,
                        prepare,
                        available: Effect.gen(function* () {
                            const current = HashMap.get((yield* Ref.get(state)).actions, action);
                            if (Option.isNone(current) || current.value !== entry.value)
                                return yield* new UnknownAction({ action });
                            for (const gate of gates) {
                                const evaluation = yield* flags.evaluate(gate);
                                if (!evaluation.value) return yield* new Unavailable({ action, reason: 'flag-off' });
                            }
                        }),
                    };
                }),
                options
            ).pipe(
                Effect.onExit((exit) =>
                    Effect.annotateCurrentSpan(
                        Attributes.actionOutcome,
                        Exit.isFailure(exit) ? outcomeOf(exit) : outcomeOf(exit.value.result)
                    )
                ),
                Effect.withSpan(actionSpan(action), { attributes: { [Attributes.actionName]: action } })
            );

        const invoke = <Wire>(action: string, input: Wire, options?: InvokeOptions) =>
            execute(action, input, options).pipe(Effect.flatMap(({ result }) => result));

        const list = (presented: CallerIdentity) =>
            Effect.gen(function* () {
                const caller = yield* identity
                    .resolve(presented)
                    .pipe(
                        Effect.mapError(() => new Forbidden({ action: '<inventory>', reason: 'identity-unavailable' }))
                    );
                const entries = [...HashMap.values((yield* Ref.get(state)).actions)].sort((a, b) =>
                    a.spec.name.localeCompare(b.spec.name)
                );
                const visible: Array<ActionSpec> = [];
                for (const entry of entries) {
                    const permitted = yield* authorizer.canInvoke(caller, entry.spec).pipe(
                        Effect.as(true),
                        Effect.catchTag('Forbidden', () => Effect.succeed(false))
                    );
                    if (!permitted) continue;
                    const enabled = yield* Effect.forEach(entry.gates, (gate) => flags.evaluate(gate));
                    if (enabled.every((evaluation) => evaluation.value)) visible.push(entry.spec);
                }
                return yield* validateInventory(visible);
            });

        return Context.make(
            ActionHost,
            ActionHost.of({
                register,
                actions: Ref.get(state).pipe(Effect.map((current) => [...HashMap.keys(current.actions)].sort())),
                schema: Ref.get(state).pipe(Effect.flatMap((current) => composeState(current))),
                invoke,
                execute,
            })
        ).pipe(
            Context.add(ActionInventory, {
                list,
                find: (caller, id) =>
                    list(caller).pipe(Effect.map((items) => Option.fromNullable(items.find((item) => item.id === id)))),
            })
        );
    })
);
