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
import { Context, Effect, Exit, Layer, Option, Ref, Schema } from 'effect';

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

const manifest = (id: string, actions: ReadonlyArray<string>, extra: object = {}) => ({
    format: 1,
    id,
    version: '1.0.0',
    description: 'Test module.',
    actions,
    flags: [gatedFlag],
    ...extra,
});

const counted = (calls: Ref.Ref<number>): ServerModule => ({
    manifest: manifest('maths', ['test.double', 'test.gated']),
    actions: [
        implement(Double, ({ value }) =>
            Ref.update(calls, (n) => n + 1).pipe(
                Effect.zipRight(
                    value > 100 ? Effect.fail(new LimitReached({ limit: 100 })) : Effect.succeed({ value: value * 2 })
                )
            )
        ),
        implement(Gated, () => Ref.update(calls, (n) => n + 1).pipe(Effect.as({}))),
    ],
});

const flagsOn = Layer.succeed(Flags, {
    evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, reason: 'STATIC', fallback: false }),
});
const person = (subject: string): CallerIdentity => ({
    subject: SubjectId.make(subject),
    kind: 'human',
    tenant: TenantId.make('0193a4f0-0000-7000-8000-0000000000aa'),
    session: SessionId.make('0193a4f0-0000-7000-8000-0000000000bb'),
});
const alice = person('0193a4f0-0000-7000-8000-000000000001');
const bob = person('0193a4f0-0000-7000-8000-000000000002');

const allowAll = Layer.succeed(Authorizer, { canInvoke: () => Effect.void, check: () => Effect.void });
// These existing host/lifecycle cases are independent of durable platform adapters.
// Use the explicitly volatile fixture, never a fallback in ActionHostLive.
const invocationServices = Layer.merge(
    Layer.unwrapScoped(Effect.map(makeTestOnlyHarness(alice), ({ TestOnly }) => TestOnly)),
    Layer.succeed(IdentityResolver, { resolve: (caller) => Effect.succeed(caller) })
);
const hostWith = (flags: Layer.Layer<Flags>, authorizer: Layer.Layer<Authorizer> = allowAll) =>
    Layer.merge(
        ActionHostLive.pipe(Layer.provide(flags), Layer.provide(authorizer), Layer.provide(invocationServices)),
        Layer.succeed(Caller, alice)
    );
const host = hostWith(FlagsSafeDefaults);

describe('ActionHost.invoke', () => {
    it.scoped('decodes wire input, runs the handler and encodes the output', () =>
        Effect.gen(function* () {
            const calls = yield* Ref.make(0);
            const actions = yield* ActionHost;
            yield* actions.register(counted(calls));
            expect(yield* actions.invoke('test.double', { value: '21' })).toEqual({ value: '42' });
            expect(yield* Ref.get(calls)).toBe(1);
        }).pipe(Effect.provide(host))
    );

    it.scoped('rejects invalid input and unknown actions without running a handler', () =>
        Effect.gen(function* () {
            const calls = yield* Ref.make(0);
            const actions = yield* ActionHost;
            yield* actions.register(counted(calls));
            const invalid = yield* Effect.flip(actions.invoke('test.double', { value: 21 }));
            expect(invalid._tag).toBe('InvalidInput');
            const unknown = yield* Effect.flip(actions.invoke('test.triple', { value: '1' }));
            expect(unknown).toMatchObject({ _tag: 'UnknownAction', action: 'test.triple' });
            expect(yield* Ref.get(calls)).toBe(0);
        }).pipe(Effect.provide(host))
    );

    it.scoped('encodes a declared error and treats an undeclared failure as a defect', () =>
        Effect.gen(function* () {
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
                actions: [implement(Fragile, () => Effect.fail('boom' as never))],
            });
            const exit = yield* Effect.exit(actions.invoke('test.fragile', {}));
            expect(
                Exit.isFailure(exit) && Exit.causeOption(exit).pipe(Option.exists((cause) => cause._tag === 'Die'))
            ).toBe(true);
        }).pipe(Effect.provide(host))
    );

    it.scoped('refuses a flagged action while its flag is off, before decoding or running it', () =>
        Effect.gen(function* () {
            const calls = yield* Ref.make(0);
            const actions = yield* ActionHost;
            yield* actions.register(counted(calls));
            const error = yield* Effect.flip(actions.invoke('test.gated', 'not an object'));
            expect(error).toMatchObject({ _tag: 'Unavailable', reason: 'flag-off' });
            expect(yield* Ref.get(calls)).toBe(0);
        }).pipe(Effect.provide(host))
    );

    it.scoped('runs a flagged action once its flag is on', () =>
        Effect.gen(function* () {
            const calls = yield* Ref.make(0);
            const actions = yield* ActionHost;
            yield* actions.register(counted(calls));
            expect(yield* actions.invoke('test.gated', {}, { idempotencyKey: 'gated-on' })).toEqual({});
            expect(yield* Ref.get(calls)).toBe(1);
        }).pipe(Effect.provide(hostWith(flagsOn)))
    );

    it.scoped('gates every action of a module behind the module flag', () =>
        Effect.gen(function* () {
            const calls = yield* Ref.make(0);
            const actions = yield* ActionHost;
            yield* actions.register({
                ...counted(calls),
                manifest: manifest('maths', ['test.double', 'test.gated'], { flag: gatedFlag.key }),
            });
            const error = yield* Effect.flip(actions.invoke('test.double', { value: '1' }));
            expect(error._tag).toBe('Unavailable');
        }).pipe(Effect.provide(host))
    );

    it.scoped('runs the handler inside the span action.<name>', () =>
        Effect.gen(function* () {
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
                    implement(Traced, () =>
                        Effect.orDie(Effect.currentSpan).pipe(
                            Effect.map((span) => ({
                                span: span.name,
                                action: String(span.attributes.get('eventiva.action.name')),
                            }))
                        )
                    ),
                ],
            });
            expect(yield* actions.invoke('test.traced', {})).toEqual({
                span: 'action.test.traced',
                action: 'test.traced',
            });
        }).pipe(Effect.provide(host))
    );
});

