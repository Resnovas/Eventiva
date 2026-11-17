/**
 * @file tests/runtime/src/host.spec.ts
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

import { define } from '@eventiva/contracts/action';
import { Authorizer, Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive, type ServerModule } from '@eventiva/runtime/host';
import { IdentityResolver } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { contribute } from '@eventiva/schema/compose';
import * as Field from '@eventiva/schema/field';
import * as Resource from '@eventiva/schema/resource';
import { describe, expect, it } from '@effect/vitest';
import { Cause, Context, Deferred, Effect, Exit, Fiber, Layer, Option, Ref, Schema, Scope } from 'effect';

/** Declare a schema-backed handler failure so encoding can be distinguished from undeclared defects. */
class LimitReached extends Schema.TaggedError<LimitReached>()('LimitReached', { limit: Schema.Int }) {}

// Input and output use transforming schemas, so a host that skips decoding or
// encoding returns visibly different values.
const Double = define('test.double', {
    version: 1,
    description: 'Double a number.',
    input: Schema.Struct({ value: Schema.NumberFromString }),
    output: Schema.Struct({ value: Schema.NumberFromString }),
    error: LimitReached,
    permission: 'test.double',
    sideEffect: 'read',
    offline: 'local',
});

const Gated = define('test.gated', {
    version: 1,
    description: 'An optional capability.',
    input: Schema.Struct({}),
    output: Schema.Struct({}),
    permission: 'test.gated',
    sideEffect: 'write',
    offline: 'queued',
    flag: 'test.gated-enabled',
});

const gatedFlag = { key: 'test.gated-enabled', description: 'Gate.', owner: 'test', safeDefault: false };

/** Build module metadata with explicit malformed-case overrides for registration validation. */
const manifest = (id: string, actions: ReadonlyArray<string>, extra: object = {}) => ({
    format: 1,
    id,
    version: '1.0.0',
    description: 'Test module.',
    actions,
    flags: [gatedFlag],
    ...extra,
});

/** Bind transforming and flagged actions to a shared entry counter without platform adapter dependencies. */
const counted = (calls: Ref.Ref<number>): ServerModule => ({
    manifest: manifest('maths', ['test.double', 'test.gated']),
    actions: [
        implement(
            Double,
            /** Double decoded values or emit the declared limit failure after counting entry. */ ({ value }) =>
                Ref.update(calls, /** Count executed handlers, not rejected host invocations. */ (n) => n + 1).pipe(
                    Effect.zipRight(
                        value > 100
                            ? Effect.fail(new LimitReached({ limit: 100 }))
                            : Effect.succeed({ value: value * 2 })
                    )
                )
        ),
        implement(
            Gated,
            /** Expose successful flag admission through the shared handler counter. */ () =>
                Ref.update(calls, /** Record one admitted gated handler execution. */ (n) => n + 1).pipe(Effect.as({}))
        ),
    ],
});

const flagsOn = Layer.succeed(Flags, {
    /** Force explicit feature enablement without changing production safe defaults. */
    evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, reason: 'STATIC', fallback: false }),
});
/** Build same-tenant humans with distinct subjects for per-invocation caller-policy checks. */
const person = (subject: string): CallerIdentity => ({
    subject: SubjectId.make(subject),
    kind: 'human',
    tenant: TenantId.make('0193a4f0-0000-7000-8000-0000000000aa'),
    session: SessionId.make('0193a4f0-0000-7000-8000-0000000000bb'),
});
const alice = person('0193a4f0-0000-7000-8000-000000000001');
const bob = person('0193a4f0-0000-7000-8000-000000000002');

const allowAll = Layer.succeed(Authorizer, {
    /** Isolate host mechanics from coarse permission policy in non-authorization cases. */ canInvoke: () =>
        Effect.void,
    /** Admit decoded targets in tests that exercise unrelated host behavior. */ check: () => Effect.void
});
// These existing host/lifecycle cases are independent of durable platform adapters.
// Use the explicitly volatile fixture, never a fallback in ActionHostLive.
const invocationServices = Layer.merge(
    Layer.unwrapScoped(
        Effect.map(
            makeTestOnlyHarness(alice),
            /** Extract explicitly volatile invocation services for host lifecycle tests. */ ({ TestOnly }) => TestOnly
        )
    ),
    Layer.succeed(IdentityResolver, {
        /** Preserve the presented caller so host policy tests can vary it independently per invocation. */ resolve: (
            caller
        ) => Effect.succeed(caller)
    })
);
/** Assemble a scoped host with selected flag/authorization policy and the default presented caller. */
const hostWith = (flags: Layer.Layer<Flags>, authorizer: Layer.Layer<Authorizer> = allowAll) =>
    Layer.merge(
        ActionHostLive.pipe(Layer.provide(flags), Layer.provide(authorizer), Layer.provide(invocationServices)),
        Layer.succeed(Caller, alice)
    );
const host = hostWith(FlagsSafeDefaults);

