/**
 * @file packages/schema/src/compose.ts
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

import { isWeaker, type SecurityProfile } from '@eventiva/contracts/security';
import { Data, Either, Schema } from 'effect';
import type { Field } from './field.ts';
import { type ModuleId, ResourceName } from './manifest.ts';
import { FieldName, type Fields, type Resource } from './resource.ts';

/**
 * Schema composition. Modules declare resources and contribute fields to
 * resources other modules own; `compose` combines them into one checked
 * description that storage, sync and agent adapters read. It is pure and
 * order-independent, holds no global registry, and either returns the whole
 * result or the first error in a fixed order, whatever order modules arrive in.
 */

/** Fields one module adds to a resource another module owns. */
export interface Contribution {
    readonly _tag: 'Contribution';
    readonly target: string;
    readonly module: ModuleId;
    readonly fields: Fields;
}

/** Declares a contribution. Pure: it is checked when the schema is composed. */
export const contribute = (target: Resource | string, module: ModuleId, fields: Fields): Contribution => ({
    _tag: 'Contribution',
    target: typeof target === 'string' ? target : target.name,
    module,
    fields,
});

/** A field of a composed resource, with the module that declared it. */
export interface ComposedField {
    readonly name: string;
    readonly module: ModuleId;
    readonly field: Field;
}

/** A resource with its own and contributed fields, sorted by field name. */
export interface ComposedResource {
    readonly resource: Resource;
    readonly fields: ReadonlyArray<ComposedField>;
}

/** Every resource, sorted by name. */
export interface Composed {
    readonly resources: ReadonlyArray<ComposedResource>;
}

/** Two resources share a name. */
export class DuplicateResource extends Data.TaggedError('DuplicateResource')<{
    readonly resource: string;
    readonly modules: ReadonlyArray<string>;
}> {}

/** Two declarations give a resource the same field. */
export class DuplicateField extends Data.TaggedError('DuplicateField')<{
    readonly resource: string;
    readonly field: string;
    readonly modules: ReadonlyArray<string>;
}> {}

/** A contribution or reference names a resource nobody declares. */
export class UnknownTarget extends Data.TaggedError('UnknownTarget')<{
    readonly resource: string;
    readonly module: string;
    readonly target: string;
}> {}

/** A field would be stored with less protection than its resource requires. */
export class WeakerClassification extends Data.TaggedError('WeakerClassification')<{
    readonly resource: string;
    readonly field: string;
    readonly module: string;
    readonly profile: SecurityProfile;
    readonly floor: SecurityProfile;
}> {}

/** A resource or field name is not canonical. */
export class InvalidName extends Data.TaggedError('InvalidName')<{
    readonly module: string;
    readonly name: string;
}> {}

export type ComposeError = DuplicateResource | DuplicateField | UnknownTarget | WeakerClassification | InvalidName;

const byName =
    <A>(key: (a: A) => string) =>
    (a: A, b: A) =>
        key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0;

const sortedModules = (...modules: ReadonlyArray<string>) => [...modules].sort();

/** Composes resources and contributions into one checked schema. */
export const compose = (
    resources: ReadonlyArray<Resource>,
    contributions: ReadonlyArray<Contribution>
): Either.Either<Composed, ComposeError> => {
    // Sorting first makes every error, and the result, independent of input order.
    const ordered = [...resources].sort(byName((resource) => `${resource.name}\u0000${resource.module}`));
    const declared = new Map<string, Resource>();
    for (const resource of ordered) {
        if (!Schema.is(ResourceName)(resource.name)) {
            return Either.left(new InvalidName({ module: resource.module, name: resource.name }));
        }
        const existing = declared.get(resource.name);
        if (existing !== undefined) {
            return Either.left(
                new DuplicateResource({
                    resource: resource.name,
                    modules: sortedModules(existing.module, resource.module),
                })
            );
        }
        declared.set(resource.name, resource);
    }

    const sources = [
        ...ordered.map((resource) => ({ target: resource.name, module: resource.module, fields: resource.fields })),
        ...[...contributions].sort(byName((contribution) => `${contribution.target}\u0000${contribution.module}`)),
    ];
    const fields = new Map<string, Map<string, ComposedField>>();
    for (const source of sources) {
        const resource = declared.get(source.target);
        if (resource === undefined) {
            return Either.left(
                new UnknownTarget({ resource: source.target, module: source.module, target: source.target })
            );
        }
        const composed = fields.get(source.target) ?? new Map<string, ComposedField>();
        fields.set(source.target, composed);
        for (const name of Object.keys(source.fields).sort()) {
            const field = source.fields[name] as Field;
            if (!Schema.is(FieldName)(name)) return Either.left(new InvalidName({ module: source.module, name }));
            const existing = composed.get(name);
            if (existing !== undefined) {
                return Either.left(
                    new DuplicateField({
                        resource: source.target,
                        field: name,
                        modules: sortedModules(existing.module, source.module),
                    })
                );
            }
            if (isWeaker(field.security, resource.security)) {
                return Either.left(
                    new WeakerClassification({
                        resource: source.target,
                        field: name,
                        module: source.module,
                        profile: field.security,
                        floor: resource.security,
                    })
                );
            }
            if (field.target._tag === 'Some' && !declared.has(field.target.value)) {
                return Either.left(
                    new UnknownTarget({ resource: source.target, module: source.module, target: field.target.value })
                );
            }
            composed.set(name, { name, module: source.module, field });
        }
    }

    return Either.right({
        resources: [...declared.values()].map((resource) => ({
            resource,
            fields: [...(fields.get(resource.name)?.values() ?? [])].sort(byName((field) => field.name)),
        })),
    });
};
