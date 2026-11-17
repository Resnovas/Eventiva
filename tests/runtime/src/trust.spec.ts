/**
 * @file tests/runtime/src/trust.spec.ts
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

import { expect, it } from '@effect/vitest';
import {
    Assurance,
    BrokerGate,
    IdentityGate,
    ResourceGate,
    TrustEvidence,
    TrustFailure,
    TrustKeyVersion,
    TrustPolicy,
    TrustReplay,
    TrustRequest,
    TrustUnavailable,
    WorkloadGate,
    type TrustGate,
    type TrustVerifier,
} from '@eventiva/contracts/trust';
import { trustPreflight } from '@eventiva/runtime/trust';
import { Effect, Either, Exit, Layer, Ref, Schema } from 'effect';
import { inspect } from 'node:util';

const uuid = (n: number): string => `019b0000-0000-7000-8000-${n.toString().padStart(12, '0')}`;
const request = Schema.decodeUnknownSync(TrustRequest)({
    scope: {
        tenant: uuid(1),
        subject: uuid(2),
        audience: 'fixture.server',
        resource: 'fixture.record',
        resourceId: uuid(3),
        purpose: 'fixture.read',
        profile: 'sensitive',
        operation: 'metadata',
    },
    nonce: uuid(4),
    keys: {
        root: uuid(5),
        signingAuthority: uuid(6),
        encryptionAuthority: uuid(7),
        kek: uuid(8),
        kekVersion: 1,
        dek: uuid(9),
        dekVersion: 1,
    },
});
const policy: TrustPolicy = {
    now: 100,
    freshAfter: { identity: 90, resource: 90, workload: 90, broker: 90 },
    minimumAssurance: 'A1',
};
const gates = ['identity', 'resource', 'workload', 'broker', 'replay'] as const;
type Options = {
    readonly missing?: TrustGate;
    readonly failed?: TrustGate;
    readonly defective?: TrustGate;
    readonly interrupted?: TrustGate;
    readonly reason?: TrustFailure['reason'];
    readonly change?: (evidence: TrustEvidence) => TrustEvidence;
    readonly assurance?: Assurance;
    readonly receipt?: string;
};

/** VOLATILE FIXTURE ONLY. Ref atomicity is not SQL/crash/custody/provider conformance. */
const fixture = (options: Options = {}) =>
    Effect.gen(function* () {
        const consumed = yield* Ref.make(false);
        const calls = yield* Ref.make<ReadonlyArray<TrustGate>>([]);
        const port = (gate: TrustEvidence['gate']): TrustVerifier => ({
            verify: (input) =>
                Effect.gen(function* () {
                    yield* Ref.update(calls, (all) => [...all, gate]);
                    if (options.defective === gate) return yield* Effect.die('PRIVATE-PROVIDER-CANARY');
                    if (options.interrupted === gate) return yield* Effect.interrupt;
                    if (options.failed === gate)
                        return yield* Effect.fail(new TrustFailure({ gate, reason: options.reason ?? 'denied' }));
                    const evidence: TrustEvidence = {
                        gate,
                        request: input,
                        reference: uuid(10 + gates.indexOf(gate)),
                        issuedAt: 90,
                        expiresAt: 101,
                        revocationCheckedAt: 100,
                        assurance: options.assurance ?? 'A4',
                    };
                    return options.change ? options.change(evidence) : evidence;
                }),
        });
        const replay = TrustReplay.of({
            consume: () =>
                Effect.gen(function* () {
                    yield* Ref.update(calls, (all): ReadonlyArray<TrustGate> => [...all, 'replay']);
                    if (options.defective === 'replay') return yield* Effect.die('PRIVATE-PROVIDER-CANARY');
                    if (options.interrupted === 'replay') return yield* Effect.interrupt;
                    if (options.failed === 'replay')
                        return yield* Effect.fail(
                            new TrustFailure({ gate: 'replay', reason: options.reason ?? 'unavailable' })
                        );
                    const used = yield* Ref.getAndSet(consumed, true);
                    if (used) return yield* Effect.fail(new TrustFailure({ gate: 'replay', reason: 'replay' }));
                    return options.receipt ?? uuid(15);
                }),
        });
        const layer = Layer.mergeAll(
            options.missing === 'identity' ? Layer.empty : Layer.succeed(IdentityGate, port('identity')),
            options.missing === 'resource' ? Layer.empty : Layer.succeed(ResourceGate, port('resource')),
            options.missing === 'workload' ? Layer.empty : Layer.succeed(WorkloadGate, port('workload')),
            options.missing === 'broker' ? Layer.empty : Layer.succeed(BrokerGate, port('broker')),
            options.missing === 'replay' ? Layer.empty : Layer.succeed(TrustReplay, replay)
        );
        return {
            layer,
            run: (input = request, settings = policy) => trustPreflight(input, settings).pipe(Effect.provide(layer)),
            calls,
        };
    });

