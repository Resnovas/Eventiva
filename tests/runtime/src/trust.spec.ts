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
import { Deferred, Effect, Either, Exit, Fiber, Layer, Ref, Schema } from 'effect';
import { inspect } from 'node:util';

/** Generate stable distinct references for request and evidence bindings. */
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
    /** Mutate fixture evidence after construction without changing the requested binding. */
    readonly change?: (evidence: TrustEvidence) => TrustEvidence;
    readonly assurance?: Assurance;
    readonly receipt?: string;
    /** Exercise adapter-owned input references before producing evidence. */
    readonly beforeVerify?: (
        gate: TrustEvidence['gate'],
        input: TrustRequest,
        settings: TrustPolicy
    ) => Effect.Effect<void>;
    /** Observe the final admitted binding without replacing replay arbitration. */
    readonly beforeReplay?: (input: TrustRequest, settings: TrustPolicy) => Effect.Effect<void>;
};

/** VOLATILE FIXTURE ONLY. Ref atomicity is not SQL/crash/custody/provider conformance. */
const fixture = (options: Options = {}) =>
    Effect.gen(
        /** Build observable gate ports and one atomic in-memory nonce consumption cell. */ function* () {
            // Keep call order separate from nonce state so early gate failures can prove replay was never reached.
            const consumed = yield* Ref.make(false);
            const calls = yield* Ref.make<ReadonlyArray<TrustGate>>([]);
            /** Build one gate's metadata verifier with independently injectable failure behavior. */
            const port = (gate: TrustEvidence['gate']): TrustVerifier => ({
                /** Record gate entry before applying faults or returning request-bound evidence. */
                verify: (input, settings) =>
                    Effect.gen(
                        /** Produce matching metadata unless this scenario injects a gate fault or mutation. */ function* () {
                            // Record admission even for faults so later-gate suppression is independently observable.
                            yield* Ref.update(
                                calls,
                                /** Append this gate without discarding previous admission order. */ (all) => [
                                    ...all,
                                    gate,
                                ]
                            );
                            if (options.beforeVerify) yield* options.beforeVerify(gate, input, settings);
                            if (options.defective === gate) return yield* Effect.die('PRIVATE-PROVIDER-CANARY');
                            if (options.interrupted === gate) return yield* Effect.interrupt;
                            if (options.failed === gate)
                                return yield* Effect.fail(
                                    new TrustFailure({ gate, reason: options.reason ?? 'denied' })
                                );
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
                        }
                    ),
            });
            const replay = TrustReplay.of({
                /** Consume the fixture nonce at most once after optional replay-port fault injection. */
                consume: (input, settings) =>
                    Effect.gen(
                        /** Model atomic nonce consumption, not durable replay protection. */ function* () {
                            // Fault injection precedes consumption; the atomic swap arbitrates concurrent successful preflights.
                            yield* Ref.update(
                                calls,
                                /** Record replay admission after all verification gates. */ (
                                    all
                                ): ReadonlyArray<TrustGate> => [...all, 'replay']
                            );
                            if (options.beforeReplay) yield* options.beforeReplay(input, settings);
                            if (options.defective === 'replay') return yield* Effect.die('PRIVATE-PROVIDER-CANARY');
                            if (options.interrupted === 'replay') return yield* Effect.interrupt;
                            if (options.failed === 'replay')
                                return yield* Effect.fail(
                                    new TrustFailure({ gate: 'replay', reason: options.reason ?? 'unavailable' })
                                );
                            const used = yield* Ref.getAndSet(consumed, true);
                            if (used) return yield* Effect.fail(new TrustFailure({ gate: 'replay', reason: 'replay' }));
                            return options.receipt ?? uuid(15);
                        }
                    ),
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
                /** Run metadata preflight with this fixture's optional gate services. */
                run: (input = request, settings = policy) =>
                    trustPreflight(input, settings).pipe(Effect.provide(layer)),
                calls,
                consumed,
            };
        }
    );

for (const gate of gates) {
    it.effect(
        `sanitizes ${gate} defects without invoking later gates`,
        /** Inject a private defect at the selected gate. */ () =>
            Effect.gen(
                /** Verify bounded failure translation and exact early-stop gate ordering. */ function* () {
                    const f = yield* fixture({ defective: gate });
                    const result = yield* Effect.exit(f.run());
                    expect(result).toEqual(Exit.fail(new TrustFailure({ gate, reason: 'unavailable' })));
                    expect(inspect(result)).not.toContain('PRIVATE-PROVIDER-CANARY');
                    expect(yield* Ref.get(f.calls)).toEqual(gates.slice(0, gates.indexOf(gate) + 1));
                }
            )
    );
    it.effect(
        `preserves ${gate} interruption without invoking later gates`,
        /** Interrupt the selected verifier rather than failing it. */ () =>
            Effect.gen(
                /** Verify interruption remains cancellation and suppresses later gates. */ function* () {
                    const f = yield* fixture({ interrupted: gate });
                    expect(Exit.isInterrupted(yield* Effect.exit(f.run()))).toBe(true);
                    expect(yield* Ref.get(f.calls)).toEqual(gates.slice(0, gates.indexOf(gate) + 1));
                }
            )
    );
    it.effect(
        `fails closed with missing ${gate}`,
        /** Omit exactly one required service from the fixture layer. */ () =>
            Effect.gen(
                /** Verify missing-service preflight rejects before any provider is invoked. */ function* () {
                    const f = yield* fixture({ missing: gate });
                    expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason: 'unavailable' }));
                    expect(yield* Ref.get(f.calls)).toEqual([]);
                }
            )
    );
    for (const reason of ['denied', 'unavailable', 'revoked'] as const) {
        it.effect(
            `preserves safe ${gate} ${reason} failure and stops`,
            /** Inject a typed safe failure at this gate. */ () =>
                Effect.gen(
                    /** Verify safe reason preservation and no later verification work. */ function* () {
                        const f = yield* fixture({ failed: gate, reason });
                        expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason }));
                        expect(yield* Ref.get(f.calls)).toEqual(gates.slice(0, gates.indexOf(gate) + 1));
                    }
                )
        );
    }
}

