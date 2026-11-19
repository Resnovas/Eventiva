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
import type { Fields, Resource } from '@eventiva/schema/resource';
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
/** Construct collision evidence with both module owners without widening the public error shape. */
const DuplicateActionBase: new (args: DuplicateActionFields) => Cause.YieldableError &
    DuplicateActionFields & {
        readonly _tag: 'DuplicateAction';
    } = Data.TaggedError('DuplicateAction');
/** Two registrations claim the same canonical action name. */
export class DuplicateAction extends DuplicateActionBase {}

/** Identify the inconsistent registration and its safe diagnostic without retaining a module implementation or layer. */
interface InvalidModuleFields {
    readonly module: string;
    readonly reason: string;
}
/** Construct a typed registration rejection while hiding the vendor's open error constructor generic. */
const InvalidModuleBase: new (args: InvalidModuleFields) => Cause.YieldableError &
    InvalidModuleFields & {
        readonly _tag: 'InvalidModule';
    } = Data.TaggedError('InvalidModule');
/** A module's manifest, implementations or resources are not consistent. Nothing was registered. */
export class InvalidModule extends InvalidModuleBase {}

/** Attribute layer startup failure to its module using a fixed reason rather than arbitrary provider errors. */
interface ActivationFailedFields {
    readonly module: string;
    readonly reason: 'layer-failed';
}
/** Construct the sanitized activation failure exposed by registration, not the original provider failure. */
const ActivationFailedBase: new (args: ActivationFailedFields) => Cause.YieldableError &
    ActivationFailedFields & {
        readonly _tag: 'ActivationFailed';
    } = Data.TaggedError('ActivationFailed');
/** A module's layer failed to build. Whatever it had acquired was released and nothing was registered. */
export class ActivationFailed extends ActivationFailedBase {}

/** Untrusted manifest data paired with typed handlers and owned schema parts, reconciled before registration. */
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

/** Captured live registration binding with its owner and conjunctive module/action flag gates. */
interface Entry extends ActionBinding {
    readonly module: string;
    readonly spec: ActionSpec;
    /** The module flag and the action flag, each of which must be on. */
    readonly gates: ReadonlyArray<Flag>;
}

/** Ownership inventory needed to remove exactly one module's actions and schema contributions on scope closure. */
interface Registered {
    readonly actions: ReadonlyArray<string>;
    readonly resources: ReadonlyArray<Resource>;
    readonly contributions: ReadonlyArray<Contribution>;
}

/** Immutable host registry snapshot; modules and action bindings must be replaced together through one Ref update. */
interface State {
    readonly modules: HashMap.HashMap<string, Registered>;
    readonly actions: HashMap.HashMap<string, Entry>;
}

type Parts<R> = Required<Omit<ModuleParts<R>, 'manifest'>>;

type Planned<R> = ReadonlyArray<readonly [string, Omit<Entry, 'prepare'>, ActionBinding<R>]>;

const emptyState: State = { modules: HashMap.empty(), actions: HashMap.empty() };

/** Recover only a string module id for decode-failure diagnostics, using a fixed marker when it is unavailable. */
const idOf = <Manifest>(manifest: Manifest): string =>
    typeof manifest === 'object' && manifest !== null && 'id' in manifest && typeof manifest.id === 'string'
        ? manifest.id
        : '<unknown>';

/** Reject a registration plan with its module-bound consistency diagnostic, without mutating the registry. */
const invalid = (module: string, reason: string) => Either.left(new InvalidModule({ module, reason }));

/** Compare declared and supplied names bidirectionally, reporting missing declarations before undeclared implementations. */
const mismatch = (
    module: string,
    kind: string,
    declared: ReadonlyArray<string>,
    provided: ReadonlyArray<string>
): Option.Option<InvalidModule> => {
    // Both directions matter: neither a manifest-only capability nor an undeclared implementation may enter the registry.
    const missing = declared.filter(
        /** Retain manifest claims that have no corresponding implementation/resource. */ (name) =>
            !provided.includes(name)
    );
    if (missing.length > 0)
        return Option.some(new InvalidModule({ module, reason: `declared but not ${kind}: ${missing.join(', ')}` }));
    const undeclared = provided.filter(
        /** Detect supplied capabilities outside the module's declared surface. */ (name) => !declared.includes(name)
    );
    if (undeclared.length > 0)
        return Option.some(new InvalidModule({ module, reason: `${kind} but not declared: ${undeclared.join(', ')}` }));
    return Option.none();
};

