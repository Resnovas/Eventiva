/**
 * @file packages/schema/src/manifest.ts
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

import { ActionName } from '@eventiva/contracts/action';
import { FlagDefinition, FlagKey } from '@eventiva/contracts/flags';
import { Schema } from 'effect';

/**
 * Module manifests. A module declares what it contributes as data, so a host
 * can check a module before registering it and remove it again safely. The
 * manifest is portable: browsers, Expo, agents and the backend read the same
 * declaration.
 */

/** A resource name: the owning module followed by the record, such as `events.event`. */
export const ResourceName = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/));
export type ResourceName = typeof ResourceName.Type;

/** A module id: lower case, optionally dotted, such as `events` or `events.tickets`. */
export const ModuleId = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$/));
export type ModuleId = typeof ModuleId.Type;

/** The manifest format this package reads. A host rejects any other format. */
export const manifestFormat = 1;

/** A module manifest. */
export const ModuleManifest = Schema.Struct({
    format: Schema.Literal(manifestFormat),
    id: ModuleId,
    /** Semantic version of the module. */
    version: Schema.String.pipe(Schema.pattern(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/)),
    description: Schema.NonEmptyTrimmedString,
    /** The flag that activates the whole module, declared in `flags`. */
    flag: Schema.optional(FlagKey),
    /** Canonical names of every action the module registers. */
    actions: Schema.Array(ActionName),
    /** Every flag the module, its actions and its screens reference. */
    flags: Schema.Array(FlagDefinition),
    /** Names of every resource the module declares; omitted when it declares none. */
    resources: Schema.optional(Schema.Array(ResourceName)),
});
export type ModuleManifest = typeof ModuleManifest.Type;