for (const gate of gates) {
    it.effect(`sanitizes ${gate} defects without invoking later gates`, () =>
        Effect.gen(function* () {
            const f = yield* fixture({ defective: gate });
            const result = yield* Effect.exit(f.run());
            expect(result).toEqual(Exit.fail(new TrustFailure({ gate, reason: 'unavailable' })));
            expect(inspect(result)).not.toContain('PRIVATE-PROVIDER-CANARY');
            expect(yield* Ref.get(f.calls)).toEqual(gates.slice(0, gates.indexOf(gate) + 1));
        })
    );
    it.effect(`preserves ${gate} interruption without invoking later gates`, () =>
        Effect.gen(function* () {
            const f = yield* fixture({ interrupted: gate });
            expect(Exit.isInterrupted(yield* Effect.exit(f.run()))).toBe(true);
            expect(yield* Ref.get(f.calls)).toEqual(gates.slice(0, gates.indexOf(gate) + 1));
        })
    );
    it.effect(`fails closed with missing ${gate}`, () =>
        Effect.gen(function* () {
            const f = yield* fixture({ missing: gate });
            expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason: 'unavailable' }));
            expect(yield* Ref.get(f.calls)).toEqual([]);
        })
    );
    for (const reason of ['denied', 'unavailable', 'revoked'] as const) {
        it.effect(`preserves safe ${gate} ${reason} failure and stops`, () =>
            Effect.gen(function* () {
                const f = yield* fixture({ failed: gate, reason });
                expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason }));
                expect(yield* Ref.get(f.calls)).toEqual(gates.slice(0, gates.indexOf(gate) + 1));
            })
        );
    }
}

it.effect('sanitizes synchronous provider throws and malformed failure reasons', () =>
    Effect.gen(function* () {
        const canary = 'PRIVATE-PROVIDER-FAILURE';
        const f = yield* fixture();
        const ports: ReadonlyArray<TrustVerifier> = [
            {
                verify: () => {
                    throw new Error(canary);
                },
            },
            {
                verify: () =>
                    Effect.fail(
                        Object.assign(new TrustFailure({ gate: 'broker', reason: 'denied' }), { reason: canary })
                    ),
            },
        ];
        for (const port of ports) {
            const result = yield* Effect.exit(
                trustPreflight(request, policy).pipe(
                    Effect.provide(Layer.merge(f.layer, Layer.succeed(IdentityGate, port)))
                )
            );
            expect(result).toEqual(Exit.fail(new TrustFailure({ gate: 'identity', reason: 'unavailable' })));
            expect(inspect(result)).not.toContain(canary);
        }
        expect(yield* Ref.get(f.calls)).toEqual([]);
    })
);

it.effect('safe default and absent services deny without defects', () =>
    Effect.gen(function* () {
        expect(yield* Effect.flip(trustPreflight(request, policy))).toEqual(
            new TrustFailure({ gate: 'identity', reason: 'unavailable' })
        );
        expect(yield* Effect.flip(trustPreflight(request, policy).pipe(Effect.provide(TrustUnavailable)))).toEqual(
            new TrustFailure({ gate: 'identity', reason: 'unavailable' })
        );
    })
);

it.effect('every safe-default port individually refuses verification or consumption', () =>
    Effect.gen(function* () {
        const identity = yield* IdentityGate;
        const resource = yield* ResourceGate;
        const workload = yield* WorkloadGate;
        const broker = yield* BrokerGate;
        const replay = yield* TrustReplay;
        const ports: ReadonlyArray<readonly [TrustEvidence['gate'], TrustVerifier]> = [
            ['identity', identity],
            ['resource', resource],
            ['workload', workload],
            ['broker', broker],
        ];
        for (const [gate, port] of ports) {
            expect(yield* Effect.flip(port.verify(request, policy))).toEqual(
                new TrustFailure({ gate, reason: 'unavailable' })
            );
        }
        expect(yield* Effect.flip(replay.consume(request, policy))).toEqual(
            new TrustFailure({ gate: 'replay', reason: 'unavailable' })
        );
    }).pipe(Effect.provide(TrustUnavailable))
);

