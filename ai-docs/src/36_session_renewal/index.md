# Trusted real-activity renewal

EVE-275 / GitHub #1063 remains open. The selected idle window is one hour,
absolute maximum eight hours from original sign-in. Server policy remains
required; trusted tenant idle settings may shorten but cannot exceed that bound.
The existing policy's approval window cannot exceed the live session deadline.
See docs/identity-oidc.md and docs/core-qualification/session-renewal.md.

Qualification checkpoint, 2026-11-20: retained renewal source2693f31b on exact
published515a62ff passes its normal static-plus-affected hook in496.534675s;
pinned fixture/hook/cleanup exits0 in500.844678s within unchanged1200s.
Fresh server80 cases include13 real SQLite/PostgreSQL lifecycle cases; coverage
is97.37/93.97/96.65/97.95%, renewal94.44/94.59/90/94.33%. No budgets/assertions
or thresholds changed. Separate clean graph hook, publication and exact-head
full main-push CI remain required. The report preserves earlier failed attempts
and finalization limits; local admission is not whole-Core or release acceptance.

IdentitySession.activity is optional for compatibility, not automatic migration.
Legacy rows require fresh sign-in to acquire lifecycle metadata. Its issuedAt,
lastRealActivityAt, absoluteExpiresAt, idleMs and original issuer/client provenance
must remain consistent with expiresAt. Repeating an already live OIDC sign-in
does not write or move anchors. Expired or closed sessions never reopen.

Trusted login completion uses server openOidcSessionWithPolicy inside the routed
Storage transaction and mandatory audit. It rereads IdentitySessionPolicy under
the shared identity guard and persists the required rolling settings. The portable
openOidcSession overload accepts explicit bounded settings; its numeric legacy
overload remains nonrenewable. The compiling example shows that lower-level seam,
not a new production policy source or replacement for the server wrapper.

Server sessionRenewal(verifier, registrations) builds a Context.Tag capability,
not an endpoint. Required services: paired same-client IdentityStore/Storage,
CurrentTenant, IdentityResolver, IdentitySessionPolicy, Flags and InputDigest.
Each exact registration supplies route, clientId, surface web/native and activity
human-mutation/interactive-read/navigation; none has a fallback. Bind only trusted
interactive handlers after accepted human activity. Never accept classification
from transport body/header/TTY booleans or wire this into generic HTTP middleware.

SessionRenewal.renew(route, redactedToken) re-verifies the bearer, matches the
server route/client, then acquires identity_guard first within Storage.transaction.
Time is sampled after lock acquisition. Live policy, issuer/subject link, human
principal/membership and session are rechecked. CAS and minimal durable receipt
commit together. Policy tightening is checked against previous activity before
acceptance; lost audit rolls back CAS. Repeated real activity cannot move the
absolute anchor or resurrect expiry/revocation. Only expiresAt is returned;
closed failure reasons invalid/denied/unavailable contain no provider/SQL details.

identity.session-renewal-enabled defaults false through the existing flag port.
Do not enable or configure production as a consequence of importing this module.
CLI activity NEVER renews, even human-interactive CLI commands: Jonathan's option B
supersedes earlier CLI eligibility. Sign-in is the human proof; reauthenticate on
idle/absolute expiry. Build no activity tickets. Only independently allowlisted
real web/native activity may renew the same canonical session. Agents, polling,
prefetch, background sync and token refresh never qualify. EVE-248 remains deferred
to January 2027 with budgets/settings unchanged; no dependency/spend/activation.