describe('ActionHost.register', () => {
    it.scoped('registers all of a module or none of it', () =>
        Effect.gen(function* () {
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
                        implement(Other, () => Effect.succeed({})),
                        implement(Double, () => Effect.succeed({ value: 0 })),
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
        }).pipe(Effect.provide(host))
    );

    it.scoped('rejects manifests that disagree with their implementations', () =>
        Effect.gen(function* () {
            const actions = yield* ActionHost;
            const calls = yield* Ref.make(0);
            const [double] = counted(calls).actions;
            const reasons = yield* Effect.forEach(
                [
                    { ...counted(calls), manifest: manifest('m1', ['test.double', 'test.gated', 'test.missing']) },
                    { ...counted(calls), manifest: manifest('m2', ['test.double']) },
                    { ...counted(calls), manifest: { ...manifest('m3', ['test.double', 'test.gated']), flags: [] } },
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
                (module) => Effect.flip(actions.register(module))
            );
            expect(reasons.map((error) => error._tag)).toEqual([
                'InvalidModule',
                'InvalidModule',
                'InvalidModule',
                'InvalidModule',
                'InvalidModule',
                'InvalidModule',
                'DuplicateAction',
            ]);
            expect(reasons[0]).toMatchObject({ module: 'm1', reason: 'declared but not implemented: test.missing' });
            expect(reasons[1]).toMatchObject({ reason: 'implemented but not declared: test.gated' });
            expect(reasons[4]).toMatchObject({ module: 'm5' });
            expect(reasons[5]).toMatchObject({ module: '<unknown>' });
            expect(yield* actions.actions).toEqual([]);
        }).pipe(Effect.provide(host))
    );

    it.scoped('rejects invalid action names, empty descriptions and a second registration of a module', () =>
        Effect.gen(function* () {
            const actions = yield* ActionHost;
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
                    actions: [implement(spec('Bad', 'x'), () => Effect.succeed({}))],
                })
            );
            expect(badName).toMatchObject({ reason: 'Bad is not a canonical action name' });
            const empty = yield* Effect.flip(
                actions.register({
                    manifest: manifest('m', ['m.a']),
                    actions: [implement(spec('m.a', ' '), () => Effect.succeed({}))],
                })
            );
            expect(empty).toMatchObject({ reason: 'm.a has no description' });
            yield* actions.register({
                manifest: manifest('m', ['m.a']),
                actions: [implement(spec('m.a', 'A.'), () => Effect.succeed({}))],
            });
            const twice = yield* Effect.flip(actions.register({ manifest: manifest('m', []), actions: [] }));
            expect(twice).toMatchObject({ reason: 'the module is already registered' });
        }).pipe(Effect.provide(host))
    );

    it.effect('removes a module when its scope closes, so it can register again', () =>
        Effect.gen(function* () {
            const calls = yield* Ref.make(0);
            const actions = yield* ActionHost;
            yield* Effect.scoped(
                Effect.gen(function* () {
                    yield* actions.register(counted(calls));
                    expect(yield* actions.actions).toEqual(['test.double', 'test.gated']);
                })
            );
            expect(yield* actions.actions).toEqual([]);
            expect((yield* Effect.flip(actions.invoke('test.double', { value: '1' })))._tag).toBe('UnknownAction');
            yield* Effect.scoped(actions.register(counted(calls)));
        }).pipe(Effect.provide(host))
    );
});

