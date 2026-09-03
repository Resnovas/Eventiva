import { describe, expect, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import { typeId } from '@eventiva/core';
import { CreateGDPRRequestInput, GDPRRequest } from '../schema.js';
import { GDPRRepository, GDPRRequestNotFoundError } from '../repository.js';
import { makeGDPRService, GDPRService, GDPRServiceLive } from '../service.js';

const sampleTenantId = typeId('tenant');
const sampleContactId = typeId('contact');

const validCreateInput = {
    tenantId: sampleTenantId,
    subjectId: sampleContactId,
    type: 'export' as const,
    details: { reason: 'User requested data export' },
};

const MockGDPRRepository = Layer.succeed(GDPRRepository, {
    createRequest: (input) =>
        Effect.succeed({
            id: typeId('gdpr_request'),
            tenantId: input.tenantId,
            subjectId: input.subjectId,
            type: input.type,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            details: input.details,
        }),
    findById: (tenantId, id) => Effect.succeed(null),
    findByTenant: (tenantId) => Effect.succeed([]),
    updateStatus: (tenantId, id, status, completedAt) =>
        Effect.succeed({
            id,
            tenantId,
            subjectId: typeId('contact'),
            type: 'export',
            status,
            requestedAt: new Date().toISOString(),
            completedAt,
            details: {},
        }),
});

const TestGDPRService = GDPRServiceLive.pipe(Layer.provide(MockGDPRRepository));

describe('GDPR Schema Validation', () => {
    it.effect('validates valid CreateGDPRRequestInput', () =>
        Effect.gen(function* () {
            const decoded = yield* Schema.decodeUnknown(CreateGDPRRequestInput)(validCreateInput);
            expect(decoded.type).toBe('export');
            expect(decoded.subjectId).toBe(sampleContactId);
        })
    );

    it.effect('fails validation for invalid fields', () =>
        Effect.gen(function* () {
            const invalidType = yield* Effect.exit(
                Schema.decodeUnknown(CreateGDPRRequestInput)({ ...validCreateInput, type: 'invalid' })
            );
            expect(invalidType._tag).toBe('Failure');
        })
    );
});

describe('GDPR Service', () => {
    it.effect('creates a GDPR request', () =>
        Effect.gen(function* () {
            const service = yield* GDPRService;
            const req = yield* service.createRequest(validCreateInput);
            expect(req.status).toBe('pending');
            expect(req.type).toBe('export');
        }).pipe(Effect.provide(TestGDPRService))
    );

    it.effect('returns not found for unknown request', () =>
        Effect.gen(function* () {
            const service = yield* GDPRService;
            const exit = yield* Effect.exit(service.getRequest(sampleTenantId, 'req_unknown'));
            expect(exit._tag).toBe('Failure');
        }).pipe(Effect.provide(TestGDPRService))
    );
});
