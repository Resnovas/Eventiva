/**
 * @file tests/telemetry/src/bootstrap-diagnostics.spec.ts
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

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@effect/vitest';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { Effect } from 'effect';

const workspace = fileURLToPath(new URL('../../../', import.meta.url));
const preload = './tests/telemetry/fixtures/bootstrap-diagnostics.mjs';

/** Execute a real child with the production ten-second bound and isolated configuration. */
const probe = (args: ReadonlyArray<string>, environment: Readonly<Record<string, string>> = {}, journal = true) =>
    Effect.try({
        /** Preserve default signal handling even when the diagnostic descriptor is absent. */
        try: () =>
            spawnSync(process.execPath, ['--conditions=@eventiva/source', ...args], {
                cwd: workspace,
                encoding: 'utf8',
                timeout: 10000,
                maxBuffer: 65536,
                env: { NODE_NO_WARNINGS: '1', ...environment },
                stdio: journal ? ['pipe', 'pipe', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
            }),
        /** Do not expose raw spawn errors or arguments through the Effect error channel. */
        catch: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
    });

/** Remove only generated timestamps and trace identities when comparing two independent server runs. */
const stableOutput = (output: string) =>
    output.replace(/\d{4}-\d\d-\d\dT[\d:.]+Z/g, '<timestamp>').replace(/\b(?:trace|span)=[a-f0-9]+/g, '<correlation>');

describe('bootstrap diagnostic observer', /** Exercise real descriptors and process termination, not mocked lifecycle callbacks. */ () => {
    it.effect(
        'exits a failed bootstrap while native workers await main-thread garbage collection',
        /** Exercise the actual composition and Node teardown under a controlled native allocation stressor. */ () =>
            Effect.gen(
                /** Keep the same ten-second process deadline and safe failure contract as ordinary bootstrap tests. */ function* () {
                    const result = yield* probe(
                        [
                            '--v8-pool-size=4',
                            '--max-old-space-size=512',
                            '--stress-concurrent-allocation',
                            '--import',
                            preload,
                            '--import',
                            './tests/telemetry/fixtures/bootstrap-exit-pressure.mjs',
                            'apps/server/src/main.ts',
                        ],
                        { EVENTIVA_CLUSTER_PROFILE: 'SECRET_BAD_JSON' }
                    );
                    expect(result.error).toBeUndefined();
                    expect(result.status).toBe(1);
                    expect(result.signal).toBeNull();
                    expect(result.stdout).toContain('bootstrap.failure');
                    expect(result.stdout).not.toContain('SECRET_BAD_JSON');
                    expect(result.stderr).toBe('');
                    expect(result.output[3]).toContain('root-exit:failure');
                    expect(result.output[3]).toContain('process-before-exit');
                    expect(result.output[3]).toContain('process-exit-failure');
                }
            ),
        15000
    );

    for (const environment of [
        {},
        { telemetry_enabled: 'false' },
        { EVENTIVA_CLUSTER_PROFILE: 'SECRET_BAD_JSON' },
        { telemetry_enabled: 'false', EVENTIVA_CLUSTER_PROFILE: 'SECRET_BAD_JSON' },
    ]) {
        it.effect(
            `preserves server output and exit with settings ${Object.keys(environment).join(',') || 'default'}`,
            /** Compare observed and unobserved execution without relaxing existing server assertions. */ () =>
                Effect.gen(
                    /** Keep the observer's side channel independent from stdout, stderr and process results. */ function* () {
                        const original = yield* probe(['apps/server/src/main.ts'], environment, false);
                        const observed = yield* probe(['--import', preload, 'apps/server/src/main.ts'], environment);
                        expect(original.error).toBeUndefined();
                        expect(observed.error).toBeUndefined();
                        expect(observed.status).toBe(original.status);
                        expect(observed.signal).toBe(original.signal);
                        expect(observed.stderr).toBe(original.stderr);
                        expect(stableOutput(observed.stdout)).toBe(stableOutput(original.stdout));
                        expect(original.output[3]).toBeUndefined();
                        const journal = observed.output[3];
                        expect(typeof journal).toBe('string');
                        if (typeof journal !== 'string') return;
                        expect(Buffer.byteLength(journal)).toBeLessThanOrEqual(4096);
                        expect(journal).toContain('child-start');
                        expect(journal).toContain('entry-source-loaded');
                        expect(journal).toContain('root-start');
                        expect(journal).toContain(`root-exit:${observed.status === 0 ? 'success' : 'failure'}`);
                        expect(journal).toContain(`process-exit-${observed.status === 0 ? 'success' : 'failure'}`);
                        expect(journal).not.toMatch(/SECRET|BAD_JSON|Cause|Error|\/home|file:/);
                        if (observed.status === 1) {
                            expect(journal).toContain('main-use-exit:failure');
                            expect(journal.indexOf('main-use-exit:failure')).toBeLessThan(
                                journal.indexOf('main-services-released:failure')
                            );
                            expect(journal.indexOf('main-services-released:failure')).toBeLessThan(
                                journal.indexOf('main-telemetry-released:failure')
                            );
                            expect(journal.indexOf('main-telemetry-released:failure')).toBeLessThan(
                                journal.indexOf('bootstrap-failure-logged')
                            );
                            expect(journal.indexOf('bootstrap-failure-logged')).toBeLessThan(
                                journal.indexOf('bootstrap-use-exit:failure')
                            );
                            expect(journal.indexOf('bootstrap-use-exit:failure')).toBeLessThan(
                                journal.indexOf('root-exit:failure')
                            );
                        }
                    }
                )
        );
    }

    it.effect(
        'ignores missing descriptors and malformed or repeated phase payloads',
        /** Diagnostic failure cannot change a child's successful business result. */ () =>
            Effect.gen(
                /** Flood the actual subscriber with untrusted values and keep one closed phase. */ function* () {
                    const script = `import { channel } from 'node:diagnostics_channel';
                const lifecycle = channel('eventiva.bootstrap.lifecycle');
                for (let i = 0; i < 10000; i++) {
                    lifecycle.publish({ secret: 'SECRET_CANARY' });
                    lifecycle.publish('SECRET_CANARY'.repeat(1000));
                    lifecycle.publish('root-start\\n');
                    lifecycle.publish('root-start');
                }
                process.stdout.write('business-result');`;
                    for (const descriptor of [true, false]) {
                        const result = yield* probe(
                            ['--import', preload, '--input-type=module', '--eval', script],
                            {},
                            descriptor
                        );
                        expect(result.error).toBeUndefined();
                        expect(result.status).toBe(0);
                        expect(result.stdout).toBe('business-result');
                        expect(result.stderr).toBe('');
                        if (descriptor) {
                            const journal = result.output[3] ?? '';
                            expect(Buffer.byteLength(journal)).toBeLessThanOrEqual(4096);
                            expect(journal.match(/root-start/g)).toHaveLength(1);
                            expect(journal).not.toMatch(/SECRET|secret/);
                            expect(journal).toContain('process-before-exit');
                            expect(journal).toContain('process-exit-success');
                        }
                    }
                }
            )
    );

    it.effect(
        'retains the last phase when the actual ten-second timeout sends SIGTERM',
        /** A deliberately stuck control must retain evidence without catching or changing SIGTERM. */ () =>
            Effect.gen(
                /** Use a synthetic keepalive, not a modified production bootstrap, to prove timeout capture. */ function* () {
                    const result = yield* probe([
                        '--import',
                        preload,
                        '--input-type=module',
                        '--eval',
                        `
                import { channel } from 'node:diagnostics_channel';
                channel('eventiva.bootstrap.lifecycle').publish('bootstrap-failure-logged');
                process.stdout.write('bootstrap.failure');
                setInterval(() => {}, 1000);
            `,
                    ]);
                    expect(result.error).toMatchObject({ code: 'ETIMEDOUT' });
                    expect(result.status).toBeNull();
                    expect(result.signal).toBe('SIGTERM');
                    expect(result.stdout).toBe('bootstrap.failure');
                    expect(result.stderr).toBe('');
                    expect(result.output[3]).toContain('child-start');
                    expect(result.output[3]).toContain('bootstrap-failure-logged');
                    expect(result.output[3]).not.toMatch(/root-exit|process-exit/);
                }
            ),
        15000
    );
});