describe('ActionHost authorisation', () => {
    // Records what the authoriser saw, and denies according to the given rules.
    const recording = (
        seen: Ref.Ref<ReadonlyArray<string>>,
        rules: { readonly invoke?: (caller: CallerIdentity) => boolean; readonly target?: (input: unknown) => boolean }
    ) =>
        Layer.succeed(Authorizer, {
            canInvoke: (caller, action) =>
                Ref.update(seen, (log) => [...log, `invoke ${action.permission}`]).pipe(
                    Effect.zipRight(
                        (rules.invoke ?? (() => true))(caller)
                            ? Effect.void
                            : Effect.fail(new Forbidden({ action: action.name, reason: 'no grant' }))
                    )
                ),
            check: (_caller, action, input) =>
                Ref.update(seen, (log) => [...log, `check ${JSON.stringify(input)}`]).pipe(
                    Effect.zipRight(
                        (rules.target ?? (() => true))(input)
                            ? Effect.void
                            : Effect.fail(new Forbidden({ action: action.name, reason: 'not this target' }))
                    )
                ),
        });

    it.scoped('refuses an unauthorised caller before decoding, so invalid input is not revealed', () =>
        Effect.gen(function* () {
            const seen = yield* Ref.make<ReadonlyArray<string>>([]);
            const calls = yield* Ref.make(0);
            const run = Effect.gen(function* () {
                const actions = yield* ActionHost;
                yield* actions.register(counted(calls));
                return yield* Effect.flip(actions.invoke('test.double', { value: 21 }));
            });
            const error = yield* run.pipe(
                Effect.provide(hostWith(FlagsSafeDefaults, recording(seen, { invoke: () => false })))
            );
            expect(error).toMatchObject({ _tag: 'Forbidden', action: 'test.double', reason: 'no grant' });
            expect(yield* Ref.get(seen)).toEqual(['invoke test.double']);
            expect(yield* Ref.get(calls)).toBe(0);
        })
    );

    it.scoped('checks the decoded input and never runs the handler for a refused target', () =>
        Effect.gen(function* () {
            const seen = yield* Ref.make<ReadonlyArray<string>>([]);
            const calls = yield* Ref.make(0);
            const small = (input: unknown) => (input as { readonly value: number }).value < 10;
            const results = yield* Effect.gen(function* () {
                const actions = yield* ActionHost;
                yield* actions.register(counted(calls));
                const allowed = yield* actions.invoke('test.double', { value: '4' });
                const refused = yield* Effect.flip(actions.invoke('test.double', { value: '40' }));
                return [allowed, refused] as const;
            }).pipe(Effect.provide(hostWith(FlagsSafeDefaults, recording(seen, { target: small }))));
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
        })
    );

    it.scoped('does not consult the authoriser for an action whose flag is off', () =>
        Effect.gen(function* () {
            const seen = yield* Ref.make<ReadonlyArray<string>>([]);
            const calls = yield* Ref.make(0);
            const error = yield* Effect.gen(function* () {
                const actions = yield* ActionHost;
                yield* actions.register(counted(calls));
                return yield* Effect.flip(actions.invoke('test.gated', {}));
            }).pipe(Effect.provide(hostWith(FlagsSafeDefaults, recording(seen, {}))));
            expect(error._tag).toBe('Unavailable');
            expect(yield* Ref.get(seen)).toEqual([]);
        })
    );

    it.scoped('reads the caller on every call', () =>
        Effect.gen(function* () {
            const seen = yield* Ref.make<ReadonlyArray<string>>([]);
            const calls = yield* Ref.make(0);
            const onlyAlice = recording(seen, { invoke: (caller) => caller.subject === alice.subject });
            const [first, second] = yield* Effect.gen(function* () {
                const actions = yield* ActionHost;
                yield* actions.register(counted(calls));
                const asAlice = yield* actions
                    .invoke('test.double', { value: '1' })
                    .pipe(Effect.provideService(Caller, alice));
                const asBob = yield* Effect.flip(actions.invoke('test.double', { value: '1' })).pipe(
                    Effect.provideService(Caller, bob)
                );
                return [asAlice, asBob] as const;
            }).pipe(Effect.provide(hostWith(FlagsSafeDefaults, onlyAlice)));
            expect(first).toEqual({ value: '2' });
            expect(second._tag).toBe('Forbidden');
        })
    );
});

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

const storeModule = (
    layer: Layer.Layer<Store, unknown>,
    actions: ReadonlyArray<string> = [Label.name]
): ServerModule<Store> => ({
    manifest: manifest('store', actions),
    actions: [implement(Label, () => Effect.map(Store, ({ label }) => ({ label })))],
    layer,
});

