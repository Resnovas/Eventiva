/**
 * @file tests/storage/src/telemetry-consent.spec.ts
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

import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { describe, expect, it } from '@effect/vitest';
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import {
    TelemetryConsent,
    type CorrelationIdentity,
    type TelemetryExportBinding,
} from '@eventiva/contracts/telemetry-export';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { telemetryConsentStore } from '@eventiva/integrations.sql/telemetry-consent';
import { ConfigProvider, Context, Effect, Exit, Layer, Redacted } from 'effect';
import { client } from '@eventiva/integrations.sql/postgres';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const tenantId = TenantId.make('019a95c0-0000-7000-8000-000000000001');
const binding: TelemetryExportBinding = {
    tenantId,
    destinationId: '019a95c0-0000-7000-8000-000000000011',
    moduleId: 'platform.telemetry',
    moduleVersion: '1.0.0',
    generation: 1,
    profile: 'baseline',
    operation: 'ordinary',
    purpose: 'diagnostics',
};
const identity: CorrelationIdentity = {
    namespace: Redacted.make('https://issuer.test'),
    subject: Redacted.make('canonical-subject'),
    session: Redacted.make('canonical-session'),
    expiresAt: 10000,
};
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Consent conformance requires disposable loopback eventiva_test');
/** Apply only the validated disposable PostgreSQL target's connection configuration. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));

describe('durable exact-scope telemetry consent', /** Register both SQL dialects without treating an absent database as a pass. */ () => {
    for (const dialect of ['sqlite', 'postgres'] as const) {
        it.scopedLive(
            `persists revocation and rejects stale grants across independent ${dialect} clients`,
            /** Reconnect to real storage and exercise optimistic races, exact scopes and fail-closed errors. */ () =>
                Effect.gen(
                    /** Each case owns its disposable database; no identity, consent or credentials are auto-seeded. */ function* () {
                        let connection: Layer.Layer<
                            SqlClient.SqlClient,
                            import('@effect/sql/SqlError').SqlError | import('effect/ConfigError').ConfigError,
                            never
                        >;
                        if (dialect === 'sqlite') {
                            const directory = yield* Effect.acquireRelease(
                                Effect.sync(
                                    /** Allocate private OS temporary state for an ephemeral database, not a deployment secret. */ () =>
                                        mkdtempSync(join(tmpdir(), 'eventiva-consent-'))
                                ),
                                /** Remove only the test-owned directory after clients close. */ (path) =>
                                    Effect.sync(
                                        /** Discard disposable test rows, never shared tenant state. */ () =>
                                            rmSync(path, { recursive: true, force: true })
                                    )
                            );
                            connection = localFile(Redacted.make(join(directory, 'consent.sqlite')));
                        } else {
                            const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                            const name = `consent_${randomUUID().replaceAll('-', '')}`;
                            yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                            yield* Effect.addFinalizer(
                                /** Drop only this isolated conformance database after reconnect clients release. */ () =>
                                    admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                            );
                            const url = new URL(local);
                            url.pathname = `/${name}`;
                            connection = pg(url.toString());
                        }
                        const first = Context.get(yield* Layer.build(connection), SqlClient.SqlClient);
                        yield* migrate(
                            dialect,
                            yield* load(
                                fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
                            )
                        ).pipe(Effect.provideService(SqlClient.SqlClient, first));
                        /** Construct independently acquired stores over the same durable database. */
                        const store = (sql: SqlClient.SqlClient) =>
                            Layer.build(telemetryConsentStore).pipe(
                                Effect.provideService(SqlClient.SqlClient, sql),
                                Effect.provideService(CurrentTenant, { id: tenantId }),
                                Effect.map(
                                    /** Expose the public consent contract, not private SQL implementation helpers. */ (
                                        context
                                    ) => Context.get(context, TelemetryConsent)
                                )
                            );
                        const a = yield* store(first);
                        expect(yield* a.get(binding, identity)).toBeUndefined();
                        yield* a.put(binding, identity, 9000, null);
                        expect(yield* a.get(binding, { ...identity, expiresAt: 20000 })).toEqual({
                            expiresAt: 9000,
                            version: 0,
                        });
                        const second = Context.get(yield* Layer.build(Layer.fresh(connection)), SqlClient.SqlClient);
                        const b = yield* store(second);
                        expect(yield* b.get(binding, identity)).toEqual({ expiresAt: 9000, version: 0 });
                        yield* b.put(binding, identity, 0, 0);
                        expect(Exit.isFailure(yield* Effect.exit(a.put(binding, identity, 19000, 0)))).toBe(true);
                        expect(Exit.isFailure(yield* Effect.exit(a.put(binding, identity, 19000, null)))).toBe(true);
                        expect(yield* a.get(binding, identity)).toEqual({ expiresAt: 0, version: 1 });
                        yield* a.put(binding, identity, 18000, 1);
                        expect(yield* b.get(binding, identity)).toEqual({ expiresAt: 18000, version: 2 });
                        for (const different of [
                            { ...binding, destinationId: '019a95c0-0000-7000-8000-000000000012' },
                            { ...binding, purpose: 'analytics' },
                            { ...binding, generation: 2 },
                            { ...binding, moduleId: 'other.telemetry' },
                            { ...binding, moduleVersion: '1.0.1' },
                            { ...binding, profile: 'sensitive' as const },
                            { ...binding, operation: 'financial' as const },
                        ])
                            expect(yield* a.get(different, identity)).toBeUndefined();
                        for (const different of [
                            { ...identity, namespace: Redacted.make('https://other.test') },
                            { ...identity, subject: Redacted.make('another-subject') },
                            { ...identity, session: Redacted.make('another-session') },
                        ])
                            expect(yield* a.get(binding, different)).toBeUndefined();
                        expect(
                            Exit.isFailure(
                                yield* Effect.exit(
                                    a.get(
                                        { ...binding, tenantId: TenantId.make('019a95c0-0000-7000-8000-000000000002') },
                                        identity
                                    )
                                )
                            )
                        ).toBe(true);
                        expect(Exit.isFailure(yield* Effect.exit(a.put(binding, identity, -1, 2)))).toBe(true);
                        expect(Exit.isFailure(yield* Effect.exit(a.put(binding, identity, 10, -1)))).toBe(true);
                        // Corrupt/absent storage must not become permissive consent or retain SQL/identity diagnostics.
                        yield* first`ALTER TABLE telemetry_consent RENAME TO unavailable_consent`;
                        expect(String(yield* Effect.exit(a.get(binding, identity)))).not.toContain('canonical-subject');
                        expect(Exit.isFailure(yield* Effect.exit(a.put(binding, identity, 19000, 2)))).toBe(true);
                    }
                )
        );
    }
});
