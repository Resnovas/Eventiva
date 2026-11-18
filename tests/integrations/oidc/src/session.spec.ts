/**
 * @file tests/integrations/oidc/src/session.spec.ts
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

import { IdentityStore, type IdentityKind, type IdentityRecords } from '@eventiva/contracts/identity';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { StorageFailure } from '@eventiva/contracts/storage';
import { closeOidcSession, openOidcSession } from '@eventiva/integrations.oidc/session';
import { type OidcAccessClaims, oidcSessionId } from '@eventiva/integrations.oidc/token';
import { describe, expect, it } from '@effect/vitest';
import { Effect, TestClock } from 'effect';

const issuer = 'https://issuer.test/realms/eventiva';
const human = SubjectId.make('019a95c0-0000-7000-8000-000000000101');
const agent = SubjectId.make('019a95c0-0000-7000-8000-000000000102');
const inactive = SubjectId.make('019a95c0-0000-7000-8000-000000000103');

/** A minimal in-memory IdentityStore with real create-only/CAS semantics for session provisioning tests. */
const memoryStore = () => {
    // Keep optimistic versions and external links private to each test so revocation cannot borrow prior fixture state.
    const rows = new Map<string, { version: number; value: unknown }>();
    const links = new Map<string, SubjectId>();
    let locks = 0;
    /** Key a record by kind and ID. */
    const key = (kind: IdentityKind, id: string) => `${kind}:${id}`;
    const store: IdentityStore['Type'] = {
        tenant: TenantId.make('019a95c0-0000-7000-8000-000000000001'),
        lock: Effect.sync(/** Count lock acquisitions so tests can see revocation serialization. */ () => void locks++),
        /** Return the stored record and version, if any. */
        get: (kind, id) =>
            Effect.sync(
                /** Read without copying; tests never mutate results. */ () =>
                    rows.get(key(kind, id)) as { version: number; value: IdentityRecords[typeof kind] } | undefined
            ),
        /** Create-only for null, otherwise compare-and-set on the version. */
        put: (kind, value, expectedVersion) =>
            Effect.suspend(
                /** Apply optimistic concurrency exactly like the SQL store. */ () => {
                    // Check before mutation so a stale version cannot overwrite the inactive session under test.
                    const current = rows.get(key(kind, value.id));
                    if ((current?.version ?? null) !== expectedVersion)
                        return Effect.fail(
                            new StorageFailure({ operation: 'identity', reason: 'identity-version-conflict' })
                        );
                    rows.set(key(kind, value.id), { version: (current?.version ?? -1) + 1, value });
                    return Effect.void;
                }
            ),
        /** No teams in this fixture. */
        teams: () => Effect.succeed([]),
        /** Record an exact issuer/subject link. */
        link: (external, subject) =>
            Effect.sync(
                /** Store the link. */ () => void links.set(`${external.issuer}\u0000${external.subject}`, subject)
            ),
        /** Resolve only the exact pair. */
        lookup: (external) =>
            Effect.sync(/** Read the link. */ () => links.get(`${external.issuer}\u0000${external.subject}`)),
        /** No receipts in this fixture. */
        audit: () => Effect.succeed([]),
    };
    return {
        store,
        rows,
        /** Report how many times the lock was taken. */
        locks: () => locks,
    };
};

/** Claims as the verifier would return them for one provider session. */
const claimsFor = (subject: string, sid = 'sid-1'): OidcAccessClaims => ({
    issuer,
    subject,
    audiences: ['eventiva-api'],
    scopes: ['eventiva.invoke'],
    session: oidcSessionId(issuer, sid),
    clientId: 'eventiva-web',
    expiresAt: 5000,
    notBefore: 500,
});

/** Seed one human, one agent and one inactive principal, each linked under the issuer. */
const seeded = Effect.gen(
    /** Build the store and its principals at a fixed clock. */ function* () {
        // Equal external-link setup isolates principal kind/activity as the reason provisioning accepts or refuses.
        yield* TestClock.setTime(1000);
        const memory = memoryStore();
        for (const [id, kind, active] of [
            [human, 'human', true],
            [agent, 'first-party-agent', true],
            [inactive, 'human', false],
        ] as const) {
            yield* memory.store.put('principal', { id, kind, active }, null);
            yield* memory.store.link({ issuer, subject: `ext-${id}` }, id);
        }
        return memory;
    }
);

