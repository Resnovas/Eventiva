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

import { ActionName } from '@eventiva/contracts/action';
import { ActionFailed, InvalidInput, UnknownAction, Unavailable } from '@eventiva/contracts/errors';
import { type Flag, Flags } from '@eventiva/contracts/flags';
import { Attributes, type Outcome, actionSpan } from '@eventiva/contracts/telemetry';
import { ModuleManifest } from '@eventiva/schema/manifest';
import {
    Cause,
    Context,
    Data,
    Effect,
    Either,
    Exit,
    HashMap,
    Layer,
    Option,
    ParseResult,
    Ref,
    Schema,
    type Scope,
} from 'effect';
import type { Implementation } from './action.ts';

/**
 * The action host: modules register handlers for portable specifications and
 * every surface invokes them through one path. Registration is scoped and
 * all-or-nothing: a module is checked completely before anything is added,
 * and closing the registering scope removes everything it added.
 */

/** Two registrations claim the same canonical action name. */
export class DuplicateAction extends Data.TaggedError('DuplicateAction')<{
    readonly action: string;
    readonly module: string;
    readonly registeredBy: string;
}> {}

/** A module's manifest or implementations are not consistent. Nothing was registered. */
export class InvalidModule extends Data.TaggedError('InvalidModule')<{
    readonly module: string;
    readonly reason: string;
}> {}

/** A backend module: its manifest, as data, and the handlers it registers. */
export interface ServerModule {
    readonly manifest: unknown;
    readonly actions: ReadonlyArray<Implementation>;
}

/** Runs registered actions. */
export class ActionHost extends Context.Tag('@eventiva/runtime/ActionHost')<
    ActionHost,
    {
        /** Registers a module until the surrounding scope closes. */
        readonly register: (
            module: ServerModule
        ) => Effect.Effect<ModuleManifest, DuplicateAction | InvalidModule, Scope.Scope>;
        /** Canonical names of every registered action, sorted. */
        readonly actions: Effect.Effect<ReadonlyArray<string>>;
        /**
         * Invokes an action with wire input: flag gates, decode, handler, encode,
         * all inside the span `action.<name>`. The output and any declared error are encoded.
         */
        readonly invoke: (
            action: string,
            input: unknown
        ) => Effect.Effect<unknown, UnknownAction | InvalidInput | Unavailable | ActionFailed>;
    }
>() {}

interface Entry {
    readonly module: string;
    readonly implementation: Implementation;
    /** The module flag and the action flag, each of which must be on. */
    readonly gates: ReadonlyArray<Flag>;
}

interface State {
    readonly modules: HashMap.HashMap<string, ReadonlyArray<string>>;
    readonly actions: HashMap.HashMap<string, Entry>;
}

const emptyState: State = { modules: HashMap.empty(), actions: HashMap.empty() };

const idOf = (manifest: unknown): string =>
    typeof manifest === 'object' && manifest !== null && 'id' in manifest && typeof manifest.id === 'string'
        ? manifest.id
        : '<unknown>';

const invalid = (module: string, reason: string) => Either.left(new InvalidModule({ module, reason }));

/** Checks a decoded module against the current registrations; pure, so it can run inside `Ref.modify`. */
const plan = (
    state: State,
    manifest: ModuleManifest,
    implementations: ReadonlyArray<Implementation>
): Either.Either<ReadonlyArray<[string, Entry]>, DuplicateAction | InvalidModule> => {
    const module = manifest.id;
    if (HashMap.has(state.modules, module)) return invalid(module, 'the module is already registered');
    const declaredFlags = new Map(manifest.flags.map((flag) => [flag.key, flag]));
    const moduleGates: Array<Flag> = [];
    if (manifest.flag !== undefined) {
        const flag = declaredFlags.get(manifest.flag);
        if (flag === undefined) return invalid(module, `module flag ${manifest.flag} is not declared in flags`);
        moduleGates.push(flag);
    }
    const entries: Array<[string, Entry]> = [];
    const seen = new Set<string>();
    for (const implementation of implementations) {
        const { name, description, flag } = implementation.spec;
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
            if (declared === undefined) return invalid(module, `${name} uses flag ${flag.value}, which is not declared`);
            gates.push(declared);
        }
        entries.push([name, { module, implementation, gates }]);
    }
    const missing = manifest.actions.filter((name) => !seen.has(name));
    if (missing.length > 0) return invalid(module, `declared but not implemented: ${missing.join(', ')}`);
    const undeclared = [...seen].filter((name) => !manifest.actions.includes(name));
    if (undeclared.length > 0) return invalid(module, `implemented but not declared: ${undeclared.join(', ')}`);
    return Either.right(entries);
};

