/**
 * @file tests/ui-modules/src/screen-context.spec.ts
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

import { it } from '@effect/vitest';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import { I18n } from '@eventiva/contracts/i18n';
import { ActionInventory, type ActionMetadata } from '@eventiva/contracts/inventory';
import {
    UiConfig,
    UiModuleFailure,
    UiPlatform,
    UiScreenContext,
    type UiModuleDefinition,
    type UiProjection,
} from '@eventiva/contracts/ui-module';
import { DeclarativeRegistry, declarativeRegistry } from '@eventiva/ui-modules/declarative-registry';
import type { UiRenderer } from '@eventiva/ui-modules/DeclarativeModule';
import { makeScreenContext } from '@eventiva/ui-modules/screen-context';
import { Deferred, Effect, Exit, Fiber, Layer, Option, Schema, Scope } from 'effect';
import { expect } from 'vitest';

const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: '00000000-0000-4000-8000-000000000001',
    session: '00000000-0000-4000-8000-000000000002',
    tenant: '00000000-0000-4000-8000-000000000003',
    kind: 'human',
});
const viewer = Schema.decodeUnknownSync(CallerIdentity)({
    ...caller,
    subject: '00000000-0000-4000-8000-000000000004',
});
const otherTenant = Schema.decodeUnknownSync(CallerIdentity)({
    ...caller,
    tenant: '00000000-0000-4000-8000-000000000005',
});
const otherSession = Schema.decodeUnknownSync(CallerIdentity)({
    ...caller,
    session: '00000000-0000-4000-8000-000000000006',
});
const binding = { action: 'sample.open', version: 1, input: { target: 'summary' } };
const definition: UiModuleDefinition = {
    format: 1,
    id: 'sample',
    version: '1.0.0',
    flag: 'sample.enabled',
    root: 'screen',
    nodes: [
        {
            id: 'screen',
            kind: 'view',
            component: { id: 'approved.content', version: '1.0.0' },
            label: 'sample.screen',
            protected: false,
            project: true,
            config: {},
            children: ['total', 'open'],
        },
        {
            id: 'total',
            kind: 'field',
            component: { id: 'approved.content', version: '1.0.0' },
            label: 'sample.total',
            protected: false,
            project: true,
            config: {},
            children: [],
            field: 'sample.total',
        },
        {
            id: 'open',
            kind: 'action',
            component: { id: 'approved.content', version: '1.0.0' },
            label: 'sample.open',
            protected: false,
            project: true,
            config: {},
            children: [],
            binding,
        },
    ],
    messages: {
        'sample.screen': 'Summary',
        'sample.total': 'Total',
        'sample.open': 'Open',
        'sample.offline': 'Reconnect.',
        'sample.unavailable': 'Unavailable.',
    },
    offline: 'sample.offline',
    unavailable: 'sample.unavailable',
};
const renderer: UiRenderer = {
    id: 'approved.content',
    version: '1.0.0',
    kinds: ['view', 'field', 'action'],
    config: UiConfig,
    component: () => null,
};
const metadata: ActionMetadata = {
    id: 'sample.open',
    version: 1,
    description: 'Open summary.',
    permission: 'sample.open',
    approval: 'confirm',
    risk: 'routine',
    sensitive: false,
    sideEffect: 'read',
    offline: 'online-only',
    providerSchemas: {
        anthropic: { input: { type: 'object' }, output: { type: 'null' } },
        openai: { input: { type: 'object' }, output: { type: 'null' } },
        google: { input: { type: 'object' }, output: { type: 'null' } },
    },
};
const fixture = () => {
    const state = {
        admitted: true,
        enabled: true,
        online: true,
        allowed: true,
        calls: [] as Array<{ readonly subject: string; readonly action: string }>,
        beforeValue: Effect.void,
    };
    const layer = declarativeRegistry([renderer]).pipe(
        Layer.provide(
            Layer.mergeAll(
                Layer.succeed(UiPlatform, {
                    admit: () =>
                        Effect.suspend(() =>
                            state.admitted ? Effect.void : Effect.fail(new UiModuleFailure({ reason: 'denied' }))
                        ),
                    checkInput: (entry) =>
                        Schema.decodeUnknown(Schema.Struct({ target: Schema.Literal('summary') }))(entry.input).pipe(
                            Effect.asVoid,
                            Effect.mapError(() => new UiModuleFailure({ reason: 'invalid-config' }))
                        ),
                    invoke: (entry) =>
                        Effect.gen(function* () {
                            const current = yield* Caller;
                            if (!state.allowed) return yield* new UiModuleFailure({ reason: 'denied' });
                            state.calls.push({ subject: current.subject, action: entry.action });
                        }),
                    visible: () => Effect.succeed(true),
                    value: () =>
                        Effect.gen(function* () {
                            yield* state.beforeValue;
                            const current = yield* Caller;
                            return current.subject === caller.subject ? 37 : 5;
                        }),
                    online: Effect.sync(() => state.online),
                }),
                Layer.succeed(Flags, {
                    evaluate: (flag) =>
                        Effect.sync(() => ({ flag: flag.key, value: state.enabled, reason: 'TEST', fallback: false })),
                }),
                Layer.succeed(I18n, { locale: 'en-GB', format: (message) => message.defaultMessage }),
                Layer.succeed(ActionInventory, {
                    find: (_caller, id) => Effect.succeed(id === metadata.id ? Option.some(metadata) : Option.none()),
                    list: () => Effect.succeed([metadata]),
                })
            )
        )
    );
    return { state, layer };
};
const projection = (module: string): UiProjection => ({
    format: 1,
    module,
    version: '1.0.0',
    state: 'available',
    message: '',
    nodes: [],
});
const screen = (module: string) => ({ read: Effect.succeed(projection(module)), invoke: () => Effect.void });
const mountIn = <A, E, R>(effect: Effect.Effect<A, E, R | Scope.Scope>, scope: Scope.CloseableScope) =>
    effect.pipe(Effect.provideService(Scope.Scope, scope));

it.scoped('reads real mounted registrations under the current viewer and invokes only canonical nodes', () => {
    const { state, layer } = fixture();
    return Effect.gen(function* () {
        const context = yield* makeScreenContext;
        const registry = yield* DeclarativeRegistry;
        const registration = yield* registry.register(JSON.stringify(definition));
        expect(yield* context.read).toEqual(Option.none());
        expect(yield* context.invoke('open')).toEqual(Option.none());
        const scope = yield* Scope.make();
        yield* mountIn(registration.mount.pipe(Effect.provideService(UiScreenContext, context.service)), scope);
        const first = Option.getOrThrow(yield* context.read);
        expect(first.nodes.find((node) => node.id === 'total')?.value).toBe(37);
        const masked = Option.getOrThrow(yield* context.read.pipe(Effect.provideService(Caller, viewer)));
        expect(masked.nodes.find((node) => node.id === 'total')?.value).toBe(5);
        expect(Option.getOrThrow(yield* context.read).nodes.find((node) => node.id === 'total')?.value).toBe(37);
        expect(JSON.stringify(masked)).not.toMatch(/target|permission|input/);
        expect(yield* context.invoke('sample.open')).toEqual(Option.none());
        expect(yield* context.invoke('total')).toEqual(Option.none());
        expect(yield* context.invoke('open').pipe(Effect.provideService(Caller, viewer))).toEqual(
            Option.some(undefined)
        );
        expect(state.calls).toEqual([{ subject: viewer.subject, action: binding.action }]);
        for (const mode of ['denied', 'offline', 'disabled', 'revoked'] as const) {
            state.allowed = mode !== 'denied';
            state.online = mode !== 'offline';
            state.enabled = mode !== 'disabled';
            state.admitted = mode !== 'revoked';
            if (mode !== 'denied') expect(yield* context.read).toEqual(Option.none());
            expect(yield* context.invoke('open')).toEqual(Option.none());
            expect(state.calls).toHaveLength(1);
        }
        state.admitted = true;
        yield* registry.register(JSON.stringify(definition), true);
        expect(yield* context.read).toEqual(Option.none());
        expect(yield* context.invoke('open')).toEqual(Option.none());
        expect(state.calls).toHaveLength(1);
        yield* Scope.close(scope, Exit.void);
        expect(yield* context.read).toEqual(Option.none());
    }).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
});

it.scoped('isolates tenant/session pairs without freezing a subject or sharing independent factory state', () =>
    Effect.gen(function* () {
        const context = yield* makeScreenContext;
        const isolated = yield* makeScreenContext;
        yield* context.service.mount(screen('owner'));
        expect(yield* isolated.read).toEqual(Option.none());
        for (const current of [otherTenant, otherSession]) {
            expect(yield* context.read.pipe(Effect.provideService(Caller, current))).toEqual(Option.none());
            expect(yield* context.invoke('open').pipe(Effect.provideService(Caller, current))).toEqual(Option.none());
            yield* context.service
                .mount(screen(current === otherTenant ? 'tenant' : 'session'))
                .pipe(Effect.provideService(Caller, current));
        }
        expect(Option.getOrThrow(yield* context.read).module).toBe('owner');
        expect(Option.getOrThrow(yield* context.read.pipe(Effect.provideService(Caller, viewer))).module).toBe('owner');
        expect(Option.getOrThrow(yield* context.read.pipe(Effect.provideService(Caller, otherTenant))).module).toBe(
            'tenant'
        );
        expect(Option.getOrThrow(yield* context.read.pipe(Effect.provideService(Caller, otherSession))).module).toBe(
            'session'
        );
    }).pipe(Effect.provideService(Caller, caller))
);

it.scoped('keeps B after closing replaced A, then empties on B close with no restoration', () =>
    Effect.gen(function* () {
        const context = yield* makeScreenContext;
        const a = yield* Scope.make();
        const b = yield* Scope.make();
        yield* mountIn(context.service.mount(screen('a')), a);
        yield* mountIn(context.service.mount(screen('b')), b);
        yield* Scope.close(a, Exit.void);
        expect(Option.getOrThrow(yield* context.read).module).toBe('b');
        yield* Scope.close(b, Exit.void);
        expect(yield* context.read).toEqual(Option.none());
        expect(yield* context.invoke('open')).toEqual(Option.none());
    }).pipe(Effect.provideService(Caller, caller))
);

it.scoped('keeps the existing tenantless platform-service identity separate from tenant sessions', () =>
    Effect.gen(function* () {
        const context = yield* makeScreenContext;
        const platformCaller = Schema.decodeUnknownSync(CallerIdentity)({
            subject: caller.subject,
            session: caller.session,
            kind: 'service',
        });
        yield* context.service.mount(screen('tenant'));
        expect(yield* context.read.pipe(Effect.provideService(Caller, platformCaller))).toEqual(Option.none());
        yield* context.service.mount(screen('platform')).pipe(Effect.provideService(Caller, platformCaller));
        expect(Option.getOrThrow(yield* context.read).module).toBe('tenant');
        expect(Option.getOrThrow(yield* context.read.pipe(Effect.provideService(Caller, platformCaller))).module).toBe(
            'platform'
        );
    }).pipe(Effect.provideService(Caller, caller))
);

for (const change of ['replace', 'unmount', 'interrupt'] as const) {
    it.scoped(`never releases a suspended real projection after ${change}`, () => {
        const { state, layer } = fixture();
        return Effect.gen(function* () {
            const context = yield* makeScreenContext;
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(definition));
            const scope = yield* Scope.make();
            yield* mountIn(registration.mount.pipe(Effect.provideService(UiScreenContext, context.service)), scope);
            const entered = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            state.beforeValue = Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Deferred.await(release)));
            const pending = yield* Effect.fork(context.read);
            yield* Deferred.await(entered);
            if (change === 'replace') yield* context.service.mount(screen('b'));
            if (change === 'unmount') yield* Scope.close(scope, Exit.void);
            if (change === 'interrupt') expect(Exit.isInterrupted(yield* Fiber.interrupt(pending))).toBe(true);
            yield* Deferred.succeed(release, undefined);
            if (change !== 'interrupt') expect(yield* Fiber.join(pending)).toEqual(Option.none());
            if (change === 'replace') expect(Option.getOrThrow(yield* context.read).module).toBe('b');
            if (change === 'unmount') expect(yield* context.read).toEqual(Option.none());
            yield* Scope.close(scope, Exit.void);
            expect(state.calls).toEqual([]);
        }).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    });
}

for (const change of ['replace', 'unmount'] as const) {
    it.scoped(`cancels canonical invocation suspended in projection on screen ${change}`, () => {
        const { state, layer } = fixture();
        return Effect.gen(function* () {
            const context = yield* makeScreenContext;
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(JSON.stringify(definition));
            const scope = yield* Scope.make();
            yield* mountIn(registration.mount.pipe(Effect.provideService(UiScreenContext, context.service)), scope);
            const entered = yield* Deferred.make<void>();
            const release = yield* Deferred.make<void>();
            state.beforeValue = Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Deferred.await(release)));
            const pending = yield* Effect.fork(context.invoke('open'));
            yield* Deferred.await(entered);
            if (change === 'replace') yield* context.service.mount(screen('b'));
            else yield* Scope.close(scope, Exit.void);
            expect(yield* Fiber.join(pending)).toEqual(Option.none());
            yield* Deferred.succeed(release, undefined);
            expect(state.calls).toEqual([]);
            yield* Scope.close(scope, Exit.void);
        }).pipe(Effect.provide(layer), Effect.provideService(Caller, caller));
    });
}

it.scoped('suppresses an old result even when the capability delays interruption', () =>
    Effect.gen(function* () {
        const context = yield* makeScreenContext;
        const entered = yield* Deferred.make<void>();
        const release = yield* Deferred.make<void>();
        yield* context.service.mount({
            read: Effect.uninterruptible(
                Deferred.succeed(entered, undefined).pipe(
                    Effect.zipRight(Deferred.await(release)),
                    Effect.as(projection('a'))
                )
            ),
            invoke: () => Effect.void,
        });
        const pending = yield* Effect.fork(context.read);
        yield* Deferred.await(entered);
        yield* context.service.mount(screen('b'));
        yield* Deferred.succeed(release, undefined);
        expect(yield* Fiber.join(pending)).toEqual(Option.none());
        expect(Option.getOrThrow(yield* context.read).module).toBe('b');
    }).pipe(Effect.provideService(Caller, caller))
);

it.scoped('clears all sessions on factory close, rejects later mount, and invalidates pending reads', () =>
    Effect.gen(function* () {
        const host = yield* Scope.make();
        const context = yield* mountIn(makeScreenContext, host);
        const entered = yield* Deferred.make<void>();
        yield* context.service.mount({
            read: Deferred.succeed(entered, undefined).pipe(Effect.zipRight(Effect.never)),
            invoke: () => Effect.void,
        });
        yield* context.service.mount(screen('other')).pipe(Effect.provideService(Caller, otherSession));
        const pending = yield* Effect.fork(context.read);
        yield* Deferred.await(entered);
        yield* Scope.close(host, Exit.void);
        expect(yield* Fiber.join(pending)).toEqual(Option.none());
        expect(yield* context.read).toEqual(Option.none());
        expect(yield* context.read.pipe(Effect.provideService(Caller, otherSession))).toEqual(Option.none());
        expect(Exit.isFailure(yield* Effect.exit(context.service.mount(screen('late'))))).toBe(true);
    }).pipe(Effect.provideService(Caller, caller))
);

it.scoped('treats typed failures as absence but preserves defects instead of hiding broken adapters', () =>
    Effect.gen(function* () {
        const context = yield* makeScreenContext;
        yield* context.service.mount({
            read: Effect.fail(new UiModuleFailure({ reason: 'denied' })),
            invoke: () => Effect.fail(new UiModuleFailure({ reason: 'stale' })),
        });
        expect(yield* context.read).toEqual(Option.none());
        expect(yield* context.invoke('open')).toEqual(Option.none());
        yield* context.service.mount({
            read: Effect.die('broken adapter'),
            invoke: () => Effect.die('broken adapter'),
        });
        expect(Exit.isFailure(yield* Effect.exit(context.read))).toBe(true);
        expect(Exit.isFailure(yield* Effect.exit(context.invoke('open')))).toBe(true);
    }).pipe(Effect.provideService(Caller, caller))
);
