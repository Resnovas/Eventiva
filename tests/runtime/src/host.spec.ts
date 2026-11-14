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
import { Flags, FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive, type ServerModule } from '@eventiva/runtime/host';
import { describe, expect, it } from '@effect/vitest';
import { Effect, Exit, Layer, Option, Ref, Schema } from 'effect';

class LimitReached extends Schema.TaggedError<LimitReached>()('LimitReached', { limit: Schema.Int }) {}

// Input and output use transforming schemas, so a host that skips decoding or
// encoding returns visibly different values.
const Double = define('test.double', {
    version: 1,
    description: 'Double a number.',
    input: Schema.Struct({ value: Schema.NumberFromString }),
    output: Schema.Struct({ value: Schema.NumberFromString }),
    error: LimitReached,
    sideEffect: 'read',
    offline: 'local',
});

const Gated = define('test.gated', {
    version: 1,
    description: 'An optional capability.',
    input: Schema.Struct({}),
    output: Schema.Struct({}),
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
                Effect.zipRight(value > 100 ? Effect.fail(new LimitReached({ limit: 100 })) : Effect.succeed({ value: value * 2 }))
            )
        ),
        implement(Gated, () => Ref.update(calls, (n) => n + 1).pipe(Effect.as({}))),
    ],
});

const flagsOn = Layer.succeed(Flags, {
    evaluate: (flag) => Effect.succeed({ flag: flag.key, value: true, reason: 'STATIC', fallback: false }),
});
const host = ActionHostLive.pipe(Layer.provide(FlagsSafeDefaults));

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
                sideEffect: 'read',
                offline: 'local',
            });
            yield* actions.register({
                manifest: manifest('fragile', ['test.fragile']),
                actions: [implement(Fragile, () => Effect.fail('boom' as never))],
            });
            const exit = yield* Effect.exit(actions.invoke('test.fragile', {}));
            expect(Exit.isFailure(exit) && Exit.causeOption(exit).pipe(Option.exists((cause) => cause._tag === 'Die'))).toBe(
                true
            );
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
            expect(yield* actions.invoke('test.gated', {})).toEqual({});
            expect(yield* Ref.get(calls)).toBe(1);
        }).pipe(Effect.provide(ActionHostLive.pipe(Layer.provide(flagsOn))))
    );

    it.scoped('gates every action of a module behind the module flag', () =>
        Effect.gen(function* () {
            const calls = yield* Ref.make(0);
            const actions = yield* ActionHost;
            yield* actions.register({ ...counted(calls), manifest: manifest('maths', ['test.double', 'test.gated'], { flag: gatedFlag.key }) });
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
                sideEffect: 'read',
                offline: 'local',
            });
            const actions = yield* ActionHost;
            yield* actions.register({
                manifest: manifest('traced', ['test.traced']),
                actions: [
                    implement(Traced, () =>
                        Effect.orDie(Effect.currentSpan).pipe(
                            Effect.map((span) => ({ span: span.name, action: String(span.attributes.get('eventiva.action.name')) }))
                        )
                    ),
                ],
            });
            expect(yield* actions.invoke('test.traced', {})).toEqual({ span: 'action.test.traced', action: 'test.traced' });
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
                sideEffect: 'read',
                offline: 'local',
            });
            const error = yield* Effect.flip(
                actions.register({
                    manifest: manifest('clash', ['test.other', 'test.double']),
                    actions: [implement(Other, () => Effect.succeed({})), implement(Double, () => Effect.succeed({ value: 0 }))],
                })
            );
            expect(error).toMatchObject({ _tag: 'DuplicateAction', action: 'test.double', module: 'clash', registeredBy: 'maths' });
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
                    { ...counted(calls), manifest: manifest('m4', ['test.double', 'test.gated'], { flag: 'test.undeclared' }) },
                    { ...counted(calls), manifest: { id: 'm5', format: 2 } },
                    { ...counted(calls), manifest: 'not a manifest' },
                    { manifest: manifest('m7', ['test.double']), actions: double === undefined ? [] : [double, double] },
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
                    sideEffect: 'read',
                    offline: 'local',
                });
            const badName = yield* Effect.flip(
                actions.register({ manifest: manifest('m', []), actions: [implement(spec('Bad', 'x'), () => Effect.succeed({}))] })
            );
            expect(badName).toMatchObject({ reason: 'Bad is not a canonical action name' });
            const empty = yield* Effect.flip(
                actions.register({ manifest: manifest('m', ['m.a']), actions: [implement(spec('m.a', ' '), () => Effect.succeed({}))] })
            );
            expect(empty).toMatchObject({ reason: 'm.a has no description' });
            yield* actions.register({ manifest: manifest('m', ['m.a']), actions: [implement(spec('m.a', 'A.'), () => Effect.succeed({}))] });
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
