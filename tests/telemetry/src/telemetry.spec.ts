/**
 * @file tests/telemetry/src/telemetry.spec.ts
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

import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';
import * as FileSystem from '@effect/platform/FileSystem';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import { describe, expect, expectTypeOf, it } from '@effect/vitest';
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    Cause,
    Config,
    ConfigProvider,
    Context,
    Data,
    Deferred,
    Effect,
    Exit,
    Fiber,
    Layer,
    Option,
    Redacted,
    Ref,
    Schema,
    TestClock,
    Tracer,
} from 'effect';
import ts from 'typescript';
import {
    consoleLoggerLayer,
    formatConsoleRecord,
    serverLoggerConfig,
    serverLoggerLayer,
    type ServerLoggerOptions,
} from '@eventiva/integrations.telemetry.server/logger';
import {
    bootstrapTelemetryLayer,
    TelemetryControl,
    telemetryConfig,
    telemetryLayer,
    type TelemetryPolicy,
} from '@eventiva/runtime/telemetry';

const policy: TelemetryPolicy = {
    messages: {
        'app.ready': 'Application ready.',
        'module.start': 'Module starting.',
        'action.run': 'Action running.',
        'resource.write': 'Resource transaction.',
        'hook.deliver': 'Observer delivery.',
        'banner.fixture':
            '\n \u2588\u2588\u2588\u2557  \u2588\u2588\u2557\n \u255a\u2550\u2550\u255d  \u255a\u2550\u255d',
    },
    attributes: {
        'eventiva.module.id': ['inventory'],
        'eventiva.execution.id': ['exec-01'],
        'eventiva.step.id': ['step-02'],
        'eventiva.tenant.id': ['test-tenant'],
    },
};
const config = (capacity = 256, enabled = true, timeoutMs = 1000) => Config.succeed({ enabled, capacity, timeoutMs });
const collector = Effect.gen(function* () {
    const records = yield* Ref.make<ReadonlyArray<TelemetryRecord>>([]);
    const sink = Layer.succeed(TelemetrySink, {
        write: (record) => Ref.update(records, (all) => [...all, record]),
        flush: Effect.void,
    });
    return { records, sink };
});
const record: TelemetryRecord = {
    version: 1,
    signal: 'log',
    timestamp: '2026-11-15T23:59:59.999Z',
    level: 'INFO',
    code: 'app.ready',
    text: 'Application ready.',
    profile: 'baseline',
    traceId: '',
    spanId: '',
    parentSpanId: '',
    attributes: {},
    durationMs: 0,
    outcome: 'none',
};
const fileOptions = (directory: string): ServerLoggerOptions => ({
    directory: Redacted.make(directory),
    maxFileBytes: 1024,
    maxFiles: 3,
    retentionDays: 2,
});
class CanaryFailure extends Data.TaggedError('CanaryFailure')<{ readonly payload: string }> {}

describe('central Effect telemetry', () => {
    it.effect('correlates action -> resource -> asynchronous observer without feature exporters', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            yield* Effect.gen(function* () {
                yield* Effect.logInfo('app.ready').pipe(
                    Effect.withSpan('resource.write'),
                    Effect.withSpan('action.run')
                );
                yield* Effect.fork(Effect.logInfo('app.ready').pipe(Effect.withSpan('hook.deliver'))).pipe(
                    Effect.flatMap(Fiber.join),
                    Effect.withSpan('action.run')
                );
                yield* (yield* TelemetryControl).flush;
            }).pipe(
                Effect.withSpan('module.start'),
                Effect.provide(telemetryLayer(policy).pipe(Layer.provide(capture.sink)))
            );
            const records = yield* Ref.get(capture.records);
            const spans = records.filter((entry) => entry.signal === 'span');
            expect(spans.map((entry) => entry.code)).toEqual([
                'resource.write',
                'action.run',
                'hook.deliver',
                'action.run',
                'module.start',
            ]);
            expect(new Set(records.map((entry) => entry.traceId)).size).toBe(1);
            const root = spans.find((entry) => entry.code === 'module.start');
            expect(root?.traceId).toMatch(/^[a-f0-9]{32}$/);
            const resource = spans[0];
            expect(resource?.parentSpanId).toBe(spans[1]?.spanId);
            expect(spans[2]?.parentSpanId).toBe(spans[3]?.spanId);
            expect(records.filter((entry) => entry.signal === 'log').map((entry) => entry.spanId)).toEqual([
                resource?.spanId,
                spans[2]?.spanId,
            ]);
            expect(
                spans
                    .filter((entry) => entry.code === 'action.run')
                    .every((entry) => entry.parentSpanId === root?.spanId)
            ).toBe(true);
        })
    );

    it.effect('redacts raw values, errors, Cause, span attributes/events and all four profiles', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            const canary = 'SECRET_CANARY_4739';
            yield* Effect.gen(function* () {
                yield* Effect.logInfo(canary, new Error(canary), Redacted.make(canary), { payload: canary });
                yield* Effect.logError(Cause.fail(new Error(canary)));
                yield* Effect.logInfo('app.ready').pipe(
                    Effect.annotateLogs({ password: canary, 'eventiva.module.id': canary })
                );
                for (const profile of ['baseline', 'sensitive', 'restricted', 'vault']) {
                    yield* Effect.logInfo('app.ready').pipe(
                        Effect.annotateLogs({
                            'eventiva.profile': profile,
                            'eventiva.module.id': 'inventory',
                            'eventiva.execution.id': 'exec-01',
                            'eventiva.step.id': 'step-02',
                            'eventiva.tenant.id': 'test-tenant',
                        })
                    );
                }
                yield* Effect.gen(function* () {
                    yield* Effect.annotateCurrentSpan('secret', canary);
                    const span = yield* Effect.currentSpan;
                    span.event(canary, 0n, { payload: canary });
                    return yield* Effect.fail(new CanaryFailure({ payload: canary }));
                }).pipe(Effect.withSpan('action.run', { attributes: { payload: canary } }), Effect.ignore);
                yield* Effect.logInfo(`${canary}\n2026-01-01 INFO forged\u001b[2J`);
                yield* (yield* TelemetryControl).flush;
            }).pipe(Effect.provide(telemetryLayer(policy).pipe(Layer.provide(capture.sink))));
            const records = yield* Ref.get(capture.records);
            expect(JSON.stringify(records)).not.toContain(canary);
            expect(JSON.stringify(records)).not.toContain('forged');
            expect(records[0]?.text).toBe('[redacted]');
            expect(
                records
                    .filter((entry) => entry.profile === 'baseline')
                    .some((entry) => entry.attributes['eventiva.module.id'] === 'inventory')
            ).toBe(true);
            expect(records.find((entry) => entry.profile === 'sensitive')?.attributes['eventiva.step.id']).toBe(
                'step-02'
            );
            expect(records.find((entry) => entry.profile === 'restricted')?.attributes).toEqual({});
            expect(records.find((entry) => entry.profile === 'vault')?.attributes).toEqual({});
            expect(records.find((entry) => entry.signal === 'span')?.outcome).toBe('failed');
        })
    );

    it.effect('does not forward opaque context or rich parent spans to an ambient tracer', () =>
        Effect.gen(function* () {
            class Secret extends Context.Tag('test/TelemetrySecret')<Secret, string>() {}
            const capture = yield* collector;
            const native = yield* Effect.tracer;
            const canary = 'SECRET_CONTEXT_CANARY';
            const context = Context.make(Secret, canary);
            let calls = 0;
            const observing = Tracer.make({
                context: (f) => f(),
                span: (name, parent, supplied, links, start, kind, options) => {
                    calls++;
                    expect(Option.isNone(Context.getOption(supplied, Secret))).toBe(true);
                    expect(links).toEqual([]);
                    expect(name).toBe('action.run');
                    expect(Option.isSome(parent)).toBe(true);
                    if (Option.isSome(parent)) {
                        expect(parent.value._tag).toBe('ExternalSpan');
                        expect(Option.isNone(Context.getOption(parent.value.context, Secret))).toBe(true);
                        expect(parent.value.spanId).toBe('1234567890abcdef');
                    }
                    return native.span(name, parent, supplied, links, start, kind, options);
                },
            });
            yield* Effect.logInfo('app.ready').pipe(
                Effect.withSpan('action.run', { context, attributes: { secret: canary } }),
                Effect.withParentSpan(
                    Tracer.externalSpan({
                        traceId: '1234567890abcdef1234567890abcdef',
                        spanId: '1234567890abcdef',
                        context,
                    })
                ),
                Effect.provide(telemetryLayer(policy).pipe(Layer.provide(capture.sink))),
                Effect.withTracer(observing)
            );
            expect(calls).toBe(1);
            expect(JSON.stringify(yield* Ref.get(capture.records))).not.toContain(canary);
        })
    );

    it.effect('retains safe span metadata, durations and an explicit asynchronous handoff parent', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            const rootTrace = '1234567890abcdef1234567890abcdef';
            const external = Tracer.externalSpan({ traceId: rootTrace, spanId: '1234567890abcdef' });
            const started = yield* Deferred.make<void>();
            const fiber = yield* Effect.gen(function* () {
                for (const profile of ['baseline', 'sensitive', 'restricted', 'vault', 'invalid']) {
                    yield* Effect.logInfo('app.ready').pipe(
                        Effect.annotateLogs({ 'eventiva.profile': profile, 'eventiva.module.id': 'inventory' }),
                        Effect.withSpan('hook.deliver', {
                            attributes: {
                                'eventiva.profile': profile,
                                'eventiva.module.id': 'inventory',
                                confidential: 'SECRET',
                            },
                        })
                    );
                }
                yield* Deferred.succeed(started, undefined);
                yield* Effect.sleep('37 millis');
            }).pipe(
                Effect.withSpan('action.run'),
                Effect.withParentSpan(external),
                Effect.provide(telemetryLayer(policy).pipe(Layer.provide(capture.sink))),
                Effect.fork
            );
            yield* Deferred.await(started);
            yield* TestClock.adjust('37 millis');
            yield* Fiber.join(fiber);
            const records = yield* Ref.get(capture.records);
            expect(records.every((entry) => entry.traceId === rootTrace)).toBe(true);
            const action = records.find((entry) => entry.code === 'action.run');
            expect(action).toMatchObject({ durationMs: 37, parentSpanId: external.spanId });
            const spans = records.filter((entry) => entry.code === 'hook.deliver');
            expect(spans.map((entry) => entry.profile)).toEqual([
                'baseline',
                'sensitive',
                'restricted',
                'vault',
                'vault',
            ]);
            expect(spans.map((entry) => entry.attributes)).toEqual([
                { 'eventiva.module.id': 'inventory' },
                { 'eventiva.module.id': 'inventory' },
                {},
                {},
                {},
            ]);
            expect(JSON.stringify(records)).not.toContain('SECRET');
        })
    );

    it.effect('preserves trusted multiline bytes and rejects control-bearing catalog/config', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            yield* Effect.gen(function* () {
                yield* Effect.logInfo('banner.fixture');
                yield* (yield* TelemetryControl).flush;
            }).pipe(Effect.provide(telemetryLayer(policy).pipe(Layer.provide(capture.sink))));
            const records = yield* Ref.get(capture.records);
            expect(records[0]?.text).toBe(
                '\n \u2588\u2588\u2588\u2557  \u2588\u2588\u2557\n \u255a\u2550\u2550\u255d  \u255a\u2550\u255d'
            );
            expect(
                formatConsoleRecord(records[0] ?? record)
                    .split('\n')
                    .slice(1)
                    .join('\n')
            ).toBe(policy.messages['banner.fixture']);
            for (const text of ['bad\rforged', 'bad\u001b[2J', 'bad\u202e', 'x'.repeat(8193)]) {
                const failed = yield* Effect.void.pipe(
                    Effect.provide(
                        telemetryLayer({ messages: { bad: text }, attributes: {} }).pipe(Layer.provide(capture.sink))
                    ),
                    Effect.exit
                );
                expect(Exit.isFailure(failed)).toBe(true);
            }
            const invalid = yield* Effect.void.pipe(
                Effect.provide(telemetryLayer(policy).pipe(Layer.provide(capture.sink))),
                Effect.withConfigProvider(ConfigProvider.fromMap(new Map([['telemetry.capacity', 'SECRET_INVALID']]))),
                Effect.exit
            );
            expect(Exit.isFailure(invalid)).toBe(true);
            expect(JSON.stringify(invalid)).not.toContain('SECRET_INVALID');
        })
    );

    it.effect('bounds concurrent producers and never waits on an unavailable exporter', () =>
        Effect.gen(function* () {
            const started = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            const sink = Layer.succeed(TelemetrySink, {
                write: () => Deferred.succeed(started, undefined).pipe(Effect.zipRight(Deferred.await(release))),
                flush: Effect.void,
            });
            yield* Effect.gen(function* () {
                yield* Effect.logInfo('app.ready');
                yield* Deferred.await(started);
                yield* Effect.forEach(Array.from({ length: 40 }).keys(), () => Effect.logInfo('app.ready'), {
                    concurrency: 'unbounded',
                    discard: true,
                });
                const control = yield* TelemetryControl;
                expect(yield* control.health).toMatchObject({ accepted: 4, completed: 0, dropped: 37 });
                yield* Deferred.succeed(release, undefined);
                yield* control.flush;
                expect(yield* control.health).toMatchObject({ completed: 4, failed: 0 });
            }).pipe(Effect.provide(telemetryLayer(policy, config(3)).pipe(Layer.provide(sink))));
        })
    );

    it.effect('reports sink errors/defects without serializing them or failing business work', () =>
        Effect.gen(function* () {
            for (const failure of [
                Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
                Effect.die(new Error('SECRET_DEFECT')),
            ]) {
                const sink = Layer.succeed(TelemetrySink, { write: () => failure, flush: Effect.void });
                yield* Effect.gen(function* () {
                    yield* Effect.logInfo('app.ready');
                    const control = yield* TelemetryControl;
                    const flush = yield* Effect.exit(control.flush);
                    expect(Exit.isFailure(flush)).toBe(true);
                    expect(JSON.stringify(flush)).not.toContain('SECRET_DEFECT');
                    expect(yield* control.health).toMatchObject({ accepted: 1, completed: 1, failed: 1 });
                }).pipe(Effect.provide(telemetryLayer(policy).pipe(Layer.provide(sink))));
            }
        })
    );

    it.effect('timeouts and scope shutdown interrupt a stalled exporter and expose failed drain', () =>
        Effect.gen(function* () {
            const interrupted = yield* Ref.make(false);
            let saved: Context.Tag.Service<typeof TelemetryControl> | undefined;
            const sink = Layer.succeed(TelemetrySink, {
                write: () => Effect.never.pipe(Effect.onInterrupt(() => Ref.set(interrupted, true))),
                flush: Effect.never,
            });
            const fiber = yield* Effect.gen(function* () {
                saved = yield* TelemetryControl;
                yield* Effect.logInfo('app.ready');
            }).pipe(Effect.provide(telemetryLayer(policy, config(2, true, 20)).pipe(Layer.provide(sink))), Effect.fork);
            yield* TestClock.adjust('100 millis');
            yield* Fiber.join(fiber);
            expect(yield* Ref.get(interrupted)).toBe(true);
            expect(saved === undefined ? undefined : yield* saved.health).toMatchObject({
                closed: true,
                shutdownFailed: true,
            });
        })
    );

    it.effect('flush on interruption releases the worker and restores the previous logger', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            const started = yield* Deferred.make<void>();
            const fiber = yield* Effect.logInfo('app.ready').pipe(
                Effect.zipRight(Deferred.succeed(started, undefined)),
                Effect.zipRight(Effect.never),
                Effect.provide(telemetryLayer(policy).pipe(Layer.provide(capture.sink))),
                Effect.fork
            );
            yield* Deferred.await(started);
            yield* Fiber.interrupt(fiber);
            expect((yield* Ref.get(capture.records)).map((entry) => entry.code)).toEqual(['app.ready']);
        })
    );

    it.effect('repeated acquisition and nested installation do not duplicate records', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            const live = telemetryLayer(policy).pipe(Layer.provide(capture.sink));
            yield* Effect.logInfo('app.ready').pipe(Effect.provide(Layer.merge(live, live)));
            const nested = Effect.logInfo('app.ready').pipe(Effect.withSpan('action.run'), Effect.provide(live));
            yield* nested.pipe(Effect.provide(live));
            yield* Effect.logInfo('app.ready').pipe(Effect.provide(live));
            expect((yield* Ref.get(capture.records)).map((entry) => entry.code)).toEqual([
                'app.ready',
                'app.ready',
                'action.run',
                'app.ready',
            ]);
        })
    );

    it.effect('bootstrap failure diagnostics survive main Config and required-layer failure', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            const acquisitions: ReadonlyArray<Effect.Effect<void, TelemetrySinkFailure>> = [
                Config.string('MISSING_SECRET').pipe(
                    Effect.asVoid,
                    Effect.mapError(() => new TelemetrySinkFailure({ reason: 'configuration' }))
                ),
                Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })),
            ];
            for (const acquisition of acquisitions) {
                const result = yield* acquisition.pipe(
                    Effect.tapErrorCause(() => Effect.logError('bootstrap.failure')),
                    Effect.provide(bootstrapTelemetryLayer().pipe(Layer.provide(capture.sink))),
                    Effect.withConfigProvider(ConfigProvider.fromMap(new Map())),
                    Effect.exit
                );
                expect(Exit.isFailure(result)).toBe(true);
            }
            const records = yield* Ref.get(capture.records);
            expect(records.map((entry) => entry.code)).toEqual(['bootstrap.failure', 'bootstrap.failure']);
            expect(JSON.stringify(records)).not.toContain('SECRET');
            expect(JSON.stringify(records)).not.toContain('ready');
        })
    );

    it.effect('installs a console-only bootstrap before even file Config acquisition', () =>
        Effect.gen(function* () {
            const output = yield* Ref.make<ReadonlyArray<string>>([]);
            const bootstrap = bootstrapTelemetryLayer().pipe(
                Layer.provide(consoleLoggerLayer((text) => Ref.update(output, (all) => [...all, text])))
            );
            const result = yield* Effect.void.pipe(
                Effect.provide(serverLoggerLayer()),
                Effect.tapErrorCause(() => Effect.logError('bootstrap.failure')),
                Effect.provide(bootstrap),
                Effect.withConfigProvider(ConfigProvider.fromMap(new Map())),
                Effect.exit
            );
            expect(Exit.isFailure(result)).toBe(true);
            expect((yield* Ref.get(output))[0]).toContain('Bootstrap failed;');
            const consoleLayer = consoleLoggerLayer();
            yield* Effect.gen(function* () {
                yield* (yield* TelemetrySink).write(record);
            }).pipe(Effect.provide(consoleLayer));
        }).pipe(Effect.provide(NodeFileSystem.layer))
    );

    it.effect('rejects invalid injected limits without acquiring a worker', () =>
        Effect.gen(function* () {
            const capture = yield* collector;
            for (const invalid of [config(0), config(4097), config(1, true, 0), config(1, true, 10001), config(1.5)]) {
                const result = yield* Effect.void.pipe(
                    Effect.provide(telemetryLayer(policy, invalid).pipe(Layer.provide(capture.sink))),
                    Effect.exit
                );
                expect(Exit.isFailure(result)).toBe(true);
            }
            expect(yield* Ref.get(capture.records)).toEqual([]);
        })
    );

    it.effect('telemetry opt-out and no-op exporter do not provide or disable mandatory audit', () =>
        Effect.gen(function* () {
            class MandatoryAudit extends Context.Tag('test/MandatoryAudit')<
                MandatoryAudit,
                { readonly persist: Effect.Effect<void, 'audit-unavailable'> }
            >() {}
            const capture = yield* collector;
            for (const enabled of [false, true]) {
                const result = yield* Effect.gen(function* () {
                    yield* Effect.logInfo('app.ready');
                    yield* (yield* MandatoryAudit).persist;
                }).pipe(
                    Effect.provide(telemetryLayer(policy, config(8, enabled)).pipe(Layer.provide(capture.sink))),
                    Effect.provideService(MandatoryAudit, {
                        persist: Effect.fail<'audit-unavailable'>('audit-unavailable'),
                    }),
                    Effect.exit
                );
                expect(Exit.isFailure(result)).toBe(true);
            }
            expect((yield* Ref.get(capture.records)).length).toBe(1);
            const noOp = Layer.succeed(TelemetrySink, { write: () => Effect.void, flush: Effect.void });
            yield* Effect.logInfo('app.ready').pipe(Effect.provide(telemetryLayer(policy).pipe(Layer.provide(noOp))));
        })
    );
});

describe('Node local sink', () => {
    it.effect('rotates at UTC midnight; enforces days, size, count and private permissions', () =>
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const directory = yield* fs.makeTempDirectoryScoped();
            const output = yield* Ref.make<ReadonlyArray<string>>([]);
            yield* TestClock.setTime(new Date('2026-11-15T23:59:59.999Z'));
            yield* Effect.gen(function* () {
                const sink = yield* TelemetrySink;
                yield* sink.write(record);
                yield* TestClock.adjust('1 millis');
                yield* sink.write({ ...record, text: policy.messages['banner.fixture'] ?? '' });
                expect((yield* fs.readDirectory(directory)).filter((file) => file.endsWith('.jsonl'))).toEqual([
                    '2026-11-15.000000.jsonl',
                    '2026-11-16.000000.jsonl',
                ]);
                yield* Effect.forEach(
                    Array.from({ length: 20 }).keys(),
                    (index) => sink.write({ ...record, code: `item.${index}`, text: 'X'.repeat(300) }),
                    { concurrency: 'unbounded', discard: true }
                );
                const files = (yield* fs.readDirectory(directory)).filter((file) => file.endsWith('.jsonl')).sort();
                expect(files.length).toBe(3);
                for (const file of files) {
                    const stat = yield* fs.stat(`${directory}/${file}`);
                    expect(Number(stat.size)).toBeLessThanOrEqual(1024);
                    expect(stat.mode & 0o777).toBe(0o600);
                    const lines = (yield* fs.readFileString(`${directory}/${file}`)).trimEnd().split('\n');
                    for (const line of lines) {
                        const decoded = yield* Schema.decode(Schema.parseJson(TelemetryRecord))(line);
                        expect(decoded.version).toBe(1);
                    }
                }
                yield* TestClock.adjust('2 days');
                yield* sink.write(record);
                expect((yield* fs.readDirectory(directory)).filter((file) => file.endsWith('.jsonl'))).toEqual([
                    '2026-11-18.000000.jsonl',
                ]);
                yield* sink.flush;
            }).pipe(
                Effect.provide(
                    serverLoggerLayer(Config.succeed(fileOptions(directory)), (text) =>
                        Ref.update(output, (all) => [...all, text])
                    )
                )
            );
            expect((yield* Ref.get(output))[1]?.split('\n').slice(1).join('\n')).toBe(
                policy.messages['banner.fixture']
            );
            expect(yield* fs.exists(`${directory}/.eventiva-telemetry.lock`)).toBe(false);
        }).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer))
    );

    it.effect('preserves console on disk outage, bounds oversized records and rejects unsafe directories', () =>
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const directory = yield* fs.makeTempDirectoryScoped();
            const output = yield* Ref.make<ReadonlyArray<string>>([]);
            yield* Effect.gen(function* () {
                const sink = yield* TelemetrySink;
                expect(Exit.isFailure(yield* Effect.exit(sink.write({ ...record, text: 'X'.repeat(2000) })))).toBe(
                    true
                );
                yield* sink.write(record);
                const file = (yield* fs.readDirectory(directory)).find((name) => name.endsWith('.jsonl'));
                if (file === undefined) return yield* Effect.dieMessage('expected fixture file');
                yield* fs.remove(`${directory}/${file}`);
                yield* fs.makeDirectory(`${directory}/${file}`);
                expect(Exit.isFailure(yield* Effect.exit(sink.write(record)))).toBe(true);
            }).pipe(
                Effect.provide(
                    serverLoggerLayer(Config.succeed(fileOptions(directory)), (text) =>
                        Ref.update(output, (all) => [...all, text])
                    )
                )
            );
            expect((yield* Ref.get(output)).length).toBe(3);
            yield* fs.chmod(directory, 0o755);
            const invalid = yield* Effect.void.pipe(
                Effect.provide(serverLoggerLayer(Config.succeed(fileOptions(directory)))),
                Effect.exit
            );
            expect(Exit.isFailure(invalid)).toBe(true);
            expect(JSON.stringify(invalid)).not.toContain(directory);
        }).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer))
    );

    it.effect('rejects a second directory owner and supports clean reacquisition', () =>
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const directory = yield* fs.makeTempDirectoryScoped();
            const first = serverLoggerLayer(Config.succeed(fileOptions(directory)), () => Effect.void);
            const second = serverLoggerLayer(Config.succeed(fileOptions(directory)), () => Effect.void);
            yield* Effect.gen(function* () {
                const result = yield* Effect.void.pipe(Effect.provide(second), Effect.exit);
                expect(Exit.isFailure(result)).toBe(true);
                yield* (yield* TelemetrySink).write(record);
            }).pipe(Effect.provide(first));
            yield* Effect.gen(function* () {
                yield* (yield* TelemetrySink).write(record);
            }).pipe(Effect.provide(second));
            expect((yield* fs.readDirectory(directory)).filter((file) => file.endsWith('.jsonl')).length).toBe(2);
        }).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer))
    );

    it.effect('uses redacted path Config with safe errors for malformed numeric inputs', () =>
        Effect.gen(function* () {
            const provider = ConfigProvider.fromMap(
                new Map([
                    ['telemetryFile.directory', '/SECRET_PATH'],
                    ['telemetryFile.maxFiles', 'SECRET_NUMBER'],
                ])
            );
            const result = yield* Effect.void.pipe(
                Effect.provide(serverLoggerLayer()),
                Effect.withConfigProvider(provider),
                Effect.exit
            );
            expect(Exit.isFailure(result)).toBe(true);
            expect(JSON.stringify(result)).not.toContain('SECRET');
            const value = yield* serverLoggerConfig.pipe(
                Effect.withConfigProvider(
                    ConfigProvider.fromMap(new Map([['telemetryFile.directory', '/SECRET_PATH']]))
                )
            );
            expect(JSON.stringify(value)).not.toContain('SECRET_PATH');
            expect(String(value.directory)).not.toContain('SECRET_PATH');
            expect(inspect(value)).not.toContain('SECRET_PATH');
            expect(inspect(result)).not.toContain('SECRET');
        }).pipe(Effect.provide(NodeFileSystem.layer))
    );

    it.effect('decodes invalid exporter records, reports console failure and enforces restart bounds', () =>
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const directory = yield* fs.makeTempDirectoryScoped();
            yield* fs.writeFileString(`${directory}/1970-01-01.000000.jsonl`, 'old', { mode: 0o600 });
            yield* TestClock.setTime(new Date('2026-11-15T12:00:00Z'));
            const live = serverLoggerLayer(Config.succeed(fileOptions(directory)));
            yield* Effect.gen(function* () {
                const sink = yield* TelemetrySink;
                expect(Exit.isFailure(yield* Effect.exit(sink.write({ ...record, text: 'bad\rFORGED' })))).toBe(true);
                expect(yield* fs.exists(`${directory}/1970-01-01.000000.jsonl`)).toBe(false);
                yield* sink.write(record);
            }).pipe(Effect.provide(live));
            const brokenConsole = consoleLoggerLayer(() =>
                Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' }))
            );
            yield* Effect.gen(function* () {
                const sink = yield* TelemetrySink;
                expect(Exit.isFailure(yield* Effect.exit(sink.write(record)))).toBe(true);
                expect(Exit.isFailure(yield* Effect.exit(sink.write({ ...record, text: '\u001b[2J' })))).toBe(true);
                yield* sink.flush;
            }).pipe(Effect.provide(brokenConsole));
            yield* fs.writeFileString(`${directory}/2026-11-15.999999.jsonl`, 'x'.repeat(1025), { mode: 0o600 });
            expect(Exit.isFailure(yield* Effect.void.pipe(Effect.provide(live), Effect.exit))).toBe(true);
            expect((yield* fs.readFileString(`${directory}/2026-11-15.999999.jsonl`)).length).toBe(1025);
            yield* fs.remove(`${directory}/2026-11-15.999999.jsonl`);
            yield* fs.writeFileString(`${directory}/2026-11-15.999999.jsonl`, '', { mode: 0o600 });
            yield* Effect.gen(function* () {
                expect(Exit.isFailure(yield* Effect.exit((yield* TelemetrySink).write(record)))).toBe(true);
            }).pipe(Effect.provide(live));
        }).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer))
    );
});

it('keeps exact typed exporter, environment and layer boundaries', () => {
    expectTypeOf<Parameters<typeof telemetryLayer>[0]>().toEqualTypeOf<TelemetryPolicy>();
    expectTypeOf<ReturnType<typeof telemetryLayer>>().toEqualTypeOf<
        Layer.Layer<TelemetryControl, TelemetrySinkFailure, TelemetrySink>
    >();
    expectTypeOf<ReturnType<typeof bootstrapTelemetryLayer>>().toEqualTypeOf<
        Layer.Layer<TelemetryControl, TelemetrySinkFailure, TelemetrySink>
    >();
    expectTypeOf<ReturnType<typeof serverLoggerLayer>>().toEqualTypeOf<
        Layer.Layer<TelemetrySink, TelemetrySinkFailure, FileSystem.FileSystem>
    >();
    expectTypeOf<ReturnType<Context.Tag.Service<typeof TelemetrySink>['write']>>().toEqualTypeOf<
        Effect.Effect<void, TelemetrySinkFailure>
    >();
    expectTypeOf<TelemetrySinkFailure>().toExtend<Cause.YieldableError>();
    expectTypeOf<TelemetrySinkFailure['reason']>().toEqualTypeOf<
        'configuration' | 'unavailable' | 'write' | 'flush' | 'timeout' | 'invalid-record'
    >();
    expectTypeOf<TelemetrySinkFailure['_tag']>().toEqualTypeOf<'TelemetrySinkFailure'>();
    expectTypeOf<Context.Tag.Service<typeof TelemetryControl>['health']>().toEqualTypeOf<
        Effect.Effect<import('@eventiva/runtime/telemetry').TelemetryHealth>
    >();
    expectTypeOf<Config.Config.Success<typeof telemetryConfig>>().toEqualTypeOf<{
        enabled: boolean;
        capacity: number;
        timeoutMs: number;
    }>();
    expectTypeOf<{ write: (input: string) => Effect.Effect<void>; flush: Effect.Effect<void> }>().not.toExtend<
        Context.Tag.Service<typeof TelemetrySink>
    >();
    expectTypeOf<{ version: 2 }>().not.toExtend<TelemetryRecord>();
    const Bootstrap = bootstrapTelemetryLayer().pipe(Layer.provide(consoleLoggerLayer()));
    const Local = telemetryLayer(policy).pipe(Layer.provide(serverLoggerLayer()), Layer.provide(NodeFileSystem.layer));
    const program = Effect.logInfo('app.ready').pipe(
        Effect.withSpan('module.start'),
        Effect.provide(Local),
        Effect.fork,
        Effect.flatMap(Fiber.await),
        Effect.flatten,
        Effect.catchAllCause(() =>
            Effect.logError('bootstrap.service-failed').pipe(
                Effect.zipRight(Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })))
            )
        ),
        Effect.provide(Bootstrap)
    );
    expectTypeOf(program).toEqualTypeOf<Effect.Effect<void, TelemetrySinkFailure>>();
});

it('resolves all local import/type/reexport edges and proves the telemetry diamond is acyclic', () => {
    const root = fileURLToPath(new URL('../../../', import.meta.url));
    const resolve = (...paths: ReadonlyArray<string>) => resolvePath(root, ...paths);
    const parsed = ts.getParsedCommandLineOfConfigFile(
        resolve('tests/telemetry/tsconfig.json'),
        {},
        {
            ...ts.sys,
            onUnRecoverableConfigFileDiagnostic: (diagnostic) => expect(diagnostic.code).toBe(0),
        }
    );
    expect(parsed).toBeDefined();
    const options = parsed?.options ?? {};
    const graphFor = (
        roots: ReadonlyArray<string>,
        options: ts.CompilerOptions,
        host: ts.ModuleResolutionHost
    ): ReadonlyMap<string, ReadonlySet<string>> => {
        const graph = new Map<string, Set<string>>();
        const addSource = (file: string): void => {
            if (graph.has(file) || file.includes('/node_modules/')) return;
            const text = host.readFile(file);
            expect(text, `unresolved source ${file}`).toBeDefined();
            const source = ts.createSourceFile(file, text ?? '', ts.ScriptTarget.Latest, true);
            const targets = new Set<string>();
            graph.set(file, targets);
            const visit = (node: ts.Node): void => {
                const specifier =
                    (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
                    node.moduleSpecifier !== undefined &&
                    ts.isStringLiteral(node.moduleSpecifier)
                        ? node.moduleSpecifier.text
                        : ts.isImportTypeNode(node) &&
                            ts.isLiteralTypeNode(node.argument) &&
                            ts.isStringLiteral(node.argument.literal)
                          ? node.argument.literal.text
                          : ts.isCallExpression(node) &&
                              node.expression.kind === ts.SyntaxKind.ImportKeyword &&
                              node.arguments[0] !== undefined &&
                              ts.isStringLiteral(node.arguments[0])
                            ? node.arguments[0].text
                            : undefined;
                if (specifier !== undefined && !specifier.startsWith('node:')) {
                    const target = ts.resolveModuleName(specifier, file, options, host).resolvedModule
                        ?.resolvedFileName;
                    expect(target, `unresolved import ${specifier}`).toBeDefined();
                    if (target !== undefined && !target.includes('/node_modules/')) {
                        targets.add(target);
                        addSource(target);
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(source);
        };
        roots.forEach(addSource);
        return graph;
    };
    const files = [
        'packages/runtime/src/telemetry.ts',
        'packages/integrations/telemetry.server/src/logger.ts',
        'packages/contracts/src/observability.ts',
    ].map((file) => resolve(file));
    const graph = graphFor(files, options, ts.sys);
    expect(graph.size).toBe(3);
    const contracts = files[2] ?? '';
    expect([...(graph.get(files[0] ?? '') ?? [])]).toEqual([contracts]);
    expect([...(graph.get(files[1] ?? '') ?? [])]).toEqual([contracts]);
    expect([...(graph.get(contracts) ?? [])]).toEqual([]);
    const cycle = (
        edges: ReadonlyMap<string, ReadonlySet<string>>,
        node: string,
        path: ReadonlyArray<string> = []
    ): boolean =>
        path.includes(node) || [...(edges.get(node) ?? [])].some((next) => cycle(edges, next, [...path, node]));
    expect(files.some((file) => cycle(graph, file))).toBe(false);
    const composition = graphFor([resolve('apps/server/src/main.ts')], options, ts.sys);
    expect(composition.size).toBeGreaterThan(graph.size);
    expect([...composition.keys()].some((file) => cycle(composition, file))).toBe(false);
    for (const file of files) expect(composition.get(file)).toEqual(graph.get(file));
    // Real compiler resolution positive control: type-only alias -> reexport -> import-type cycle.
    const virtual = new Map([
        ['/virtual/feature.ts', "import type { Port } from '@port'; export type Feature = Port;"],
        ['/virtual/port.ts', "export type { Backend as Port } from './bridge.ts';"],
        ['/virtual/bridge.ts', "export type Backend = import('./feature.ts').Feature;"],
    ]);
    const bad = graphFor(
        ['/virtual/feature.ts'],
        { ...options, paths: { '@port': ['/virtual/port.ts'] } },
        {
            fileExists: (file) => virtual.has(file),
            readFile: (file) => virtual.get(file),
            directoryExists: (directory) => directory === '/virtual',
            getCurrentDirectory: () => '/virtual',
        }
    );
    expect(bad.size).toBe(3);
    expect(cycle(bad, '/virtual/feature.ts')).toBe(true);
    const declarations = new Map<string, string>();
    const program = ts.createProgram(files, {
        ...options,
        noEmit: false,
        emitDeclarationOnly: true,
        rootDir: resolve('.'),
    });
    expect(ts.getPreEmitDiagnostics(program)).toHaveLength(0);
    const emitted = program.emit(undefined, (file, text) => {
        if (file.endsWith('.d.ts')) declarations.set(file, text);
    });
    expect(emitted.emitSkipped).toBe(false);
    expect(emitted.diagnostics).toHaveLength(0);
    expect(declarations.size).toBe(3);
    const authored = [
        ...files,
        resolve('apps/server/src/main.ts'),
        resolve('tests/telemetry/src/telemetry.spec.ts'),
        resolve('tests/telemetry/src/server.spec.ts'),
        resolve('tests/telemetry/vitest.config.mts'),
    ].map((file) => [file, readFileSync(file, 'utf8')]);
    for (const [file = '', text = ''] of [...authored, ...declarations]) {
        const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const prohibited: Array<string> = [];
        const visit = (node: ts.Node): void => {
            if (
                node.kind === ts.SyntaxKind.AnyKeyword ||
                node.kind === ts.SyntaxKind.UnknownKeyword ||
                ts.isAsExpression(node) ||
                ts.isTypeAssertionExpression(node) ||
                ts.isNonNullExpression(node)
            )
                prohibited.push(node.getText(source));
            ts.forEachChild(node, visit);
        };
        visit(source);
        expect(prohibited).toEqual([]);
        expect(source.text).not.toMatch(/(?:\/\/|\/\*)\s*(?:@ts-|eslint-disable)/);
    }
}, 15000);
