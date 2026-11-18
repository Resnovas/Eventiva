# Tenant-private CRM organisations

This bounded [EVE-68](https://linear.app/resnovas/issue/EVE-68) backend supplies six
`crm.organisation.*` actions and six sensitive organisation work-contact actions.
It does not implement the complete CRM issue.

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
   `crm.organisation`, `crm.contact-point`, `crm.email-primary-guard` and
   `crm.phone-primary-guard` declarations using the existing privileged resource
   migration/provider composition. Existing Party/Organisation definitions are
   unchanged; contacts and guards are additive. This module adds no SQL migration.
3. Supply `Resources` and `CurrentTenant` when evaluating
   `crmOrganisationModule` from `@eventiva/runtime/crm-organisation`, together
   with the host's live `IdentityResolver`, `Authorizer` and `Flags` services.
   Contact execution rechecks those services after acquiring its group guard.
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

## Manage organisation work contacts

Use `crm.contact-point.add`, `update`, `remove`, `set-primary`, `get` and `list`
through the same authenticated host. These are the lowercase canonical names
required by the existing ActionName grammar. The planning packet's conceptual
`crm.contactPoint.*` / `setPrimary` spelling is not an alias or accepted action
name; no shared grammar or host admission was changed.

All six actions are sensitive and online-only. They deliberately remain outside
the existing non-sensitive HTTP inventory: do not add a transport exception.
They reuse default-off `crm.enabled`, `crm.read` for reads and `crm.write` for
mutations, plus live target and resource policy. Importing declares no authority.
The parent must be an accessible active tenant-private organisation, not a
Person or login organisation. Parent and contact operations share the exact
Resources/Integrity Storage owner; no names or paired parent revisions change.

Invoke this complete example on a fresh organisation created above (chapter 30
also contains a compiling sequence):

```json
{
    "organisationId": "019b0000-0000-7000-8000-000000000001",
    "id": "019b0000-0000-7000-8000-000000000011",
    "kind": "email",
    "label": "work",
    "value": "Sales.Team+demo@Example.test"
}
```

| Operation     | Required input and defaults                                                                       | Result                                                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add`         | Caller-generated UUIDv7 `id`, UUIDv7 `organisationId`, `kind=email\|phone`, `label=work`, `value` | Distinct revision-1 non-primary live contact. Same values at different IDs remain distinct; an existing ID conflicts.                                                                                                        |
| `update`      | `id`, `organisationId`, positive safe-integer `expectedRevision`, replacement `value`             | Advances the contact revision, preserving parent, kind, label and primary status. Value must match the stored kind's syntax.                                                                                                 |
| `set-primary` | `id`, `organisationId`, `expectedRevision`                                                        | Selects a non-primary live contact and atomically clears every previous live primary of the same parent/kind, including later storage pages. Each changed contact advances one revision. Already primary or stale conflicts. |
| `remove`      | `id`, `organisationId`, `expectedRevision`                                                        | Advances revision and stores `removed=true`, `primary=false`. Returns the authorized tombstone projection; retains immutable value/history. No replacement primary is nominated. Repeated fresh removal is not-found.        |
| `get`         | `id`, `organisationId`                                                                            | Strict live projection or safe refusal. No tombstone/include-removed option.                                                                                                                                                 |
| `list`        | `organisationId`; optional exclusive UUIDv7 `after`, integer `limit=50` in 1..100                 | ID-ordered live `items` and optional last-returned `after`. Continue until an empty page. Scans past tombstones before limiting, including multiple storage pages.                                                           |

Every projection contains ID, organisation ID, revision, immutable kind/work
label, exact value, primary and removed booleans. There is no verified status.
Email syntax is conservative ASCII: nonempty dot-separated unquoted local
segments using letters, digits and `!#$%&'*+/=?^_` plus backtick, braces, vertical
bar, tilde and hyphen; `@`; at least two domain labels made of alphanumeric
segments separated by single hyphens. The total maximum is 254 characters.
Phone syntax is exactly `+` followed by 7..15 digits, first digit 1..9 (maximum
16 characters). All input is already trimmed; case and bytes are retained. This
is syntax validation only, not comprehensive mailbox RFC support, allocation,
deliverability, ownership, country inference, normalization or verification.
Submit neither personal labels, other kinds, arbitrary visibility, user links,
tenant/owner/creator overrides nor `primary`/`verified` fields. Immutable fields
are not accepted by update. No inferred deduplication or reparenting occurs.

All contact mutations acquire a revision-checked persisted guard scoped to the
organisation and kind. First-use initialization and concurrent CAS losers roll
back the entire invocation with a bounded conflict/storage refusal. There is no
automatic mutation retry. Competing same-contact expected revisions have at
most one winner; different-contact selections may serialize successfully but
leave only one live same-kind primary. Email and phone primaries are independent.
Complete scans run inside this guard, without a process-local lock or SQL escape
hatch. Ordinary pages across calls are current-state keyset reads, not snapshots.

Fresh reads and writes refuse an archived parent, removed or foreign contact,
inaccessible parent or revoked authority. Restoring the organisation restores
fresh visibility of remaining live contacts. **Archive is not authorization
revocation of a previously committed mutation replay.** An already-authorized
retry with the original action/key/input may return its original historical
output without running parent/contact reads again, even after archive/removal or
later edits. The shared host still rechecks live identity, session, membership,
permission, target policy and flag on replay. Do not change keys or input to
recover an ambiguous committed reply. Stored commit evidence is stable; a fresh
invocation receipt need not be identical. Revocation denies replay; archive alone
does not. This slice changes no shared replay semantics.

After `conflict`, reread and decide whether a new mutation is appropriate.
`invalid-value` means an update's value failed the immutable kind's syntax;
`not-found`, `denied` and `unavailable` retain the bounded recovery rules above.
Do not log contact values, public-error internals or underlying SQL/parser
diagnostics. Value-bearing contact rows, history, results and original durable
commit outputs are sensitive authorized storage, not public metadata or logs.

## Verification and remaining scope

`tests/resources/src/crm-organisation.spec.ts` drives the actual public host on
disposable real PostgreSQL and SQLite, with paired failure injection, concurrent
revision races, same-ID tenant isolation, multi-page/archived boundaries,
duplicate names, permission/flag/membership revocation, fresh reconnect and
private-value log/error/telemetry controls. Contact tests additionally cover
original-key replay and lost-reply recovery, same-ID tenant isolation, immutable
parent revisions/tombstone history, real post-write interruption and partial
primary-switch rollback, independent-host primary races, 100-row storage-page
boundaries, post-guard flag loss and actual email/phone span/logger canaries.
The contracts suite keeps explicit
negative discovery controls so compiler limitations cannot become silent schema
loss. See EVE-68 and the [planning timeline](planning/timeline.md) for executed
gate and delivery evidence; passing local invocation is not full provider parity.

Person/User choices, personal/other contact kinds, affiliations, team/private sharing,
sensitive-field masking, generic undo, UI, offline/native execution and
HTTP/MCP/provider parity remain open on EVE-68. No archive/vendor bytes, shared
compiler/Resources/SQL APIs, protected trust paths or dependencies are changed.
EVE-248 remains deferred until January 2027; no spend or production release is
authorised by this backend slice.