describe('module lifecycle', () => {
    it.effect('builds a module layer once, serves its handlers from it and releases it after removing them', () =>
        Effect.gen(function* () {
            const log = yield* Ref.make<ReadonlyArray<string>>([]);
            const actions = yield* ActionHost;
            const layer = Layer.scoped(
                Store,
                Effect.acquireRelease(
                    Ref.update(log, (l) => [...l, 'acquire']).pipe(Effect.as({ label: 'main' })),
                    () =>
                        // Actions are already gone when the layer is released.
                        Effect.flatMap(actions.actions, (names) =>
                            Ref.update(log, (l) => [...l, `release with ${names.length} actions`])
                        )
                )
            );
            yield* Effect.scoped(
                Effect.gen(function* () {
                    yield* actions.register(storeModule(layer));
                    expect(yield* actions.invoke('store.label', {})).toEqual({ label: 'main' });
                    expect(yield* actions.invoke('store.label', {})).toEqual({ label: 'main' });
                })
            );
            expect(yield* Ref.get(log)).toEqual(['acquire', 'release with 0 actions']);
            expect(yield* actions.actions).toEqual([]);
        }).pipe(Effect.provide(host))
    );

    it.effect('releases what a failed layer acquired and registers nothing', () =>
        Effect.gen(function* () {
            const log = yield* Ref.make<ReadonlyArray<string>>([]);
            const actions = yield* ActionHost;
            const layer = Layer.scoped(
                Store,
                Effect.acquireRelease(
                    Ref.update(log, (l) => [...l, 'acquire']),
                    () => Ref.update(log, (l) => [...l, 'release'])
                ).pipe(Effect.zipRight(Effect.fail('no connection')))
            );
            const error = yield* Effect.flip(Effect.scoped(actions.register(storeModule(layer))));
            expect(error).toMatchObject({ _tag: 'ActivationFailed', module: 'store', cause: 'no connection' });
            expect(yield* Ref.get(log)).toEqual(['acquire', 'release']);
            expect(yield* actions.actions).toEqual([]);
        }).pipe(Effect.provide(host))
    );

    it.effect('never starts the layer of an invalid module', () =>
        Effect.gen(function* () {
            const log = yield* Ref.make<ReadonlyArray<string>>([]);
            const actions = yield* ActionHost;
            const layer = Layer.effect(
                Store,
                Ref.update(log, (l) => [...l, 'acquire']).pipe(Effect.as({ label: 'x' }))
            );
            const error = yield* Effect.flip(
                Effect.scoped(actions.register(storeModule(layer, [Label.name, 'store.missing'])))
            );
            expect(error._tag).toBe('InvalidModule');
            expect(yield* Ref.get(log)).toEqual([]);
        }).pipe(Effect.provide(host))
    );
});

describe('module schema', () => {
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
    const tickets = (fields: Resource.Fields): ServerModule => ({
        manifest: manifest('tickets', ['test.double', 'test.gated']),
        actions: [implement(Double, () => Effect.succeed({ value: 0 })), implement(Gated, () => Effect.succeed({}))],
        contributions: [contribute(Event, 'tickets', fields)],
    });
    const fieldsOf = (composed: {
        readonly resources: ReadonlyArray<{
            readonly fields: ReadonlyArray<{ readonly name: string; readonly module: string }>;
        }>;
    }) => composed.resources.flatMap((resource) => resource.fields.map((field) => `${field.module}:${field.name}`));

    it.effect('adds resources and contributions with their module and removes them with it', () =>
        Effect.gen(function* () {
            const actions = yield* ActionHost;
            yield* Effect.scoped(
                Effect.gen(function* () {
                    yield* actions.register(events);
                    yield* Effect.scoped(
                        Effect.gen(function* () {
                            yield* actions.register(tickets({ ticketLimit: Field.integer() }));
                            expect(fieldsOf(yield* actions.schema)).toEqual([
                                'events:id',
                                'tickets:ticketLimit',
                                'events:title',
                            ]);
                        })
                    );
                    expect(fieldsOf(yield* actions.schema)).toEqual(['events:id', 'events:title']);
                })
            );
            expect((yield* actions.schema).resources).toEqual([]);
        }).pipe(Effect.provide(host))
    );

    it.scoped('refuses a conflicting contribution and registers none of that module', () =>
        Effect.gen(function* () {
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
        }).pipe(Effect.provide(host))
    );

    it.scoped('requires every resource to be listed in the manifest and owned by the module', () =>
        Effect.gen(function* () {
            const actions = yield* ActionHost;
            const unlisted = yield* Effect.flip(actions.register({ ...events, manifest: manifest('events', []) }));
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
        }).pipe(Effect.provide(host))
    );
});
