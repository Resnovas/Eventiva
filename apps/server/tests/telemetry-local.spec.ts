/**
 * @file apps/server/tests/telemetry-local.spec.ts
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

import { mkdtempSync, mkdirSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import { afterEach, describe, expect, it, vi } from '@effect/vitest';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { IdentityStore } from '@eventiva/contracts/identity';
import { CurrentTenant, EpochMillis } from '@eventiva/contracts/storage';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { IdentityResolver } from '@eventiva/runtime/invocation';
import { ConfigProvider, Effect, Exit, Layer, Redacted, Schema } from 'effect';
import { telemetryTenants } from '../src/telemetry-live.ts';
import { localTelemetryProgram } from '../src/telemetry-local.ts';

const caller = Schema.decodeSync(CallerIdentity)({
    subject: '019a95c0-0000-7000-8000-000000000021',
    session: '019a95c0-0000-7000-8000-000000000031',
    tenant: telemetryTenants.development.tenantId,
    kind: 'human',
});
/** Resolve current SQL identity on every call; the test never supplies an always-accepting identity resolver. */
const current = Effect.gen(
    /** The verifier seam is isolated here; live token provenance is exercised by the OIDC integration suite. */ function* () {
        const resolved = yield* (yield* IdentityResolver).resolve(caller);
        const stored = yield* (yield* IdentityStore).get('session', resolved.session);
        if (!stored) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
        return { caller: resolved, issuer: 'https://local-issuer.test', sessionExpiresAt: stored.value.expiresAt };
    }
);

afterEach(/** Never retain the isolated transport in another test. */ () => vi.unstubAllGlobals());

