# Tenant-private CRM organisations

This bounded [EVE-68](https://linear.app/resnovas/issue/EVE-68) backend supplies six
`crm.organisation.*` actions. It does not implement the complete CRM issue.

**Discovery limitation:** public action invocation works through `ActionHost`,
but `validateInventory` cannot currently compile these intact bounded schemas
for every provider. The published exact-UUID correction in `2c7ed103` is included;
composed numeric minima and the Google profile's unsupported string constraints
remain independent compatibility limits. UUID normalization does not fix name
bounds or numeric composition. Discovery fails closed; do not relax schemas or describe this slice
as HTTP/OpenAPI, model-provider, MCP or native inventory parity. Shared compiler
changes belong to their own lane.

## Compose the backend

1. Supply a trusted tenant database and canonical live identity resolution as
   described in [Resources](resources.md) and [identity](identity.md).
2. Evaluate `organisationResources` from
   `@eventiva/contracts/crm-organisation`. Admit its `crm.party` and
   `crm.organisation` declarations using the existing privileged resource
   migration/provider composition. This module adds no SQL migration.
3. Supply `Resources` and `CurrentTenant` when evaluating
   `crmOrganisationModule` from `@eventiva/runtime/crm-organisation`.
4. Register the returned module with the existing `ActionHost`. Supply live
   module-specific action and resource policy, flags and durable Integrity.
   Integrity and Resources must share the provider's **exact Storage transaction
   owner**, not merely a database URL or SQL client. Importing either module
   does not activate it or install a permissive policy.
5. Enable `crm.enabled` only through the approved flag service. Its safe default
   is `false`. Enabling it grants no authority. Actions declare `crm.read` or
   `crm.write`; resource policy must also authorize the reads and paired writes
   each operation performs. No production flag or provider is enabled here.

The real SQL tests compose canonical identity resolution and live tenant-wide
fixture grants. Their target policy is deliberately limited to those grants;
it is not a reusable production resource-policy implementation.

## Invoke the actions

Use the authenticated public host with a distinct durable idempotency key for
each intentional mutation. The following payloads form one complete sequence;
run each through `host.invoke('crm.organisation.<operation>', payload, options)`
in the canonical Caller context. Chapter 30 of `LLMS.md` contains a compiling
Effect example of create followed by update, archive, get, restore and list.

```json
{
    "id": "019b0000-0000-7000-8000-000000000001",
    "displayName": "Synthetic customer",
    "legalName": "Synthetic Customer Ltd",
    "tradingName": "Synthetic Trading",
    "visibility": "tenant"
}
```

| Operation | Input and defaults                                                                                                                                | Observable result                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `create`  | Required caller-generated UUIDv7 `id`, `displayName`, `legalName`; optional `tradingName`; optional `visibility` must be `tenant`                 | Creates Party and Organisation atomically at revision 1 with the same ID. Duplicate names remain distinct records; an existing ID conflicts.                 |
| `update`  | Required `id`, positive safe-integer `expectedRevision`, `displayName`, `legalName`; optional `tradingName` retains its stored value when omitted | Replaces supplied names and advances both revisions. An archived record or stale revision conflicts.                                                         |
| `archive` | Required `id`, `expectedRevision`                                                                                                                 | Hides an active record from default reads without changing identity. Already archived conflicts.                                                             |
| `restore` | Required `id`, `expectedRevision`                                                                                                                 | Reactivates an archived record, retaining identity/history. Already active conflicts.                                                                        |
| `get`     | Required `id`; `includeArchived` defaults to `false`                                                                                              | Returns the authorised projection or `not-found`. Explicit `true` permits reading an archived record with the same read authority.                           |
| `list`    | Optional exclusive UUIDv7 `after`; integer `limit` defaults to 50, range 1-100; `includeArchived` defaults to `false`                             | Returns ID-ordered `items` and the last returned ID as `after`. Continue with that cursor until `items` is empty. Archive filtering happens before limiting. |

All names must be nonempty, already trimmed and at most 200 characters. The
current update contract cannot clear an existing trading name; omission retains
it. Pagination is a keyset view of current state, not a snapshot across separate
calls. Inserts or archive changes between calls can change subsequent pages.

Every response carries stable `id`, paired `revision`, `kind=organisation`,
`visibility=tenant`, names, canonical `createdBy` and `owner`, and `archived`.
Creator is the freshly resolved Caller subject; delegated owner is its canonical
`onBehalfOf`, otherwise the subject. Identity columns are scalar text because
canonical SubjectId permits UUID versions beyond UUIDv7 record keys. They are
validated as SubjectId on output, never supplied by feature input.

## Rejections and recovery

- Do not submit tenant, owner, creator, private/team visibility, email, phone,
  contact points, bank/tax identifiers or other excess fields. Input decoding
  rejects them before mutation instead of silently stripping them.
- On `conflict`, reread current state and obtain its revision before deciding
  whether to submit a new mutation. Do not blindly retry a stale revision.
- `not-found` includes a default read of an archived organisation. Read with
  `includeArchived: true` before an authorised restore.
- `denied` means the invocation lacks matching canonical tenant/resource scope.
  The host may refuse earlier for revoked identity, missing permission or a
  disabled flag. Flags cannot override those refusals.
- `unavailable` is a bounded persistence/projection failure, not a partial
  success acknowledgement. Both resource rows and their history roll back
  together, including a failure after the second tentative write. Do not log
  private input or underlying database/parser errors to investigate it.

Concurrent mutations at the same expected revision have at most one winner;
successful edits advance both halves and append immutable resource history.
Reconnect uses persisted rows, not a process-local CRM cache. This is not a
generic undo, merge or offline convergence mechanism.

## Verification and remaining scope

`tests/resources/src/crm-organisation.spec.ts` drives the actual public host on
disposable real PostgreSQL and SQLite, with paired failure injection, concurrent
revision races, same-ID tenant isolation, multi-page/archived boundaries,
duplicate names, permission/flag/membership revocation, fresh reconnect and
private-value log/error/telemetry controls. The contracts suite keeps explicit
negative discovery controls so compiler limitations cannot become silent schema
loss. See EVE-68 and the [planning timeline](planning/timeline.md) for executed
gate and delivery evidence; passing local invocation is not full provider parity.

Person/User choices, contact points, affiliations, team/private sharing,
sensitive-field masking, generic undo, UI, offline/native execution and
HTTP/MCP/provider parity remain open on EVE-68. No archive/vendor bytes, shared
compiler/Resources/SQL APIs, protected trust paths or dependencies are changed.
EVE-248 remains deferred until January 2027; no spend or production release is
authorised by this backend slice.
