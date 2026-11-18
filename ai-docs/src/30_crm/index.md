# Tenant-private CRM organisations

EVE-68's bounded organisation backend exports portable specifications from
`@eventiva/contracts/crm-organisation` and unactivated composition from
`@eventiva/runtime/crm-organisation`. Evaluate `organisationResources`, admit
both declarations with the existing privileged Resources provider, then compose
the module with that Resources service and matching CurrentTenant. Durable
Integrity must use the exact provider Storage owner. Supply canonical identity,
live module-owned action/resource policy and flags; no production policy is
installed by this module. `crm.enabled` defaults off, with dotted `crm.read/write`
permissions. Tenant-only visibility never grants authority.

**Discovery parity is incomplete.** Intact bounded schemas work through public
ActionHost invocation but fail `validateInventory` provider compilation. The
published exact-UUID amendment `2c7ed103` is included; numeric composed minima
and Google's bounded-name support remain independent refusals, not resolved
by UUID normalization or a general constraint relaxation.
Keep explicit fail-closed discovery controls and do not change shared compiler
paths or weaken runtime input/output schemas to obtain parity.

Party and Organisation share a caller-generated UUIDv7 and atomic revision.
Names are nonempty, trimmed, maximum 200 characters; duplicate names are not
merged. Update requires display/legal names and expectedRevision; omitted
tradingName is retained and cannot currently be cleared. Archive/restore retain
identity/history. Get/list exclude archived records unless explicitly requested.
List uses exclusive ID cursor `after`, default 50/max 100; continue until empty.
Creator/owner derive from freshly resolved Caller; reject excess tenant/owner,
team/private visibility and contact/financial fields. Feature errors expose only
not-found/conflict/denied/unavailable, never private input or SQL causes.

The compiling example assumes an already authenticated, tenant-routed host;
it is not a bootstrap or permission bypass. Real SQL public-host proof is in
`tests/resources/src/crm-organisation.spec.ts`; details/options are in
`docs/crm-organisations.md`. Broad EVE-68 remains open for people, contacts,
private/team policy, undo, screens, offline/native and HTTP/MCP/provider parity.
No activation, migration file, dependency, paid service or January-deferred
EVE-248 work is included.