/** Detach optional scalar metadata, including the shared None instance, while retaining Effect's Option protocols. */
const snapshotOption = <A>(option: Option.Option<A>): Option.Option<A> => {
    // A constructor round-trip reuses None; copy instance properties and retain only the library prototype instead.
    const snapshot = { ...option };
    Object.setPrototypeOf(snapshot, Object.getPrototypeOf(option));
    return snapshot;
};

/** Detach field metadata while preserving opaque Effect value schemas, ASTs and schema-compatible field operations. */
const snapshotFields = (fields: Fields): Fields =>
    Object.fromEntries(
        Object.entries(fields).map(
            /** Copy each declaration and its optional scalar metadata, never recursively cloning schema constructors. */ ([
                name,
                field,
            ]): readonly [string, Fields[string]] => [
                name,
                {
                    ...field,
                    label: snapshotOption(field.label),
                    target: snapshotOption(field.target),
                },
            ]
        )
    );

/** Capture a resource's admission metadata and field map without retaining caller-owned declaration objects. */
const snapshotResource = (resource: Resource): Resource => ({ ...resource, fields: snapshotFields(resource.fields) });

/** Capture contributor ownership, target and fields independently of the caller's array and map lifetime. */
const snapshotContribution = (contribution: Contribution): Contribution => ({
    ...contribution,
    fields: snapshotFields(contribution.fields),
});