const add = (state: State, module: string, entries: ReadonlyArray<[string, Entry]>): State => ({
    modules: HashMap.set(
        state.modules,
        module,
        entries.map(([name]) => name)
    ),
    actions: entries.reduce((actions, [name, entry]) => HashMap.set(actions, name, entry), state.actions),
});

const remove = (state: State, module: string): State =>
    Option.match(HashMap.get(state.modules, module), {
        onNone: () => state,
        onSome: (names) => ({
            modules: HashMap.remove(state.modules, module),
            actions: names.reduce((actions, name) => HashMap.remove(actions, name), state.actions),
        }),
    });

const outcomeOf = (exit: Exit.Exit<unknown, { readonly _tag: string }>): Outcome =>
    Exit.match(exit, {
        onSuccess: () => 'succeeded',
        onFailure: (cause) =>
            Option.match(Cause.failureOption(cause), {
                onNone: () => 'failed',
                onSome: (error) =>
                    error._tag === 'UnknownAction'
                        ? 'unknown-action'
                        : error._tag === 'InvalidInput'
                          ? 'invalid-input'
                          : error._tag === 'Unavailable'
                            ? 'unavailable'
                            : 'failed',
            }),
    });

/** The in-process action host. It evaluates flag gates with the `Flags` service. */
export const ActionHostLive: Layer.Layer<ActionHost, never, Flags> = Layer.effect(
    ActionHost,
    Effect.gen(function* () {
        const flags = yield* Flags;
        const state = yield* Ref.make(emptyState);

        const register = (module: ServerModule) =>
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
                yield* Effect.acquireRelease(
                    Ref.modify(state, (current) => {
                        const result = plan(current, manifest, module.actions);
                        return [result, Either.isRight(result) ? add(current, manifest.id, result.right) : current];
                    }).pipe(Effect.flatten),
                    () => Ref.update(state, (current) => remove(current, manifest.id))
                );
                return manifest;
            });

        const invoke = (action: string, input: unknown) =>
            Effect.gen(function* () {
                const entry = HashMap.get((yield* Ref.get(state)).actions, action);
                if (Option.isNone(entry)) return yield* new UnknownAction({ action });
                const { implementation, gates, module } = entry.value;
                const { spec, handler } = implementation;
                yield* Effect.annotateCurrentSpan(Attributes.moduleId, module);
                yield* Effect.annotateCurrentSpan(Attributes.actionVersion, spec.version);
                for (const gate of gates) {
                    const evaluation = yield* flags.evaluate(gate);
                    if (!evaluation.value) return yield* new Unavailable({ action, reason: 'flag-off' });
                }
                const decoded = yield* Schema.decodeUnknown(spec.input)(input).pipe(
                    Effect.mapError(
                        (error) => new InvalidInput({ action, message: ParseResult.TreeFormatter.formatErrorSync(error) })
                    )
                );
                const output = yield* handler(decoded).pipe(
                    Effect.catchAll((error) =>
                        Option.match(spec.error, {
                            // A handler that declares no errors and fails anyway has a defect.
                            onNone: () => Effect.die(error),
                            onSome: (schema) =>
                                Schema.encode(schema)(error).pipe(
                                    Effect.orDie,
                                    Effect.flatMap((encoded) => Effect.fail(new ActionFailed({ action, error: encoded })))
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
            invoke,
        });
    })
);