it.effect(
    'sanitizes synchronous provider throws and malformed failure reasons',
    /** Exercise failures outside the ordinary typed provider contract. */ () =>
        Effect.gen(
            /** Verify thrown or malformed private causes normalize to bounded gate unavailability. */ function* () {
                // Override the first gate so malformed failures cannot be hidden by successful later verification.
                const canary = 'PRIVATE-PROVIDER-FAILURE';
                const f = yield* fixture();
                const ports: ReadonlyArray<TrustVerifier> = [
                    {
                        /** Throw before returning an Effect to exercise synchronous vendor failure handling. */
                        verify: () => {
                            throw new Error(canary);
                        },
                    },
                    {
                        /** Return a deliberately malformed safe-error instance with private reason text. */
                        verify: () =>
                            Effect.fail(
                                Object.assign(new TrustFailure({ gate: 'broker', reason: 'denied' }), {
                                    reason: canary,
                                })
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
            }
        )
);

it.effect(
    'safe default and absent services deny without defects',
    /** Compare absent services with the explicit unavailable layer. */ () =>
        Effect.gen(
            /** Verify both unconfigured paths fail closed with the same typed identity failure. */ function* () {
                expect(yield* Effect.flip(trustPreflight(request, policy))).toEqual(
                    new TrustFailure({ gate: 'identity', reason: 'unavailable' })
                );
                expect(
                    yield* Effect.flip(trustPreflight(request, policy).pipe(Effect.provide(TrustUnavailable)))
                ).toEqual(new TrustFailure({ gate: 'identity', reason: 'unavailable' }));
            }
        )
);

it.effect(
    'every safe-default port individually refuses verification or consumption',
    /** Probe each unavailable service directly rather than only preflight's first failure. */ () =>
        Effect.gen(
            /** Verify every verification and replay default independently refuses authority. */ function* () {
                // Direct calls expose unsafe later defaults that an early identity rejection would otherwise mask.
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
            }
        ).pipe(Effect.provide(TrustUnavailable))
);

const mismatches: ReadonlyArray<
    readonly [
        string,
        /** Substitute one evidence request dimension while retaining all others. */ (r: TrustRequest) => TrustRequest,
    ]
> = [
    [
        'tenant',
        /** Substitute a different schema-validated tenant binding. */ (r) =>
            Schema.decodeUnknownSync(TrustRequest)({ ...r, scope: { ...r.scope, tenant: uuid(99) } }),
    ],
    [
        'subject',
        /** Substitute a different schema-validated subject binding. */ (r) =>
            Schema.decodeUnknownSync(TrustRequest)({ ...r, scope: { ...r.scope, subject: uuid(99) } }),
    ],
    [
        'audience',
        /** Bind evidence to a different server audience. */ (r) => ({
            ...r,
            scope: { ...r.scope, audience: 'other.server' },
        }),
    ],
    [
        'resource',
        /** Bind evidence to another resource type. */ (r) => ({
            ...r,
            scope: { ...r.scope, resource: 'other.record' },
        }),
    ],
    [
        'record',
        /** Bind evidence to another record reference. */ (r) => ({
            ...r,
            scope: { ...r.scope, resourceId: uuid(99) },
        }),
    ],
    [
        'purpose',
        /** Bind evidence to a different access purpose. */ (r) => ({
            ...r,
            scope: { ...r.scope, purpose: 'other.read' },
        }),
    ],
    [
        'profile',
        /** Weaken only the evidence request's classification profile. */ (r) => ({
            ...r,
            scope: { ...r.scope, profile: 'baseline' },
        }),
    ],
    [
        'operation',
        /** Change metadata access into a server-decrypt evidence binding. */ (r) => ({
            ...r,
            scope: { ...r.scope, operation: 'server-decrypt' },
        }),
    ],
    ['nonce', /** Bind otherwise identical evidence to a different nonce. */ (r) => ({ ...r, nonce: uuid(99) })],
    ...(['root', 'signingAuthority', 'encryptionAuthority', 'kek', 'dek'] as const).map(
        /** Build an independent key-reference substitution case. */ (
            key
        ): readonly [string, /** Replace the selected key reference only. */ (r: TrustRequest) => TrustRequest] => [
            key,
            /** Preserve all key metadata except the selected authority reference. */ (r) => ({
                ...r,
                keys: { ...r.keys, [key]: uuid(99) },
            }),
        ]
    ),
    ...(['kekVersion', 'dekVersion'] as const).map(
        /** Build an independent key-version mismatch case. */ (
            key
        ): readonly [
            string,
            /** Replace the selected version without rotating its key reference. */ (r: TrustRequest) => TrustRequest,
        ] => [
            key,
            /** Change only this version to expose nonexact evidence matching. */ (r) => ({
                ...r,
                keys: { ...r.keys, [key]: 2 },
            }),
        ]
    ),
];
for (const gate of ['identity', 'resource', 'workload', 'broker'] as const) {
    for (const [name, change] of mismatches) {
        it.effect(
            `rejects ${gate} mismatched ${name}`,
            /** Inject this binding substitution at one verification gate. */ () =>
                Effect.gen(
                    /** Verify mismatched evidence is denied before nonce consumption. */ function* () {
                        const f = yield* fixture({
                            /** Mutate only the selected gate's evidence request. */ change: (e) =>
                                e.gate === gate ? { ...e, request: change(e.request) } : e,
                        });
                        expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason: 'binding' }));
                        expect(yield* Ref.get(f.calls)).not.toContain('replay');
                    }
                )
        );
    }
    for (const patch of [
        { issuedAt: 89 },
        { issuedAt: 101 },
        { expiresAt: 100 },
        { revocationCheckedAt: 89 },
        { revocationCheckedAt: 101 },
    ]) {
        it.effect(
            `rejects ${gate} stale/future metadata ${JSON.stringify(patch)}`,
            /** Inject one timestamp boundary violation at this gate. */ () =>
                Effect.gen(
                    /** Verify stale or future evidence cannot satisfy preflight freshness. */ function* () {
                        const f = yield* fixture({
                            /** Alter timestamps only for the selected verifier. */ change: (e) =>
                                e.gate === gate ? { ...e, ...patch } : e,
                        });
                        expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate, reason: 'stale' }));
                    }
                )
        );
    }
}