/** Validate combined schema on detached declarations so even a successful composed view cannot mutate registry metadata. */
const composeState = (state: State, extra: ReadonlyArray<Registered> = []) => {
    // Include existing and candidate contributions together so cross-module conflicts cannot pass isolated validation.
    const all = [...HashMap.values(state.modules), ...extra];
    return compose(
        all.flatMap(
            /** Collect owned resource definitions from every participating module. */ (registered) =>
                registered.resources.map(snapshotResource)
        ),
        all.flatMap(
            /** Include extensions from other modules in the same composition validation. */ (registered) =>
                registered.contributions.map(snapshotContribution)
        )
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
    // This plan is reused inside the atomic commit; checks must depend only on this snapshot and supplied definitions.
    const module = manifest.id;
    if (HashMap.has(state.modules, module)) return invalid(module, 'the module is already registered');
    const declaredFlags = new Map(
        manifest.flags.map(
            /** Resolve gates only from the module's declared flag definitions. */ (flag) => [flag.key, flag]
        )
    );
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
    const foreign = [...parts.resources, ...parts.contributions].find(
        /** Reject schema parts whose claimed owner differs from the registering manifest. */ (part) =>
            part.module !== module
    );
    if (foreign !== undefined)
        return invalid(module, `${foreign._tag.toLowerCase()} belongs to module ${foreign.module}`);
    const resources = mismatch(
        module,
        'provided',
        manifest.resources ?? [],
        parts.resources.map(
            /** Compare resource names with manifest claims independently of field composition. */ (resource) =>
                resource.name
        )
    );
    if (Option.isSome(resources)) return Either.left(resources.value);
    const composed = composeState(state, [
        { actions: [], resources: parts.resources, contributions: parts.contributions },
    ]);
    if (Either.isLeft(composed)) return Either.left(composed.left);
    return Either.right(entries);
};

/** Remove one module's owned bindings and schema inventory; closing an already absent registration is a no-op. */
const remove = (state: State, module: string): State =>
    Option.match(HashMap.get(state.modules, module), {
        /** Preserve snapshot identity when the requested module is already absent. */
        onNone: () => state,
        /** Delete the module and only the action names recorded by its successful atomic registration. */
        onSome: (registered) => ({
            modules: HashMap.remove(state.modules, module),
            actions: registered.actions.reduce(
                /** Remove each owned action while preserving unrelated modules' bindings. */ (actions, name) =>
                    HashMap.remove(actions, name),
                state.actions
            ),
        }),
    });

const outcomes: Readonly<Record<string, Outcome>> = {
    UnknownAction: 'unknown-action',
    InvalidInput: 'invalid-input',
    Unavailable: 'unavailable',
    Forbidden: 'forbidden',
};

/** Project execution into bounded telemetry outcomes without sending failure messages, input or outputs. */
const outcomeOf = <A>(exit: Exit.Exit<A, { readonly _tag: string }>): Outcome =>
    Exit.match(exit, {
        /** Mark a successful Exit independently of its potentially sensitive value. */
        onSuccess: () => 'succeeded',
        /** Inspect typed error tags only; defects and interruptions use the generic failure category. */
        onFailure: (cause) =>
            Option.match(Cause.failureOption(cause), {
                /** Avoid exporting untyped cause details into telemetry dimensions. */
                onNone: () => 'failed',
                /** Allow only the known bounded failure vocabulary; unknown tags remain generic. */
                onSome: (error) => outcomes[error._tag] ?? 'failed',
            }),
    });

/** The in-process action host. It evaluates flag gates with `Flags` and asks `Authorizer` on every call. */
export const ActionHostLive: Layer.Layer<
    ActionHost | ActionInventory,
    never,
    Flags | Authorizer | IdentityResolver | InputDigest | ExecutionPolicy | Approvals | Audit | Integrity
> = Layer.effectContext(
    Effect.gen(
        /** Build one isolated registry and bind invocation/discovery to the same trusted host services. */ function* () {
            // Registry state belongs to this layer instance; service capture must not create a process-global module registry.
            const flags = yield* Flags;
            const authorizer = yield* Authorizer;
            const identity = yield* IdentityResolver;
            const executor = yield* makeExecutor;
            const state = yield* Ref.make(emptyState);

            /** Validate and atomically register a module for the caller's scope, releasing its layer after unregistering its surface. */
            const register = <R = never, E = never>(
                module: ServerModule<R, E>
            ): Effect.Effect<ModuleManifest, RegistrationError, Scope.Scope> =>
                Effect.gen(
                    /** Decode and preflight before layer startup, then revalidate against current state at the atomic publication point. */ function* () {
                        const manifest = yield* Schema.decodeUnknown(ModuleManifest)(module.manifest).pipe(
                            Effect.mapError(
                                /** Expose only a bounded manifest-shape diagnostic rather than raw decoding details. */
                                () =>
                                    new InvalidModule({
                                        module: idOf(module.manifest),
                                        reason: 'Manifest does not match its schema.',
                                    })
                            )
                        );
                        const parts: Parts<R> = {
                            actions: module.actions,
                            // One admitted declaration snapshot governs preflight, activation waits and atomic publication.
                            resources: (module.resources ?? []).map(snapshotResource),
                            contributions: (module.contributions ?? []).map(snapshotContribution),
                        };
                        // Check first, so an invalid module never starts its layer.
                        yield* plan(yield* Ref.get(state), manifest, parts);
                        yield* validateDefinitions(
                            parts.actions.map(
                                /** Validate portable action definitions before any module services start. */ ({
                                    spec,
                                }) => spec
                            )
                        ).pipe(
                            Effect.mapError(
                                /** Attribute action-definition validation failure to this module's registration. */ (
                                    error
                                ) => new InvalidModule({ module: manifest.id, reason: error.message })
                            )
                        );

                        // The module scope is a child of the caller's scope. Its finalizer is added
                        // before the registration's, so removal runs first and release second.
                        const moduleScope = yield* Scope.fork(yield* Effect.scope, ExecutionStrategy.sequential);
                        /** Close the partially built module scope with the failure cause when activation or publication fails. */
                        const release = <E>(cause: Cause.Cause<E>) => Scope.close(moduleScope, Exit.failCause(cause));
                        // The no-layer union member can contain only service-free actions.
                        const bindings: ReadonlyArray<ActionBinding> =
                            module.layer === undefined
                                ? module.actions
                                : yield* Layer.buildWithScope(module.layer, moduleScope).pipe(
                                      Effect.catchAllDefect(
                                          /** Sanitize arbitrary layer defects before they escape module activation. */ () =>
                                              Effect.dieMessage('Module activation defect.')
                                      ),
                                      Effect.mapError(
                                          /** Convert typed provider failures to the fixed public activation-failure reason. */
                                          () => new ActivationFailed({ module: manifest.id, reason: 'layer-failed' })
                                      ),
                                      Effect.onError(release),
                                      Effect.map(
                                          /** Bind the built module environment only to execution, leaving preparation and host policy outside it. */ (
                                              context
                                          ) =>
                                              module.actions.map(
                                                  /** Retain the portable specification while capturing services required by its handler. */ (
                                                      implementation
                                                  ): ActionBinding => ({
                                                      spec: implementation.spec,
                                                      /** Prepare wire input without services, then provide captured module services to the deferred run effect. */
                                                      prepare: (input) =>
                                                          implementation.prepare(input).pipe(
                                                              Effect.map(
                                                                  /** Preserve captured policy operations and supply the handler's environment without rerunning the layer. */ (
                                                                      prepared
                                                                  ) => ({
                                                                      ...prepared,
                                                                      // Resolve only Caller at invocation time; every other captured module service keeps its precedence.
                                                                      run: Effect.contextWithEffect(
                                                                          /** Pick optional ambient Caller supplied by the executor without adding requirements to the closed module binding. */ (
                                                                              environment: Context.Context<never>
                                                                          ) =>
                                                                              Effect.provide(
                                                                                  prepared.run,
                                                                                  Context.merge(
                                                                                      context,
                                                                                      Context.pick(Caller)(environment)
                                                                                  )
                                                                              )
                                                                      ),
                                                                  })
                                                              )
                                                          ),
                                                  })
                                              )
                                      )
                                  );
                        const boundParts: Parts<never> = { ...parts, actions: bindings };

                        /** Replan against the latest registry and publish modules/actions together, leaving the snapshot untouched on failure. */
                        const commit = (
                            current: State
                        ): readonly [Either.Either<Planned<never>, RegistrationError>, State] => {
                            // Another registration may have won during layer startup, so the preflight plan is not sufficient authority to publish.
                            const result = plan(current, manifest, boundParts);
                            if (Either.isLeft(result)) return [result, current];
                            const next: State = {
                                modules: HashMap.set(current.modules, manifest.id, {
                                    actions: result.right.map(
                                        /** Record exact owned names for later scoped removal. */ ([name]) => name
                                    ),
                                    resources: parts.resources,
                                    contributions: parts.contributions,
                                }),
                                actions: result.right.reduce(
                                    /** Install bound handlers with their captured owner and flag metadata into the next immutable snapshot. */
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
                                Effect.flatMap(
                                    /** Lift the atomic plan result so a rejected registration triggers scope cleanup. */ (
                                        result
                                    ): Effect.Effect<Planned<never>, RegistrationError> => result
                                )
                            ),
                            /** Unpublish the registered surface before the earlier module-layer finalizer releases services. */ () =>
                                Ref.update(
                                    state,
                                    /** Remove from the latest snapshot without losing later unrelated registrations. */ (
                                        current
                                    ) => remove(current, manifest.id)
                                )
                        ).pipe(Effect.onError(release));
                        return manifest;
                    }
                );

            /** Execute against one captured registration, retaining durable invocation evidence and payload-free span outcomes. */
            const execute = <Wire>(action: string, input: Wire, options?: InvokeOptions) =>
                executor(
                    action,
                    input,
                    Effect.gen(
                        /** Resolve a live binding and reject action-version drift before input preparation. */ function* () {
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
                                available: Effect.gen(
                                    /** Reject removed/replaced bindings and reevaluate every captured gate for this execution checkpoint. */ function* () {
                                        // A same-name replacement is not the captured implementation; never authorize it using the earlier snapshot.
                                        const current = HashMap.get((yield* Ref.get(state)).actions, action);
                                        if (Option.isNone(current) || current.value !== entry.value)
                                            return yield* new UnknownAction({ action });
                                        for (const gate of gates) {
                                            const evaluation = yield* flags.evaluate(gate);
                                            if (!evaluation.value)
                                                return yield* new Unavailable({ action, reason: 'flag-off' });
                                        }
                                    }
                                ),
                            };
                        }
                    ),
                    options
                ).pipe(
                    Effect.onExit(
                        /** Annotate both outer audit failure and captured execution failure through the same bounded outcome vocabulary. */ (
                            exit
                        ) =>
                            Effect.annotateCurrentSpan(
                                Attributes.actionOutcome,
                                Exit.isFailure(exit) ? outcomeOf(exit) : outcomeOf(exit.value.result)
                            )
                    ),
                    Effect.withSpan(actionSpan(action), { attributes: { [Attributes.actionName]: action } })
                );

            /** Return the action's encoded result through the same audited engine, omitting receipt metadata only from the projection. */
            const invoke = <Wire>(action: string, input: Wire, options?: InvokeOptions) =>
                execute(action, input, options).pipe(
                    Effect.flatMap(
                        /** Restore the captured execution Exit to the result channel after receipt persistence. */ ({
                            result,
                        }) => result
                    )
                );

            /** Discover a validated sorted inventory for refreshed caller authority; decoded-target permission remains invocation-only. */
            const list = (presented: CallerIdentity) =>
                Effect.gen(
                    /** Filter one registry snapshot by current discovery permission and every flag before validating the visible inventory. */ function* () {
                        // Discovery uses trusted refreshed identity, not caller-supplied grants, but does not authorize a yet-unknown decoded target.
                        const caller = yield* identity
                            .resolve(presented)
                            .pipe(
                                Effect.mapError(
                                    /** Hide resolver failure details behind a fixed inventory denial. */ () =>
                                        new Forbidden({ action: '<inventory>', reason: 'identity-unavailable' })
                                )
                            );
                        const entries = [...HashMap.values((yield* Ref.get(state)).actions)].sort(
                            /** Keep inventory order stable by canonical action name, independently of registration order. */ (
                                a,
                                b
                            ) => a.spec.name.localeCompare(b.spec.name)
                        );
                        const visible: Array<ActionSpec> = [];
                        for (const entry of entries) {
                            const permitted = yield* authorizer.canInvoke(caller, entry.spec).pipe(
                                Effect.as(true),
                                Effect.catchTag(
                                    'Forbidden',
                                    /** Omit denied actions from discovery rather than expose their definitions. */ () =>
                                        Effect.succeed(false)
                                )
                            );
                            if (!permitted) continue;
                            const enabled = yield* Effect.forEach(
                                entry.gates,
                                /** Evaluate module and action gates with the same trusted flag service used by invocation. */ (
                                    gate
                                ) => flags.evaluate(gate)
                            );
                            if (
                                enabled.every(
                                    /** Require every gate, not merely one enabled flag, before revealing this specification. */ (
                                        evaluation
                                    ) => evaluation.value
                                )
                            )
                                visible.push(entry.spec);
                        }
                        return yield* validateInventory(visible);
                    }
                );

            return Context.make(
                ActionHost,
                ActionHost.of({
                    register,
                    actions: Ref.get(state).pipe(
                        Effect.map(
                            /** Expose sorted registered names without claiming caller-specific discovery visibility. */ (
                                current
                            ) => [...HashMap.keys(current.actions)].sort()
                        )
                    ),
                    schema: Ref.get(state).pipe(
                        Effect.flatMap(
                            /** Compose the current complete registry schema, including all registered contributions. */ (
                                current
                            ) => composeState(current)
                        )
                    ),
                    invoke,
                    execute,
                })
            ).pipe(
                Context.add(ActionInventory, {
                    list,
                    /** Find only within the caller's refreshed, filtered inventory; hidden actions remain indistinguishable from absent ones. */
                    find: (caller, id) =>
                        list(caller).pipe(
                            Effect.map(
                                /** Preserve absence as Option after applying the same discovery gates as list. */ (
                                    items
                                ) =>
                                    Option.fromNullable(
                                        items.find(
                                            /** Match the portable definition id rather than treating an unchecked lookup as authorization. */ (
                                                item
                                            ) => item.id === id
                                        )
                                    )
                            )
                        ),
                })
            );
        }
    )
);
