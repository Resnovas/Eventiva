# ADR-0003: Portable Contracts, Schema Compilation, and Canonical Serialization

- Status: Accepted
- Date: 2026-11-21
- Owners: Contracts & Schema

## Context

Eventiva action contracts, resource declarations, trust profiles, and domain primitives run across untrusted input boundaries, multiple AI model providers (Anthropic, OpenAI, Google), and portable browser/Hermes runtimes. Schema validation, JSON Schema generation, and canonical serialization must remain deterministic, code-free at admission time, and resistant to prototype pollution, provider drift, or JS runtime quirks.

## Decision

1. **Code-free schema admission and all-or-nothing provider parity**:
   - `validateInventory` (`packages/contracts/src/inventory.ts`) validates action schemas structurally using `Schema.isSchema` without executing decoders or sample values so untrusted refinement predicates never run at registration time.
   - Anthropic, OpenAI, and Google tool schemas are compiled atomically; failure on any provider rejects the action completely rather than advertising inconsistent partial support.
2. **Strict JSON Schema compilation (`packages/contracts/src/json-schema.ts`)**:
   - Explicit JSON Schema override annotations on non-refinement Effect Schema AST nodes are rejected so authors cannot advertise wire schemas that conceal runtime transformations or validation.
   - Effect's `Schema.UUID` and `UuidV7` refinements project to exact JSON Schema `pattern` strings (stripping provider-dependent `format: 'uuid'`, safely dropping the redundant `i` flag on Effect's UUID regex, and permitting only the proven `UuidV7` subset narrowing without attempting general regex intersection).
   - Compiled `properties` maps are populated via `Object.defineProperty` with own enumerable data descriptors so schema keys such as `__proto__` cannot mutate the result object's prototype.
3. **Deterministic order-independent schema composition**: `packages/schema/src/compose.ts` canonically sorts resources and contributions before validating or composing so both the composed schema and the first reported `ComposeError` are independent of registration order.
4. **Detached literal resource field typing and immutable field evolution**:
   - `packages/contracts/src/resource.ts` validates field templates with strict Effect Schema decoding and then performs a two-level `copyFields` copy of `input.fields` so caller-owned mutable objects are detached while preserving literal `Resource<F>` typing.
   - Existing fields must retain identical type, optionality, and contributor pin across schema versions (neither loosening nor tightening optionality is permitted).
5. **Canonical JSON and RFC 8785 JCS serialization**:
   - `packages/contracts/src/trust-profile.ts` implements RFC 8785 JSON Canonicalization Scheme (JCS) using native ECMAScript `JSON.stringify` for finite numbers and JS `<` UTF-16 code-unit comparison for object keys, matching RFC 8785 without external dependencies.
   - `packages/runtime/src/invocation.ts` tracks only the active ancestor path during canonical JSON traversal so shared acyclic object graphs (DAGs) are accepted while cycles are rejected.
6. **Domain scalar contracts**:
   - **Exact minor-unit money strings**: Monetary amounts are represented as exact minor-unit decimal strings rather than JS numbers (`ai-docs/src/13_storage/01_transaction.ts`) to avoid IEEE-754 precision loss above `Number.MAX_SAFE_INTEGER`.
   - **Gregorian calendar dates without JS `Date`**: ISO `YYYY-MM-DD` dates in `packages/contracts/src/i18n.ts` use explicit Gregorian leap-year arithmetic so overflow days are not normalized and years below 100 are not remapped to 1900-1999.
   - **Governed terminology confidence**: `GovernedTerminologyPack.mappingConfidence` stays a descriptive `NonEmptyTrimmedString` rather than an invented numeric or enum scale.
   - **Conservative ASCII work email**: `WorkEmail` (`packages/contracts/src/crm-organisation.ts`) uses a deterministic ASCII-only regex (max 254 chars) without IDNA conversion or deliverability checks.
   - **Action wire grammar vs audit receipts**: Wire `ActionName` identifiers enforce lowercase kebab-case (`ai-docs/src/30_crm/01_organisations.ts`), whereas `Receipt.action` (`packages/contracts/src/receipt.ts`) stays `Schema.String` so audit receipts can record denied calls targeting unknown or malformed names.
   - **Stateless contract bounds vs stateful graph validation**: Contracts such as inventory kits (`tests/contracts/src/inventory-kit.spec.ts`) enforce stateless structural and numeric bounds while deferring graph-dependent duplicate and cycle checks to stateful runtime execution.
   - **Invoice wire UUID compatibility**: Durable invoice draft actions require UUIDv7 identifiers while the provider-neutral `InvoiceRevision` wire schema retains compatibility with existing non-v7 UUIDs (`packages/runtime/src/invoice-draft.ts`, `tests/contracts/src/invoice-draft.spec.ts`).

## Consequences

- Provider schema drift, prototype pollution during JSON Schema compilation, and registration-order nondeterminism fail closed at admission time.
- Portable contracts remain free of external runtime dependencies and JS `Date`/floating-point edge cases.

## References

- `packages/contracts/src/inventory.ts`
- `packages/contracts/src/json-schema.ts`
- `packages/contracts/src/resource.ts`
- `packages/contracts/src/trust-profile.ts`
- `packages/contracts/src/i18n.ts`
- `packages/contracts/src/crm-organisation.ts`
- `packages/contracts/src/receipt.ts`
- `packages/schema/src/compose.ts`
- `packages/runtime/src/invocation.ts`
- `packages/runtime/src/invoice-draft.ts`