for (const assurance of Assurance.literals) {
    for (const profile of ['baseline', 'sensitive', 'restricted', 'vault'] as const) {
        for (const operation of ['metadata', 'server-decrypt'] as const) {
            it.effect(
                `${profile}/${operation}/${assurance} floor`,
                /** Exercise this profile, operation and assurance combination. */ () =>
                    Effect.gen(
                        /** Compare the assurance matrix with metadata-only success and absolute vault denial. */ function* () {
                            // Vault decryption is categorically denied; other cases compare evidence assurance with the operation-specific floor.
                            const f = yield* fixture({ assurance });
                            const result = yield* Effect.either(
                                f.run({ ...request, scope: { ...request.scope, profile, operation } })
                            );
                            const floor =
                                profile === 'restricted' && operation === 'server-decrypt'
                                    ? 3
                                    : profile === 'baseline'
                                      ? 0
                                      : 1;
                            if (profile === 'vault' && operation === 'server-decrypt') {
                                expect(result).toEqual(
                                    Either.left(new TrustFailure({ gate: 'preflight', reason: 'vault' }))
                                );
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
                        }
                    )
            );
        }
    }
}

it.effect(
    'tenant policy can tighten to A5; current evidence cannot weaken it',
    /** Raise policy above the fixture's default evidence assurance. */ () =>
        Effect.gen(
            /** Verify caller-supplied evidence cannot lower the trusted tenant assurance minimum. */ function* () {
                const f = yield* fixture();
                expect(yield* Effect.flip(f.run(request, { ...policy, minimumAssurance: 'A5' }))).toEqual(
                    new TrustFailure({ gate: 'workload', reason: 'assurance' })
                );
            }
        )
);

it.effect(
    'isolates the trusted A5 floor from identity adapter mutation',
    /** Attempt a policy downgrade through the public verifier port. */ () =>
        Effect.gen(
            /** Deny A4 without consumption and admit a genuine A5 metadata-only control. */ function* () {
                // Reflect.set models an adapter that ignores failed writes without manufacturing a mutable contract type.
                for (const assurance of ['A4', 'A5'] as const) {
                    const settings: TrustPolicy = {
                        ...policy,
                        freshAfter: { ...policy.freshAfter },
                        minimumAssurance: 'A5',
                    };
                    const f = yield* fixture({
                        assurance,
                        /** Only the first independent adapter attempts to lower trusted policy. */
                        beforeVerify: (gate, _input, received) =>
                            Effect.sync(
                                /** Attempt the downgrade without throwing on immutable input. */ () => {
                                    if (gate === 'identity') Reflect.set(received, 'minimumAssurance', 'A1');
                                }
                            ),
                    });
                    const result = yield* Effect.either(f.run(request, settings));
                    if (assurance === 'A4') {
                        expect(result).toEqual(
                            Either.left(new TrustFailure({ gate: 'workload', reason: 'assurance' }))
                        );
                        expect(yield* Ref.get(f.consumed)).toBe(false);
                    } else {
                        expect(result).toMatchObject({ _tag: 'Right', right: { release: 'denied' } });
                        expect(yield* Ref.get(f.consumed)).toBe(true);
                    }
                    expect(settings.minimumAssurance).toBe('A5');
                }
            }
        )
);

it.effect(
    'isolates nested bindings and policy through all gates and replay',
    /** Attempt scope, nonce, version and freshness substitution at identity admission. */ () =>
        Effect.gen(
            /** Verify every later gate and replay sees the original admitted metadata. */ function* () {
                const input = { ...request, scope: { ...request.scope }, keys: { ...request.keys } };
                const settings = { ...policy, freshAfter: { ...policy.freshAfter } };
                const observations = yield* Ref.make<ReadonlyArray<readonly [TrustRequest, TrustPolicy]>>([]);
                /** Capture port values before attempted writes without asserting inside the sanitized adapter boundary. */
                const record = (received: TrustRequest, receivedPolicy: TrustPolicy) =>
                    Ref.update(
                        observations,
                        /** Detach observations so subsequent writes cannot rewrite the test oracle. */ (
                            all
                        ): ReadonlyArray<readonly [TrustRequest, TrustPolicy]> => [
                            ...all,
                            [
                                { ...received, scope: { ...received.scope }, keys: { ...received.keys } },
                                { ...receivedPolicy, freshAfter: { ...receivedPolicy.freshAfter } },
                            ],
                        ]
                    );
                const f = yield* fixture({
                    /** Capture admission, then attempt nested and top-level writes at the early verifier. */
                    beforeVerify: (gate, received, receivedPolicy) =>
                        Effect.gen(
                            /** Record before mutation to permit isolated writable views as well as rejected writes. */ function* () {
                                yield* record(received, receivedPolicy);
                                if (gate === 'identity') {
                                    Reflect.set(received.scope, 'purpose', 'fixture.changed');
                                    Reflect.set(received.scope, 'tenant', uuid(99));
                                    Reflect.set(received.scope, 'profile', 'baseline');
                                    Reflect.set(received, 'nonce', uuid(98));
                                    Reflect.set(received.keys, 'kekVersion', 7);
                                    Reflect.set(received.keys, 'dekVersion', 9);
                                    Reflect.set(receivedPolicy.freshAfter, 'broker', 0);
                                    Reflect.set(receivedPolicy, 'now', 95);
                                }
                            }
                        ),
                    beforeReplay: record,
                });
                const result = yield* Effect.either(f.run(input, settings));
                if (Either.isRight(result)) {
                    expect(result.right.release).toBe('denied');
                    expect(yield* Ref.get(f.calls)).toEqual(gates);
                } else {
                    expect(result.left).toBeInstanceOf(TrustFailure);
                    expect(['binding', 'unavailable']).toContain(result.left.reason);
                    expect(yield* Ref.get(f.consumed)).toBe(false);
                }
                for (const [observedRequest, observedPolicy] of yield* Ref.get(observations)) {
                    expect(observedRequest).toEqual(request);
                    expect(observedPolicy).toEqual(policy);
                }
                expect(input).toEqual(request);
                expect(settings).toEqual(policy);
            }
        )
);

it.effect(
    'does not let an adapter relax freshness for a later gate',
    /** Attempt to admit stale broker evidence by rewriting its freshness floor. */ () =>
        Effect.gen(
            /** Verify freshness remains host-owned and replay stays untouched. */ function* () {
                const f = yield* fixture({
                    /** Lower only the later broker window through the identity adapter reference. */
                    beforeVerify: (gate, _input, settings) =>
                        Effect.sync(
                            /** Ignore rejected writes so host freshness verification still runs. */ () => {
                                if (gate === 'identity') Reflect.set(settings.freshAfter, 'broker', 0);
                            }
                        ),
                    /** Supply evidence that passes only if the broker floor was illegally lowered. */
                    change: (e) => (e.gate === 'broker' ? { ...e, issuedAt: 89, revocationCheckedAt: 89 } : e),
                });
                const settings = { ...policy, freshAfter: { ...policy.freshAfter } };
                expect(yield* Effect.flip(f.run(request, settings))).toEqual(
                    new TrustFailure({ gate: 'broker', reason: 'stale' })
                );
                expect(yield* Ref.get(f.consumed)).toBe(false);
            }
        )
);

for (const mutation of ['caller', 'retained adapter'] as const) {
    it.effect(
        `isolates ${mutation} writes while a verifier is suspended`,
        /** Mutate both ownership boundaries at deterministic barriers. */ () =>
            Effect.gen(
                /** Verify asynchronous aliases cannot rewrite the admitted binding or A5 policy. */ function* () {
                    // Separate caller values from expected constants; barriers establish that both attacks occur after admission.
                    const input = { ...request, scope: { ...request.scope }, keys: { ...request.keys } };
                    const settings = {
                        ...policy,
                        freshAfter: { ...policy.freshAfter },
                        minimumAssurance: 'A5' as const,
                    };
                    const expectedPolicy = { ...policy, minimumAssurance: 'A5' };
                    const entered = yield* Deferred.make<void>();
                    const resume = yield* Deferred.make<void>();
                    const retained = yield* Ref.make<readonly [TrustRequest, TrustPolicy] | undefined>(undefined);
                    const observations = yield* Ref.make<ReadonlyArray<readonly [TrustRequest, TrustPolicy]>>([]);
                    /** Retain detached port observations outside the failure-sanitizing boundary. */
                    const record = (received: TrustRequest, receivedPolicy: TrustPolicy) =>
                        Ref.update(
                            observations,
                            /** Preserve every binding as observed, not references an attack could later overwrite. */ (
                                all
                            ): ReadonlyArray<readonly [TrustRequest, TrustPolicy]> => [
                                ...all,
                                [
                                    { ...received, scope: { ...received.scope }, keys: { ...received.keys } },
                                    { ...receivedPolicy, freshAfter: { ...receivedPolicy.freshAfter } },
                                ],
                            ]
                        );
                    const f = yield* fixture({
                        assurance: 'A5',
                        /** Retain identity references and suspend the gate at the selected ownership boundary. */
                        beforeVerify: (gate, received, receivedPolicy) =>
                            Effect.gen(
                                /** Coordinate mutations without sleeps or scheduler assumptions. */ function* () {
                                    if (gate === 'identity') {
                                        yield* Ref.set(retained, [received, receivedPolicy]);
                                    }
                                    if (gate === (mutation === 'caller' ? 'identity' : 'resource')) {
                                        yield* Deferred.succeed(entered, undefined);
                                        yield* Deferred.await(resume);
                                    }
                                    // Check admission before attacks, and later gates after the barrier; a safe early denial is also allowed.
                                    yield* record(received, receivedPolicy);
                                }
                            ),
                        beforeReplay: record,
                    });
                    const pending = yield* Effect.fork(Effect.either(f.run(input, settings)));
                    yield* Deferred.await(entered);
                    if (mutation === 'caller') {
                        Object.assign(input.scope, { purpose: 'fixture.caller', tenant: uuid(96) });
                        Object.assign(input.keys, { kekVersion: 8, dekVersion: 10 });
                        Object.assign(input, { nonce: uuid(95) });
                        Object.assign(settings, { now: 50, minimumAssurance: 'A1' });
                        Object.assign(settings.freshAfter, { identity: 0, resource: 0, workload: 0, broker: 0 });
                    } else {
                        const previous = yield* Ref.get(retained);
                        expect(previous).toBeDefined();
                        if (previous) {
                            Reflect.set(previous[0].scope, 'purpose', 'fixture.retained');
                            Reflect.set(previous[0], 'nonce', uuid(97));
                            Reflect.set(previous[1], 'minimumAssurance', 'A1');
                            Reflect.set(previous[1].freshAfter, 'workload', 0);
                        }
                    }
                    yield* Deferred.succeed(resume, undefined);
                    const result = yield* Fiber.join(pending);
                    if (Either.isRight(result)) {
                        expect(result.right.release).toBe('denied');
                        expect(yield* Ref.get(f.calls)).toEqual(gates);
                        for (const [observedRequest, observedPolicy] of yield* Ref.get(observations)) {
                            expect(observedRequest).toEqual(request);
                            expect(observedPolicy).toEqual(expectedPolicy);
                        }
                    } else {
                        expect(result.left).toBeInstanceOf(TrustFailure);
                        expect(yield* Ref.get(f.consumed)).toBe(false);
                    }
                }
            )
    );
}

it.effect(
    'sanitizes rejected mutation writes without leaking adapter canaries',
    /** Model an adapter that throws when a write is rejected. */ () =>
        Effect.gen(
            /** Verify input isolation defects remain bounded and suppress nonce consumption. */ function* () {
                const f = yield* fixture({
                    /** Assign private text to an immutable nested binding inside the observed adapter boundary. */
                    beforeVerify: (_gate, input) =>
                        Effect.sync(
                            /** Exercise throwing writes rather than cooperative Reflect.set handling. */ () => {
                                Object.assign(input.scope, { purpose: 'PRIVATE-MUTATION-CANARY' });
                            }
                        ),
                });
                const result = yield* Effect.either(f.run());
                expect(Either.isLeft(result)).toBe(true);
                if (Either.isLeft(result)) {
                    expect(result.left.gate).toBe('identity');
                    expect(['binding', 'unavailable']).toContain(result.left.reason);
                }
                expect(inspect(result)).not.toContain('PRIVATE-MUTATION-CANARY');
                expect(yield* Ref.get(f.consumed)).toBe(false);
            }
        )
);

it.effect(
    'consumes once atomically under concurrent preflights',
    /** Race two preflights against one volatile replay cell. */ () =>
        Effect.gen(
            /** Verify one admission succeeds and the competitor receives replay denial. */ function* () {
                // Share the same fixture and nonce so concurrency tests atomic consumption rather than independent requests.
                const f = yield* fixture();
                const results = yield* Effect.all([Effect.either(f.run()), Effect.either(f.run())], {
                    concurrency: 'unbounded',
                });
                expect(results.filter(Either.isRight)).toHaveLength(1);
                expect(
                    results
                        .filter(Either.isLeft)
                        .map(/** Extract the losing preflight's bounded failure. */ (r) => r.left)
                ).toEqual([new TrustFailure({ gate: 'replay', reason: 'replay' })]);
            }
        )
);

it.effect(
    'rotation metadata is algorithm agnostic and versions remain exact',
    /** Exercise version rotation and strict key metadata schemas. */ () =>
        Effect.gen(
            /** Verify metadata rotation grants no release and malformed or aliased authorities remain invalid. */ function* () {
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
            }
        )
);

it.effect(
    'rejects payloads and does not serialize secret canaries in errors/audit',
    /** Inject private request and receipt fields into otherwise valid preflights. */ () =>
        Effect.gen(
            /** Verify error renderings and metadata-only audit results exclude private payloads and resource identifiers. */ function* () {
                // Inspect several renderers and the success path so hiding a canary in just JSON errors is insufficient.
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
            }
        )
);

it.effect(
    'rejects wrong gate, invalid evidence and invalid trusted time policy',
    /** Exercise independent gate, schema and trusted-time failures. */ () =>
        Effect.gen(
            /** Verify malformed evidence and policy receive the expected bounded failure categories. */ function* () {
                const wrong = yield* fixture({
                    /** Mislabel identity evidence as a different verifier's result. */ change: (e) => ({
                        ...e,
                        gate: 'broker',
                    }),
                });
                expect(yield* Effect.flip(wrong.run())).toEqual(
                    new TrustFailure({ gate: 'identity', reason: 'binding' })
                );
                const invalid = yield* fixture({
                    /** Make expiry structurally invalid rather than merely stale. */ change: (e) => ({
                        ...e,
                        expiresAt: -1,
                    }),
                });
                expect(yield* Effect.flip(invalid.run())).toEqual(
                    new TrustFailure({ gate: 'identity', reason: 'invalid' })
                );
                const f = yield* fixture();
                expect(
                    yield* Effect.flip(f.run(request, { ...policy, freshAfter: { ...policy.freshAfter, broker: 101 } }))
                ).toEqual(new TrustFailure({ gate: 'preflight', reason: 'invalid' }));
            }
        )
);

it.effect(
    'checks revocation ordering even when both timestamps are within the freshness window',
    /** Supply fresh timestamps with revocation checked before evidence issuance. */ () =>
        Effect.gen(
            /** Verify freshness alone cannot satisfy revocation ordering or consume the nonce. */ function* () {
                const f = yield* fixture({
                    /** Reverse issuance/revocation order while keeping both inside the trusted window. */ change: (
                        e
                    ) => ({ ...e, issuedAt: 95, revocationCheckedAt: 94 }),
                });
                expect(yield* Effect.flip(f.run())).toEqual(new TrustFailure({ gate: 'identity', reason: 'stale' }));
                expect(yield* Ref.get(f.calls)).not.toContain('replay');
            }
        )
);

it.effect(
    'valid metadata is not cryptographic proof and safe-default examples remain unavailable',
    /** Round-trip metadata before testing default and fixture-backed authority. */ () =>
        Effect.gen(
            /** Verify schema validity neither supplies missing verifiers nor authorizes payload release. */ function* () {
                // Compare decoded input with and without fixture verifiers; successful metadata preflight still explicitly denies release.
                const decodedRequest = yield* Schema.decodeUnknown(Schema.parseJson(TrustRequest))(
                    JSON.stringify(request)
                );
                const decodedPolicy = yield* Schema.decodeUnknown(Schema.parseJson(TrustPolicy))(
                    JSON.stringify(policy)
                );
                expect(yield* Effect.flip(trustPreflight(decodedRequest, decodedPolicy))).toEqual(
                    new TrustFailure({ gate: 'identity', reason: 'unavailable' })
                );
                const f = yield* fixture();
                const result = yield* f.run(decodedRequest, decodedPolicy);
                expect(result.release).toBe('denied');
                expect(Object.keys(result)).toEqual(['decision', 'release', 'audit']);
            }
        )
);

it.effect(
    'invalid policy metadata and evidence payloads fail without consuming a nonce',
    /** Exercise strict policy and provider-evidence validation. */ () =>
        Effect.gen(
            /** Verify invalid metadata fails before replay and private evidence contents stay redacted. */ function* () {
                const f = yield* fixture();
                expect(yield* Effect.flip(f.run(request, { ...policy, now: -1 }))).toEqual(
                    new TrustFailure({ gate: 'preflight', reason: 'invalid' })
                );
                const evidencePayload = yield* fixture({
                    /** Add a forbidden evidence payload field without changing its valid bindings. */ change: (e) => ({
                        ...e,
                        plaintext: 'SECRET-EVIDENCE-CANARY',
                    }),
                });
                const failure = yield* Effect.flip(evidencePayload.run());
                expect(failure).toEqual(new TrustFailure({ gate: 'identity', reason: 'invalid' }));
                expect(inspect(failure)).not.toContain('SECRET-EVIDENCE-CANARY');
                expect(yield* Ref.get(evidencePayload.calls)).not.toContain('replay');
            }
        )
);