describe('persistent local telemetry commands', /** Verify no consent/identity seed is hidden in executable composition. */ () => {
    it.scopedLive(
        'reopens real identity and consent state for status, deliberate grant, durable revocation and session removal',
        /** Independent program invocations must retain policy but never retain authenticated authority. */ () =>
            Effect.gen(
                /** Every path is an isolated test-owned directory, never an operator dev database. */ function* () {
                    const root = yield* Effect.acquireRelease(
                        Effect.sync(
                            /** Allocate private persistent storage for this scenario only. */ () =>
                                mkdtempSync(join(tmpdir(), 'telemetry-local-'))
                        ),
                        /** Release only test-owned state after every scoped SQL connection has closed. */ (path) =>
                            Effect.sync(
                                /** A test must not leave synthetic principal/session rows in the developer environment. */ () =>
                                    rmSync(path, { recursive: true, force: true })
                            )
                    );
                    const directory = join(root, 'development');
                    mkdirSync(directory, { mode: 0o700 });
                    const database = localFile(Redacted.make(join(directory, 'tenant.sqlite')));
                    const migrations = yield* load(
                        fileURLToPath(new URL('../../../storage/migrations/sqlite', import.meta.url))
                    );
                    const store = identityStore.pipe(
                        Layer.provide(
                            Layer.effectDiscard(migrate('sqlite', migrations)).pipe(Layer.provideMerge(database))
                        ),
                        Layer.provide(Layer.succeed(CurrentTenant, { id: telemetryTenants.development.tenantId }))
                    );
                    /** Reopen trusted storage independently, as an onboarding/revocation command would. */
                    const manage = <A, E>(effect: Effect.Effect<A, E, IdentityStore>) =>
                        Effect.scoped(effect.pipe(Effect.provide(store)));
                    /** Commands inherit no API key, correlation root or token from the orb. */
                    const run = (
                        command?: string,
                        revision?: number,
                        environment = 'development',
                        credentials: ReadonlyArray<readonly [string, string]> = []
                    ) =>
                        localTelemetryProgram(current).pipe(
                            Effect.provide(NodeFileSystem.layer),
                            Effect.withConfigProvider(
                                ConfigProvider.fromMap(
                                    new Map([
                                        ['EVENTIVA_ENVIRONMENT', environment],
                                        ['TELEMETRY_STATE_DIRECTORY', root],
                                        ...(command ? [['TELEMETRY_COMMAND', command] as const] : []),
                                        ...(revision === undefined
                                            ? []
                                            : [['TELEMETRY_CONSENT_REVISION', String(revision)] as const]),
                                        ...credentials,
                                    ]),
                                    { pathDelim: '_' }
                                )
                            )
                        );
                    expect(Exit.isFailure(yield* Effect.exit(run()))).toBe(true);
                    // Provision only explicit test-owned SQL identities. The local executable never does this automatically.
                    yield* manage(
                        Effect.gen(
                            /** Link authority depends on active principal, membership and exact live session, not consent alone. */ function* () {
                                const identity = yield* IdentityStore;
                                yield* identity.put(
                                    'principal',
                                    { id: caller.subject, active: true, kind: 'human' },
                                    null
                                );
                                yield* identity.put(
                                    'membership',
                                    { id: caller.subject, active: true, roles: [] },
                                    null
                                );
                                yield* identity.put(
                                    'session',
                                    {
                                        id: caller.session,
                                        subject: caller.subject,
                                        expiresAt: EpochMillis.make(Date.now() + 60000),
                                        active: true,
                                        delegation: null,
                                    },
                                    null
                                );
                            }
                        )
                    );
                    expect((yield* run()).consent).toBeNull();
                    expect((yield* run('grant')).consent?.version).toBe(0);
                    expect((yield* run()).consent?.version).toBe(0);
                    const destinations: string[] = [];
                    vi.stubGlobal(
                        'fetch',
                        vi.fn<typeof fetch>(
                            /** Simulate vendor responses only; actual SQL identity and consent remain authoritative. */ (
                                url
                            ) => {
                                destinations.push(String(url));
                                return Promise.resolve(
                                    new Response(
                                        JSON.stringify({
                                            featureFlags: {
                                                'eventiva-telemetry-export-enabled': true,
                                                'eventiva-telemetry-correlation-pseudonymous-enabled': true,
                                            },
                                        }),
                                        { status: 200, headers: { 'content-type': 'application/json' } }
                                    )
                                );
                            }
                        )
                    );
                    const probe = yield* run('probe', undefined, 'development', [
                        ['POSTHOG_API_KEY', 'fixture-ingest-only'],
                        ['TELEMETRY_CORRELATION_ROOT_KEY', '01'.repeat(32)],
                    ]);
                    expect(probe).toMatchObject({
                        command: 'probe',
                        traceId: expect.stringMatching(/^[0-9a-f]{32}$/),
                        health: { accepted: 2, completed: 2, failed: 0, dropped: 0 },
                    });
                    expect(
                        destinations.some(
                            /** Require the real OTLP composition, not merely a flag request. */ (url) =>
                                url.endsWith('/i/v1/traces')
                        )
                    ).toBe(true);
                    expect(
                        destinations.some(
                            /** Require the SDK event adapter in the same scoped program. */ (url) =>
                                url.includes('/batch/')
                        )
                    ).toBe(true);
                    expect((yield* run('revoke', 0)).consent).toEqual({ expiresAt: 0, version: 1 });
                    expect((yield* run()).consent).toEqual({ expiresAt: 0, version: 1 });
                    expect(Exit.isFailure(yield* Effect.exit(run('grant', 0)))).toBe(true);
                    expect(Exit.isFailure(yield* Effect.exit(run('probe')))).toBe(true);
                    expect(Exit.isFailure(yield* Effect.exit(run('status', undefined, 'production')))).toBe(true);
                    expect(Exit.isFailure(yield* Effect.exit(run('status', undefined, 'staging')))).toBe(true);
                    yield* manage(
                        Effect.gen(
                            /** Revoke the real SQL session while retaining the consent row; the next command must authenticate again. */ function* () {
                                const identity = yield* IdentityStore;
                                const session = yield* identity.get('session', caller.session);
                                if (!session) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                yield* identity.put('session', { ...session.value, active: false }, session.version);
                            }
                        )
                    );
                    expect(Exit.isFailure(yield* Effect.exit(run()))).toBe(true);
                    chmodSync(directory, 0o777);
                    expect(Exit.isFailure(yield* Effect.exit(run()))).toBe(true);
                }
            )
    );
});
