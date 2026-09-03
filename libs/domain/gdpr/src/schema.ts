import * as Schema from 'effect/Schema';
import { typeIdSchema } from '@eventiva/core';

export const GDPRRecordType = Schema.Literal('export', 'erasure', 'rectification', 'consent');
export type GDPRRecordType = Schema.Schema.Type<typeof GDPRRecordType>;

export const GDPRActionStatus = Schema.Literal('pending', 'in_progress', 'completed', 'failed', 'cancelled');
export type GDPRActionStatus = Schema.Schema.Type<typeof GDPRActionStatus>;

export const GDPRRequest = Schema.Struct({
    id: typeIdSchema('gdpr_request'),
    tenantId: typeIdSchema('tenant'),
    subjectId: typeIdSchema('contact'), // or relevant entity ID
    type: GDPRRecordType,
    status: GDPRActionStatus,
    requestedAt: Schema.String,
    completedAt: Schema.optional(Schema.String),
    details: Schema.Record(Schema.String, Schema.Unknown),
});
export type GDPRRequest = Schema.Schema.Type<typeof GDPRRequest>;

export const CreateGDPRRequestInput = Schema.Struct({
    tenantId: typeIdSchema('tenant'),
    subjectId: typeIdSchema('contact'),
    type: GDPRRecordType,
    details: Schema.Record(Schema.String, Schema.Unknown),
});
export type CreateGDPRRequestInput = Schema.Schema.Type<typeof CreateGDPRRequestInput>;