describe('OIDC session provisioning', /** Trusted open/close of Eventiva sessions for provider sessions. */ () => {
    it.effect(
        'opens a session only for a linked, active human and is idempotent for the same subject',
        /** Happy path plus idempotent repeat. */ () =>
            Effect.gen(
                /** The created row carries the server-chosen expiry, not the token's. */ function* () {
                    // Repeat the same request without advancing revision to distinguish idempotent open from a refresh write.
                    const { store, rows, locks } = yield* seeded;
                    const claims = claimsFor(`ext-${human}`);
                    /** Run a provisioning effect against this test's store. */
                    const run = <A, E>(effect: Effect.Effect<A, E, IdentityStore>) =>
                        Effect.provideService(effect, IdentityStore, store);
                    expect(yield* run(openOidcSession(claims, 90000))).toBe(claims.session);
                    expect(rows.get(`session:${claims.session}`)).toEqual({
                        version: 0,
                        value: { id: claims.session, subject: human, expiresAt: 90000, active: true, delegation: null },
                    });
                    expect(yield* run(openOidcSession(claims, 90000))).toBe(claims.session);
                    expect(rows.get(`session:${claims.session}`)?.version).toBe(0);
                    expect(locks()).toBe(2);
                }
            )
    );

    it.effect(
        'refuses unlinked, inactive, non-human, expired and conflicting sessions',
        /** Every refusal leaves no session row behind. */ () =>
            Effect.gen(
                /** Map each case to its closed refusal reason. */ function* () {
                    const { store, rows } = yield* seeded;
                    /** Open a session and return the refusal reason it fails with. */
                    const reason = (claims: OidcAccessClaims, expiresAt = 90000) =>
                        openOidcSession(claims, expiresAt).pipe(
                            Effect.provideService(IdentityStore, store),
                            Effect.flip,
                            Effect.map(
                                /** Keep the tag and reason only. */ (error) =>
                                    error._tag === 'OidcSessionRefused' ? error.reason : error._tag
                            )
                        );
                    expect(yield* reason(claimsFor('never-linked'))).toBe('unlinked');
                    expect(yield* reason(claimsFor(`ext-${inactive}`))).toBe('inactive-principal');
                    expect(yield* reason(claimsFor(`ext-${agent}`))).toBe('not-human');
                    expect(yield* reason(claimsFor(`ext-${human}`), 1000)).toBe('expired');
                    expect(yield* reason({ ...claimsFor(`ext-${human}`), expiresAt: 1000 })).toBe('expired');
                    expect([...rows.keys()].filter(/** Sessions only. */ (k) => k.startsWith('session:'))).toEqual([]);
                    // A provider session already bound to another subject, or closed, is never reused.
                    const taken = claimsFor(`ext-${human}`, 'sid-taken');
                    yield* store.put(
                        'session',
                        { id: taken.session, subject: agent, expiresAt: 90000, active: true, delegation: null },
                        null
                    );
                    expect(yield* reason(taken)).toBe('conflict');
                }
            )
    );

    it.effect(
        'closes a session with compare-and-set and never reopens it',
        /** Revocation is final for that provider session. */ () =>
            Effect.gen(
                /** Close twice and close an unknown session; then a reopen attempt conflicts. */ function* () {
                    // Keep the same provider session identifier through revocation; opening a fresh identifier would miss resurrection.
                    const { store, rows } = yield* seeded;
                    const claims = claimsFor(`ext-${human}`);
                    /** Run a provisioning effect against this test's store. */
                    const run = <A, E>(effect: Effect.Effect<A, E, IdentityStore>) =>
                        Effect.provideService(effect, IdentityStore, store);
                    yield* run(openOidcSession(claims, 90000));
                    yield* run(closeOidcSession(claims.session));
                    expect(rows.get(`session:${claims.session}`)).toMatchObject({
                        version: 1,
                        value: { active: false },
                    });
                    yield* run(closeOidcSession(claims.session));
                    yield* run(closeOidcSession(SessionId.make('019a95c0-0000-7000-8000-0000000009ff')));
                    expect(rows.get(`session:${claims.session}`)?.version).toBe(1);
                    const reopened = yield* Effect.flip(run(openOidcSession(claims, 90000)));
                    expect(reopened).toMatchObject({ _tag: 'OidcSessionRefused', reason: 'conflict' });
                }
            )
    );
});
