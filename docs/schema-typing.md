# Preserve concrete field and row types

Use `@eventiva/schema/field` constructors and keep the inferred resource type when calling `Resource.row`. A concrete `ValueField<S>` holds the original schema in `schema` and implements the same decoded/encoded schema itself. This lets `Resource.row` pass the fields directly to `Schema.Struct` without asserting that a dynamically mapped object has particular keys.

```ts
import * as Field from '@eventiva/schema/field';
import * as Resource from '@eventiva/schema/resource';
import { Schema } from 'effect';

const Event = Resource.make('events.event', {
    module: 'events',
    version: 1,
    plane: 'tenant',
    consistency: 'record',
    fields: {
        startsAt: Field.timestamp(),
        notes: Field.text().pipe(Field.nullable),
    },
});

const row = Resource.row(Event);
const decoded = Schema.decodeUnknownSync(row)({
    startsAt: '2026-11-15T02:40:00.125Z',
    notes: null,
});
// decoded.startsAt is Date; its encoded value is string.
const encoded = Schema.encodeSync(row)(decoded);
```

`Resource.Row<typeof Event>` describes the decoded record. `Schema.Schema.Encoded<typeof row>` describes its encoded form. Both retain each field's own type, including schema transformations and nullability. All fields remain required; nullable means the value may be `null`, not that the key may be omitted. Use Effect's asynchronous decoders from Effect application code when a schema needs them; the synchronous example above uses only synchronous built-in fields.

The default `Field` and `Resource` types are metadata views for heterogeneous composition and storage declarations. Their erased schema view exposes its syntax tree, not an untyped decoder. Do not annotate a declaration as plain `Resource` before constructing its row schema: that deliberately discards the key/value evidence the row builder requires. Keep inference, or retain the concrete fields type in `Resource<Name, Fields>`.

Field defaults do not change: security is `baseline`, conflict is `field-lww`, nullability is `false`, and label and reference target are absent. `classify`, `conflict` and `label` return new values; `nullable` preserves all existing metadata while replacing both schema views with the nullable schema. `Field.json(schema)` preserves the exact original schema object and type, including its schema-specific members. No source schema is mutated.

## Composition error constructors

Each composition error has one required, concrete constructor argument. `DuplicateResource` requires `resource` and `modules`; `DuplicateField` also requires `field`. `UnknownTarget` requires `resource`, `module` and `target`. `WeakerClassification` requires `resource`, `field`, `module`, `profile` and `floor`. `InvalidName` requires `module` and `name`. All fields are readonly; names are strings, `modules` is a readonly string array, and `profile`/`floor` use `SecurityProfile`.

The emitted constructor bases have no open generic parameter, `any` or `unknown`: they return `Cause.YieldableError` intersected with the concrete fields and the matching literal `_tag`. They still use `Data.TaggedError` at runtime, so Error identity, stored fields, tags and `yield* error` behavior are unchanged. The annotation is a compiler-checked constructor contract, not a cast, schema decoder or new runtime excess-property validator; ordinary TypeScript structural assignment rules still apply. Constructor-parameter type checks and yieldability tests cover all five classes in `tests/schema/src/compose.spec.ts`.

This is a pure library typing change, not a new application behavior switch or a storage adapter. It adds no dependency, runtime registry, persistence model or feature flag. The separate resource-provider model is not reinterpreted here.

## Deterministic contribution diagnostics

`compose(resources, contributions)` validates owner declarations first, then contributions ordered by target and module. When several contributions share both keys, it breaks the tie using the JSON encoding of their field-name-sorted `[name, security, referenceTargetOrNull]` tuples, compared by code-unit order. Field-object insertion order and contribution arrival order do not select the first error. Schemas remain opaque: composition neither serializes nor decodes them to order declarations.

For example, if `events.event` owns `alpha` and `beta`, two contributions from `tickets` that separately redeclare those fields both produce `DuplicateField({ resource: 'events.event', field: 'alpha', modules: ['events', 'tickets'] })`, whichever contribution arrives first. Independently malformed names, weaker protection profiles and missing references also select the same complete typed diagnostic under permutation. Ties with identical validation metadata need no schema-based ordering: nonempty ties have the same failure, and empty contributions add no fields.

Accepted schemas, owner/module attribution, owner-first validation, security floors, unknown-target checks and the five public error classes are unchanged. Successful composition retains the original resource, field and schema references; it sorts copied arrays and entry lists, never caller-owned containers. The regression controls enumerate all six orders of three same-module contributions with both resource orders, plus frozen-input and transformed-schema identity controls. This corrects the existing pure deterministic-composition invariant, not an optional product capability or a feature-flag rollout.

Run `pnpm exec tsc -b packages/schema/tsconfig.build.json`, then `pnpm exec tsc -p tests/schema/tsconfig.json --noEmit`. Run `pnpm exec vitest run --config vitest.config.mts` from `tests/schema`. The composition test includes compile-time row/field type checks, Date round trips, source-schema identity and nullable metadata checks.