const mismatches: ReadonlyArray<readonly [string, (r: TrustRequest) => TrustRequest]> = [
    ['tenant', (r) => Schema.decodeUnknownSync(TrustRequest)({ ...r, scope: { ...r.scope, tenant: uuid(99) } })],
    ['subject', (r) => Schema.decodeUnknownSync(TrustRequest)({ ...r, scope: { ...r.scope, subject: uuid(99) } })],
    ['audience', (r) => ({ ...r, scope: { ...r.scope, audience: 'other.server' } })],
    ['resource', (r) => ({ ...r, scope: { ...r.scope, resource: 'other.record' } })],
    ['record', (r) => ({ ...r, scope: { ...r.scope, resourceId: uuid(99) } })],
    ['purpose', (r) => ({ ...r, scope: { ...r.scope, purpose: 'other.read' } })],
    ['profile', (r) => ({ ...r, scope: { ...r.scope, profile: 'baseline' } })],
    ['operation', (r) => ({ ...r, scope: { ...r.scope, operation: 'server-decrypt' } })],
    ['nonce', (r) => ({ ...r, nonce: uuid(99) })],
    ...(['root', 'signingAuthority', 'encryptionAuthority', 'kek', 'dek'] as const).map(
        (key): readonly [string, (r: TrustRequest) => TrustRequest] => [
            key,
            (r) => ({ ...r, keys: { ...r.keys, [key]: uuid(99) } }),
        ]
    ),
    ...(['kekVersion', 'dekVersion'] as const).map((key): readonly [string, (r: TrustRequest) => TrustRequest] => [
        key,
        (r) => ({ ...r, keys: { ...r.keys, [key]: 2 } }),
    ]),
];
for (const gate of ['identity', 'resource', 'workload', 'broker'] as const) {
    for (const [name, change] of mismatches) {
        it.effect(`rejects ${gate} mismatched ${name}`, () =>
            Effect.gen(function* () {
                const f = yield* fixture({
                    change: (e) => (e.gate === gate ? { ...e, request: change(e.request) } : e),
                });
                expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason: 'binding' }));
                expect(yield* Ref.get(f.calls)).not.toContain('replay');
            })
        );
    }
    for (const patch of [
        { issuedAt: 89 },
        { issuedAt: 101 },
        { expiresAt: 100 },
        { revocationCheckedAt: 89 },
        { revocationCheckedAt: 101 },
    ]) {
        it.effect(`rejects ${gate} stale/future metadata ${JSON.stringify(patch)}`, () =>
            Effect.gen(function* () {
                const f = yield* fixture({ change: (e) => (e.gate === gate ? { ...e, ...patch } : e) });
                expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason: 'stale' }));
            })
        );
    }
}

for (const assurance of Assurance.literals) {
    for (const profile of ['baseline', 'sensitive', 'restricted', 'vault'] as const) {
        for (const operation of ['metadata', 'server-decrypt'] as const) {
            it.effect(`${profile}/${operation}/${assurance} floor`, () =>
                Effect.gen(function* () {
                    const f = yield* fixture({ assurance });
                    const result = yield* Effect.either(
                        f.run({ ...request, scope: { ...request.scope, profile, operation } })
                    );
                    const floor =
                        profile === 'restricted' && operation === 'server-decrypt' ? 3 : profile === 'baseline' ? 0 : 1;
                    if (profile === 'vault' && operation === 'server-decrypt') {
                        expect(result).toEqual(Either.left(new TrustFailure({ gate: 'preflight', reason: 'vault' })));
                    } else if (Assurance.literals.indexOf(assurance) < floor) {
                        expect(result).toEqual(
                            Either.left(new TrustFailure({ gate: 'workload', reason: 'assurance' }))
                        );
                    } else {
                        expect(result).toMatchObject({
                            _tag: 'Right',
                            right: { decision: 'metadata-preflight-only', release: 'denied' },
                        });
                    }
                })
            );
        }
    }
}

it.effect('tenant policy can tighten to A5; current evidence cannot weaken it', () =>
    Effect.gen(function* () {
        const f = yield* fixture();
        expect(yield* Effect.flip(f.run(request, { ...policy, minimumAssurance: 'A5' }))).toEqual(
            new TrustFailure({ gate: 'workload', reason: 'assurance' })
        );
    })
);

it.effect('consumes once atomically under concurrent preflights', () =>
    Effect.gen(function* () {
        const f = yield* fixture();
        const results = yield* Effect.all([Effect.either(f.run()), Effect.either(f.run())], {
            concurrency: 'unbounded',
        });
        expect(results.filter(Either.isRight)).toHaveLength(1);
        expect(results.filter(Either.isLeft).map((r) => r.left)).toEqual([
            new TrustFailure({ gate: 'replay', reason: 'replay' }),
        ]);
    })
);