describe('ActionHost.invoke', /** Register wire-boundary, feature-gating and diagnostic privacy cases. */ () => {
    it.scoped(
        'decodes wire input, runs the handler and encodes the output',
        /** Invoke a transforming schema through the real host boundary. */ () =>
            Effect.gen(
                /** Require numeric handler computation between wire-string decoding and output encoding. */ function* () {
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* actions.register(counted(calls));
                    expect(yield* actions.invoke('test.double', { value: '21' })).toEqual({ value: '42' });
                    expect(yield* Ref.get(calls)).toBe(1);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'rejects invalid input and unknown actions without running a handler',
        /** Exercise invalid wire input and absent action discovery. */ () =>
            Effect.gen(
                /** Require typed preflight rejection without any handler execution. */ function* () {
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* actions.register(counted(calls));
                    const invalid = yield* Effect.flip(actions.invoke('test.double', { value: 21 }));
                    expect(invalid._tag).toBe('InvalidInput');
                    const unknown = yield* Effect.flip(actions.invoke('test.triple', { value: '1' }));
                    expect(unknown).toMatchObject({ _tag: 'UnknownAction', action: 'test.triple' });
                    expect(yield* Ref.get(calls)).toBe(0);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'encodes a declared error and treats an undeclared failure as a defect',
        /** Compare schema-declared failure with deliberate handler-contract violation. */ () =>
            Effect.gen(
                /** Require declared errors to encode while undeclared failures remain defects. */ function* () {
                    // The never assertion deliberately violates the handler contract to exercise the defensive host boundary.
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* actions.register(counted(calls));
                    const failed = yield* Effect.flip(actions.invoke('test.double', { value: '101' }));
                    expect(failed).toMatchObject({ _tag: 'ActionFailed', error: { _tag: 'LimitReached', limit: 100 } });

                    const Fragile = define('test.fragile', {
                        version: 1,
                        description: 'Declares no errors.',
                        input: Schema.Struct({}),
                        output: Schema.Struct({}),
                        permission: 'test.fragile',
                        sideEffect: 'read',
                        offline: 'local',
                    });
                    yield* actions.register({
                        manifest: manifest('fragile', ['test.fragile']),
                        actions: [
                            implement(
                                Fragile,
                                /** Inject an undeclared failure that a correctly typed implementation cannot return. */ () =>
                                    Effect.fail('boom' as never)
                            )
                        ],
                    });
                    const exit = yield* Effect.exit(actions.invoke('test.fragile', {}));
                    expect(
                        Exit.isFailure(exit) &&
                            Exit.causeOption(exit).pipe(
                                Option.exists(
                                    /** Confirm contract violation is classified as a defect rather than typed failure. */ (
                                        cause
                                    ) => cause._tag === 'Die'
                                )
                            )
                    ).toBe(true);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'refuses a flagged action while its flag is off, before decoding or running it',
        /** Supply invalid input to a disabled action as an ordering probe. */ () =>
            Effect.gen(
                /** Require flag denial to precede schema decoding and handler execution. */ function* () {
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* actions.register(counted(calls));
                    const error = yield* Effect.flip(actions.invoke('test.gated', 'not an object'));
                    expect(error).toMatchObject({ _tag: 'Unavailable', reason: 'flag-off' });
                    expect(yield* Ref.get(calls)).toBe(0);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'keeps invalid input, handler defects and non-JSON output out of returned diagnostics',
        /** Inject private canaries at input, handler and encoded-output boundaries. */ () =>
            Effect.gen(
                /** Require public diagnostics to omit payload and defect secrets while preserving outcome classification. */ function* () {
                    const actions = yield* ActionHost;
                    const calls = yield* Ref.make(0);
                    yield* actions.register(counted(calls));
                    const base = {
                        version: 1,
                        description: 'Exercise the validated wire boundary.',
                        input: Schema.Struct({}),
                        permission: 'test.redaction',
                        sideEffect: 'read' as const,
                        offline: 'local' as const,
                    };
                    const Defect = define('test.defect', { ...base, output: Schema.String });
                    const NonJson = define('test.non-json', { ...base, output: Schema.DateFromSelf });
                    yield* actions.register({
                        manifest: manifest('redaction', [Defect.name, NonJson.name]),
                        actions: [
                            implement(
                                Defect,
                                /** Raise a private defect whose contents must not cross the diagnostic boundary. */ () =>
                                    Effect.die({ secret: 'handler-secret-canary' })
                            ),
                            implement(
                                NonJson,
                                /** Return schema-valid but non-JSON data to exercise wire-output rejection. */ () =>
                                    Effect.succeed(new Date(0))
                            ),
                        ],
                    });
                    const invalid = yield* actions.execute(Double.name, { value: 'input-secret-canary' });
                    expect(invalid.receipt.outcome).toBe('denied');
                    // The fixture's TEST-ONLY digest deliberately contains canonical input, not a production hash.
                    expect(JSON.stringify(invalid.result)).not.toContain('input-secret-canary');
                    for (const name of [Defect.name, NonJson.name]) {
                        const result = yield* actions.execute(name, {});
                        expect(result.receipt.outcome).toBe('defect');
                        expect(Exit.isFailure(result.result)).toBe(true);
                        if (Exit.isFailure(result.result)) {
                            const diagnostic = Cause.pretty(result.result.cause);
                            expect(diagnostic).not.toContain('handler-secret-canary');
                            expect(diagnostic).not.toContain('1970');
                        }
                    }
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'runs a flagged action once its flag is on',
        /** Use explicit enablement as the positive gated-action control. */ () =>
            Effect.gen(
                /** Require enabled keyed mutation to reach its handler exactly once. */ function* () {
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* actions.register(counted(calls));
                    expect(yield* actions.invoke('test.gated', {}, { idempotencyKey: 'gated-on' })).toEqual({});
                    expect(yield* Ref.get(calls)).toBe(1);
                }
            ).pipe(Effect.provide(hostWith(flagsOn)))
    );

    it.scoped(
        'gates every action of a module behind the module flag',
        /** Apply a disabled module flag to an otherwise ungated action. */ () =>
            Effect.gen(
                /** Require module-level availability policy to cover all registered actions. */ function* () {
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* actions.register({
                        ...counted(calls),
                        manifest: manifest('maths', ['test.double', 'test.gated'], { flag: gatedFlag.key }),
                    });
                    const error = yield* Effect.flip(actions.invoke('test.double', { value: '1' }));
                    expect(error._tag).toBe('Unavailable');
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'runs the handler inside the span action.<name>',
        /** Observe the current span from inside an invoked handler. */ () =>
            Effect.gen(
                /** Require the host to install the action span and action-name attribute before handler entry. */ function* () {
                    const Traced = define('test.traced', {
                        version: 3,
                        description: 'Reports its span.',
                        input: Schema.Struct({}),
                        output: Schema.Struct({ span: Schema.String, action: Schema.String }),
                        permission: 'test.traced',
                        sideEffect: 'read',
                        offline: 'local',
                    });
                    const actions = yield* ActionHost;
                    yield* actions.register({
                        manifest: manifest('traced', ['test.traced']),
                        actions: [
                            implement(
                                Traced,
                                /** Report handler-visible tracing context instead of inventing an expected span externally. */ () =>
                                    Effect.orDie(Effect.currentSpan).pipe(
                                        Effect.map(
                                            /** Expose only the span name and action attribute required by this assertion. */ (
                                                span
                                            ) => ({
                                                span: span.name,
                                                action: String(span.attributes.get('eventiva.action.name')),
                                            })
                                        )
                                    )
                            ),
                        ],
                    });
                    expect(yield* actions.invoke('test.traced', {})).toEqual({
                        span: 'action.test.traced',
                        action: 'test.traced',
                    });
                }
            ).pipe(Effect.provide(host))
    );
});

describe('ActionHost.register', /** Register manifest validation, atomic admission and scoped removal cases. */ () => {
    it.scoped(
        'registers all of a module or none of it',
        /** Attempt a module combining a fresh action with a conflicting action. */ () =>
            Effect.gen(
                /** Require duplicate-action rejection to leave the complete prior registry unchanged. */ function* () {
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* actions.register(counted(calls));
                    const Other = define('test.other', {
                        version: 1,
                        description: 'New action.',
                        input: Schema.Struct({}),
                        output: Schema.Struct({}),
                        permission: 'test.other',
                        sideEffect: 'read',
                        offline: 'local',
                    });
                    const error = yield* Effect.flip(
                        actions.register({
                            manifest: manifest('clash', ['test.other', 'test.double']),
                            actions: [
                                implement(
                                    Other,
                                    /** Supply a valid fresh binding that must not be partially registered. */ () =>
                                        Effect.succeed({})
                                ),
                                implement(
                                    Double,
                                    /** Supply the conflicting action binding without relying on handler execution. */ () =>
                                        Effect.succeed({ value: 0 })
                                ),
                            ],
                        })
                    );
                    expect(error).toMatchObject({
                        _tag: 'DuplicateAction',
                        action: 'test.double',
                        module: 'clash',
                        registeredBy: 'maths',
                    });
                    expect(yield* actions.actions).toEqual(['test.double', 'test.gated']);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'rejects manifests that disagree with their implementations',
        /** Compare action, flag and manifest-shape mismatches through registration. */ () =>
            Effect.gen(
                /** Require every invalid module to fail without publishing any action. */ function* () {
                    const actions = yield* ActionHost;
                    const calls = yield* Ref.make(0);
                    const [double] = counted(calls).actions;
                    const reasons = yield* Effect.forEach(
                        [
                            {
                                ...counted(calls),
                                manifest: manifest('m1', ['test.double', 'test.gated', 'test.missing'])
                            },
                            { ...counted(calls), manifest: manifest('m2', ['test.double']) },
                            {
                                ...counted(calls),
                                manifest: { ...manifest('m3', ['test.double', 'test.gated']), flags: [] }
                            },
                            {
                                ...counted(calls),
                                manifest: manifest('m4', ['test.double', 'test.gated'], { flag: 'test.undeclared' }),
                            },
                            { ...counted(calls), manifest: { id: 'm5', format: 2 } },
                            { ...counted(calls), manifest: 'not a manifest' },
                            {
                                manifest: manifest('m7', ['test.double']),
                                actions: double === undefined ? [] : [double, double],
                            },
                        ],
                        /** Capture registration errors as values for ordered manifest-case assertions. */ (module) =>
                            Effect.flip(actions.register(module))
                    );
                    expect(
                        reasons.map(
                            /** Compare error categories without coupling every case to diagnostic prose. */ (error) =>
                                error._tag
                        )
                    ).toEqual([
                        'InvalidModule',
                        'InvalidModule',
                        'InvalidModule',
                        'InvalidModule',
                        'InvalidModule',
                        'InvalidModule',
                        'DuplicateAction',
                    ]);
                    expect(reasons[0]).toMatchObject({
                        module: 'm1',
                        reason: 'declared but not implemented: test.missing'
                    });
                    expect(reasons[1]).toMatchObject({ reason: 'implemented but not declared: test.gated' });
                    expect(reasons[4]).toMatchObject({ module: 'm5' });
                    expect(reasons[5]).toMatchObject({ module: '<unknown>' });
                    expect(yield* actions.actions).toEqual([]);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'rejects invalid action names, empty descriptions and a second registration of a module',
        /** Exercise malformed action metadata and duplicate module identity. */ () =>
            Effect.gen(
                /** Require canonical names, useful descriptions and unique module registration. */ function* () {
                    const actions = yield* ActionHost;
                    /** Vary only metadata under validation while keeping schemas and side-effect policy valid. */
                    const spec = (name: string, description: string) =>
                        define(name, {
                            version: 1,
                            description,
                            input: Schema.Struct({}),
                            output: Schema.Struct({}),
                            permission: name,
                            sideEffect: 'read',
                            offline: 'local',
                        });
                    const badName = yield* Effect.flip(
                        actions.register({
                            manifest: manifest('m', []),
                            actions: [
                                implement(
                                    spec('Bad', 'x'),
                                    /** Keep handler valid so registration failure isolates the noncanonical name. */ () =>
                                        Effect.succeed({})
                                )
                            ],
                        })
                    );
                    expect(badName).toMatchObject({ reason: 'Bad is not a canonical action name' });
                    const empty = yield* Effect.flip(
                        actions.register({
                            manifest: manifest('m', ['m.a']),
                            actions: [
                                implement(
                                    spec('m.a', ' '),
                                    /** Keep handler valid while testing an empty action description. */ () =>
                                        Effect.succeed({})
                                )
                            ],
                        })
                    );
                    expect(empty).toMatchObject({ reason: 'm.a has no description' });
                    yield* actions.register({
                        manifest: manifest('m', ['m.a']),
                        actions: [
                            implement(
                                spec('m.a', 'A.'),
                                /** Provide the valid control binding before duplicate module registration. */ () =>
                                    Effect.succeed({})
                            )
                        ],
                    });
                    const twice = yield* Effect.flip(actions.register({ manifest: manifest('m', []), actions: [] }));
                    expect(twice).toMatchObject({ reason: 'the module is already registered' });
                }
            ).pipe(Effect.provide(host))
    );

    it.effect(
        'removes a module when its scope closes, so it can register again',
        /** Open and close explicit registration scopes under a live host. */ () =>
            Effect.gen(
                /** Require scope finalization to remove action discovery and permit a later registration. */ function* () {
                    // Keep the host alive outside registration scope so removal is observable before host shutdown.
                    const calls = yield* Ref.make(0);
                    const actions = yield* ActionHost;
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Assert actions are discoverable only while their registration scope is open. */ function* () {
                                yield* actions.register(counted(calls));
                                expect(yield* actions.actions).toEqual(['test.double', 'test.gated']);
                            }
                        )
                    );
                    expect(yield* actions.actions).toEqual([]);
                    expect((yield* Effect.flip(actions.invoke('test.double', { value: '1' })))._tag).toBe(
                        'UnknownAction'
                    );
                    yield* Effect.scoped(actions.register(counted(calls)));
                }
            ).pipe(Effect.provide(host))
    );
});

describe('ActionHost authorisation', /** Register ordering, decoded-target and per-call identity authorization cases. */ () => {
    // Records what the authoriser saw, and denies according to the given rules.
    /** Log coarse and target checks while applying independently configurable denial predicates. */
    const recording = (
        seen: Ref.Ref<ReadonlyArray<string>>,
        rules: {
            /** Decide coarse caller permission before any input decoding. */ readonly invoke?: (
                caller: CallerIdentity
            ) => boolean;
            /** Decide target access using the already decoded input. */ readonly target?: (input: unknown) => boolean
        }
    ) =>
        Layer.succeed(Authorizer, {
            /** Record coarse permission entry and return Forbidden when the caller predicate denies. */
            canInvoke: (caller, action) =>
                Ref.update(
                    seen,
                    /** Preserve coarse-check order for boundary sequencing assertions. */ (log) => [
                        ...log,
                        `invoke ${action.permission}`
                    ]
                ).pipe(
                    Effect.zipRight(
                        (
                            rules.invoke ??
                            /** Admit coarse permission when this case tests only target policy. */ (() => true)
                        )(caller)
                            ? Effect.void
                            : Effect.fail(new Forbidden({ action: action.name, reason: 'no grant' }))
                    )
                ),
            /** Record the policy-visible decoded target and return Forbidden on target denial. */
            check: (_caller, action, input) =>
                Ref.update(
                    seen,
                    /** Capture the exact decoded target observed by the authorizer. */ (log) => [
                        ...log,
                        `check ${JSON.stringify(input)}`
                    ]
                ).pipe(
                    Effect.zipRight(
                        (
                            rules.target ??
                            /** Admit targets when this case configures only coarse caller permission. */ (() => true)
                        )(input)
                            ? Effect.void
                            : Effect.fail(new Forbidden({ action: action.name, reason: 'not this target' }))
                    )
                ),
        });

    it.scoped(
        'refuses an unauthorised caller before decoding, so invalid input is not revealed',
        /** Use malformed input to probe the coarse authorization boundary. */ () =>
            Effect.gen(
                /** Require caller denial before decoding can reveal input validity or invoke a handler. */ function* () {
                    const seen = yield* Ref.make<ReadonlyArray<string>>([]);
                    const calls = yield* Ref.make(0);
                    const run = Effect.gen(
                        /** Register the valid module and submit invalid input under the injected denial policy. */ function* () {
                            const actions = yield* ActionHost;
                            yield* actions.register(counted(calls));
                            return yield* Effect.flip(actions.invoke('test.double', { value: 21 }));
                        }
                    );
                    const error = yield* run.pipe(
                        Effect.provide(
                            hostWith(
                                FlagsSafeDefaults,
                                recording(seen, {
                                    /** Deny every caller to isolate coarse authorization ordering. */ invoke: () =>
                                        false
                                })
                            )
                        )
                    );
                    expect(error).toMatchObject({ _tag: 'Forbidden', action: 'test.double', reason: 'no grant' });
                    expect(yield* Ref.get(seen)).toEqual(['invoke test.double']);
                    expect(yield* Ref.get(calls)).toBe(0);
                }
            )
    );

    it.scoped(
        'checks the decoded input and never runs the handler for a refused target',
        /** Compare allowed and refused targets under one decoded-input policy. */ () =>
            Effect.gen(
                /** Require target checks on decoded values and no handler entry for refused targets. */ function* () {
                    const seen = yield* Ref.make<ReadonlyArray<string>>([]);
                    const calls = yield* Ref.make(0);
                    /** Admit only decoded numeric targets below ten; the host schema establishes this fixture shape. */
                    const small = (input: unknown) => (input as { readonly value: number }).value < 10;
                    const results = yield* Effect.gen(
                        /** Invoke the same registered action with one allowed and one forbidden wire value. */ function* () {
                            const actions = yield* ActionHost;
                            yield* actions.register(counted(calls));
                            const allowed = yield* actions.invoke('test.double', { value: '4' });
                            const refused = yield* Effect.flip(actions.invoke('test.double', { value: '40' }));
                            return [allowed, refused] as const;
                        }
                    ).pipe(Effect.provide(hostWith(FlagsSafeDefaults, recording(seen, { target: small }))));
                    expect(results[0]).toEqual({ value: '8' });
                    expect(results[1]).toMatchObject({ _tag: 'Forbidden', reason: 'not this target' });
                    // The policy sees the decoded number, not the wire string.
                    expect(yield* Ref.get(seen)).toEqual([
                        'invoke test.double',
                        'check {"value":4}',
                        'invoke test.double',
                        'check {"value":40}',
                    ]);
                    expect(yield* Ref.get(calls)).toBe(1);
                }
            )
    );

    it.scoped(
        'does not consult the authoriser for an action whose flag is off',
        /** Observe authorizer entry while the action uses safe-default disablement. */ () =>
            Effect.gen(
                /** Require availability gating to short-circuit both coarse and target authorization. */ function* () {
                    const seen = yield* Ref.make<ReadonlyArray<string>>([]);
                    const calls = yield* Ref.make(0);
                    const error = yield* Effect.gen(
                        /** Register and invoke the disabled action under the recording authorizer. */ function* () {
                            const actions = yield* ActionHost;
                            yield* actions.register(counted(calls));
                            return yield* Effect.flip(actions.invoke('test.gated', {}));
                        }
                    ).pipe(Effect.provide(hostWith(FlagsSafeDefaults, recording(seen, {}))));
                    expect(error._tag).toBe('Unavailable');
                    expect(yield* Ref.get(seen)).toEqual([]);
                }
            )
    );

    it.scoped(
        'reads the caller on every call',
        /** Reuse a registration while changing the caller service between invocations. */ () =>
            Effect.gen(
                /** Require authorization to observe each invocation's caller rather than retaining registration identity. */ function* () {
                    const seen = yield* Ref.make<ReadonlyArray<string>>([]);
                    const calls = yield* Ref.make(0);
                    const onlyAlice = recording(seen, {
                        /** Grant only Alice's subject so caller reuse would incorrectly admit Bob. */ invoke: (
                            caller
                        ) => caller.subject === alice.subject
                    });
                    const [first, second] = yield* Effect.gen(
                        /** Invoke under Alice and Bob independently without rebuilding the registered module. */ function* () {
                            // Caller provision surrounds each invocation, not module registration.
                            const actions = yield* ActionHost;
                            yield* actions.register(counted(calls));
                            const asAlice = yield* actions
                                .invoke('test.double', { value: '1' })
                                .pipe(Effect.provideService(Caller, alice));
                            const asBob = yield* Effect.flip(actions.invoke('test.double', { value: '1' })).pipe(
                                Effect.provideService(Caller, bob)
                            );
                            return [asAlice, asBob] as const;
                        }
                    ).pipe(Effect.provide(hostWith(FlagsSafeDefaults, onlyAlice)));
                    expect(first).toEqual({ value: '2' });
                    expect(second._tag).toBe('Forbidden');
                }
            )
    );
});

/** Represent a module-owned dependency whose scoped acquisition and release are observable in lifecycle tests. */
class Store extends Context.Tag('test/Store')<Store, { readonly label: string }>() {}

const Label = define('store.label', {
    version: 1,
    description: 'Read the store label.',
    input: Schema.Struct({}),
    output: Schema.Struct({ label: Schema.String }),
    permission: 'store.label',
    sideEffect: 'read',
    offline: 'local',
});

/** Bind a handler requiring Store to its module-provided layer, optionally mismatching manifest action names. */
const storeModule = <E>(
    layer: Layer.Layer<Store, E>,
    actions: ReadonlyArray<string> = [Label.name]
): ServerModule<Store, E> => ({
    manifest: manifest('store', actions),
    actions: [
        implement(
            Label,
            /** Read the Store supplied by this module's scoped layer. */ () =>
                Effect.map(
                    Store,
                    /** Expose the injected label without retaining the service object. */ ({ label }) => ({ label })
                )
        )
    ],
    layer,
});

describe('module lifecycle', /** Register dependency ownership, failed activation and admission-order cases. */ () => {
    it.effect(
        'builds a module layer once, serves its handlers from it and releases it after removing them',
        /** Keep the host alive while a module dependency scope opens and closes. */ () =>
            Effect.gen(
                /** Require a single dependency acquisition and release only after handlers leave discovery. */ function* () {
                    // Release inspects the still-live host registry, proving removal precedes dependency finalization.
                    const log = yield* Ref.make<ReadonlyArray<string>>([]);
                    const actions = yield* ActionHost;
                    const layer = Layer.scoped(
                        Store,
                        Effect.acquireRelease(
                            Ref.update(
                                log,
                                /** Record dependency acquisition independently of handler count. */ (l) => [
                                    ...l,
                                    'acquire'
                                ]
                            ).pipe(Effect.as({ label: 'main' })),
                            /** Inspect registry state at dependency release, after module removal. */ () =>
                                // Actions are already gone when the layer is released.
                                Effect.flatMap(
                                    actions.actions,
                                    /** Bind the registry snapshot observed during finalization into the release log. */ (
                                        names
                                    ) =>
                                        Ref.update(
                                            log,
                                            /** Record how many actions remained when the dependency was released. */ (
                                                l
                                            ) => [...l, `release with ${names.length} actions`]
                                        )
                                )
                        )
                    );
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Invoke twice within one registration to detect accidental per-call layer acquisition. */ function* () {
                                yield* actions.register(storeModule(layer));
                                expect(yield* actions.invoke('store.label', {})).toEqual({ label: 'main' });
                                expect(yield* actions.invoke('store.label', {})).toEqual({ label: 'main' });
                            }
                        )
                    );
                    expect(yield* Ref.get(log)).toEqual(['acquire', 'release with 0 actions']);
                    expect(yield* actions.actions).toEqual([]);
                }
            ).pipe(Effect.provide(host))
    );

    it.effect(
        'releases what a failed layer acquired and registers nothing',
        /** Fail activation only after a scoped dependency has been acquired. */ () =>
            Effect.gen(
                /** Require rollback cleanup, no published handlers and sanitized activation diagnostics. */ function* () {
                    const log = yield* Ref.make<ReadonlyArray<string>>([]);
                    const actions = yield* ActionHost;
                    const layer = Layer.scoped(
                        Store,
                        Effect.acquireRelease(
                            Ref.update(
                                log,
                                /** Mark the resource as acquired before activation fails. */ (l) => [...l, 'acquire']
                            ),
                            /** Observe cleanup of a partially activated module dependency. */ () =>
                                Ref.update(
                                    log,
                                    /** Record release even though registration never succeeded. */ (l) => [
                                        ...l,
                                        'release'
                                    ]
                                )
                        ).pipe(Effect.zipRight(Effect.fail({ secret: 'activation-secret-canary' })))
                    );
                    const error = yield* Effect.flip(Effect.scoped(actions.register(storeModule(layer))));
                    expect(error).toMatchObject({ _tag: 'ActivationFailed', module: 'store', reason: 'layer-failed' });
                    expect(error).not.toHaveProperty('cause');
                    expect(JSON.stringify(error)).not.toContain('activation-secret-canary');
                    expect(String(error)).not.toContain('activation-secret-canary');
                    expect(yield* Ref.get(log)).toEqual(['acquire', 'release']);
                    expect(yield* actions.actions).toEqual([]);
                }
            ).pipe(Effect.provide(host))
    );

    it.effect(
        'never starts the layer of an invalid module',
        /** Give a malformed module a visibly effectful dependency layer. */ () =>
            Effect.gen(
                /** Require manifest validation before any dependency acquisition side effect. */ function* () {
                    const log = yield* Ref.make<ReadonlyArray<string>>([]);
                    const actions = yield* ActionHost;
                    const layer = Layer.effect(
                        Store,
                        Ref.update(
                            log,
                            /** Detect activation that must not happen for a rejected manifest. */ (l) => [
                                ...l,
                                'acquire'
                            ]
                        ).pipe(Effect.as({ label: 'x' }))
                    );
                    const error = yield* Effect.flip(
                        Effect.scoped(actions.register(storeModule(layer, [Label.name, 'store.missing'])))
                    );
                    expect(error._tag).toBe('InvalidModule');
                    expect(yield* Ref.get(log)).toEqual([]);
                }
            ).pipe(Effect.provide(host))
    );
});

describe('module schema', /** Register resource/contribution ownership, conflict and scoped removal cases. */ () => {
    const Event = Resource.make('events.event', {
        module: 'events',
        version: 1,
        plane: 'tenant',
        consistency: 'record',
        fields: { id: Field.id(), title: Field.text({ maxLength: 200 }) },
    });
    const events: ServerModule = {
        manifest: manifest('events', [], { resources: [Event.name] }),
        actions: [],
        resources: [Event],
    };
    /** Contribute caller-selected fields to the events resource with otherwise valid action bindings. */
    const tickets = (fields: Resource.Fields): ServerModule => ({
        manifest: manifest('tickets', ['test.double', 'test.gated']),
        actions: [
            implement(
                Double,
                /** Supply a valid transforming-action result while schema composition is under test. */ () =>
                    Effect.succeed({ value: 0 })
            ),
            implement(
                Gated,
                /** Supply a valid gated binding independent of contribution validity. */ () => Effect.succeed({})
            )
        ],
        contributions: [contribute(Event, 'tickets', fields)],
    });
    /** Project ordered field ownership pairs so scope removal can distinguish base and contributed fields. */
    const fieldsOf = (composed: {
        readonly resources: ReadonlyArray<{
            readonly fields: ReadonlyArray<{ readonly name: string; readonly module: string }>;
        }>;
    }) =>
        composed.resources.flatMap(
            /** Preserve resource ordering while flattening owned fields. */ (resource) =>
                resource.fields.map(
                    /** Expose each field's contributor alongside its local name. */ (field) =>
                        `${field.module}:${field.name}`
                )
        );

    it.scoped(
        'isolates admitted declarations and returned views until their own scopes close',
        /** Mutate ordinary typed fixture inputs and public views without casting away readonly contracts. */ () =>
            Effect.gen(
                /** Preserve ownership, protection and exact value schemas despite unscoped caller mutations. */ function* () {
                    // Independent scopes distinguish real unregistering from accidental declaration aliasing.
                    const actions = yield* ActionHost;
                    const baseScope = yield* Scope.make();
                    const addonScope = yield* Scope.make();
                    yield* Effect.addFinalizer(
                        /** Close both fixture scopes even if a regression assertion fails. */ () =>
                            Scope.close(addonScope, Exit.void).pipe(Effect.zipRight(Scope.close(baseScope, Exit.void)))
                    );
                    const title = { ...Field.text().pipe(Field.classify('sensitive'), Field.label('probe.title')) };
                    const ownFields: Record<string, Field.Field> = { title };
                    const resource = {
                        ...Resource.make('probe.record', {
                            module: 'probe',
                            version: 1,
                            plane: 'tenant',
                            consistency: 'record',
                            security: 'sensitive',
                            fields: ownFields,
                        }),
                        name: 'probe.record',
                    };
                    const resources = [resource];
                    const limit = { ...Field.integer().pipe(Field.classify('sensitive')) };
                    const addedFields: Record<string, Field.Field> = { limit };
                    const contribution = { ...contribute(resource, 'addon', addedFields) };
                    const contributions = [contribution];
                    yield* actions
                        .register({
                            manifest: manifest('probe', [], { resources: ['probe.record'] }),
                            actions: [],
                            resources,
                        })
                        .pipe(Scope.extend(baseScope));
                    yield* actions
                        .register({ manifest: manifest('addon', []), actions: [], contributions })
                        .pipe(Scope.extend(addonScope));
                    const control = yield* actions.schema;
                    expect(fieldsOf(control)).toEqual(['addon:limit', 'probe:title']);

                    contributions.length = 0;
                    expect(fieldsOf(yield* actions.schema)).toEqual(['addon:limit', 'probe:title']);
                    // Reflection attempts writes through the public readonly view without manufacturing a mutable host type.
                    for (const view of control.resources) {
                        Reflect.set(view.resource, 'security', 'baseline');
                        Reflect.set(view.resource, 'module', 'intruder');
                        Reflect.set(view.resource.fields, 'injected', Field.text());
                        for (const field of view.fields) {
                            Reflect.set(field.field, 'security', 'baseline');
                            Reflect.set(field.field.label, 'value', 'probe.corrupted');
                            Reflect.set(field.field.target, '_tag', 'Some');
                            Reflect.set(field.field.target, 'value', 'probe.missing');
                            Reflect.set(field, 'module', 'intruder');
                        }
                    }
                    resources.length = 0;
                    resource.name = 'probe.changed';
                    resource.module = 'intruder';
                    resource.security = 'vault';
                    resource.version = 9;
                    title.security = 'baseline';
                    Reflect.set(title.label, 'value', 'probe.changed');
                    limit.security = 'baseline';
                    contribution.module = 'intruder';
                    contribution.target = 'probe.missing';
                    delete ownFields.title;
                    ownFields.injected = Field.text();
                    delete addedFields.limit;
                    addedFields.injected = Field.text();
                    const stable = yield* actions.schema;
                    expect(fieldsOf(stable)).toEqual(['addon:limit', 'probe:title']);
                    expect(stable.resources[0]?.resource).toMatchObject({
                        name: 'probe.record',
                        module: 'probe',
                        security: 'sensitive',
                        version: 1,
                    });
                    for (const view of stable.resources) {
                        expect(Object.keys(view.resource.fields)).toEqual(['title']);
                        for (const field of view.fields) {
                            expect(field.field.security).toBe('sensitive');
                            expect(field.field.target.pipe(Option.isNone)).toBe(true);
                            expect(field.field.label.pipe(Option.getOrUndefined)).toBe(
                                field.name === 'title' ? 'probe.title' : undefined
                            );
                            const original = field.name === 'title' ? title : limit;
                            expect(field.field.schema).toBe(original.schema);
                            expect(field.field.schema.ast).toBe(original.schema.ast);
                            expect(Reflect.get(field.field, 'ast')).toBe(original.ast);
                        }
                    }
                    yield* actions
                        .register({
                            manifest: manifest('later', []),
                            actions: [],
                            contributions: [
                                contribute('probe.record', 'later', {
                                    extra: Field.integer().pipe(Field.classify('sensitive')),
                                }),
                            ],
                        })
                        .pipe(Scope.extend(addonScope));
                    const weakened = yield* Effect.flip(
                        actions.register({
                            manifest: manifest('weak', []),
                            actions: [],
                            contributions: [contribute('probe.record', 'weak', { weak: Field.text() })],
                        })
                    );
                    expect(weakened._tag).toBe('WeakerClassification');
                    yield* Scope.close(addonScope, Exit.void);
                    expect(fieldsOf(yield* actions.schema)).toEqual(['probe:title']);
                    yield* Scope.close(baseScope, Exit.void);
                    expect((yield* actions.schema).resources).toEqual([]);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'publishes the preflight schema snapshot after activation waits and rechecks concurrent conflicts',
        /** Use a deterministic layer barrier to mutate declarations between preflight and atomic publication. */ () =>
            Effect.gen(
                /** Keep activation cleanup and latest-state composition authoritative without rereading caller declarations. */ function* () {
                    const actions = yield* ActionHost;
                    yield* actions.register(events);
                    const entered = yield* Deferred.make<void>();
                    const resume = yield* Deferred.make<void>();
                    const releases = yield* Ref.make(0);
                    const fields: Record<string, Field.Field> = { limit: Field.integer() };
                    const contribution = { ...contribute(Event, 'waiting', fields) };
                    const contributions = [contribution];
                    const resource = {
                        ...Resource.make('waiting.record', {
                            module: 'waiting',
                            version: 1,
                            plane: 'tenant',
                            consistency: 'record',
                            fields: { title: Field.text() },
                        }),
                    };
                    const resources = [resource];
                    const layer = Layer.scoped(
                        Store,
                        Effect.acquireRelease(
                            Deferred.succeed(entered, undefined).pipe(
                                Effect.zipRight(Deferred.await(resume)),
                                Effect.as({ label: 'waiting' })
                            ),
                            /** Count each acquired module dependency release, including failed atomic publication. */ () =>
                                Ref.update(
                                    releases,
                                    /** Increment the cleanup count once per acquired layer. */ (n) => n + 1
                                )
                        )
                    );
                    const scope = yield* Scope.make();
                    yield* Effect.addFinalizer(
                        /** Close the independent registration scope on assertion failure too. */ () =>
                            Scope.close(scope, Exit.void)
                    );
                    const candidate = {
                        manifest: manifest('waiting', [], { resources: ['waiting.record'] }),
                        actions: [],
                        resources,
                        contributions,
                        layer,
                    };
                    const pending = yield* actions.register(candidate).pipe(Scope.extend(scope), Effect.fork);
                    yield* Deferred.await(entered);
                    contributions.length = 0;
                    fields.injected = Field.text();
                    contribution.module = 'intruder';
                    resources.length = 0;
                    resource.module = 'intruder';
                    yield* Deferred.succeed(resume, undefined);
                    yield* Fiber.join(pending);
                    expect(fieldsOf(yield* actions.schema)).toEqual([
                        'events:id',
                        'waiting:limit',
                        'events:title',
                        'waiting:title',
                    ]);
                    yield* Scope.close(scope, Exit.void);
                    expect(yield* Ref.get(releases)).toBe(1);
                    expect(fieldsOf(yield* actions.schema)).toEqual(['events:id', 'events:title']);

                    // A valid preflight must still lose atomically if another registration takes its field while activation waits.
                    const conflictEntered = yield* Deferred.make<void>();
                    const conflictResume = yield* Deferred.make<void>();
                    const conflictLayer = Layer.scoped(
                        Store,
                        Effect.acquireRelease(
                            Deferred.succeed(conflictEntered, undefined).pipe(
                                Effect.zipRight(Deferred.await(conflictResume)),
                                Effect.as({ label: 'conflict' })
                            ),
                            /** Release the losing candidate's acquired dependency on commit rejection. */ () =>
                                Ref.update(releases, /** Count the failed candidate's single release. */ (n) => n + 1)
                        )
                    );
                    const conflict = yield* actions
                        .register({
                            manifest: manifest('loser', [], { resources: ['loser.record'] }),
                            actions: [],
                            resources: [
                                Resource.make('loser.record', {
                                    module: 'loser',
                                    version: 1,
                                    plane: 'tenant',
                                    consistency: 'record',
                                    fields: {},
                                }),
                            ],
                            contributions: [contribute(Event, 'loser', { limit: Field.integer() })],
                            layer: conflictLayer,
                        })
                        .pipe(Effect.either, Effect.fork);
                    yield* Deferred.await(conflictEntered);
                    yield* actions.register({
                        manifest: manifest('winner', []),
                        actions: [],
                        contributions: [contribute(Event, 'winner', { limit: Field.integer() })],
                    });
                    yield* Deferred.succeed(conflictResume, undefined);
                    expect(yield* Fiber.join(conflict)).toMatchObject({
                        _tag: 'Left',
                        left: { _tag: 'DuplicateField' },
                    });
                    expect(fieldsOf(yield* actions.schema)).toEqual(['events:id', 'winner:limit', 'events:title']);
                    expect((yield* actions.schema).resources).toHaveLength(1);
                    expect(yield* Ref.get(releases)).toBe(2);
                }
            ).pipe(Effect.provide(host))
    );

    it.effect(
        'adds resources and contributions with their module and removes them with it',
        /** Nest contributor registration inside its base resource scope. */ () =>
            Effect.gen(
                /** Require contribution cleanup to preserve base fields until their own module closes. */ function* () {
                    // Nested scopes expose contributor removal separately from removal of the resource owner.
                    const actions = yield* ActionHost;
                    yield* Effect.scoped(
                        Effect.gen(
                            /** Hold base resources open across contributor registration and removal. */ function* () {
                                yield* actions.register(events);
                                yield* Effect.scoped(
                                    Effect.gen(
                                        /** Verify contributed ownership while both modules are registered. */ function* () {
                                            yield* actions.register(tickets({ ticketLimit: Field.integer() }));
                                            expect(fieldsOf(yield* actions.schema)).toEqual([
                                                'events:id',
                                                'tickets:ticketLimit',
                                                'events:title',
                                            ]);
                                        }
                                    )
                                );
                                expect(fieldsOf(yield* actions.schema)).toEqual(['events:id', 'events:title']);
                            }
                        )
                    );
                    expect((yield* actions.schema).resources).toEqual([]);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'refuses a conflicting contribution and registers none of that module',
        /** Attempt to contribute an already owned base field name. */ () =>
            Effect.gen(
                /** Require schema conflict to reject the whole module, including its unrelated action bindings. */ function* () {
                    const actions = yield* ActionHost;
                    yield* actions.register(events);
                    const error = yield* Effect.flip(actions.register(tickets({ title: Field.text() })));
                    expect(error).toMatchObject({
                        _tag: 'DuplicateField',
                        resource: 'events.event',
                        field: 'title',
                        modules: ['events', 'tickets'],
                    });
                    expect(yield* actions.actions).toEqual([]);
                    expect(fieldsOf(yield* actions.schema)).toEqual(['events:id', 'events:title']);
                }
            ).pipe(Effect.provide(host))
    );

    it.scoped(
        'requires every resource to be listed in the manifest and owned by the module',
        /** Exercise missing declarations, missing definitions, foreign ownership and orphan contributions. */ () =>
            Effect.gen(
                /** Require manifest/resource agreement and a registered target owner before contribution admission. */ function* () {
                    const actions = yield* ActionHost;
                    const unlisted = yield* Effect.flip(
                        actions.register({ ...events, manifest: manifest('events', []) })
                    );
                    expect(unlisted).toMatchObject({
                        _tag: 'InvalidModule',
                        reason: 'provided but not declared: events.event',
                    });
                    const missing = yield* Effect.flip(
                        actions.register({
                            ...events,
                            resources: [],
                            manifest: manifest('events', [], { resources: [Event.name] }),
                        })
                    );
                    expect(missing).toMatchObject({ reason: 'declared but not provided: events.event' });
                    const foreign = yield* Effect.flip(
                        actions.register({ ...events, manifest: manifest('other', [], { resources: [Event.name] }) })
                    );
                    expect(foreign).toMatchObject({ module: 'other', reason: 'resource belongs to module events' });
                    const orphan = yield* Effect.flip(actions.register(tickets({ ticketLimit: Field.integer() })));
                    expect(orphan).toMatchObject({ _tag: 'UnknownTarget', target: 'events.event' });
                }
            ).pipe(Effect.provide(host))
    );
});