it.effect('rotation metadata is algorithm agnostic and versions remain exact', () =>
    Effect.gen(function* () {
        const f = yield* fixture();
        const rotated = { ...request, keys: { ...request.keys, kekVersion: 300, dekVersion: 900 } };
        expect((yield* f.run(rotated)).release).toBe('denied');
        expect(Schema.is(TrustKeyVersion)({ ...request.keys, algorithm: 'unapproved' })).toBe(false);
        expect(Schema.is(TrustKeyVersion)({ ...request.keys, dekVersion: 0 })).toBe(false);
        expect(
            Schema.is(TrustKeyVersion)({ ...request.keys, signingAuthority: request.keys.encryptionAuthority })
        ).toBe(false);
        expect(
            Schema.is(TrustKeyVersion)({
                ...request.keys,
                encryptionAuthority: request.keys.signingAuthority.toUpperCase(),
            })
        ).toBe(false);
    })
);

it.effect('rejects payloads and does not serialize secret canaries in errors/audit', () =>
    Effect.gen(function* () {
        const canary = 'SECRET-CANARY-DO-NOT-EXPOSE';
        const f = yield* fixture();
        const bad = { ...request, plaintext: canary };
        const error = yield* Effect.flip(f.run(bad));
        const serialized = [JSON.stringify(error), String(error), inspect(error)].join('|');
        expect(serialized).not.toContain(canary);
        expect(serialized).not.toContain(request.scope.resourceId);
        const output = yield* f.run();
        expect(JSON.stringify(output)).not.toContain(canary);
        expect(JSON.stringify(output)).not.toContain(request.scope.resourceId);
        const invalid = yield* fixture({ receipt: canary });
        expect(JSON.stringify(yield* Effect.flip(invalid.run()))).not.toContain(canary);
    })
);

it.effect('rejects wrong gate, invalid evidence and invalid trusted time policy', () =>
    Effect.gen(function* () {
        const wrong = yield* fixture({ change: (e) => ({ ...e, gate: 'broker' }) });
        expect(yield* Effect.flip(wrong.run())).toEqual(new TrustFailure({ gate: 'identity', reason: 'binding' }));
        const invalid = yield* fixture({ change: (e) => ({ ...e, expiresAt: -1 }) });
        expect(yield* Effect.flip(invalid.run())).toEqual(new TrustFailure({ gate: 'identity', reason: 'invalid' }));
        const f = yield* fixture();
        expect(
            yield* Effect.flip(f.run(request, { ...policy, freshAfter: { ...policy.freshAfter, broker: 101 } }))
        ).toEqual(new TrustFailure({ gate: 'preflight', reason: 'invalid' }));
    })
);

it.effect('checks revocation ordering even when both timestamps are within the freshness window', () =>
    Effect.gen(function* () {
        const f = yield* fixture({ change: (e) => ({ ...e, issuedAt: 95, revocationCheckedAt: 94 }) });
        expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate: 'identity', reason: 'stale' }));
        expect(yield* Ref.get(f.calls)).not.toContain('replay');
    })
);

it.effect('valid metadata is not cryptographic proof and safe-default examples remain unavailable', () =>
    Effect.gen(function* () {
        const decodedRequest = yield* Schema.decodeUnknown(Schema.parseJson(TrustRequest))(JSON.stringify(request));
        const decodedPolicy = yield* Schema.decodeUnknown(Schema.parseJson(TrustPolicy))(JSON.stringify(policy));
        expect(yield* Effect.flip(trustPreflight(decodedRequest, decodedPolicy))).toEqual(
            new TrustFailure({ gate: 'identity', reason: 'unavailable' })
        );
        const f = yield* fixture();
        const result = yield* f.run(decodedRequest, decodedPolicy);
        expect(result.release).toBe('denied');
        expect(Object.keys(result)).toEqual(['decision', 'release', 'audit']);
    })
);

it.effect('invalid policy metadata and evidence payloads fail without consuming a nonce', () =>
    Effect.gen(function* () {
        const f = yield* fixture();
        expect(yield* Effect.flip(f.run(request, { ...policy, now: -1 }))).toEqual(
            new TrustFailure({ gate: 'preflight', reason: 'invalid' })
        );
        const evidencePayload = yield* fixture({ change: (e) => ({ ...e, plaintext: 'SECRET-EVIDENCE-CANARY' }) });
        const failure = yield* Effect.flip(evidencePayload.run());
        expect(failure).toEqual(new TrustFailure({ gate: 'identity', reason: 'invalid' }));
        expect(inspect(failure)).not.toContain('SECRET-EVIDENCE-CANARY');
        expect(yield* Ref.get(evidencePayload.calls)).not.toContain('replay');
    })
);
