<!-- linear:generated:start -->
# EVE-13: Establish modular core foundations for database adapters, Expo and observability

[Live Linear source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-16T10:38:47.454Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending, Feature, Product |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-16](EVE-16.md), [EVE-17](EVE-17.md), [EVE-18](EVE-18.md), [EVE-19](EVE-19.md), [EVE-20](EVE-20.md), [EVE-21](EVE-21.md), [EVE-22](EVE-22.md), [EVE-23](EVE-23.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-29](EVE-29.md), [EVE-30](EVE-30.md), [EVE-31](EVE-31.md), [EVE-32](EVE-32.md), [EVE-33](EVE-33.md), [EVE-34](EVE-34.md), [EVE-35](EVE-35.md), [EVE-36](EVE-36.md), [EVE-37](EVE-37.md), [EVE-38](EVE-38.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-47](EVE-47.md), [EVE-48](EVE-48.md), [EVE-49](EVE-49.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-57](EVE-57.md), [EVE-58](EVE-58.md), [EVE-59](EVE-59.md), [EVE-60](EVE-60.md), [EVE-240](EVE-240.md), [EVE-242](EVE-242.md), [EVE-243](EVE-243.md), [EVE-244](EVE-244.md), [EVE-248](EVE-248.md), [EVE-257](EVE-257.md), [EVE-259](EVE-259.md), [EVE-260](EVE-260.md), [EVE-261](EVE-261.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-52](EVE-52.md), [EVE-53](EVE-53.md), [EVE-54](EVE-54.md), [EVE-55](EVE-55.md), [EVE-56](EVE-56.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-78](EVE-78.md), [EVE-80](EVE-80.md), [EVE-86](EVE-86.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-113](EVE-113.md), [EVE-119](EVE-119.md), [EVE-124](EVE-124.md), [EVE-141](EVE-141.md), [EVE-148](EVE-148.md), [EVE-152](EVE-152.md), [EVE-154](EVE-154.md), [EVE-224](EVE-224.md), [EVE-245](EVE-245.md), [EVE-247](EVE-247.md), [EVE-250](EVE-250.md), [EVE-251](EVE-251.md), [EVE-252](EVE-252.md), [EVE-258](EVE-258.md), [EVE-261](EVE-261.md), [EVE-262](EVE-262.md), [EVE-263](EVE-263.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Modular extension platform continuity and delivery gate — 2026-11-15

Owner requested fully documented implementation and coordinated Amp orbs. The following dependent issue descriptions contain persistent implementation contracts and test requirements: <issue id="ceb453e5-ab8e-4566-bf54-47d742b0f425" label="EVE-257" href="https://linear.app/resnovas/issue/EVE-257/implement-the-composable-module-kernel-and-safe-lifecycleprovider" /> kernel lifecycle, <issue id="555738cd-b6eb-4f45-b9d0-d1e590a75785" label="EVE-258" href="https://linear.app/resnovas/issue/EVE-258/add-the-database-neutral-resources-api-and-privileged-tenant-migration" /> typed Resources + privileged migration, <issue id="afb95d96-359d-4c0f-a462-a7ce41e2c988" label="EVE-262" href="https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with" /> observation-only hook gateway and security, <issue id="71b3a3b5-09a5-45f1-9c59-512c9368036e" label="EVE-259" href="https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved" /> declarative UI registry, <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" /> telemetry/logger/console/rotated-file exporters, <issue id="4f5ecaa3-aedf-446d-8993-0c07c98d4bb4" label="EVE-251" href="https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust" /> trust policy, <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> federated web/native proof, <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> durable outbox, <issue id="55c2d64a-d779-41d9-b74e-dcc7d062b86b" label="EVE-252" href="https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the" /> multi-runner recovery. Preserve the exact archived Examples/preamp Eventiva ASCII word-art startup extension as the mandatory end-to-end proof of platform.ready + Effect structured logger + observability + lifecycle; verify original bytes and do not invent a substitute. Four existing Amp orbs were confirmed active on 2026-11-15 for kernel, resources, hooks and specification; coordinate instead of duplicating. Owner's strict central DB API, safe hybrid hot/restart lifecycle, observation-and-side-effects-only hooks and protected-event restrictions are approved principles. No assumption that incomplete target adapters, native federation, durable worker or production migrations are complete. Maintain acceptance gate: branch isolation, dependency checks, security review, full verified tests, evidence, explicit owner sign-off prior to integration to main; no unapproved dependencies/providers/production changes.

## Approved three-package foundation — 2026-11-14

Jonathan approved this architecture on 2026-11-14 after the <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />, <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> and <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" /> research review. This is architecture approval only: it does not start implementation, approve unlisted dependencies, provision services, change spending limits, or re-enable paid AI gates.

Eventiva's foundation is:

* `@eventiva/contracts`: portable, discoverable action specifications with stable IDs, Effect Schema inputs/outputs, transport-safe typed errors, agent-facing descriptions, permission/approval requirements and side-effect classes.
* `@eventiva/schema`: portable domain/resource definitions and database-neutral schema composition. It does not duplicate action definitions and imports no database driver into shared/client code.
* `@eventiva/runtime`: Effect v3 execution/composition for handlers, authorization, applicable transactions, audit and lifecycle. Domain handlers remain in feature modules; each handler registers against one action specification.

Every UI, mobile MDT, desktop/web, first-party/external agent and HTTP/MCP/ACP/other supported adapter invokes the same authorized action path. No UI-only or agent-only business implementation and no permission bypass. Dynamic feature/module registration and disposal use compatible manifests without changing core for each domain.

Nx dependencies must be explicit and acyclic, with portable frontend imports, tree-shakeable subpath entrypoints, type/layer/capability boundaries and no root barrels that pull in runtimes or drivers. Eventiva retains direct-to-main delivery, house checks and $0 paid AI-overage controls.

This decision supersedes earlier text that places portable actions in schema, embeds handlers in client-imported specifications, or treats a vendor/agent adapter as a separate business path.

## Highest-priority core architecture rule: agent-native capability parity

Explicit user decision: build on and use [Builder.io](<http://Builder.io>)'s open-source Agent-Native framework ([https://github.com/BuilderIO/agent-native](<https://github.com/BuilderIO/agent-native>)), not merely its branding or a loosely similar chat UI. Agent-native parity is the primary architectural acceptance gate for all core modules and both server/client surfaces. It does not override authorization, privacy, human approvals or the retained Effect-TS and module-boundary requirements.

Define every platform operation once as a discoverable, schema-described action. UI, first-party agents, external agents and protocol adapters must call the same validated, authorized implementation, share the same data, and receive relevant application state. No UI-only business capability, duplicated agent implementation or privileged database bypass. '100% coverage/access' means complete coverage of platform operations under the invoking user's explicitly delegated permissions, not unrestricted access to other users' data, secrets or administrative authority. Maintain a machine-readable action/capability inventory and a CI parity gate so adding an operation or federated module cannot silently exclude agents.

Retain Effect-TS as the domain/runtime foundation, with typed errors, services/Layers, Schema and scoped resources. Adapt Agent-Native/vendor Promise and schema boundaries in dedicated integration modules, rather than migrating domain logic to unstructured async code or adopting a second business-action implementation. Investigate compatibility with Expo, federation, sharding and offline synchronization; stop for a documented decision if upstream assumptions conflict. User approval covers adopting Agent-Native as the architectural foundation; additional dependencies still require review.

Ownership decided by the user (2026-10-31), subject to confirmation by spike: Eventiva owns the action contract, server runtime, authorization/auth and database. Each action is defined once in Effect Schema with an Effect handler on Eventiva's own runtime. Eventiva does not run Agent-Native's own server, auth and database as the backbone; how upstream agent surfaces are reused is set by the framework direction below, which supersedes the earlier plan to reuse upstream modules through a thin adapter. Observed at upstream commit a0356c6 (@agent-native/core 0.222.2): upstream ships its own Nitro/h3 server, better-auth, zod/Standard Schema actions and Drizzle over Postgres/PGlite, with no Effect usage. Spike S1 must show one Effect-defined action, authorized once, exposed to the UI, to an MCP client and as an AI SDK tool from the same inventory entry; if it cannot, stop and return the conflict here before building.

Framework direction decided by the user (2026-10-31): Eventiva owns its own Effect-native agent framework rather than a thin adapter over upstream. Upstream Agent-Native is the reference for functionality, not a runtime dependency to run as-is. Every upstream module is mapped to one of: build in Effect, wrap behind an integration boundary, port later, or not needed; that capability map is the parity list and modules are ported by priority, not as one rewrite. Observed size at a0356c6: about 690k non-test lines in core across 102 modules plus about 340k in toolkit, so a single full rewrite is out of scope. Upstream is MIT; ported code keeps attribution. For the AI side, use the Vercel AI libraries to keep maintenance simple, in line with the house AI reference (AI SDK alongside Effect AI, wrapped at Effect boundaries). Durable runtime (D3, decided 2026-10-31): Effect Cluster plus the Vercel tools the house prefers (house AI reference: AI SDK, Effect AI, eve, Workflow, Chat SDK, Connect, Sandbox, each where it fits). Load balancing and sharding take priority; where that causes an agent problem, file it as a Linear issue and solve it rather than weakening sharding. Each new dependency is still listed here for approval. Packaging must preserve tree shaking: one entry point per module, sideEffects false, no barrels that pull in drivers or vendors.

### Screen awareness and UI-to-agent registration - confirmed requirement

User requirement (2026-10-31): porting must keep upstream's AI integration behaviour, so every module built or ported registers with the agent in the same way. The agent must understand what is on screen and how to interact with everything: every button, API endpoint and user interaction is equally understood and invocable by the agent, so it can do exactly what the user wants.

Observed upstream mechanism at a0356c6, to be preserved in the Effect port: application state (navigation, selection, focused object) is persisted so the agent can read it (`application-state/`, upstream rule "Application state belongs in SQL application_state"); versioned screen projections for readable content, screenshot references, design and control (`browser-context/`, `browser-context.v1`); action results carry change records with undo (`action-ui.ts`); views describe themselves to the agent (for example `describeSettingsViewForAgent`); WebMCP exposes actions in the browser; UIs never call models directly, all AI work goes through the agent.

Proposed contract (to validate): (1) every interactive element binds to an action in the inventory; an interactive handler without an action binding fails a CI check, extending the parity gate from operations to UI; (2) every screen and component declares an Effect Schema screen-context projection of what it shows, the selection and focus, filtered by the viewer's permissions and masking; (3) navigation is itself an action, so the agent can open any screen the user can; (4) projections are declared explicitly rather than scraped from the DOM, so the same mechanism works on React Native, desktop and web, with screenshots only as a supplement; (5) federated modules register their actions and projections on activation and remove them on disposal. Validation: for a sample screen, the agent reads the same visible state as the user, performs each user-visible interaction through the same action, and a deliberately unbound button fails the check.

### Porting rules for every upstream module

Applies to every child issue that ports an Agent-Native module (decided 2026-10-31: port by capability map, spec everything now rather than leaving a vague later).

1. Read the upstream module at the tag pinned by <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" /> before writing code; record the tag in the commit. Keep the MIT attribution header on any file derived from upstream.
2. Every operation is an inventory action: Effect Schema input and output, typed errors, one authorization check, audit record, change record with undo where it mutates. No UI-only or agent-only path.
3. Every screen declares its screen-context projection and binds each control to an action (Screen awareness section). UI comes from Rambo-UI.
4. Vendors (storage, email, chat platforms, model providers) sit behind an integration package with a neutral Effect service; switching vendor changes composition only.
5. New behaviour ships behind a PostHog feature flag with a safe in-code default (house `feature-flags` skill).
6. Tests with `@effect/vitest`; docs for people and agents; graph refreshed; shipped to main per the AGENTS.md delivery exception.
7. Starts only after the phase-1 framework core it depends on exists (action contract from <issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, plus any named prerequisite).

### Connections and execution methods

Support all connection and execution methods in the selected, pinned upstream Agent-Native release. Inventory its actual supported surface from current source/docs and publish a versioned conformance matrix, not an open-ended promise based on a README. Explicit required target interfaces include ACP, API/HTTP, MCP and webhooks; also cover upstream A2A, CLI and applicable embedded/remote execution, agent teams, schedules/events, skills/memory and streaming/cancellation/resumption facilities. Distinguish upstream-native capabilities, Eventiva adapters, provider limitations and gaps needing implementation. ACP and webhooks are user requirements, not verified upstream support claims. ACP is required in both directions (decided 2026-10-31): inbound, so editors and external clients can drive Eventiva as an agent, and outbound, so Eventiva can drive external ACP agents. Observed at a0356c6: upstream has outbound only. Inbound and outbound transport support must each be stated, tested where applicable, and use the common action authorization path.

### End-user subscriptions and external agents

Support first-party agents and user-connected external agents, including use of the user's own eligible provider subscriptions as well as approved API-key/provider connections. Use supported provider login/delegation flows and document eligibility/terms per provider: owning a chat subscription does not automatically grant API or third-party execution rights. Never scrape session cookies, extract unofficial tokens, share credentials across users or silently fall back to Eventiva-funded inference.

Model execution identity, credential ownership, requested scopes, approvals, provider/model routing, quotas, cancellation, audit trail and who pays explicitly. Store credentials securely outside prompts, telemetry and action payloads; support disconnection/revocation and expiration. External agents receive scoped, revocable action access, not platform credentials. A revoked permission must not remain effective in an already running session. Preserve end-to-end OTel/PostHog correlation without recording credentials or sensitive prompts by default.

### Offline-first collaborative foundation

Confirmed starting database pair: PostgreSQL/Neon through Drizzle plus SQLite for local storage. Offline-first and multi-user editing are required, not delivered merely by providing two adapters. Human and agent changes must share the same operation, authorization and synchronization model: durable queued writes, retries/deduplication, reconnect convergence and explicit conflict rules. An offline agent must be able to use locally available actions/data; remote model/network work must surface its offline limitation rather than pretending to execute. Decided by the user (2026-10-31): multi-user editing covers both record/field-level concurrent edits and document-style collaborative text/canvas editing, and both are designed and validated together from the start rather than phased. Sync machinery must therefore be selected against both models: record sync with explicit field/record conflict rules, and a collaborative document model (for example a CRDT such as Yjs, which upstream Agent-Native already uses for its collaboration; not yet evaluated) with convergence, presence, undo and offline merge. The two must share one authorization, audit and action path for human and agent edits, and define how a document embedded in a record (for example a canvas attached to an event) is versioned, permissioned and synchronized. Agent-Native adoption does not itself prove offline collaboration support.

Sync engine decided by the user (2026-11-09, S4 <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" />): PowerSync, self-hosted Open Edition with Postgres bucket storage, for records and fields, paired with Yjs for text and canvas, with Yjs updates sent as rows through PowerSync. Every write goes through an Eventiva Effect action that checks permission, merges per field and records audit. Evidence: Node clients, web and Expo web (7 of 7), and a real Android phone (6 of 6). Runner-up if the FSL service licence becomes unacceptable: Electric with TanStack DB. Conflict policy per data kind is in the <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> findings comment and is carried into <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />. Two rules from the device test are binding:

* Concurrent canvas edits resolve by Yjs CRDT merge order, not last-writer-wins. Every device converges to the same value, which is not necessarily the edit that reached the server last.
* When a client loses a sync bucket (access removed), it tears down every open Yjs document from that bucket immediately: destroy the in-memory `Y.Doc`, close its editors and drop presence, without waiting for a reload.

Still unverified: native iOS (needs a Mac with Xcode), Safari/WebKit and Neon logical replication, tracked as a follow-up child issue.

## 1. Goal

Establish Eventiva's core foundations before product features: composable modules across backend, web, iOS and Android; multiple database tools; component-first React Native/Expo workflows; supported hot reloading; OpenTelemetry throughout; and PostHog as the product tooling platform.

Initial specification for product discussion. Not approval to begin implementation. Resolve open decisions below before delegating code work.

## 2. Context

Repository: Eventiva (the house-guidance worker reports the current target as Resnovas/Eventiva; confirm the canonical repository before implementation).

* House standards: [https://github.com/Resnovas/.github/blob/main/AGENTS.md](<https://github.com/Resnovas/.github/blob/main/AGENTS.md>)
* Coding preferences: .agents/skills/coding-preferences/references/{architecture,ui,effect,data,telemetry,integrations}.md
* Boundaries: docs/learnings/module-boundaries.md and eslint.config.mjs
* Existing architecture: docs/learnings/architecture.md
* Current testing transition: docs/learnings/tdd-and-test-creation.md
* Historical intent only: Examples/packages-old/core, databases, extensions and platforms. Do not copy the manually written implementation wholesale. Review current packages first and reuse sound existing mechanisms.
* House restoration: [https://ampcode.com/threads/T-95bc9c6d-a905-4a27-8ee3-d64535963d7f](<https://ampcode.com/threads/T-95bc9c6d-a905-4a27-8ee3-d64535963d7f>)

### Module foundations

Define the minimal public contracts, exports, configuration, dependency declarations, registration and startup/disposal lifecycle. Core is domain-agnostic, with no dependencies on other workspace packages. Keep vendor implementations in integration packages and business features in extension packages. Use strict TypeScript, Effect services/Layers, Schema validation, typed errors and scoped resources; no any.

Apply Nx type, layer and capability constraints together. Frontend cannot import backend, backend cannot import frontend, shared code must remain portable, and cycles must fail. Boundary decisions by the user (2026-10-31): lint (`eslint.config.mjs`) is the source of truth, and the documentation is corrected to match it. That means extensions may import `type:database` packages for schema helpers, and `type:shared` is a documented type. Tags use colons (`type:core`), and the house architecture reference in Resnovas/.github is corrected to colons. Target change (D6, agreed): move schema helpers such as `defineExtensionTable` into a `type:shared` schema package, then tighten lint and docs together so extensions never import database drivers. Same-type dependencies are allowed; during build-out, check for cycles and file a Linear issue only if a real problem appears. Core split (D5, agreed): a portable `layer:shared` contracts package with no dependencies, and separate backend runtime packages, so web and native can import the contracts.

No vendor coupling (user requirement, 2026-10-31): no build may couple core or domain code to a vendor. Vendors sit behind integration packages with a neutral contract, and switching vendors means changing composition, not domain code. Observed at 322ab45: Sentry is the only vendor found coupled into core (`packages/core/src/observability/tracing.ts`, `@sentry/node`, `@sentry/opentelemetry`); it is to be removed (D4).

### Multiple database tools

Use capability-based contracts and separately composed adapters rather than vendor branches in domain code. Document configuration, connection/resource ownership, transaction semantics, schema/migration ownership, unavailable capabilities and typed errors. Permit independently configured adapters to coexist without global mutable backend selection. Agree the initial concrete tools before building; a mock alone does not prove portability.

### React Native, Expo and component-first sharing

Support isolated component development before composing screens, across iOS, Android and web. Shared components/contracts must not pull server or database driver code into clients. Provide i18n-ready and accessible components.

Decided by the user (2026-10-31): the UI component library is its own package, Rambo-UI, in the Resnovas/Rambo-UI repository (connected to this project). Eventiva consumes it; Eventiva does not keep its own component library and does not port upstream's DOM toolkit. Observed at Rambo-UI b47a58c: README, logo and a template folder only, no components yet; its README mentions Storybook and [bit.dev](<http://bit.dev>), which are not yet reconciled with the React Native and Expo direction. Decided (D8, 2026-10-31): Rambo-UI becomes the cross-platform component library; it was once meant as a Mitosis multi-framework tool, and its build approach is open for the implementer to choose. Proposed: Rambo-UI stays free of Eventiva dependencies and exposes neutral hooks for interaction descriptors and screen-context projections, which Eventiva binds to its action inventory, so every Rambo-UI control can satisfy the screen-awareness contract without coupling the library to Eventiva.

Use the house direction of self-hosted Module Federation v2 for web and Re.Pack v2 for native, subject to a focused Expo/bundler compatibility validation. No Zephyr: older repository guidance mentions it but current house UI preference does not use it. Document when Expo development builds are required rather than promising Expo Go compatibility.

Specify public contract/version compatibility and shared React/runtime dependency policy. Remote components need bundled/cached fallbacks so offline screens do not fail. Local-first data/synchronization is separate from remote code loading.

### Server-side sharding and load distribution - confirmed scope

Support horizontally distributed backend execution using the repository's Effect Cluster direction. Define entity/work routing and shard ownership across multiple runner processes, with explicit ownership changes, capacity/load distribution, graceful drain and recovery after runner loss. A single-runner demo is not sufficient evidence. Keep domain operations transport-agnostic and avoid process-local state assumptions. Specify concurrency, ordering, retry/idempotency and persistence guarantees; do not claim exactly-once execution without proof. Distinguish compute/entity sharding from physical database partitioning: the latter is not implicitly selected by this requirement. Correlate traces and expose shard/runner load and failover metrics without uncontrolled metric cardinality.

### Unified mobile, desktop and web application - confirmed decision

Use React Native with Expo to streamline the shared mobile and web component foundation. For desktop, use a hybrid shared-UI desktop-shell architecture across macOS, Windows and Linux, with narrow native bridges for hardware and operating-system capabilities such as MIDI, DMX, USB/serial devices, local files and background services. Select the exact desktop shell through a later compatibility and dependency decision. Users install one Eventiva application per platform; roles and modules alter the experience inside it rather than requiring separate admin, client or crew applications.

Design deployment around both over-the-air application updates and federated runtime modules. They are complementary, not interchangeable: OTA updates deliver compatible application JavaScript/assets within platform policy; federation discovers, loads, activates, switches and unloads independently deployed modules/components. Both use signed/trusted manifests, versioned contracts, shared-runtime compatibility checks, staged rollout, rollback and a bundled/cached known-good fallback. Module enablement can vary by deployment and permissions without rebuilding the whole application where the target permits it.

Do not promise that every change avoids redeployment. Native dependency, entitlement, permission, desktop bridge, binary contract or incompatible shared-runtime changes require a new native/desktop release. Validate Expo OTA, Re.Pack federation and the eventual desktop shell together; a solution is not accepted merely because each works in isolation. <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> owns the federation proof and must extend its support matrix to cover interaction with Expo OTA and the chosen desktop-shell direction before production adoption.

Module activation model clarified by the user (2026-11-10): the ordinary Odoo-like install/activate experience should not require downloading arbitrary new native code or rebuilding the application. A module can immediately activate a package of declarative UI, data views, navigation, actions, permissions, workflows and configuration that the installed Eventiva runtime already knows how to interpret. Community authors and non-developers build pages through manual and AI-assisted visual tools using the same registered component/action inventory.

Use a cross-platform, versioned declarative view/module schema rather than treating raw XML or browser HTML as the portable runtime contract. Import/export may support familiar XML/HTML-like representations where useful, but the canonical model must render through Rambo-UI/React Native on mobile, desktop and web, pass accessibility and localization rules, bind every interaction to an authorized inventory action, support offline caching, and expose the same screen context to agents. Activation and deactivation are transactional and reversible: validate signatures, schema version, dependencies, permissions and compatibility before registration; unload routes, projections, listeners and resources cleanly; preserve or migrate module data explicitly.

Separate three module classes in the support matrix: (1) declarative modules using preinstalled capabilities, activatable immediately; (2) trusted federated JavaScript modules, updateable without a host rebuild only where platform policy and compatibility permit; (3) modules adding native code, entitlements, desktop bridges or new runtime capabilities, which require a reviewed application release. Community plugin policy decided by the user (2026-11-10): Eventiva is open source and the ecosystem remains open. Tenants may create, import, install, activate and share their own private or community modules without Eventiva review or marketplace approval. The official catalogue is discovery and trust metadata, not a gate on functionality. Self-hosters retain full control and can use alternative catalogues or direct package sources.

Openness does not make all module classes equally safe. Declarative modules run through the constrained schema, action permissions and tenant boundaries and may be installed directly after showing requested capabilities. Federated or executable code requires an explicit tenant-admin trust decision, integrity/signature and provenance display, isolated capability grants, revocation, audit and rollback; the hosted service may sandbox or refuse capabilities it cannot safely isolate without forbidding the portable module format itself. Native-capability modules still require the application owner to build and distribute a compatible binary. Never present Eventiva review as a security proof, and never silently grant a plugin the installing administrator's full authority.

### Client-side dynamic module loading and switching - confirmed scope

Component-first and federation must support runtime discovery, loading, activation, switching and disposal of compatible UI/modules, not merely development Fast Refresh. Define a versioned module manifest/public contract, compatibility checks, shared runtime dependency policy, loading/error states and fallback to a known-good bundled/cached module. Specify state handoff versus deliberate remount on switch, cancellation/cleanup of replaced work, and rollback after a failed activation. Load code only from trusted sources; do not treat remote code delivery as ordinary untrusted data. Verify platform restrictions and distribution policies, especially native binary changes and Expo development builds. Record which compatible JavaScript updates avoid a host rebuild and which changes require restart or rebuild.

### Hot reloading

Distinguish Fast Refresh/HMR, backend service lifecycle reload and independently deployed remote component updates. Publish a target-by-target support matrix: state-preserving refresh, safe remount/restart, native binary rebuild and unsupported cases. Dispose superseded scopes/connections/listeners exactly once and prevent duplicate registrations. Reject incompatible updates safely. Native code and schema changes must not be presented as universally hot-swappable.

### Mandatory module scaffold: localization, terminology and feature control

Internationalisation is a core contract, not a later translation pass. Every core, product and community module declares namespaced message keys, default messages, supported locale bundles, terminology concepts and locale-aware formats. React Native, Expo, desktop and web use the same message contracts; Rambo-UI accepts message keys rather than embedded user-facing strings. Per-user locale, language, time zone, number, currency, date/time, plural and accessibility formatting work offline. Missing keys, hard-coded user-facing strings and incomplete default catalogues fail the module validation gate.

Separate language from domain vocabulary. A locale translates human language; a tenant terminology/profile pack maps canonical concepts to event, community-role-play or other domain terms. Stable entity, action, permission, telemetry and API identifiers never change with wording. The selected profile changes labels, help, templates, default statuses and visible navigation without forking code or data. Agents receive both canonical concepts and the user's rendered terminology so they can understand the screen while calling stable actions.

Feature flags are part of the module contract from first registration. Every new behaviour has a namespaced flag, owner, purpose, safe in-code default, supported runtime/deployment scope, dependency/conflict declarations, offline fallback, exposure event and removal or graduation plan. Flags can enable modules and staged behaviour by tenant, environment, cohort, role or compatible runtime, but they do not bypass package installation, permissions, approvals, schema compatibility, native capability requirements or safety certification. PostHog is the default adapter behind the vendor-neutral flag service.

Every module therefore ships one validated manifest covering identity/version/licence/source, dependencies and compatibility, actions and permissions, data/sync/migrations, screens and Rambo-UI components, i18n catalogues and terminology concepts, feature flags/defaults, agent/screen projections, telemetry, offline behavior, requested capabilities, activation/deactivation and rollback. The same open manifest and validation tooling applies to first-party, tenant-private and community modules so open-source modules work out of the box rather than relying on private conventions.

### OpenTelemetry and PostHog - foundational, not a later add-on

Provide interoperable OpenTelemetry tracing, metrics and correlated logging across supported runtimes. Propagate trace context across HTTP/RPC, async operations, workflow/job boundaries and database adapter calls; preserve context through Effect concurrency and scoped lifecycle operations. Instrument module activation, reload, disposal and failures. Define stable semantic attributes and resource identity (service, module, version, environment), sampling, batching, bounded buffers, flush/shutdown and exporter configuration. No vendor coupling in core contracts. Decided (D4, 2026-10-31): remove Sentry; core emits vendor-neutral OpenTelemetry; telemetry and product-tooling vendors are swappable integration packages, with PostHog the default as the house requires.

PostHog is the primary product tooling platform, in a dedicated Eventiva product project rather than an unrelated/default project. Cover the house telemetry inventory:

* Product analytics and identity/group conventions.
* Tracing, correlated logging and metrics.
* Error tracking with release/source-map support for host and independently versioned components.
* Feature flags with safe in-code defaults, Early Access, experiments and exposure tracking.
* Session Replay and Replay Vision; heatmaps and toolbar where the target supports them.
* For AI-enabled modules, AI Observability linked to relevant product/error/session context, managed prompts with A/B tests, Skills, Datasets and Semantics where supported and applicable.

Use current documentation to verify support, maturity, SDK compatibility and ingestion paths separately for web, native and backend. Create an explicit capability matrix including unsupported or not-applicable tools, with rationale and proposed follow-up. Do not claim every PostHog product works on every runtime, or that all OpenTelemetry signals can be ingested into PostHog without verification. If a required signal needs a separate compatible collection/export path, bring that decision back here rather than silently choosing another platform.

Telemetry must not block business operations or break offline development. Prevent duplicate events/instrumentation after reload and federation loading. Provide telemetry: false as required by house standards, with documented interaction with feature-flag retrieval and safe offline defaults. Redact secrets and sensitive payloads; apply consent, replay masking, retention/access rules and pseudonymous identifiers before linking traces, errors, people and replay. Do not send customer data merely because an SDK permits it. Credentials belong in secure configuration, not source or this issue. New dependencies require maintainer approval here first.

## 3. Validation

* Primary gate: the operation inventory has 100% authorized agent/action coverage. Demonstrate UI-to-agent and agent-to-UI state/data visibility, including a dynamically loaded module and a sharded operation. Negative tests prove tenant isolation and identical permissions across every exposed interface.
* Pin the upstream Agent-Native version and verify its connection/execution inventory. Conformance tests cover each supported method; explicitly include ACP, API/HTTP, MCP and webhooks plus applicable A2A/CLI paths. Document unimplemented required methods as blockers, not silently unsupported exceptions.
* Demonstrate a first-party agent and an external agent using shared actions, plus an eligible end-user subscription connection. Verify routing, payer attribution, denied scopes, cancellation, expired/revoked access and no silent billing fallback. List provider-specific unavailable subscription paths honestly.
* Demonstrate human and agent offline writes surviving restart and reconnect, concurrent edits converging under a documented conflict policy, and permission revocation handled at synchronization. Demonstrate concurrent human and agent text/canvas co-editing converging online and after offline divergence, with presence, undo and permission revocation, in the same validation phase as record sync.
* Run a representative backend workload across at least two independent runner processes. Demonstrate distribution and shard ownership, graceful runner drain and recovery on runner loss, with explicit delivery/retry and state persistence guarantees and observable traces/metrics.
* Demonstrate loading and switching between two compatible UI/module versions at runtime on each supported target, without a host rebuild where supported. Verify cleanup, documented state retention/remount behaviour, incompatible-version rejection and recovery to a known-good module. Distinguish this evidence from development-only Fast Refresh.
* A reviewed module inventory maps each package to public contracts, runtime support, lifecycle and Nx tags. Positive/negative dependency fixtures prove enforcement, including cycles and client/server isolation.
* One representative extension passes a shared conformance suite against at least two agreed concrete database adapters without domain source changes. Test capability differences and simultaneous independent configurations.
* An isolated component runs through documented Expo workflows on iOS and Android plus web. Record actual device/simulator verification and exact commands; unrun platform checks remain outstanding.
* Demonstrate each claimed refresh path, compatible state retention, disposal/re-registration without leaks or duplicate handlers, and safe incompatible-update failure/restart.
* Demonstrate shared module loading, shared-runtime version handling, and bundled/cached fallback for unavailable or incompatible remotes.
* An end-to-end sample operation has a correlated trace from UI through backend to database; correlate an intentional error and applicable structured logs without leaking sensitive inputs. Metrics and exporter delivery are observable. Verify context across async boundaries and clean shutdown.
* Verify applicable PostHog analytics, flags/defaults, experiment exposure, errors/source maps and masked replay; record evidence for remaining tools in the capability matrix rather than assuming support.
* Test offline/exporter outage behaviour, bounded buffering, opt-out, masking/redaction and repeated hot reload with no duplicate telemetry or application failure.
* Applicable Nx lint, typecheck, build and tests pass with commands/results recorded. Follow the current testing transition: implementers may add/update tests; never remove or weaken tests to silence failures. Do not assume a live cluster or initialize private tests in default setup.
* Human and agent documentation explain setup, a minimal module, options/defaults, adapter composition, Expo component workflow, reload support, OpenTelemetry/PostHog configuration, privacy controls and troubleshooting. Correct affected stale guidance.
* Done signal: decisions and evidence linked here, limitations explicit, and accountable human review against these criteria. Writing this issue alone does not complete the implementation.

## 4. Out of scope

Product features, copying historical packages wholesale, a backend rewrite, every database vendor, production infrastructure deployment and universal native hot swapping. Offline-first multi-user editing, server-side sharding and client-side runtime module loading/switching are explicitly in scope. House-sync enrollment remains a separate maintenance decision. This issue authorizes planning, not provisioning PostHog or changing production settings.

## 5. Escalation and open decisions

 1. Resolved by the user: 'sharing' meant server-side sharding/load distribution plus client-side federated, component-first modules that can be hot-loaded and switched. A subsequent user requirement separately adds offline-first multi-user editing. Resolved 2026-10-31: both record/field and text/canvas co-editing, designed and validated together from the start.
 2. Database pair confirmed by user: PostgreSQL/Neon with Drizzle plus SQLite for local/offline storage. Agree adapter capabilities and sync machinery, evaluated against both record and text/canvas editing. Sync machinery resolved 2026-11-09: PowerSync plus Yjs (<issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" />); adapter capabilities remain with P1.3.
 3. Agree minimum core inventory and existing implementation to retain/extend/replace.
 4. Validate Expo/native federation strategy and acceptable reload/rebuild limits.
 5. Resolved 2026-10-31: lint is the source of truth; see Module foundations.
 6. Agree PostHog project ownership, platform capability gaps, telemetry privacy policy and any exporter/collection path PostHog cannot supply.
 7. Resolved 2026-10-31, pending spike S1: Eventiva owns actions, server, auth and database (reuse approach refined by item 8).
 8. Resolved 2026-10-31: own Effect-native framework, ported from upstream by capability map; Vercel AI libraries for the AI side. Durable runtime resolved in item 11 (D3).
 9. Resolved 2026-10-31: UI components live in the separate Rambo-UI package and repository.
10. Resolved 2026-10-31: a new Linear project, Eventiva platform foundations, with [EVE-13](<https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and>) as parent and executable child issues. Finalised specifications live in Linear, which syncs to GitHub.
11. Resolved 2026-10-31: D3 Effect Cluster plus house Vercel tools; D4 remove Sentry, vendor-neutral; D5 core split; D6 shared schema package; D7 colons and house fix; D8 Rambo-UI cross-platform; D10 ACP both directions.
12. Resolved 2026-10-31 (user chose an Eventiva-only exception): agents push straight to main without pull requests, overriding AI-20, AI-21, AI-31 and, for sign-off, AI-03 in this repository only. Agent commits are authored and signed off as Jonathan [11413796+TGTGamer@users.noreply.github.com](<mailto:11413796+TGTGamer@users.noreply.github.com>) with the AI Co-authored-by trailer, and run the local gate before each push. Recorded in AGENTS.md after house:local, commit 058251e on main.

Stop for unresolved architecture conflicts, new dependencies or house-rule overrides rather than guessing. Read current upstream documentation before implementation. Graphify and the house MCP gateway were unavailable in this Puck conversation; repository guidance and the connected Linear tools informed this initial specification. No runtime or SDK compatibility validation has been performed.

## Core foundations planning audit - 2026-11-13 (current GitHub main and Linear)

**Review only.** This is a dependency and evidence audit, not implementation approval and not a change to issue states. Current repository: [https://github.com/Resnovas/Eventiva](<https://github.com/Resnovas/Eventiva>) at main `6c43145f` (2026-11-11). Current `packages/README.md` explicitly says the production package tree is empty after <issue id="6b614c3b-413d-4d91-939b-d1792fefe210" label="EVE-242" href="https://linear.app/resnovas/issue/EVE-242/archive-the-manual-pre-amp-packages-and-create-a-clean-package-tree" />. Root `pnpm-workspace.yaml` selects only the root; `package.json` has house setup/check but no Nx application, Effect or Expo dependencies, and `nx.json` and `eslint.config.mjs` do not currently exist. `Examples/eventiva-before-amp` and `Examples/packages-old` are archives, not executable baselines. Do not describe pre-reset platform code as currently implemented.

### Release order / true blockers

1. <issue id="6b614c3b-413d-4d91-939b-d1792fefe210" label="EVE-242" href="https://linear.app/resnovas/issue/EVE-242/archive-the-manual-pre-amp-packages-and-create-a-clean-package-tree" /> **Done** - the intentional full reset/archive is committed and documented. Treat it as decided, not an open retain-vs-copy question.
2. <issue id="583894b0-6b9f-4759-8b2d-145a78d15933" label="EVE-243" href="https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization" /> **Backlog / live verification blocked** - canonical Smartcloud config and ten workflows are present and local checks were recorded as passing at dbe8a23b and 6c43145f. However live settings sync remains unverified: the repository currently exposes only the pre-existing disabled ruleset, and latest checked Smartcloud runs on 2026-11-13 failed with no job steps (e.g. [https://github.com/Resnovas/Eventiva/actions/runs/43340789056](<https://github.com/Resnovas/Eventiva/actions/runs/43340789056>)). The <issue id="583894b0-6b9f-4759-8b2d-145a78d15933" label="EVE-243" href="https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization" /> comment cites GitHub billing lock on previous runs; this specific new failure's logs could not be fetched, so do not assert its cause without verifying. Owner actions in `docs/smartcloud-enrollment.md`: resolve GitHub Actions/billing if still active, confirm Resnovas Bot installation/administration permissions and Actions variables/secrets securely, explicitly authorise a fresh workflow run, verify ruleset/settings read-back, set five-ref push limit manually, and attach evidence. Do not equate committed YAML or passing local checks with applied GitHub settings.
3. <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" /> **Backlog / immediate foundation build gate** - after <issue id="583894b0-6b9f-4759-8b2d-145a78d15933" label="EVE-243" href="https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization" />, create the first real Nx/PNPM/Expo/React Native/Effect workspace and non-recursive lint/build/test checks; publish an exact version compatibility matrix, obtain required dependency/version approvals, synchronize Node 24 and PNPM declarations across tools, and prove client/server module boundaries on a minimal example. Current pinned Node is 24.22.2 and PNPM 9.14.2, but `.nvmrc` and fresh application workspace still need scaffolding as the ticket states. <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" />'s many recorded governance/security/feature decisions remain constraints, not a reason to build the entire platform in this scaffold.
4. <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" /> **In Progress, but old extraction contract is stale** - the existing description was written around porting `packages/core` and preserving old tests. Those live packages/tests no longer exist by explicit <issue id="6b614c3b-413d-4d91-939b-d1792fefe210" label="EVE-242" href="https://linear.app/resnovas/issue/EVE-242/archive-the-manual-pre-amp-packages-and-create-a-clean-package-tree" /> decision. Before resuming, revise <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" /> into a from-scratch portable contracts / Effect runtime / shared schema deliverable against the new <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" /> tree, with fresh tests; do not pretend the previous extraction or old Nx tests can run.
5. <issue id="b010c76c-336d-43ce-901f-f0d7ea75706a" label="EVE-22" href="https://linear.app/resnovas/issue/EVE-22/correct-boundary-docs-to-match-lint-use-colon-tags-and-fix-the-house" /> **Backlog boundary reconciliation** - once new Nx rule files exist, align the archived module-boundary intent with the canonical Resnovas house rule and enforce `type:*`, `layer:*`, `capability:*` using colon tags. The current house architecture skill still describes underscore tags while its own examples say colon; no live `eslint.config.mjs` exists after reset. Treat this as a design/documentation conflict to resolve during scaffolding, not as a current failing lint rule.
6. <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> **Backlog technical proof** - Expo web/Android remote module loading and switching with Re.Pack/native and Module Federation/web has not been accepted by a recorded spike. Require explicit current SDK/bundler version compatibility, what needs a development/native build, offline cached fallback, ABI shared dependency checks, and iOS follow-up. Do not claim remote native hot-loading works yet.

### Chosen directions already documented, not decisions to repeat

* <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> sets Effect-TS, agent-native one-action parity across UI/API/MCP/ACP/agents and scoped auth, horizontal Effect Cluster, component-first Expo/React Native, OTel with PostHog adapter, and locally stored SQLite plus Postgres/Neon with Drizzle.
* <issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" /> and <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" /> Done: action/protocol proof and capability map. <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" /> Done: historical two-runner Effect Cluster spike (evidence applies to archived code, not the reset production tree). <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> Done: choose PowerSync self-hosted Open Edition for record sync and Yjs for text/canvas; <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> implements it, and <issue id="0fa44b79-7365-4359-837e-3369704d781d" label="EVE-240" href="https://linear.app/resnovas/issue/EVE-240/s4-follow-up-run-the-powersync-and-yjs-device-test-on-ios" /> remains iOS device validation. <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> Done: direct OTLP to PostHog decision with <issue id="dc7c9627-4917-4545-8535-0aec48a21460" label="EVE-57" href="https://linear.app/resnovas/issue/EVE-57/telemetry-f1-spike-effect-otlp-export-of-traces-and-metrics-from-expo" />/58/59/60 follow-ups. <issue id="a904aa60-b3c7-4bfa-8d2d-995d1e679389" label="EVE-20" href="https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription" /> Done: sanctioned provider connection launch list with limitations and no consumer-plan workarounds. None of these spikes creates the missing current production foundation.
* <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> action registry should be the first substantive platform contract after <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" />/<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />; <issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" /> configuration, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> auth and <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> storage are subsequent dependency foundations. Then <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> change feed, <issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" /> HTTP/streaming, <issue id="37c126a9-64e0-4235-88f0-494533c8e3a2" label="EVE-48" href="https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory" /> MCP and <issue id="937d4311-ff71-4bd1-b167-846d08afc64f" label="EVE-49" href="https://linear.app/resnovas/issue/EVE-49/p110-build-inbound-acp-so-editors-can-drive-eventivas-agent" /> ACP; later agent runtime <issue id="ea979eae-7d55-4438-96ae-2449b9a15c18" label="EVE-47" href="https://linear.app/resnovas/issue/EVE-47/p18-build-the-agent-loop-engines-durable-runs-threads-and-harness" />, screen context <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> and collaboration <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />. <issue id="1b79a257-9ea0-40b5-a8f7-23e1c09221be" label="EVE-39" href="https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default" /> idempotent persistence is a cross-cutting safety requirement, not a feature to defer indefinitely.
* Repository-specific AGENTS.md has a documented direct-to-main exception; house general guidance alone does not override it. House Effect preference: strict TypeScript, Effect for fallible/IO code with typed errors/Layers, no `any`; vendor APIs behind integration boundaries, Nx dependency constraints, human and agent docs, reviewable tests and feature flags. Some older S2 and <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> wording references an active `packages/core` or previously pinned drivers; that context is now archival and must be refreshed when those issues start.

### Recommended next decision / action

Do not restart the directory or inventory onboarding research (<issue id="fd056914-9b21-4734-9f29-2ff2847630dd" label="EVE-247" href="https://linear.app/resnovas/issue/EVE-247/research-supplier-product-catalogue-coverage-and-bulk-inventory" /> is parked). Verify <issue id="583894b0-6b9f-4759-8b2d-145a78d15933" label="EVE-243" href="https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization" />'s actual external settings/Actions state with an owner-capable path; then approve a current Nx/Expo/Effect/TypeScript dependency and runtime matrix for <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" /> **after** compatibility review. Only then lock the minimal portable contract and action-inventory API for <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />/<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />. If native federation compatibility fails, decide on a documented web-first/native-bundled fallback rather than relaxing the platform's agent parity or offline requirement.

**Audit evidence limits:** GitHub files and Linear comments/issue statuses inspected 2026-11-13; no source code changed, no test/build/CI re-run and no admin settings applied. Current Graphify indexed results mixed historical `Examples/packages-old` with `packages/core` symbols which do not exist in the current active tree, so do not treat that index alone as current-code verification.

## Modular-platform source of truth and breakdown (2026-11-15)

Canonical self-contained spec: [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>); repository document docs/architecture/modular-platform.md (local review handoff, not yet pushed). Owner request 21:26 UTC and 21:34 approval gate govern this increment: no push/merge to main before owner approval of the detailed brief and review gates. No new dependency/provider/crypto/settings/provisioning permission.

Implementation packets: <issue id="ceb453e5-ab8e-4566-bf54-47d742b0f425" label="EVE-257" href="https://linear.app/resnovas/issue/EVE-257/implement-the-composable-module-kernel-and-safe-lifecycleprovider" /> kernel; <issue id="555738cd-b6eb-4f45-b9d0-d1e590a75785" label="EVE-258" href="https://linear.app/resnovas/issue/EVE-258/add-the-database-neutral-resources-api-and-privileged-tenant-migration" /> central Resources under <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />; <issue id="71b3a3b5-09a5-45f1-9c59-512c9368036e" label="EVE-259" href="https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved" /> initial declarative-only UI; <issue id="575e86d2-9f53-42bf-8097-6b8b79e515a5" label="EVE-260" href="https://linear.app/resnovas/issue/EVE-260/build-the-clean-word-art-reference-extension-after-verified-platform" /> clean historical startup banner/template; <issue id="b025ea11-9298-48b2-9bd4-d44decabcab4" label="EVE-261" href="https://linear.app/resnovas/issue/EVE-261/integrate-the-modular-platform-and-prove-every-owner-required" /> integrated acceptance; coordinator-created <issue id="afb95d96-359d-4c0f-a462-a7ce41e2c988" label="EVE-262" href="https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with" /> governed subscription/dispatcher/gateway shares <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> durable producer/outbox/feed. <issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" />/44/45/50/16 updated without replacing their original intent; <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />/40/244 remain Done. No new thread created by specification lane.

Safe order: isolated contracts/kernel/resources/hooks checkpoints -> coordinator-only exports/Nx/format-1 adapters/root SQL graph gate -> config/central console+date-file telemetry/authorization/audit/durable outbox and workflow fencing -> declarative UI/action projection -> historical ready-triggered banner/template -> full Nx/check/verify/docs/graph and owner review. Two compositions/provider coexistence, resource migration/history, all ten module operations and hook lifecycle, active-workflow update refusal/retry, protected non-disclosure, config serialization negatives, correlated sinks/bootstrap failure, ready/banner replay/recovery/audit are mandatory G01-G14 gates in spec. All implementation gates remain unverified by specification lane.

Stable kernel API: exact x.y.z only; ProviderKey {module,instance}; explicit bindings; 8 states/10 operations; scoped workflow pin {module,version,generation}; mandatory ModuleDefinition.validate Effect<void,KernelError>, exact compatibleWith predecessor for hot update; MigrationDeclaration exactly id/kind/online. Rich migration checksums/history live in privileged resource plan. Process-local ready/lease/dispatcher tests are not durable/distributed proof. Historical word-art means Eventiva/by-Resnovas/copyright startup output after verified platform.ready, NOT an editor. Physical console exactly-once crash gap requires sink evidence and cannot be silently claimed from dedup. AI-authored planning update.

## New binding quality gate — circular dependencies and exact types (2026-11-15)

See <issue id="5dbfce34-6bca-46ef-937b-e475730e55a0" label="EVE-263" href="https://linear.app/resnovas/issue/EVE-263/enforce-acyclic-moduledependency-graphs-and-exact-effect-ts-types" /> for full requirements and negative/positive acceptance fixtures. Never create circular static/runtime module dependencies, including indirect and type-only imports. Shared contracts belong in existing lower-level package C, imported by A and B with no reverse edge. Effects hooks/capabilities must permit cross-module extension without imports back to publishers. Reject dependency cycles at manifest admission and in Nx/import/type graph CI. Preserve precise Effect Schema/Context/Layer/action/hook/external dependency typing. No `any`, exposed `unknown`, invented `none` catch-all, unsafe casts, or ignored TS diagnostics as fixes. Validate external input at narrow schema adapters and escalate unavoidable vendor internal `unknown` to explicit review. Strict typecheck, boundary lint, type-level and runtime negative fixtures and evidence mandatory before sign-off.

## Latest owner continuation authorization

The later owner-authorized message permits starting bounded nonconflicting GPT/Codex lanes for UI and telemetry after existing <issue id="afb95d96-359d-4c0f-a462-a7ce41e2c988" label="EVE-262" href="https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with" /> scope/path review. This supersedes the earlier no-new-thread planning limit only for these two lanes. UI [https://ampcode.com/threads/T-ed7d0408-f922-492a-b3c0-0458581052e1](<https://ampcode.com/threads/T-ed7d0408-f922-492a-b3c0-0458581052e1>) and telemetry [https://ampcode.com/threads/T-01a1e12c-591d-7547-b19c-e44d0f38fb46](<https://ampcode.com/threads/T-01a1e12c-591d-7547-b19c-e44d0f38fb46>) launched; no duplicate kernel/resource/hooks. Review packet [https://ampcode.com/artifacts/eve-261-integration-review-packet-79ccdbb8-374a-4c4f-bd42-6e43e14b975c](<https://ampcode.com/artifacts/eve-261-integration-review-packet-79ccdbb8-374a-4c4f-bd42-6e43e14b975c>). Word-art stays gated; no shared integration, main push/merge, settings, provisioning or dependency additions authorized.

## Binding <issue id="5dbfce34-6bca-46ef-937b-e475730e55a0" label="EVE-263" href="https://linear.app/resnovas/issue/EVE-263/enforce-acyclic-moduledependency-graphs-and-exact-effect-ts-types" /> integration appendix - 2026-11-15

Goal: satisfy the owner's strict acyclic, escape-free typing requirement before shared integration or main delivery. <issue id="5dbfce34-6bca-46ef-937b-e475730e55a0" label="EVE-263" href="https://linear.app/resnovas/issue/EVE-263/enforce-acyclic-moduledependency-graphs-and-exact-effect-ts-types" /> is the source of truth; this appendix preserves this issue's existing scope and completion intent.

Context: canonical spec section 2.1/G15: [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>) . Single review packet: [https://ampcode.com/artifacts/eve-261-integration-review-packet-79ccdbb8-374a-4c4f-bd42-6e43e14b975c](<https://ampcode.com/artifacts/eve-261-integration-review-packet-79ccdbb8-374a-4c4f-bd42-6e43e14b975c>) . All existing lanes were asked to audit their exact revision and record violations rather than treat earlier green tests as clearance.

Validation: Nx package boundaries/cycles plus TypeScript-resolved source graphs must cover value/type-only imports, relative paths, aliases, reexports, transitive and generated edges. Runtime manifest/provider graph rejects cycles before publication/admission. Show direct A->B->A and indirect A->B->C->A negatives, type-only/alias/reexport negatives, shared-contract A->C<-B and diamond A->B,C->D positives, and one-way hooks via registry. Shared versioned Effect Schema stays lower-level in contracts/schema; no reverse dependency or duplicated widened model. Strict compile/decode fixtures preserve precise input/output/error/environment and provider-swap types. CI must reject any, unauthorized explicit unknown, erased placeholders, unsafe/blind JSON casts, untyped bindings and suppression/disabled checks. Decode untrusted values at boundaries; an unavoidable vendor unknown is private, narrow, parsed before exposure, and requires explicit owner review.

Out of scope: no new dependencies, settings, source integration, export/shared-file edits, push/merge or weakening gates through this appendix. An isolated alias typecheck or process-local model is not full CI/durability proof.

Escalation: list exact revision/file:line, cycle path or type escape, command/exit/diagnostic, owner and blocked code/remediation. Existing violations are separate findings, not grandfathered. Review-before-main remains binding; no integration while unresolved <issue id="5dbfce34-6bca-46ef-937b-e475730e55a0" label="EVE-263" href="https://linear.app/resnovas/issue/EVE-263/enforce-acyclic-moduledependency-graphs-and-exact-effect-ts-types" /> violations or approvals remain. Hook edges stay one-way; no inverse imports to observe a publisher.

Issue-specific audit continuity: All platform increments inherit G15. Preserve the four security profiles and logical-versus-physical exactly-once caveat. <issue id="5dbfce34-6bca-46ef-937b-e475730e55a0" label="EVE-263" href="https://linear.app/resnovas/issue/EVE-263/enforce-acyclic-moduledependency-graphs-and-exact-effect-ts-types" /> is an additional conjunctive acceptance gate, not a reason to reopen completed foundation issues.

## Linear comments (69)

### Comment 7d00f364-95f4-4ac3-87be-d207396c390c

Author: GitHub. Created: 2026-10-31T11:13:20.657Z; updated: 2026-10-31T11:13:20.632Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/779). All replies are displayed in both locations.


### Comment 7fb440f7-39c2-43c3-9543-430a7d7e1af1

Author: jonathan@resnovas.com. Created: 2026-10-31T22:01:36.769Z; updated: 2026-10-31T22:01:36.735Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Findings from S2 (EVE-15), recorded here as gaps and risks. Status: Observed.

1. **ACP inbound has no upstream implementation.** Agent-Native only drives external ACP agents. A standard SDK makes inbound viable (`@agentclientprotocol/sdk` 2.2.0, where `agent()` is stable over stdio and HTTP/WS is experimental). This is new Eventiva build scope rather than a blocked gap, and it is listed as phase-1 step 10 in the S2 map.
2. **Effect version risk for S1.** Eventiva pins `effect` 3.19.19 and the house standard says Effect v3. `effect` latest is now 4.1.1 (2026-10-30), and `@effect/ai-anthropic` tracks 4.x. `@effect/cluster` 0.60.2 and `@effect/workflow` 0.19.1 are the v3-line releases. S1 should confirm that Cluster, Workflow and Effect AI all work together on 3.19 before phase 1 starts. If they do not, a v4 move becomes a house-level decision.
3. **Protocol gaps Eventiva must close itself:** A2A push notifications and `tasks/resubscribe` (upstream is v0.3), signed outbound webhooks, and MCP request cancellation.

Map: [S2: Agent-Native capability map and protocol conformance matrix](https://linear.app/resnovas/document/s2-agent-native-capability-map-and-protocol-conformance-matrix-9a000bdd8953).


### Comment 1bff877b-388d-4595-97cd-9d6b132ff5d2

Author: jonathan@resnovas.com. Created: 2026-10-31T22:08:17.505Z; updated: 2026-10-31T22:08:17.490Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Decided 2026-10-31 (Jonathan, decision card): **Client runtime is one React Native runtime**, also rendered on the web through react-native-web. Rambo-UI components are built the same way. This gives one set of screens and one screen registry for the agent (screen awareness is built once). Upstream's DOM `client` (219 of its 550 source files use the browser) is rewritten from its behaviour, not ported. WebMCP stays a web-only projection of the same registry.

Also recorded: the 7.4 Not needed verdicts in the S2 capability map (EVE-15) are accepted unless Jonathan flips a row. `agent-sql` is Not needed rather than Later, because agents get no SQL tools; data goes through actions only.


### Comment f5690bf0-5b5c-49d6-a789-ee7851abdd18

Author: jonathan@resnovas.com. Created: 2026-10-31T22:32:36.606Z; updated: 2026-10-31T22:32:36.445Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Phase-1 issues filed (2026-10-31), one per step of the S2 phase-1 order, each with goal, upstream reference at 6b5cf68, scope, acceptance criteria, constraints, done signal and blockers:

EVE-40 action contract and inventory; EVE-41 config, settings, secrets, credentials; EVE-42 storage on Postgres and SQLite with tenant guards; EVE-43 identity, authorization, audit; EVE-44 telemetry; EVE-45 events and change feed; EVE-46 HTTP API, streaming, typed client; EVE-47 agent (sub-issues EVE-52 loop, EVE-53 engines and user subscriptions, EVE-54 durable runs, EVE-55 threads, EVE-56 harness with outbound ACP and memory); EVE-48 inbound MCP; EVE-49 inbound ACP; EVE-50 screen awareness on one React Native runtime; EVE-51 collaboration.

Proposed. Every new dependency still needs approval on its issue.


### Comment ee36e764-71d9-4bb9-9069-da9c592cab10

Author: jonathan@resnovas.com. Created: 2026-10-31T22:46:00.372Z; updated: 2026-10-31T22:46:00.318Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

**Decided 2026-10-31 (Jonathan, in the S6 thread): telemetry contract from EVE-19 accepted.**

* Traces, logs and metrics are vendor-neutral by protocol: Effect `withSpan`, `Effect.log*` and `Metric` only, exported through `@effect/opentelemetry` `Otlp.layer` straight to PostHog (`/i/v1/logs`, `/i/v1/traces`, `/i/v1/metrics`; AI spans to `/i/v0/ai/otel`). No collector. Switching vendor is a `telemetry.otlp` config change.
* Product telemetry is vendor-neutral by service: `ProductEvents`, `Flags`, `ErrorReports`, `LlmTelemetry` as `Context.Tag` services in core; PostHog Layers in `packages/integrations/*`; a Noop Layer for `telemetry: false`.
* Recorded gaps: heatmaps and toolbar are web-only upstream; Skills and Semantics are adopted when PostHog and our warehouse work are ready.

Follow-ups filed: EVE-57 (F1 Hermes OTLP spike), EVE-58 (F2 endpoint smoke test, blocked on a dedicated PostHog project), EVE-59 (F3 Early Access on native and server), EVE-60 (F4 session and person context propagation). Sentry removal remains EVE-21.

Recorded by Claude (agent) for Jonathan.


### Comment 1c50bea8-cbf2-4cff-b089-ddaee70739a1

Author: jonathan@resnovas.com. Created: 2026-10-31T22:47:42.062Z; updated: 2026-10-31T22:47:42.023Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Decision: Zod-free agent stack (from S1, EVE-14)

**Confirmed by Jonathan, 2026-10-31 (decision card in the S1 thread).**

* The framework uses the `Action.make` action API proven in EVE-14: schemas, scopes and handler; `invoke` as the only entry point; `Caller` as a required service; inventory from `JSONSchema.make`.
* Eventiva is Zod-free. MCP and model tool calling use Effect AI (`@effect/ai`): `McpServer.addTool` serves the inventory's JSON Schema with Effect handlers, and an Effect AI `Toolkit` handles model calls. `@modelcontextprotocol/sdk` and `ai` are **not** added to main.
* **House rule override for Eventiva:** `coding-preferences/references/ai.md` ("AI SDK alongside Effect AI") is set aside here. Effect AI only.

**Approved dependencies for main:** `@effect/ai` (0.33.x on effect 3.19), plus its peers `@effect/rpc` and `@effect/experimental`, which are already in the repo.

**Follow-ups this decision creates (proposed):**

1. Bump effect from 3.19 to 3.22 so the newest `@effect/ai` (0.37) and its providers can be used.
2. Build the chat UI on Effect and Rambo-UI, replacing what the AI SDK's `useChat` would have given.
3. Pick the model providers from Effect AI's v3 set: OpenAI, Anthropic, Google, Bedrock, OpenRouter.
4. Add a lint rule that bans imports of `zod`.
5. Record the AI-rule override in Eventiva `AGENTS.md`, after the `house:local` line.

*Recorded by Claude (AI agent) for Jonathan.*


### Comment 12100a9e-2741-4b38-9901-16a79ca46c51

Author: jonathan@resnovas.com. Created: 2026-10-31T22:49:39.693Z; updated: 2026-10-31T22:49:39.659Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

**Confirmed 2026-10-31 (Jonathan, S6 thread): PostHog is Eventiva's telemetry platform** for product analytics, flags, experiments, replay, errors, logs, traces, metrics and AI observability, through the accepted vendor-neutral contract (EVE-19). Native SDK gaps are covered by EVE-57, EVE-59 and EVE-60. No PostHog project has been created; EVE-58 stays blocked until Jonathan authorises the dedicated Eventiva project.

Recorded by Claude (agent) for Jonathan.


### Comment 6ee5fb20-83e4-4215-be8d-abb1bd00e6d6

Author: jonathan@resnovas.com. Created: 2026-10-31T22:55:45.695Z; updated: 2026-10-31T22:55:45.649Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

**Confirmed (Jonathan, 2026-10-31), sharding:** keep the existing Effect Cluster platform (`@effect/cluster` 0.56.4, SQL runner and message storage) as the base for server-side sharding and load distribution. It was proven across two independent runners in EVE-18. Order of follow-ups: platform gaps EVE-37, EVE-38 and EVE-39 first, then the agent-run tasks EVE-34, EVE-35 and EVE-36. The probe and the results are on main in `docs/parts/local-dev/cluster-sharding-probe.md` (commit 7f823c1).


### Comment feb6d39b-a6e9-46db-b761-8f8c67c517fd

Author: jonathan@resnovas.com. Created: 2026-11-11T00:31:41.924Z; updated: 2026-11-11T00:31:41.902Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Deployment and topology portability invariant confirmed by Jonathan:

Eventiva must use the same application/domain code from a single-laptop installation through a horizontally distributed cloud deployment across many physical or virtual servers. Scale is selected through configuration and adapters, not through forks or rewrites.

Required architecture:
- Effect services/layers isolate runtime, transport, persistence, queue, scheduler, cache, object storage, secrets, observability and deployment-provider integrations.
- Effect Cluster sharding, remote execution and distributed coordination are first-class capabilities, while an in-process/local topology provides equivalent contracts for single-node and developer/community installs.
- Deployment profiles may compose local, single-node, high-availability and distributed adapters without changing domain capabilities.
- No domain package may assume Kubernetes, a particular cloud, Neon, PostHog, PowerSync or another hosted vendor.
- Provider-specific optimisations belong in adapters and expose explicit capability metadata rather than leaking into domain code.
- Community deployment must have a simple documented local path with safe defaults; managed Eventiva cloud can use the same contracts at large scale.
- Configuration, manifests and infrastructure templates must be portable, inspectable and replaceable. Migration and export paths are required for data and configuration.
- Tests must exercise local implementations and contract suites shared by production adapters.

This is a cross-platform invariant for EVE-13 and a foundation acceptance criterion for EVE-244.


### Comment 04355bc1-9b30-4d93-9a0f-f8f7e56ce9c0

Author: jonathan@resnovas.com. Created: 2026-11-11T00:34:51.867Z; updated: 2026-11-11T00:34:51.854Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Tenant data-isolation decision confirmed by Jonathan, superseding any shared-database default:

- Eventiva must use a dedicated database per tenant by default. Shared tenant tables, shared schemas and tenant_id/RLS multiplexing are not an accepted default architecture.
- Self-hosted installations may use their own local or dedicated database and must be able to operate without a shared Eventiva data plane.
- Domain repositories and provisioning contracts must treat the tenant database as a routable resource so preferred Neon/PostgreSQL provisioning can be replaced by another PostgreSQL-compatible or supported adapter.
- SQLite remains valid for local/device storage and supported local deployments where its capabilities fit.
- A central control-plane database is permitted only for narrowly defined cross-tenant platform concerns such as tenant discovery, database routing, entitlement/catalogue metadata or explicitly enabled federation. It must not silently become shared storage for tenant operational data.
- Cross-tenant analytics, discovery or federation requires an explicit contract, least-data design and tenant consent; it must not require joining tenant operational tables in a shared database.
- Backup, export, restore, migration, deletion and residency operate per tenant.
- Tests must prove tenant database routing and prevent accidental cross-tenant access.

This replaces the previously suggested shared-database-first model and is an acceptance requirement for the fresh foundation.


### Comment 4f3876a5-c410-49bb-90dc-5935e7dfec2e

Author: jonathan@resnovas.com. Created: 2026-11-11T00:39:35.868Z; updated: 2026-11-11T00:39:35.836Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Identity decision confirmed by Jonathan:

- Eventiva-hosted federated identity is introduced early and enabled by default for supported hosted/community deployments.
- Independent local and generic OIDC identity providers remain fully supported; self-hosted Eventiva must not require Eventiva identity infrastructure.
- Tenant membership, roles, permissions, conduct actions and agent grants remain tenant-local. Central revocation may invalidate compromised Eventiva credentials, but must not silently become a universal community ban.
- Licensing/entitlements, authentication and tenant authorisation remain separate contracts. Offline/self-hosted entitlement verification uses signed locally verifiable data rather than an online check on every login.

Security baseline:
- Standards-based OAuth 2.1/OIDC, short-lived scoped tokens, rotation, replay protection, passkeys/WebAuthn and phishing-resistant MFA.
- No bespoke cryptographic algorithms. Use audited libraries and managed HSM/KMS-backed keys with envelope encryption, versioned keys and rotation.
- Effect Schema redaction and Secret handling must keep credentials, identity evidence and personal data out of logs, traces, analytics, agent context and error payloads.
- Agents receive narrow delegated capabilities, never reusable user credentials; sensitive actions require policy checks and step-up authentication where appropriate.
- Design for cryptographic agility: algorithms, formats and key versions are replaceable; inventory encrypted assets and provide migration paths. Track standards-based post-quantum/hybrid adoption as platforms mature rather than inventing quantum-safe cryptography.
- Provide breach response, session/device visibility, remote revocation, recovery protections, audit trails, rate limits and anomaly detection.
- Hosted identity requires threat modelling, privacy/retention controls, independent security review and operational incident procedures before production trust claims.

This is an architecture requirement for EVE-13 and must be represented in the EVE-244 foundation contracts without claiming the complete production identity service is delivered by the foundation task.


### Comment 64bb47d5-cffb-4a56-a11b-78039632cded

Author: jonathan@resnovas.com. Created: 2026-11-11T00:42:39.929Z; updated: 2026-11-11T00:42:39.887Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Authorisation decision confirmed by Jonathan, superseding role-first defaults:

Eventiva is permission-first and resource-oriented, similar to Google Drive sharing. Roles exist only as reusable permission bundles/templates; they are not the primary enforcement model.

Required model:
- Grant a subject (person, group, service, agent or device) a relation/capability on a specific resource: for example viewer, commenter, editor, operator, approver, owner or a domain-specific action.
- Support permissions down to individual resources, actions, fields and UI capabilities where justified. A user may be allowed one operation without receiving the rest of a role.
- Model resource hierarchy and inheritance explicitly: tenant, event, department, plan, document, incident, request, control surface and individual resource. Show inherited versus direct grants and allow intentional overrides.
- Support users, groups, teams, dynamic attributes, time/location/status conditions, delegation, expiry and revocation.
- Compute effective access from direct grants, group membership, inherited relationships and policy conditions. Provide an explain-access view answering why access is allowed or denied.
- Use stable canonical permission identifiers shared by UI, API, MCP, ACP, webhooks and every agent execution path. Hiding a control is not enforcement; every action checks the same server-side authorisation contract.
- Agents receive explicit scoped grants tied to identity, purpose, resource, action and expiry. They do not automatically inherit every permission of the invoking user; delegation policy determines the allowed subset and human approval requirements.
- Roles ship as editable convenience presets that expand to grants, enabling understandable onboarding without limiting granular customisation.
- Keep the Eventiva contract engine-independent. A Zanzibar/OpenFGA-style relationship model is an appropriate preferred adapter/reference, with tenant-local storage and self-hosted operation.
- Audit grant changes, permission evaluations for sensitive actions, delegation and denied attempts without leaking protected data.

This is a cross-platform requirement for EVE-13 and must shape EVE-244 contracts and testing.


### Comment 50569b7f-fb59-4dd2-8f6e-fa1a6434432c

Author: jonathan@resnovas.com. Created: 2026-11-11T00:43:54.515Z; updated: 2026-11-11T00:43:54.502Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Authorisation refinement from Jonathan:

Resource permissions are the enforcement primitive, but managed grouping is first-class rather than merely a one-time role expansion.

- A permission grant may target an individual, role, team/group, organisation, deployment, service, agent or device.
- Roles and permission groups contain managed sets of resource relations, actions and conditions. Assigning a person to a role keeps a live relationship to that role; changing the role updates effective access for its members.
- Teams, organisations and deployments can also be subjects in the relationship graph and can receive grants at any resource scope.
- Direct individual grants and exceptions remain available alongside grouped access.
- Effective access is the union/composition of direct and grouped grants, hierarchy inheritance and conditions, subject to explicit conflict rules and safety constraints.
- The administration UI must support role-centric, team-centric, subject-centric and resource-centric views over the same underlying permission graph.
- Explain-access must identify the exact path, such as: John Doe → Operations Team → Event Controller role → operate permission on Event A.

This clarifies, rather than replaces, the permission-first model recorded previously.


### Comment d06e0cab-d9b6-47c7-887c-1a86b37ee2b8

Author: jonathan@resnovas.com. Created: 2026-11-11T00:45:08.764Z; updated: 2026-11-11T00:45:08.717Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Permission verification tooling is required from the first authorisation implementation:

- Provide an admin-facing permission simulator: choose a subject, resource, action and optional context, then evaluate whether access would be allowed.
- Return an explainable decision tree showing direct grants, role/team/organisation/deployment memberships, inherited resource grants, conditions, exceptions, expiry and the final rule that allowed or denied access.
- Support both current-state checks and safe what-if simulation of proposed changes before saving them.
- Show the effective permissions for a subject and all subjects able to perform an action on a resource.
- Provide access-diff previews for role, membership, hierarchy or policy changes, including unexpectedly gained or lost access and high-risk capability expansion.
- Allow administrators to save permission assertions as regression tests and run them after policy changes, imports and upgrades.
- Expose the same deterministic evaluator and explanation through authorised UI, API and agent tooling; simulations never grant access or bypass enforcement.
- Protect the debugger itself with strict permissions and audit its use because explanations may expose sensitive relationship metadata.
- Support time, location, event state, device trust, step-up authentication and other relevant context in simulation.
- Include test fixtures, property/contract tests and cross-adapter conformance for the authorisation engine.

This is a core acceptance requirement for EVE-13 and must inform EVE-244's foundational authorisation contracts.


### Comment 8bf65268-b894-4928-a905-88a1b76ac736

Author: jonathan@resnovas.com. Created: 2026-11-11T00:46:08.213Z; updated: 2026-11-11T00:46:08.130Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Offline-first and consistency decision confirmed by Jonathan:

Offline operation and synchronisation are top-priority platform capabilities, not later enhancements. Every domain capability must declare and test its offline behaviour.

Adopt consistency by data class:
- Collaborative documents, layouts, UI compositions and planning artefacts use Yjs/CRDT semantics where appropriate.
- Ordinary records use optimistic concurrency, stable identifiers and domain/field-aware conflict handling.
- Inventory, finance, ticket capacity and other invariants use transactional commands with authoritative validation and compensating outcomes when queued offline commands are later rejected.
- Dispatch, incidents, requests, acknowledgements and show cues use append-only actions plus explicit state transitions; never silent last-write-wins.
- Physical-device and safety-relevant execution requires idempotency, acknowledgements and truthful delivery/execution state. Offline clients may plan or queue permitted intent but must never display an unconfirmed action as executed.
- Conflicts requiring judgement enter a visible conflict inbox with provenance, proposed resolutions and audit history.

Foundation requirements:
- Local-first read/write paths and durable outbox/inbox queues.
- Sync status, pending work, last-confirmed state and degraded/offline mode are visible to users and agents.
- Provider-independent sync contracts, with PowerSync as the preferred adapter and SQLite as the preferred device store.
- Deterministic merge/command semantics, idempotency keys, resumable sync, schema/version migration and per-tenant routing.
- Test offline creation/editing, concurrent changes, long disconnection, retries, reordering, duplicate delivery, partial sync, migration and recovery.
- A feature may require online authority only when its real-world invariant demands it; that exception must be explicit and degrade safely.

This is a core EVE-13 requirement and an acceptance criterion for EVE-244.


### Comment 7048ce25-b700-436a-8404-90ac0dec2330

Author: jonathan@resnovas.com. Created: 2026-11-11T00:47:55.439Z; updated: 2026-11-11T00:47:55.394Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Audit and record-integrity decision confirmed by Jonathan, strengthening the selective proposal:

Universal auditability:
- Every create, read where sensitive, update, delete, command, state transition, permission evaluation/change, authentication event, agent action, integration action, export and administrative operation emits an audit event according to an explicit policy.
- Denied attempts against sealed/protected records are immutable security events with high-severity detection and alerting. Repeated or suspicious attempts feed incident response; classification distinguishes attempted policy violation from a confirmed breach.
- Audit events identify human/service/agent/device actor, delegated authority, tenant, resource, canonical action, source channel, request/correlation/causation IDs, trusted and observed timestamps, result and redacted change metadata.

Sealed records:
- Domain policy can move a record through draft, submitted, approved, posted, sealed and archived states.
- Once the applicable state is reached, in-place mutation and deletion are impossible through every UI, API, agent and integration path.
- Accounting and other regulated records use append-only corrections, reversals and superseding entries with explicit links; history is never rewritten.
- Period close and legal hold can seal resource sets. Reopening requires narrowly scoped authority, step-up authentication, dual control where configured, a recorded reason and its own immutable audit event.
- Database permissions and storage controls enforce sealing beneath application UI checks.

Tamper evidence and durability:
- Per-tenant append-only audit journal with canonical serialization, hash chaining/Merkle commitments, versioned signatures and signed checkpoints.
- Support WORM/immutable storage and optional independent checkpoint anchoring so an operator controlling the primary database cannot silently rewrite history.
- Verification tooling continuously checks chain integrity, signatures, gaps, ordering and checkpoint consistency, with exportable evidence packages.
- Use audited, cryptographically agile implementations with classical plus standards-based post-quantum/hybrid signature migration support; do not invent cryptographic algorithms.
- Redact or tokenise secrets and sensitive payloads before logging. Retention, legal hold and privacy erasure must preserve evidentiary integrity without retaining unnecessary plaintext.
- Offline events are device-signed where appropriate, sequence-aware and reconciled without pretending an unconfirmed local timestamp is authoritative.

This is a platform-wide EVE-13 requirement and must shape EVE-244 contracts, local implementations and conformance tests.


### Comment 3a7b1029-15b1-402d-b4da-2846ebc1b2d9

Author: jonathan@resnovas.com. Created: 2026-11-11T00:50:31.912Z; updated: 2026-11-11T00:50:31.883Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Record-integrity refinement from Jonathan:

Universal auditability remains required, but full submit/approve/post/seal lifecycle is selected per record type rather than imposed on every record. Each module must classify every persisted resource and justify its integrity profile.

Standard profiles:
1. Collaborative: freely editable local-first/CRDT content with attribution, version history, restore and audit. Suitable for working plans, layouts and drafts.
2. Versioned: mutable current state with immutable revisions, comparison, restore and optional named/published versions. Suitable for production plans, rig designs and lighting/show sequences while being developed.
3. Controlled: draft/review/approve/publish workflow; published versions are immutable, while a new revision may be prepared. Suitable for operational plans, policies, runbooks and approved show files.
4. Sealed record: submit/approve/post/seal lifecycle, append-only correction/reversal and legal hold. Suitable for accounting, ecommerce transactions, contractual records and other regulated evidence.
5. Operational/safety journal: immutable actions and state transitions with acknowledgements, corrections by superseding event, strict provenance and degraded-mode semantics. Suitable for MDT incidents, dispatch, safety events and executed show-control actions.

Requirements:
- Profiles are Eventiva-owned policy contracts, not hard-coded to a storage vendor.
- A module manifest declares the default profile for each resource and the supported transitions; tenants may strengthen policy but cannot silently weaken legally or operationally mandatory controls.
- All profiles retain audit and version provenance, but storage volume, read auditing, approvals, signatures, retention and sealing differ by profile.
- The UI and agent tools clearly show whether a user is editing a working copy, creating a new revision, changing current mutable state or attempting to alter immutable evidence.
- Profile changes and policy weakening are privileged, audited and impact-previewed.
- Module design review explicitly asks what must remain editable, versioned, approved, sealed or operationally immutable.

This clarifies the universal audit and sealing decision on EVE-13 and EVE-244.


### Comment d81ec5dd-5213-4ab7-a0ed-3502102da9af

Author: jonathan@resnovas.com. Created: 2026-11-11T00:54:47.149Z; updated: 2026-11-11T00:54:47.125Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Plugin execution decision confirmed by Jonathan:

Eventiva supports three clear module tiers:

1. Declarative modules (default for ordinary users)
- Compose approved Eventiva UI components, schemas, workflows, reports, terminology, permissions and existing canonical actions.
- No arbitrary executable code, raw database access or unrestricted network access.
- Install/activate immediately where policy allows and remain offline-capable from signed/versioned manifests and assets.

2. Sandboxed executable modules (advanced/power-user tier)
- Allow custom logic and scripts inside a strongly isolated runtime, preferably a portable WASM/component-model sandbox where practical, with isolated worker/process boundaries for supported JavaScript use cases.
- Access Eventiva only through versioned capability APIs and canonical actions; never raw tenant databases, host files, secrets, process APIs or unrestricted network access.
- Manifest requests explicit data, action, UI, agent, network, storage, schedule and compute capabilities. Tenant administrators review and grant a least-privilege subset.
- Enforce CPU, memory, duration, concurrency, storage and network quotas; scoped module storage; egress allowlists; kill switches; revocation; audit; crash containment and rollback.
- Installation requires advanced-mode confirmation and clear risk/provenance/scanner results. Updates that request new capabilities require fresh approval.

3. Trusted/native modules
- Capabilities requiring native binaries, device drivers or deep host integration require reviewed/signed builds and application release processes. They cannot arrive as ordinary OTA executable updates.

Community catalogue:
- Provide an open community registry for discovery, manifests, versions, signatures, provenance, SBOMs, vulnerability/malware/static analysis and community/reviewer trust signals.
- Catalogue submission and scanning improve trust but are not a mandatory gate for open-source/self-hosted installations. Tenants may install private or external modules under their own policy.
- Scanning is evidence, not a guarantee; the runtime sandbox and capability enforcement remain mandatory.
- Support reproducible builds, publisher identity, signature verification, transparency records, revocation and rollback.

All module tiers use the same permission, audit, integrity-profile, i18n, feature-flag, offline and agent-action contracts. A module cannot create a privileged side door around UI/API/agent enforcement.

This is a core EVE-13 requirement and must shape EVE-244 module contracts and threat-model tests.


### Comment 6b715b51-eea2-46bb-922e-6a5e1d7d4568

Author: jonathan@resnovas.com. Created: 2026-11-11T01:05:06.142Z; updated: 2026-11-11T01:05:06.112Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Deletion, erasure and agent-accountability decisions confirmed by Jonathan:

Ordinary deletion lifecycle:
- Stage 1: tenant recycle bin, hidden from ordinary workflows and recoverable by authorised tenant administrators. Default retention: 30 days.
- Stage 2: protected quarantine, inaccessible to application workflows and ordinary tenant administration. Default retention: 60 additional days. Recovery requires deployment-operator authority, step-up authentication, a recorded reason and preferably dual approval. Self-hosted deployments assign this authority locally.
- Stage 3: irreversible purge of records, attachments, indexes, caches, replicas and applicable encryption keys. Backups expire under a documented retention schedule. Retain only non-sensitive tombstones and audit evidence.
- Retention is policy-configurable where law and integrity requirements permit. Legal hold, sealed records and regulated evidence override ordinary deletion and use their dedicated retention/redaction workflows.

Personal-data erasure:
- An erasure request is separate from ordinary soft deletion and must not be delayed merely to preserve convenient recovery.
- Disable credentials and processing, erase unnecessary identity/profile/contact/analytics data, and remove or crypto-shred re-identification mappings.
- Replace references with one stable random subject tombstone ID so retained records can be correlated as belonging to the same unknown subject without identifying who that subject was.
- A tombstone must contain no reversible mapping or identifying derivation. If a mapping is deliberately retained under a documented lawful basis, label it restricted pseudonymous retention rather than completed erasure.
- Retain accounting, security, incident or legal-claim records only where a documented legal basis requires them, with purpose limitation, narrow access, retention expiry and legal hold controls.
- Produce verifiable erasure evidence without retaining the erased identity. Propagate erasure to search, telemetry, analytics, sync replicas, exports under control and backup-expiry workflows.
- Do not claim automatic GDPR compliance: provide configurable policy, records of processing and evidence for tenant controllers to apply with legal review.

Agent accountability and approvals:
- Routine agent actions do not require confirmation by default. Canonical actions carry risk metadata; only configured high-risk actions require human approval, dual control or step-up authentication.
- Every agent/tool access supplies a structured purpose/justification tied to actor, delegated authority, task/session, resource and canonical action. Store this in the audit event.
- Purpose text does not grant access. The normal permission engine, data minimisation and policy checks still apply.
- Users and administrators can inspect what an agent accessed, why, what it changed, which credentials/capabilities it used and the resulting evidence.

These are EVE-13 platform requirements and must shape EVE-244 contracts and test fixtures.


### Comment 95b136c6-7b1e-4cf0-b7e9-b6fc1235b4d4

Author: jonathan@resnovas.com. Created: 2026-11-11T01:07:33.682Z; updated: 2026-11-11T01:07:33.632Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

User-owned connection decision confirmed by Jonathan:

Personal connections and subscriptions remain sovereign to the individual who owns/pays for them.

- A user creates, consents to, scopes, pauses, reauthorises and revokes their personal OAuth/subscription/external-agent connection.
- Tenant or deployment administrators may allow, deny or constrain use of a connector, provider, model or capability inside their environment. They cannot take ownership of, transfer, inspect raw credentials for, broaden, reassign or continue using a personal connection after its owner revokes it or leaves.
- Platform/cloud operators administer infrastructure and policy but do not gain control over the underlying user-owned account or subscription.
- Personal and organisation/service-account connections are distinct resource types with different ownership, lifecycle, billing and offboarding rules. The UI must never blur them.
- Every execution clearly shows whose connection will be used, which provider/account alias, expected charging source where knowable, requested capability and purpose. No silent fallback from a user subscription to Eventiva-funded usage, or vice versa.
- Agents receive short-lived, audience-bound capability handles through the connector broker, never reusable tokens, cookies or provider credentials.
- Administrators may stop an execution or disable connector use under tenant policy without revoking or altering the person’s external account.
- Audit records connection identity by opaque reference, owner, purpose, action and result while excluding credentials and unnecessary provider content.
- Offboarding removes tenant grants and local handles without deleting or taking over the external user account. Shared artefacts created through a personal connection require explicit ownership/continuity rules.
- Support export, connection inventory, device/session visibility, usage controls, revocation and provider-authorised subscription mechanisms only; never scrape credentials or circumvent provider terms.

This is a platform-wide EVE-13 requirement and must shape EVE-244 connection and agent-capability contracts.


### Comment f525b939-1a72-487a-ab5f-2ae391eb6bfd

Author: jonathan@resnovas.com. Created: 2026-11-11T01:09:34.641Z; updated: 2026-11-11T01:09:34.616Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Sponsored/shared service connection refinement from Jonathan:

Eventiva supports administrator/organisation-funded service connections alongside user-owned connections. Model three independent authorities:

1. Connection owner controls the external credential/account connection, revocation, provider consent and who may be granted use.
2. Funding owner controls budgets, quotas, eligible users/groups, models/features, schedules, rate/cost limits and whether use continues.
3. Tenant/deployment policy controls whether and how that provider/capability may operate on tenant resources.

For organisation-sponsored connections:
- An authorised administrator or organisation connects an official API/service account and may offer it to selected users, teams, roles, agents or modules.
- Users can access permitted capabilities without providing or paying for their own connection.
- The credential remains hidden; execution uses short-lived scoped capability handles through the connector broker.
- Policies support per-user/team/project budgets, hard and soft limits, concurrency/rate limits, approved models/tools, data classifications, regions, retention and purpose restrictions.
- Usage and cost attribution are visible to the funding owner and affected users without exposing unrelated user content or secrets.
- Exhaustion or disablement produces a clear result. Fallback to another personal, sponsored or Eventiva-funded connection occurs only through an explicit user/admin policy that shows who will be charged.
- Shared connection rotation, incident response and offboarding do not affect users’ separate personal connections.

The UI must clearly label Personal, Tenant-sponsored, Organisation-sponsored and Eventiva-sponsored execution sources. The party paying controls allocation; tenant policy controls permitted use; neither silently takes ownership of another party’s external service.

This refines the EVE-13 and EVE-244 connection-sovereignty requirement.


### Comment 7e40a37f-67e5-4d47-af9b-340196101d4b

Author: jonathan@resnovas.com. Created: 2026-11-11T01:16:37.356Z; updated: 2026-11-11T01:16:37.323Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Data portability decision confirmed by Jonathan:

Portability is a level-one Eventiva capability, covering both complete tenant migration and structured interoperability with other CMS, ERP, CRM, planning and work-management systems.

Tenant migration:
- Authorised tenant owners can initiate complete export, backup, restore and migration themselves, protected by step-up authentication, impact preview, audit and stronger approval for sealed/regulated/high-risk datasets.
- Support Eventiva Cloud to self-hosted, self-hosted to Eventiva Cloud and provider-to-provider movement without domain-code changes.
- Export tenant data, attachments/assets, schemas, permissions/relationships, identities by portable references, modules/configuration, terminology/i18n, workflows, audit evidence, integrity metadata and supported secrets/configuration references.
- Use versioned, documented, signed manifests and open file formats; include checksums, counts, dependencies and provenance. No provider-specific state may be essential unless it can be reconstructed or has an explicit portable representation.
- Support encrypted full/incremental backups, point-in-time recovery, resumable transfers, dry-run validation, reconciliation reports and minimal-downtime final sync/cutover.

Interoperability framework:
- Define stable canonical Eventiva import/export contracts and a mapping/transformation pipeline. Odoo, monday.com, HubSpot and other systems are adapters to those contracts, not special cases embedded in domain code.
- Support structured open formats where applicable: JSON/JSONL, CSV, Parquet, iCalendar, vCard, media archives and domain standards selected by each module.
- Imports provide schema discovery, field/entity mapping, terminology mapping, preview, validation, deduplication, identity resolution, conflict policy, provenance, rollback/quarantine and an exception report.
- Exports provide complete, selective and incremental modes with permission enforcement, redaction, integrity-profile rules and machine-readable schemas.
- Preserve source-system identifiers and provenance without making them primary Eventiva identities. Record adapter/version/mapping so imports are reproducible.
- Support repeatable/incremental connectors, not only one-time files, while respecting provider APIs, terms, rate limits and user-owned connection sovereignty.
- Connector capability and fidelity are explicit; never claim lossless round-trip compatibility where the source/target models differ.
- Modules must declare their portable representation and migration/version strategy before production readiness.

This is a platform-wide EVE-13 requirement and must shape EVE-244 foundational contracts and test fixtures.


### Comment 4ebadc72-22d4-437b-9163-2145cd046db2

Author: jonathan@resnovas.com. Created: 2026-11-11T01:19:56.789Z; updated: 2026-11-11T01:19:56.763Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Protected export controls confirmed by Jonathan:

- Ordinary tenant exports require authorised ownership, step-up authentication, scope preview, purpose and audit.
- Sensitive-data exports require phishing-resistant MFA, explicit scope/recipient/purpose review, notifications to other authorised owners and a default 24-hour cancellation window.
- Sealed or regulated exports require independent approval from two authorised people, each using phishing-resistant MFA, followed by a default 48-hour cancellation window.
- Prepare encrypted packages during the delay but do not release usable decryption material until approvals and the cooling-off period complete.
- Any authorised approver can cancel. A change to scope, recipient, destination, format or included data invalidates approvals and restarts the delay.
- Packages expire, limit retrieval attempts, use recipient/destination-bound delivery where possible, carry signed/watermarked manifests and log preparation, approval, cancellation, release, retrieval and verification.
- Notify relevant administrators through independent channels and surface unusual export volume, scope or destination as security signals.
- Emergency/break-glass export requires a documented lawful/operational reason, strongest available authentication, dual control where possible, immediate alerts and mandatory post-event review; it must not become a routine bypass.
- Policies may strengthen delays and approval counts for legal, tenant or module requirements but cannot silently weaken mandatory regulated controls.

This refines EVE-13 portability/security requirements and EVE-244 foundational policy contracts.


### Comment 9bbcdcef-4699-47c4-9547-40587bcd42a6

Author: jonathan@resnovas.com. Created: 2026-11-11T09:09:44.658Z; updated: 2026-11-11T09:09:44.604Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Backup and disaster-recovery tiers confirmed by Jonathan:

1. Community/small deployment
- Default for small-team and community-managed/self-hosted installations.
- Encrypted daily backups with a target maximum data-loss window (RPO) of 24 hours and target restoration time (RTO) of 24 hours.
- Simple local/provider-independent scheduling, retention, verification and restore tooling.

2. Production
- Default for Eventiva production/hosted tenant deployments.
- Continuous or at least hourly incremental recovery/point-in-time recovery where supported, with target RPO of 1 hour and target RTO of 4 hours.
- Recovery begins automatically or immediately when a qualifying failure is detected, subject to safeguards that prevent replication of corruption/destructive actions.

3. Critical live operations
- Explicitly selected for safety-sensitive or continuity-critical deployments.
- Near-continuous replication/recovery with target RPO approaching zero and target RTO of 1 hour or better, with architecture-specific evidence rather than blanket guarantees.
- Requires stronger redundancy, tested failover, degraded operation and operational runbooks.

Cross-tier requirements:
- Dedicated per-tenant backup/restore without affecting other tenants.
- Include databases, attachments, configuration, permissions, module state, portability manifests and required audit/integrity evidence.
- Encrypt in transit/at rest, support customer-controlled destinations/keys, separate failure domains and provider-independent adapters.
- Automated integrity verification and scheduled restoration drills; a backup is not reported healthy until restorable evidence exists.
- Retention, legal hold, erasure propagation, sealed-record integrity and export controls remain enforceable.
- Clearly distinguish RPO (possible data loss), RTO (time to restore), high availability/failover and backup restoration in UI and documentation.
- Tenants may strengthen tiers and configure supported retention, but the product must not silently promise an RPO/RTO the selected deployment cannot demonstrate.

This is an EVE-13 platform requirement and must shape EVE-244 recovery contracts and local test fixtures.


### Comment 8b0b61d5-1c6c-478c-bfe0-70b14f8435c2

Author: jonathan@resnovas.com. Created: 2026-11-11T09:11:53.751Z; updated: 2026-11-11T09:11:53.710Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Data residency decision confirmed by Jonathan:

- Eventiva-hosted deployments default to UK residency for the initial market and must be designed against applicable UK data-protection and sector requirements.
- EU residency is the initial alternative/fallback selectable region. Additional countries/regions are added only when infrastructure, legal, operational and support requirements are understood.
- Self-hosted operators choose and control their own deployment and storage locations; Eventiva tooling clearly reports the resulting residency rather than implying Eventiva controls it.
- Residency selection covers tenant databases, attachments/object storage, backups, replicas, search indexes, queues, audit journals and tenant-derived telemetry/log payloads. A UK database with unbounded foreign logs/backups is not presented as UK-resident.
- Dedicated tenant resources carry an explicit residency policy. Provider adapters must expose region/capability metadata and prevent accidental placement outside the approved boundary.
- Cross-region transfer, support access and disaster-recovery replication require explicit policy, lawful transfer controls, disclosure and audit. Failover must not silently move protected data to an unapproved region.
- Global control-plane and identity services minimise tenant/personal data, document what remains global and use regional processing/storage where required. Operational metadata must not become a hidden copy of tenant data.
- Imports, exports, connectors, agents and observability pipelines enforce the selected data-boundary policy.
- Provide residency inventory and evidence tooling; do not claim legal compliance solely from technical region selection. Legal review and tenant/controller configuration remain required.

This is an EVE-13 platform requirement and must shape EVE-244 provider, storage, telemetry and deployment contracts.


### Comment 94042052-e927-4f94-9fbb-aa27d3a5518f

Author: jonathan@resnovas.com. Created: 2026-11-11T09:13:31.550Z; updated: 2026-11-11T09:13:31.506Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Verified against current Neon documentation (2026-10-14):

- Neon offers AWS London `aws-eu-west-2`. Postgres and Managed Better Auth are available there.
- A Neon project exists in exactly one fixed region; all branches/databases in it share that region. This fits Eventiva’s dedicated-project/database-per-tenant model.
- Region cannot be changed in place. Residency migration requires a new project in the target region plus database migration and connection cutover; Eventiva must automate this through its portability layer.
- Neon Object Storage, Functions, AI Gateway and Realtime are not currently available in London. They must not be selected for UK-resident Eventiva workloads until official availability changes.
- Use replaceable adapters and UK-region alternatives such as AWS London or another verified provider for objects, compute/functions, queues/realtime, telemetry and backups. EU Frankfurt remains the initial alternative only when tenant policy permits EU residency.
- Neon's project-region statement establishes database placement, not automatically complete end-to-end residency. Before claiming UK residency, verify contractual/security documentation for backups, support access, control-plane metadata, access logs/Logz.io, subprocessors and every Eventiva-connected service.
- Provisioning must query the provider’s current region/capability API rather than hard-code availability, and persist evidence of the chosen region and product capabilities.

Sources:
- https://neon.com/docs/introduction/regions
- https://neon.com/docs/import/region-migration
- https://neon.com/docs/security

This refines the existing EVE-13 and EVE-244 residency requirements without changing Neon as the preferred Postgres provider.


### Comment 53aea8ef-7e45-4807-8ac3-55467bd3b2c0

Author: jonathan@resnovas.com. Created: 2026-11-11T09:16:29.468Z; updated: 2026-11-11T09:16:29.438Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Managed deployment decision confirmed by Jonathan:

Eventiva’s initial managed UK default is a mixed-provider profile rather than forcing unsupported Neon products:
- Dedicated Neon Postgres project per tenant in AWS London (eu-west-2).
- AWS London or another verified UK-region provider for object/media storage, compute/workers, queues/events, cache, keys/secrets, backups and other services Neon does not provide in London.
- OpenTelemetry/OpenFeature and Eventiva-owned Effect contracts keep telemetry, feature flags, sync, identity and infrastructure replaceable; preferred products are selected only when their deployment satisfies the tenant’s residency policy.

Transparency and privacy requirements:
- Maintain a machine-readable residency and data-flow manifest per deployment/tenant. For every data category, identify controller/processor roles, provider/subprocessor, purpose, storage region, processing region, backup/replica region, support-access location, retention, encryption/key owner and transfer mechanism.
- Show this information in understandable administrator/privacy UI and use it to generate/update privacy notices, records of processing and data-processing documentation. Do not hide the mixed-provider design behind a generic “UK hosted” label.
- Explicitly disclose any transfer between Neon and AWS or another provider, including transport encryption, service identity, data minimisation, egress destination and audit evidence.
- Block deployment or data flow when a component cannot satisfy the selected residency/privacy policy. Failover, telemetry, support and backups cannot silently cross approved boundaries.
- Provider/region/capability changes require impact analysis, updated disclosure, policy validation and audit before activation.
- Verify actual provider contracts, subprocessors and current regional availability before making residency/compliance claims; technical region selection alone is insufficient.

This refines EVE-13 and EVE-244 deployment, portability, privacy and residency requirements.


### Comment 9e6e287a-4a28-4695-801a-23a0889f6a56

Author: jonathan@resnovas.com. Created: 2026-11-11T09:21:58.718Z; updated: 2026-11-11T09:21:58.650Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Encryption and key-authority decision confirmed by Jonathan:

Authority ownership:
- Eventiva Cloud controls its deployment authority through a tightly governed M-of-N administrator/custodian quorum.
- Self-hosted operators control their equivalent deployment authority and key infrastructure.
- Authority follows deployment ownership; Eventiva must not retain a hidden universal self-hosted decryption path.

Key hierarchy:
- Offline/HSM-backed deployment root trust signs intermediate authorities and recovery policy; it is not used directly by applications or as a routine universal data-decryption key.
- Separate tenant key-encryption keys (KEKs), resource-class keys and unique/versioned data-encryption keys (DEKs) provide blast-radius isolation.
- Publisher, catalogue, tenant, service, module, user, agent and device signatures provide independent provenance rather than sharing one signing key.
- Optional recovery material uses threshold/quorum protection. Shares stay separated and operations occur in secure hardware; do not reconstruct an ordinary master key on one machine.

Universal encryption:
- Encrypt all tenant data in transit and at rest, including databases, fields requiring application encryption, files, backups, indexes, queues, audit evidence, sync stores, exports and temporary processing artefacts.
- Use envelope encryption. Applications receive only short-lived, audience/resource/action-bound key handles after identity, resource permission, purpose, device/session and policy checks. They never receive deployment/root keys.
- Authorisation and decryption are both required. Database or infrastructure access alone must not reveal plaintext.
- Offline access uses device-bound encrypted key grants with expiry/revocation and least-data scope.

Processing profiles:
- Standard encrypted data may be decrypted only inside authorised workloads so Eventiva search, sync, automation and agents can perform permitted functions.
- Highly sensitive/vault-class fields support end-to-end or client-side encryption where only authorised user/device keys can decrypt. Eventiva servers and developers remain cryptographically blind; modules must disclose resulting limitations on server search, automation, recovery and agents.
- Do not falsely call server-decryptable data “zero knowledge”.

Personnel/support controls:
- Developers have no standing plaintext or production-key access.
- Exceptional support/recovery access requires a case, scoped tenant approval where applicable, phishing-resistant step-up authentication, M-of-N/dual approval, time-limited just-in-time workload identity, purpose limitation, visible notifications and immutable audit.
- Access expires automatically and cannot be reused for other tenants/resources. Prefer tenant-provided redacted diagnostics and synthetic replicas.
- Key rotation, revocation, crypto-shredding, rewrapping and algorithm/post-quantum migration are required and tested.

This is an EVE-13 platform requirement and must shape EVE-244 encryption, identity, authorisation, offline and provider contracts.


### Comment c3a06adc-8c33-4a6c-b43c-815bb8479410

Author: jonathan@resnovas.com. Created: 2026-11-11T09:23:11.047Z; updated: 2026-11-11T09:23:10.969Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Module/data security-profile refinement from Jonathan:

Do not implement “lower encryption” as weaker algorithms. All profiles use the approved modern encryption baseline. Profiles differ in key granularity, decrypting authority, approvals, audit, retention, recovery and server processing.

Standard profiles:
1. Baseline encrypted
- Tenant-isolated keys, encryption in transit/at rest, ordinary resource permission checks and audited changes.
- Authorised Eventiva workloads may decrypt/process for normal product functions.

2. Sensitive
- Separate resource-class or domain keys, field-level encryption where needed, stronger purpose checks, read/access audit, shorter-lived handles, stricter export/retention and phishing-resistant step-up for administrative access.
- Default for personal/contact data, confidential plans, credentials metadata and similar material.

3. Restricted/regulated
- Dedicated keys per ledger/resource set or security boundary, dual control for exceptional access/export, immutable/sealed history, legal hold, stronger monitoring and no developer standing access.
- Default for accounting, ecommerce/payment evidence, permissions/policy administration, identity-security records, MDT/safety evidence and other regulated/high-impact data.

4. Vault/zero-knowledge
- Client/user/device-side encryption; Eventiva servers and operators cannot decrypt without an explicitly designed quorum/recovery mechanism.
- Use for secrets or user-selected highly sensitive fields. The product must disclose limitations on server search, automation, agents, recovery and sync.

Module requirements:
- Every module manifest classifies each resource and sensitive field, names its default profile, key scope, allowed processing locations, offline policy, export controls, retention, recovery and supported profile strengthening.
- Modules may select stronger defaults for a resource. Tenants may strengthen policy; weakening mandatory regulated/security classifications requires an explicit governed exception or is forbidden.
- Accounting, permissions/authorisation and identity-security modules default to Restricted/regulated for their protected records, not Baseline.
- A security-profile registry and policy engine generate storage/encryption configuration, key requests, UI disclosures, audit requirements and conformance tests from the same declaration.
- Threat modelling and data-flow classification review the profile before a module reaches production readiness.

This refines EVE-13 and EVE-244 module, security and encryption contracts.


### Comment 08f09405-dbfb-4d5f-ac19-920cf95a98df

Author: jonathan@resnovas.com. Created: 2026-11-11T09:24:38.979Z; updated: 2026-11-11T09:24:38.932Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Core ownership of security profiles confirmed by Jonathan:

- Baseline encrypted, Sensitive, Restricted/regulated and Vault/zero-knowledge are sealed Eventiva core contracts.
- Only the versioned core security package defines their cryptographic requirements, key hierarchy, decrypting authority, audit, export, retention, recovery and minimum control semantics.
- Modules, plugins, tenants and provider adapters cannot redefine a profile, substitute weaker algorithms, remove required controls or claim a core profile while implementing different guarantees.
- Core exposes typed schema annotations, resource declarations, action/policy APIs and runtime services for assigning a profile to resources/fields. Storage, sync, UI, agent, export and audit tooling consume that one declaration automatically.
- Modules must classify every persisted resource and protected field against a core profile. Modules may define domain-specific labels/policies only by composing core controls and may require a stronger profile.
- Tenant policy may strengthen controls, add approvals or promote data to a stronger profile. It cannot weaken the core floor or a module’s mandatory classification.
- Third-party declarative and sandboxed modules can request profiles but cannot implement their own cryptography or gain direct key access. Unsupported custom requirements must compose audited core primitives or require a reviewed core extension.
- Profile assignments, upgrades and migrations are versioned and auditable. Downgrades are forbidden by default and require an explicit core-governed migration proving reclassification, retention/export consequences and safe key/data transformation.
- Core conformance suites verify every storage/sync/provider adapter and fail closed when a required profile capability is unavailable.
- Security-profile metadata itself is protected as Restricted/regulated policy data.

This is a foundational acceptance requirement for EVE-13 and EVE-244.


### Comment 63580da7-6f2c-4a8e-8509-79184b7126d1

Author: jonathan@resnovas.com. Created: 2026-11-11T09:28:36.652Z; updated: 2026-11-11T09:28:36.606Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Recovery and support-access decision confirmed by Jonathan:

Self-hosted/community deployments:
- Eventiva supplies recovery and support tooling as-is, but Eventiva has no standing keys, hidden escrow or guaranteed ability to recover/decrypt the deployment.
- Operators own their root/key custody, recovery quorum, backups and support policy. Documentation and diagnostics must make loss/consequences explicit.

Managed/cloud deployments:
- Tenant support access is disabled by default and explicitly opt-in per support case or tightly bounded support window.
- Enabling support creates a case-scoped cryptographic access grant and fresh ephemeral support identity/key material. It does not expose or reuse the tenant’s ordinary user/admin keys.
- The tenant selects the permitted resources/data classes/actions and duration, sees the named support case/purpose, and can revoke early. Restricted/regulated access requires stronger approval; Vault/zero-knowledge data remains inaccessible unless its owner explicitly configured and authorises a compatible recovery path.
- Tenant opt-in alone is not sufficient: named support personnel require phishing-resistant authentication, just-in-time assignment, least privilege and dual approval/quorum for high-risk access.
- The key broker rewraps only the scoped resource keys for the ephemeral support principal. Never mint a universal deployment decryption key or bulk-decrypt outside the authorised workload.
- Access is time-limited, session/device bound, non-transferable and automatically expires. Completion/revocation destroys ephemeral private material and grants, invalidates sessions and verifies that no access path remains.
- Notify tenant owners when requested, approved, first used, expanded, revoked and expired. Log every decrypt/read/change/export with case, purpose and actor; provide a tenant-visible support-access report.
- Scope expansion or duration extension requires fresh tenant approval. Support personnel cannot enable their own access.
- Prefer tenant-provided redacted diagnostics, synthetic reproductions and metadata before plaintext access.

Recovery:
- Managed ordinary tenant access may use opt-in threshold-assisted recovery, passkeys, recovery codes, delays and notifications.
- Eventiva support cannot recover alone. Self-hosted recovery remains wholly operator controlled.
- Vault-class data defaults to no recovery unless the owner preconfigures recovery material/quorum and accepts the changed trust model.

This is a core EVE-13 requirement and must shape EVE-244 key broker, identity, support and audit contracts.


### Comment 9291cfc1-112d-4620-93cc-47b1a53048c0

Author: jonathan@resnovas.com. Created: 2026-11-11T09:35:26.495Z; updated: 2026-11-11T09:35:26.432Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Legal hold and lawful recovery decision confirmed by Jonathan:

Authority and scope:
- Every managed or self-hosted deployment provides a deployment-level legal-hold capability that can preserve any tenant’s in-scope data, including when tenant administrators cannot or must not act.
- This is not granted to every ordinary cloud administrator. It is a distinct least-privilege Legal Hold authority assigned by the deployment owner, protected by phishing-resistant authentication, case/purpose entry and independent/dual approval for activation, expansion and release.
- Eventiva Cloud governs its authority; community/self-hosted deployment owners govern theirs. Eventiva has no hidden control over self-hosted holds.
- Holds can target a tenant, subject tombstone, resource set, record class, date range, module or case. Broad database/tenant holds remain possible but require explicit scope justification.

Deletion and retention interaction:
- A valid hold atomically suspends purge, crypto-shredding, backup expiry and destructive retention for matching data across primary stores, replicas, attachments, search/indexes, audit evidence, sync stores and controlled backups.
- Soft-deleted/quarantined matching data remains preserved. The user-facing deleted state may remain, but the system records that destruction is suspended by hold.
- Erasure workflows evaluate lawful-basis/hold conflicts explicitly. Remove or restrict unnecessary PII where permitted, but do not destroy evidence covered by a valid legal obligation. Record the basis and review date.
- A hold cannot reconstruct data already genuinely erased or crypto-shredded before preservation took effect.
- Releasing a hold does not immediately destroy data: normal retention resumes from a policy-defined point after conflict checks and an impact preview.

Security and evidence:
- Legal hold preserves ciphertext and integrity evidence; it does not itself grant plaintext access. Recovery/disclosure requires a separate lawful-access case, scoped ephemeral keys and quorum approval.
- Record immutable case authority, scope, custodians, timestamps, approvals, notices, searches, exports, changes and release. Maintain chain of custody and signed evidence manifests.
- Notify affected tenant owners unless prohibited by law; record delayed-notice authority and review deadlines.
- Holds have periodic review/expiry prompts, but never auto-release merely because an operator missed a reminder.
- Provide hold inventory, overlap/conflict detection, storage impact and proof that every required adapter enforces the hold. Fail closed when a store cannot confirm preservation.

This refines EVE-13 and EVE-244 deletion, backup, audit, encryption and deployment-authority contracts.


### Comment ebbcbe62-4eab-4919-9b33-03288c232e73

Author: jonathan@resnovas.com. Created: 2026-11-11T09:39:04.901Z; updated: 2026-11-11T09:39:04.860Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Decryption guard and runtime-attestation refinement confirmed by Jonathan:

Private-key boundary:
- Tenant, user and deployment private keys remain non-exportable in the user/device secure store, HSM/KMS or approved confidential-computing key broker. Applications, developers, administrators and support personnel do not receive raw private keys.
- Authorised decryption occurs inside the approved cryptographic boundary or through a narrowly scoped unwrap/decrypt operation. Returning plaintext never returns the private key.

Independent decryption gates:
1. Identity/delegation gate verifies human/service/agent identity, phishing-resistant authentication, session/device trust, delegated authority and required quorum approvals.
2. Resource/purpose policy gate verifies tenant, resource, canonical action, declared purpose, security profile, legal/support case, time/location/risk conditions and audit obligations.
3. Workload-attestation gate verifies the requesting runtime is an approved signed build with expected measurements/configuration, workload identity, region, patch/policy status and an untampered confidential execution environment where required.
4. Key broker/HSM gate independently binds the operation to the exact key version, resource, workload audience, short expiry and permitted cryptographic operation.

All required gates must produce short-lived, signed evidence and agree before decrypt/unwrap. Failure, stale evidence, changed measurements, revoked builds, policy uncertainty or unavailable audit fails closed for protected profiles.

Runtime security:
- Prefer hardware-backed remote attestation/confidential computing for Restricted/regulated and supported managed workloads. Baseline/Sensitive profiles still require signed artefacts, workload identity, admission policy, integrity verification and hardened isolation.
- Verify software supply-chain provenance, signatures, SBOM/policy, immutable deployment configuration and runtime measurements. Continuously revoke compromised artefacts/attestation roots and rotate affected grants.
- Decryption grants are audience-bound, resource-bound, operation-bound, non-transferable and very short-lived; plaintext is minimised, memory lifetime bounded and logs/traces/crash dumps prevented from capturing it.
- Every attempt records gate decisions and evidence references without secrets. High-risk decryptions support independent monitoring and tenant-visible reports.
- Legal hold, support mode or cloud-administrator status cannot bypass these gates.

Portability:
- Core defines the attestation and decryption-evidence contracts. Managed profiles may use cloud HSM/confidential-computing services; self-hosted deployments plug in supported equivalents and own trust roots. The UI must state the achieved assurance level when hardware attestation is unavailable rather than claiming equivalent protection.

This is a core EVE-13 requirement and must shape EVE-244 cryptography, identity, authorisation, supply-chain and deployment contracts.


### Comment 6770565a-053c-47e6-8980-adab5ed9a109

Author: jonathan@resnovas.com. Created: 2026-11-11T09:47:42.781Z; updated: 2026-11-11T09:47:42.763Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Deployment assurance model confirmed for ongoing design decisions:

- A1 Verified software: signed images/provenance, hardened runtime, short-lived workload identity and policy checks. Universal minimum; typical Docker Compose or ordinary VM when no stronger hardware proof exists.
- A2 Hardware-bound: A1 plus TPM/measured boot and hardware-bound keys. Default minimum for Sensitive data.
- A3 Protected keys: A2 plus HSM/KMS non-exportable keys and independent key-broker policy.
- A4 Confidential workload: A3 plus attested encrypted memory and host-administrator isolation. Default minimum for Restricted/regulated server-side decryption.
- A5 High assurance: A4 plus quorum controls, continuous attestation, independent monitoring and tested failover. Managed-cloud target for highest-risk live/regulated operations.

Rules:
- Lower assurance never means weaker cryptographic algorithms.
- Each module/resource/action declares its minimum achieved assurance level and behaviour when unmet.
- UI, API, MCP, ACP, agents and integrations enforce the same gate. Restricted data may be blocked, read-only or case-scoped according to the core policy; no channel is a bypass.
- Installer detects capabilities, runs conformance tests and displays achieved level, missing controls and restrictions. Hardware/confidential-compute claims require evidence, not deployment labels such as Docker or VM.
- Managed Eventiva Cloud targets the strongest applicable profile. Community/self-hosted deployments choose supported profiles and receive clear upgrade/remediation guidance.
- Safety certification remains separate from technical assurance level.

Interactive working map: https://ampcode.com/artifacts/visuals/eventiva-deployment-assurance-and-capability-map-57b9e105-c462-4b88-8e64-e5f78c324b80

Use this map as the decision framework while scoping module-specific minimums, exceptions, evidence renewal and degraded behaviour.


### Comment 9b5c6de1-9887-4af9-b760-4e8c9e1ebee2

Author: jonathan@resnovas.com. Created: 2026-11-11T09:53:28.117Z; updated: 2026-11-11T09:53:28.089Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Community degraded-assurance override confirmed by Jonathan:

- Self-hosted/community deployment owners may deliberately enable selected sensitive/restricted UI, API, MCP or agent capabilities below the recommended hardware assurance level, including on A1, because they control and accept risk for their deployment.
- Default remains fail-closed. Override requires advanced mode, repeated plain-language warnings, phishing-resistant step-up authentication, a signed risk acceptance, exact tenant/resource/action/channel scope, expiry/renewal and immutable audit.
- The override never upgrades the achieved assurance, satisfies regulatory/certification requirements or permits Eventiva to describe that use as recommended. UI/API/audit continuously report “A1 with degraded-assurance override” and the missing protections.
- Managed Eventiva Cloud cannot use this mechanism to weaken its mandatory profile. Modules may mark capabilities non-overridable where law, safety certification or an external obligation requires it.
- Restricted API/MCP/agent access under a community override requires a private access-plane profile by default: loopback/private listeners, VPN or zero-trust access proxy, mTLS/workload identity, device/IP policy, no public ingress, egress allowlists, short-lived credentials, purpose logging, rate limits and anomaly alerts.
- Provide guided configurations for WireGuard/Tailscale-style VPNs, zero-trust access products and equivalent open/self-hosted alternatives. A VPN reduces network exposure but does not replace confidential-compute or hardware attestation.
- Conformance checks detect public exposure, insecure TLS, stale identity, permissive egress and missing monitoring, then warn or block according to core policy.

Updated working map: https://ampcode.com/artifacts/visuals/eventiva-deployment-assurance-and-capability-map-57b9e105-c462-4b88-8e64-e5f78c324b80

This refines EVE-13 and EVE-244 assurance and deployment contracts.


### Comment 1da54684-89c0-4ce7-895c-aeec61af9c8a

Author: jonathan@resnovas.com. Created: 2026-11-11T09:55:18.831Z; updated: 2026-11-11T09:55:18.807Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Zero-trust policy decision confirmed by Jonathan:

Zero trust is the default Eventiva security model across every deployment and assurance level:
- No identity, device, workload, network location, administrator role or “internal” subnet is trusted merely because of where it is.
- Every request verifies subject identity, device/workload identity, resource permission, purpose, session risk, deployment/tenant boundary and achieved assurance. Re-evaluate continuously for sensitive/long-lived operations.
- Default-deny network and action policy, least privilege, short-lived credentials, mTLS/service identity, micro-segmentation, explicit egress and resource-level authorisation apply from A1 upward.
- Human access uses phishing-resistant authentication and device/session posture where supported. Workloads use signed identities and attestation evidence appropriate to the deployment level.
- UI, API, MCP, ACP, webhooks, agents, internal services and administrative/support paths use the same canonical policy engine; private networking is not an authorisation bypass.
- Tailscale is an appropriate preferred/community-friendly private access adapter, alongside WireGuard, Cloudflare Zero Trust/Access and open/self-hosted equivalents. Eventiva core owns the zero-trust contracts and does not require one vendor.
- Installers generate secure private-access defaults, avoid public listeners, verify DNS/TLS/routes/ACLs, and provide guided policy templates for individuals, teams, devices, services and deployment operators.
- Community degraded-assurance overrides still require zero-trust controls; accepting lower hardware assurance does not permit anonymous/public unrestricted access.
- Policies map achieved assurance and security profile to allowed actions, channels, step-up requirements, approvals, network paths and degraded behaviour. Explain-access/simulation tooling includes these zero-trust factors.
- Emergency/break-glass access is explicit, time-limited, independently approved where required and fully audited; it is not an always-trusted administrator path.

This is a sealed core policy requirement for EVE-13 and EVE-244.


### Comment 4571a167-a4fa-432c-b7c3-ed08747b363d

Author: jonathan@resnovas.com. Created: 2026-11-11T10:24:27.229Z; updated: 2026-11-11T10:24:27.190Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Zero-trust product requirements confirmed by Jonathan:

Extensions and guided setup:
- Ship zero-trust integrations as core-governed extensions/adapters with one-click or short guided setup where provider APIs permit. Initial targets may include Tailscale, WireGuard-based access, Cloudflare Zero Trust/Access and open/self-hosted equivalents.
- Setup automation generates least-privilege policy, service/workload identities, routes, DNS, mTLS/certificates, private listeners, device rules and verification probes. Show the exact proposed external changes and obtain authorised approval before applying them.
- Core remains vendor-neutral. Extensions implement sealed identity, policy, attestation, audit and health contracts and cannot bypass resource permission enforcement.

Admin security control centre:
- Provide one deployment/tenant overview of achieved assurance level, public/private endpoints, identity providers, MFA/passkey coverage, device/workload posture, certificate/key expiry, mTLS, routes/ACLs, egress, exposed services, failed checks, drift, overrides, exceptions and remediation.
- Continuously verify effective state rather than trusting saved configuration. Display evidence freshness and distinguish verified, degraded, unknown and failed states.
- Offer safe automated remediation with preview/rollback, and alert on public exposure or policy drift.

Public endpoints:
- Plain HTTP never carries authenticated or sensitive traffic. Permit only tightly scoped health/ACME handling or redirect to HTTPS; otherwise disable it.
- Public HTTPS endpoints use adaptive/step-up authentication based on security profile, action, device/session trust, assurance level, risk and anomaly signals. Password-only authentication is insufficient for sensitive access.
- Support passkeys/WebAuthn, hardware security keys, TOTP/authenticator MFA, recovery codes and approved federated identity. SMS may be supported only as a lower-assurance/recovery factor with clear warnings, not for restricted actions.
- Do not treat multiple static passwords as independent MFA: they are the same knowledge factor and increase phishing/storage risk. Where users want extra knowledge or separation, provide transaction-specific confirmation, independent approver/quorum, separate account credentials or a narrowly scoped secondary PIN protected and rate-limited under core policy.
- Avoid prompting for MFA on every API request; bind strong authentication to short-lived, audience-bound sessions/tokens and require fresh step-up for high-risk actions.

Authenticated outbound communications:
- Allow users/tenants to configure a non-secret security phrase or recognisable marker included in supported email/SMS/notification templates to help identify expected communications.
- Never accept the phrase as inbound authentication, a recovery secret or proof that a message is genuine; messages can be copied and SMS sender identities can be spoofed.
- Prefer cryptographic verification where supported: signed email/domain controls, verified deep links into the authenticated app, message IDs visible in the notification centre and no sensitive-action completion from untrusted message links alone.
- Never include secrets, private data or reusable authentication codes in the phrase. Support rotation, per-tenant/user phrases and channel-specific privacy previews.

These are EVE-13 platform requirements and must shape EVE-244 extension, identity, networking, observability and admin-control contracts.


### Comment f9145bac-2b74-432e-8140-241f76206c0c

Author: jonathan@resnovas.com. Created: 2026-11-11T10:28:15.357Z; updated: 2026-11-11T10:28:15.331Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

SMS authentication refinement from Jonathan:

- SMS may be offered as an MFA/recovery factor, but never as a standalone factor for authenticated access.
- When SMS is used, require an additional independent verified-email confirmation step under the default policy, alongside the primary credential/session requirements.
- Treat SMS plus email as lower assurance than passkeys/WebAuthn or hardware security keys. Many users receive both on one compromised device, email accounts can be weak, and SMS remains vulnerable to SIM swap, interception and number recycling.
- Permit the composite SMS+email method only for Baseline and explicitly permitted Sensitive actions. Restricted/regulated, key-management, legal-hold, support plaintext access, export approval, permission-policy changes and other high-risk actions require phishing-resistant authentication and cannot be satisfied by SMS+email.
- Apply rate limits, anti-automation, number/account change cooldowns, SIM/number-change risk signals where available, replay-resistant short-lived challenges, independent channel notifications and recovery review.
- Never reveal whether a phone/email account exists. Redact destinations in UI/logs and avoid placing sensitive content in either message.
- Tenants may disable SMS or strengthen this policy; they cannot use it to weaken mandatory high-risk authentication floors.

This refines the EVE-13 and EVE-244 zero-trust identity requirements.


### Comment 8d3b1098-8a28-4ccf-b99d-85d40923d0a7

Author: jonathan@resnovas.com. Created: 2026-11-11T10:33:57.109Z; updated: 2026-11-11T10:33:57.084Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Password security and compromise-detection requirement confirmed by Jonathan and verified against NIST SP 800-63B-4:

Password policy:
- Follow current NIST guidance: minimum 15 characters when a password is the sole factor; permit a minimum of 8 only when it is part of MFA. Support at least 64 characters, Unicode and whitespace; never silently truncate.
- Do not impose arbitrary composition rules or scheduled/periodic password rotation.
- Require a change when there is evidence the password/authenticator is compromised, including a blocklist match, confirmed breach signal or credible account-attack evidence.
- Permit paste, password managers and autofill. Apply strong rate limiting, bot/credential-stuffing detection, session/device risk and phishing-resistant MFA/step-up policy.
- Store passwords only with a current memory-hard password hash and unique salt (preferred Argon2id adapter), independently versioned for migration. Never store reversible passwords or an additional reusable unsalted fingerprint merely to support later breach checks.

Breached-password screening:
- Preferred open adapter: Have I Been Pwned Pwned Passwords. Its range API is free, open source and unauthenticated; hash locally and send only the first five SHA-1/NTLM hash characters, request padded responses, then compare the suffix locally. SHA-1 here is only the corpus lookup format, never Eventiva’s password-storage algorithm.
- For maximum privacy, managed and self-hosted deployments may download/regularly update the corpus and query it entirely locally. This also supports offline/community operation at the cost of storage/update management.
- The provider remains replaceable behind an Eventiva blocklist contract; support local organisational/common-password lists and another trusted corpus without changing identity code.
- Check prospective passwords at creation/change/recovery. Check the supplied plaintext again during authenticated login when policy requires; do not weaken storage by retaining a globally comparable verifier for background rescans.

Compromise response:
- Combine blocklist matches with credential-stuffing/anomaly signals, provider breach intelligence, session/device changes and user/admin reports.
- On credible evidence, revoke affected sessions/tokens, prevent further password-only access, notify through independent channels and require recovery/password replacement plus MFA review according to risk.
- Distinguish password-corpus checks from account/email breach monitoring. Email-address monitoring may expose personal data or require paid/provider-specific services; make it transparent and opt-in or use a verified privacy-preserving adapter, document the processor/region and apply residency policy.
- Do not force a password reset solely because of ordinary failed attempts; rate-limit and investigate. Record the evidence and decision without logging the password or lookup suffix.

Sources verified 2026-11-11:
- NIST SP 800-63B-4: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63B-4.pdf
- HIBP API: https://haveibeenpwned.com/API/V3
- HIBP Pwned Passwords: https://haveibeenpwned.com/Passwords

This is a core EVE-13 identity requirement and must shape EVE-244 identity/security contracts and adapters.


### Comment 754712b6-407c-448a-aa8d-38fdc1e695bd

Author: jonathan@resnovas.com. Created: 2026-11-11T14:43:08.685Z; updated: 2026-11-11T14:43:08.620Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Feature configuration decision confirmed by Jonathan:

Flag coverage boundary:
- Every meaningful optional product or operational capability must have a typed OpenFeature flag before it can ship: modules, integrations, screens/views, independently optional UI components, new/legacy implementation selection, background jobs, public/API/MCP/agent surfaces, experimental behaviour, tenant/cohort rollout and emergency subsystem activation.
- Do not flag ordinary algorithm branches, validation outcomes, domain invariants, permission decisions or mandatory security checks. Those remain deterministic code/policy and cannot be remotely disabled.
- Mandatory security controls default on/fail closed. Optional and experimental capabilities default off until enabled by an authorised source.

Enforcement:
- Core owns a typed flag registry and manifest schema. Each flag declares canonical key, owner, description, scope, value type, safe default, dependencies/conflicts, security profile, licence entitlement, permitted override sources, creation/expiry date, tests and removal plan.
- Module/surface/action manifests reference their controlling flag. CI/lint/Graphify policy checks reject newly introduced optional product surfaces, integrations or execution paths without a registered flag and both-state tests.
- Agent guidance and scaffolding require flag declaration as part of creating a capability, not as later cleanup.
- Detect orphaned, permanently enabled, expired, unknown and untested flags. Removal deletes both the registry entry and dead branch after rollout completion.
- Evaluate through OpenFeature only; no direct PostHog SDK checks in domain/UI capability code.

Decision precedence:
1. Sealed core security invariant
2. Signed emergency kill/safety policy
3. Signed licence entitlement
4. Deployment security/policy gate
5. Git-managed JSON/YAML baseline
6. PostHog preferred remote rollout provider
7. Tenant/user targeting where the flag permits it

- PostHog provides preferred operational master controls, targeting and analytics, but cannot override a higher security/licence/policy denial. A signed locally cached emergency provider must continue to disable systems if PostHog is unavailable or compromised.
- Flag evaluation, source, reason, configuration version and changes are audited without leaking targeting PII.

Configuration/secrets/licensing:
- Only bootstrap trust configuration remains environment/mounted-secret based. Deployment UI manages typed settings and secret references; secret values live in the configured encrypted vault/KMS rather than ordinary database fields.
- Licences are signed entitlements, not flags. Free/paid/exception entitlements authorise capability; flags decide whether an authorised capability is active. Flag activation cannot create entitlement.
- Every module/screen/component publishes typed administration metadata for visibility, placement, terminology, permission, setting, entitlement and flag dependencies, while impossible or insecure states remain prohibited.

This is a sealed core requirement for EVE-13 and an acceptance criterion for EVE-244.


### Comment 84c3ffcc-2f26-455e-840c-69d3cb919ba5

Author: jonathan@resnovas.com. Created: 2026-11-11T14:59:45.632Z; updated: 2026-11-11T14:59:45.561Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Licensing decision confirmed by Jonathan after reading the canonical repository LICENSE:

- Retain Fair Core License 1.0, MIT Future License (FCL-1.0-MIT), not AGPL/open-core.
- Current terms permit use except Competing Use, prohibit bypass/removal of licence-key-protected functionality, and grant each released version an irrevocable MIT licence on the second anniversary of the date that version was made available.
- Treat the repository LICENSE as canonical. Product copy should call this “Fair Core” or source-available with a future MIT licence rather than inaccurately claiming every current version is OSI open source.

Implementation requirements:
- Maintain tamper-evident release/version publication dates so the two-year future-licence date can be determined for each version. Include licence identifier, licensor notice, release date and future-MIT date in release metadata and source distributions.
- Use signed, portable entitlements for protected/commercial capabilities. Free, trial, community, partner and paid entitlements may authorise the same capability under different terms/limits; OpenFeature controls activation only after entitlement succeeds.
- Self-hosted/offline verification must work with signed entitlements and documented grace/recovery behaviour. Licence checks must not become a hidden dependency on Eventiva Cloud.
- Make licence state, permitted use, entitlement source, expiry/grace and affected capabilities clear in deployment administration. Do not silently collect licence telemetry; disclose and minimise any verification/usage data.
- Licence enforcement cannot disable mandatory security, export/portability needed to retrieve customer data, legal compliance controls or access to licence text. Expiry/degradation behaviour must be safe and documented.
- Do not interpret legal terms in code comments or UI beyond approved product/legal copy. Obtain qualified legal review for commercial terms, Competing Use guidance, future-licence release dating and jurisdiction-specific enforcement.

Canonical source reviewed: https://github.com/Resnovas/Eventiva/blob/main/LICENSE

This is an EVE-13 platform requirement and must shape EVE-244 entitlement, feature-flag and release-metadata contracts.


### Comment 9b25b62f-89df-4a3b-9caf-8db5c81b4b04

Author: jonathan@resnovas.com. Created: 2026-11-11T15:02:06.658Z; updated: 2026-11-11T15:02:06.629Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Release/update-channel decision confirmed by Jonathan (decision 1 of 5 before returning to licensing tiers):

Formal channels:
- Stable: production-supported, fully gated releases. Managed-cloud default automatically deploys stable updates through staged rollout; self-hosted default notifies administrators and requires approval/scheduled policy.
- Beta: feature-complete or near-complete releases for willing tenants/users, with production-like migrations and supported rollback but reduced stability guarantees.
- Nightly: rapid automated builds for development/test deployments, clearly unsupported for production/regulated use, with short retention and frequent breaking-change/migration warnings.
- Emergency: signed narrowly scoped security remediation, kill switch or compatibility action that can override normal scheduling only under declared emergency policy and audit.
- Canary is a rollout strategy within Stable/Beta/Nightly, targeting a small cohort of tenants/users/devices/workloads before progressive expansion; it is not a separate code truth.

Requirements:
- Signed manifests, reproducible/provenanced artefacts, SBOM/security scan, compatibility constraints, assurance requirements and migration/rollback metadata for every channel.
- Atomic activation, health checks, progressive rollout, automatic halt/rollback thresholds and preservation of the last verified working version for offline clients.
- Declarative bundles may update independently; sandboxed executable modules require capability/security checks; new permissions require approval; native changes require platform application releases.
- Deployment, tenant and device policies choose allowed channels, update windows, maintenance notices, rollout cohort, maximum skew and rollback behaviour. Regulated modules may prohibit Beta/Nightly.
- Data/schema/protocol changes use forward/backward compatibility windows so mixed-version offline and distributed clients remain safe.
- Security updates may carry an enforce-by deadline for managed services, with transparent notice, evidence and safe degraded behaviour. Self-hosted operators retain deployment control, while the UI clearly reports unsupported/vulnerable versions.
- PostHog/OpenFeature may target rollout cohorts and kill switches, but signed release policy and core security gates remain authoritative.

This is an EVE-13 platform requirement and must shape EVE-244 release, module and deployment contracts.


### Comment 73f7d476-250c-422a-8497-424cbf33f402

Author: jonathan@resnovas.com. Created: 2026-11-11T15:03:50.334Z; updated: 2026-11-11T15:03:50.216Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Compatibility/support lifecycle decision confirmed by Jonathan (decision 2 of 5 before returning to licensing tiers):

Default compatibility guarantee:
- Support platform/API/event/schema/module/action compatibility for at least two stable major versions or 36 months from a version’s publication date, whichever is longer.
- The 36-month horizon deliberately extends 12 months beyond the version’s FCL-1.0-MIT future-licence transition at 24 months.

Lifecycle:
1. Active support, months 0–24: normal bug/security/compatibility maintenance, supported migrations and documented commercial/managed support channels according to entitlement.
2. Community maintenance, months 24–36: version is under MIT future licence; public repository issues/discussions are the default first line, with best-effort/community-prioritised maintenance and clearly stated response expectations. Critical security/upgrade guidance remains handled under the published security policy.
3. End of standard support after month 36: retain documentation, source/release artefacts, portability/export and upgrade paths. Further fixes/support require community contribution or a separately offered extended-support entitlement.

Requirements:
- Publish machine-readable publication, MIT-transition, active-support, community-maintenance and end-of-support dates per release.
- Version every API, event, schema, canonical action and module contract; prefer additive evolution and test mixed-version offline/distributed operation.
- Provide deprecation notices, telemetry/administrative inventory of affected clients/modules, migration tooling and compatibility adapters where safe.
- Security may shorten support for unsafe protocols/algorithms. Such removal requires a security advisory, safe migration path and cannot preserve a known-dangerous interface merely to meet the normal window.
- Paid/managed subscriptions provide defined response channels and service levels; community Git issues/discussions do not imply an SLA.
- Do not conflate source licence transition with hosted-service availability or entitlement. Each is represented separately in the administration UI.

This refines EVE-13 and EVE-244 release, compatibility and licensing metadata contracts.


### Comment 5dd1c144-eba5-4db3-b881-341d11ec8553

Author: jonathan@resnovas.com. Created: 2026-11-11T15:06:04.433Z; updated: 2026-11-11T15:06:04.399Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Migration decision confirmed by Jonathan (decision 3 of 5 before returning to licensing tiers):

Execution defaults:
- Managed cloud runs validated migrations automatically through staged tenant canaries and rollout policy.
- Self-hosted/community deployments default to administrator preview, backup verification and approval, with supported unattended policy available when explicitly configured.

State-aware migration graph:
- Follow the useful Odoo-style principle of deployment/version-specific migration paths, but implement an Eventiva-owned state-aware planner rather than one blind linear script sequence.
- Every deployment/module reports a signed migration inventory: platform/module/schema/data-contract versions, enabled modules/features, provider capabilities, security/assurance profile, residency, integrity/security classifications, pending jobs, historical migration checkpoints and detected drift.
- The planner compares observed state to the target release and selects a versioned path through a directed migration graph. Paths may differ for managed cloud, self-hosted, offline/edge, provider adapter, module set, source version and skipped releases.
- Never infer solely from a version string. Migration preconditions probe actual schema/data/configuration and classify expected, already-applied, partial, drifted, unsupported and ambiguous states.
- Ambiguous or unsafe state pauses with an actionable report; it never guesses or silently marks a migration complete.

Safety model:
- Expand → migrate/backfill → verify → contract. Initial deployment does not remove data required by still-supported versions.
- Signed/provenanced migration bundles, deterministic plans, dry-run impact estimates, compatibility matrix and verified recovery point before mutation.
- Idempotent/resumable steps with checkpoints, bounded batches, progress evidence and safe retry across interruption.
- Support mixed old/new clients, workers and modules during the compatibility window. Destructive contract steps wait until telemetry/inventory proves old consumers are gone and retention/hold rules permit deletion.
- Tenant-specific violations enter a migration exception workflow with remediation/transform/quarantine choices and complete provenance.
- Automatic rollback only when schema/data semantics make it proven safe; otherwise halt and roll forward or restore the verified recovery point.
- Module authors declare install, upgrade, downgrade/rollback limits, uninstall/data-retention behaviour and migration tests for every supported source path.
- CI tests direct upgrades, skipped-version upgrades, partial/retry, drift, provider differences, offline reconnection and large-data backfills.

This is an EVE-13 platform requirement and must shape EVE-244 migration manifests, tooling and test fixtures.


### Comment 4b5a0625-64c5-424c-9991-09359a7fc0bb

Author: jonathan@resnovas.com. Created: 2026-11-11T15:08:38.258Z; updated: 2026-11-11T15:08:38.233Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Explicit degraded-mode decision confirmed by Jonathan (decision 4 of 5 before returning to licensing tiers):

Production-readiness gate:
- Every module, integration, provider adapter and cross-module capability must declare and test its degraded-operation contract before production readiness. “Unavailable” without defined behaviour is not an acceptable implicit fallback.

Required declaration:
- Dependency/capability and failure modes: unavailable, timeout, partial response, stale data, corrupt/invalid response, authentication expiry, quota exhaustion, region/network partition and incompatible version.
- Criticality, maximum safe staleness, timeout/deadline, retry/backoff/circuit-breaker policy, queue/outbox limits, idempotency and load-shedding behaviour.
- Functions remaining available, read-only or offline; functions blocked; queued intent versus confirmed execution; and exact reconciliation/recovery path.
- User/agent/API status vocabulary, evidence freshness and whether the state is pending, degraded, unconfirmed, failed, recovered or requires intervention.
- Data-loss, security, financial, operational and safety risks plus escalation/alerting thresholds.
- Dependencies between degraded modes so cascading failures do not produce contradictory claims.

Core rules:
- Never report an external action as executed without acknowledgement/evidence. Preserve intent separately from outcome.
- Fail closed for security, permission, key, legal/retention and regulated integrity uncertainty. Fail safely/read-only where that preserves useful operation without making false claims.
- Offline-first capabilities continue locally within their declared staleness/invariant bounds and expose pending sync/conflicts.
- Cached flags/configuration require signed version/freshness policy; local emergency/security policy overrides an unavailable remote provider.
- Queues are bounded and observable. Exhaustion produces explicit backpressure rather than silent loss.
- Recovery performs deterministic reconciliation and retains provenance; it does not silently overwrite conflicting offline state.

Examples confirmed:
- PostHog unavailable: signed cached flags plus local emergency policy.
- Email/SMS unavailable: queue and show pending, never delivered.
- Sync unavailable: local operation with visible unconfirmed state.
- Payment unavailable: preserve basket/order intent, never claim payment.
- Show-control bridge unavailable: disconnected; never claim cue execution.
- Identity provider unavailable: honour bounded valid sessions only where policy allows; block sensitive reauthentication/step-up.

Verification:
- Module manifests expose the degraded-mode contract to UI, agents, health control centre and documentation.
- CI/chaos/contract tests inject each declared failure, including long partitions and recovery. Production approval requires measured behaviour and operator runbooks.
- The admin control centre shows current degraded dependencies, affected capabilities, queue/staleness metrics, automatic actions and required intervention.

This is a sealed EVE-13 requirement and an acceptance criterion for EVE-244 module/provider contracts.


### Comment 9000c637-dfee-49b0-824c-8976cb88c218

Author: jonathan@resnovas.com. Created: 2026-11-11T15:11:45.069Z; updated: 2026-11-11T15:11:45.031Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Reliability/SLO decision confirmed by Jonathan (decision 5 of 5; return to postponed licensing-tier structure next):

Production readiness:
- Every production module declares machine-readable SLIs/SLO targets and error-budget policy for availability, latency, sync/queue delay, freshness, confirmed execution/delivery, recovery/data loss, reconciliation, security-policy evaluation and relevant agent outcomes.
- Before production history exists, objectives are provisional. Readiness requires proven instrumentation, measured capacity/failure limits, dashboards/alerts and operator runbooks—not a claim that a long-term SLO has already been achieved.
- Stable rollout starts with a limited monitored cohort; objectives become established or are revised after representative evidence.
- Error-budget burn pauses risky rollouts and prioritises reliability work. Security emergency releases use a separate assessed path.

Measurement:
- OpenTelemetry is the vendor-neutral reliability source of truth. Canonical safe attributes identify module/capability, deployment/assurance profile, release/flag version, degraded state, provider and result without leaking tenant data.
- PostHog may correlate product behaviour but does not define reliability truth.
- Community/self-hosted deployments receive local dashboards and tests without mandatory telemetry export; aggregate reporting is opt-in.

Simulation/load framework:
- Every module provides scenario generators and a deterministic simulation adapter for its canonical actions/events. A shared harness can create synthetic tenants, users, agents, events, plans, records and time progression at controlled scale.
- Test steady load, burst/spike, soak/endurance, concurrency/races, large tenants, fan-out, queue backlog, cold start, autoscaling, shard movement, regional/network partition, provider latency/error/quota, retries/duplicates/reordering, offline reconnection and recovery.
- Use seeded reproducible workloads, synthetic/non-PII data, virtual clocks where safe, distributed load generators and signed result artefacts with environment/capacity/cost metadata.
- Verify data invariants and outcome correctness as well as throughput; a fast system producing duplicate payments, lost cues or cross-tenant access fails.
- Model external-provider rate/cost limits and use provider sandboxes/contracts rather than generating abusive production traffic.
- Physical MIDI/DMX/OSC, device, safety and timing paths use protocol simulators first, then hardware-in-the-loop and controlled field tests. Simulation alone cannot establish real-world or safety certification.
- Performance regression budgets run in CI at small scale; scheduled/nightly and pre-release environments run larger distributed/soak/chaos suites.

Readiness evidence includes test matrix, achieved capacity, saturation point, resource/cost curve, error/recovery behaviour, remaining uncertainty and the supported operating envelope. Production admission prevents configuration beyond that envelope unless an explicit degraded/unsupported override applies.

This is an EVE-13 platform requirement and an acceptance criterion for EVE-244 observability, simulation and module contracts.


### Comment 8d02b5b9-6be8-4741-aade-eeda10169d1f

Author: jonathan@resnovas.com. Created: 2026-11-11T15:15:32.208Z; updated: 2026-11-11T15:15:32.176Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Licensing/hosting/support level structure confirmed and specified:

Three independent dimensions:
1. Software entitlement: Community, Evaluation, Education/non-profit/contributor, Commercial, and version-specific MIT-future state after the recorded two-year transition.
2. Deployment/hosting: Self-hosted, Cloud Community, Cloud Team, Cloud Business, Cloud Critical.
3. Support: Community, Standard, Priority, Critical, and Extended lifecycle.

Key rules:
- Customers may combine dimensions independently; software rights, infrastructure resources and response service are not one ladder.
- Security, portability/export, accessibility, legal controls and safe shutdown are not paywalled.
- Signed free entitlements are first-class; flags activate authorised capability but never create entitlement.
- Expiry uses explicit degraded modes and never destroys/locks customer data.
- MIT transition applies per published version; hosting, support and third-party services remain separate.
- Final commercial/permitted-use wording requires legal approval.

Full working specification and remaining decisions: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 entitlement, release, deployment and administration contracts.


### Comment d68637af-5f23-41db-a89d-f0b15c0b6d7b

Author: jonathan@resnovas.com. Created: 2026-11-11T16:22:10.847Z; updated: 2026-11-11T16:22:10.807Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Community baseline and monetisation decision confirmed:

- Community is a broad, fully functional core platform rather than an intentionally crippled edition. It includes offline/sync, identity, granular permissions, encryption/audit, administration, module runtime/catalogue, UI builder, i18n/terminology, portability/backup, API/MCP/ACP/webhook/agent surfaces, OpenFeature configuration and public releases under normal security policy.
- Managed-cloud monetisation is based primarily on understandable resource/service consumption: compute/runtime, dedicated database resources, object storage, backup/retention, egress, background work, communications and explicitly sponsored third-party/AI usage.
- Use a predictable base subscription with included allowances, transparent metering, forecasts, budgets, hard/soft limits and no surprise overages or silent payer changes.
- Self-hosted Community users supply their infrastructure. Eventiva charges separately only for commercial rights beyond Fair Core, hosted/marketplace services, external consumption or support.
- Feature paywalls are exceptional and require a documented commercial or third-party reason. Security, portability, accessibility and compliance controls are never weakened to force upgrades.
- Protected recent modules may use signed free Community grants before their future-MIT date, but broad access remains the product default.

Updated plan specification: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 entitlement, billing, feature-flag and administration contracts.


### Comment 2a122c6c-85e9-445c-a453-bc699d66f303

Author: jonathan@resnovas.com. Created: 2026-11-11T16:24:13.123Z; updated: 2026-11-11T16:24:13.054Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Cloud billing decision confirmed:

- Resource-first billing: managed deployment base, understandable compute/capacity units, database/files/backup storage, external egress, communications, sponsored third-party/AI use and high-assurance dedicated infrastructure.
- Active-user count is not the primary charge; use it for capacity/fair-use signals where needed.
- Infrastructure and external consumption use transparent modest cost-plus pricing. Principal margin should come from support, managed operations and contracted service rather than opaque infrastructure mark-up.
- Exact prices/allowances wait for measured provider-cost modelling.

Metering requirements:
- Append-only idempotent usage ledger with canonical meter, source evidence, tenant/funding owner and pricing version.
- Reconcile to provider invoices and detect missing/duplicate/anomalous events before invoicing.
- Customer-visible usage, forecasts, allowances, unit prices, credits/adjustments and downloadable evidence.
- Budgets, alerts and hard caps prevent surprise overages; exhaustion follows explicit degraded-mode policy.
- Signed period close, immutable corrections and dispute/recalculation workflow.
- Privacy-minimised/residency-compliant meters never require customer content, prompts or secrets.
- Synthetic meter tests, provider invoice fixtures and independent review before production charging.

Updated specification: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 billing, audit, funding-source and administration contracts.


### Comment 9ab5c646-2e75-4090-9e6c-05b2ee63796e

Author: jonathan@resnovas.com. Created: 2026-11-11T16:25:34.414Z; updated: 2026-11-11T16:25:34.387Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Pre-execution cost transparency decision confirmed:

- Every potentially expensive canonical action can request a typed cost estimate before execution: exports/imports, AI jobs, bulk communications, media processing, simulation, reports, cross-region transfer and future metered actions.
- Estimate current scope using measured data/resource size, provider prices, historical comparable jobs and uncertainty. Show expected amount/range, included allowance, likely billable amount, payer/funding source, assumptions, confidence/freshness and major cost drivers.
- Cost policy sets auto-execution, confirmation and budget-owner approval thresholds by action/category, single amount, cumulative spend and anomaly/risk.
- Agents use the same estimate and approval contract. Detect logical job splitting and aggregate related operations so automation cannot bypass thresholds.
- Reserve budget when practical, bind approval to a maximum authorised amount, pause before exceeding it and release unused reservation.
- Requote on material scope/provider/destination/volume/price/plan changes.
- Reconcile estimate against actual usage, explain material variance and calibrate future estimates with privacy-safe aggregate history.
- Estimation failure follows explicit policy: potentially high-cost work must not proceed silently.

Updated specification: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 canonical action, billing, agent approval and administration contracts.


### Comment aadb4993-fea3-40ce-8eab-32437285eb46

Author: jonathan@resnovas.com. Created: 2026-11-11T16:28:55.371Z; updated: 2026-11-11T16:28:55.288Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Support severity/triage decision now saved:

Impact severity:
- S0 Emergency: active compromise, key exposure, uncontrolled data loss or widespread critical failure.
- S1 Critical: production unavailable/critical workflow blocked without workaround.
- S2 Major: substantial degradation.
- S3 Moderate: important defect with workaround.
- S4 Minor: limited impact/edge case.
- S5 Cosmetic: visual, wording, non-blocking accessibility/consistency.
- S6 Informational: observation or clarification without defect.

Request type is separate: incident, security report, defect, configuration/help, documentation, accessibility, performance, enhancement, product idea or community discussion.

Community triage is also separate: Needs reproduction, Needs design, Maintainer accepted, Contributor welcome, Planned, Backlog, Declined or Duplicate. Community remains best effort/no SLA.

Provisional response structure:
- Standard: UK business hours; S1 initial target 4 business hours.
- Priority: extended contracted coverage; S1 initial target 1 hour during coverage.
- Critical: 24/7 eligible incidents; S0 initial target 15 minutes, S1 30 minutes.
- Targets become contractual only after staffing/monitoring evidence demonstrates sustainability.

Updated specification: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 support, incident and community-workflow contracts.


### Comment 99632c95-04ff-4eb7-a512-aeb738a31bb3

Author: jonathan@resnovas.com. Created: 2026-11-11T16:32:21.171Z; updated: 2026-11-11T16:32:21.135Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Community entitlement and grace-period decision confirmed:

- Unregistered Community: no account/key; local self-hosted unprotected core under repository terms; no Eventiva-hosted resources, sponsored services or licence telemetry. MIT-transitioned versions require no Fair Core entitlement.
- Registered Community: free signed entitlement for current protected/connected Community capabilities; 12-month renewable term and 90-day offline grace; only opaque deployment, entitlement, version and aggregate hosted-limit records—never tenant content.
- Managed Community Cloud: account/entitlement required because Eventiva supplies resources; free/sponsored allocation with explicit limits and consumption-based upgrade.
- Abuse checks validate entitlement scope and Eventiva-funded/hosted resource limits, not private self-hosted activity.
- Evaluation default: 30 days, warnings from day 21, safe expiry preserving read/export/security.
- Paid default technical grace: 30 days after contracted term unless approved terms/security require otherwise; emergency signed extension for licence-service outage.

Updated specification: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 entitlement/privacy/offline administration contracts.


### Comment 1faf74b0-0d07-4a30-bf3b-f19b4ba0b821

Author: jonathan@resnovas.com. Created: 2026-11-11T16:33:29.337Z; updated: 2026-11-11T16:33:29.252Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Education/non-profit/contributor decision confirmed:

- Self-hosted qualifying users do not need a special paid programme merely to run the broad Community platform on their own infrastructure, subject to Fair Core terms and any free signed entitlement for current protected Community capabilities.
- Managed-cloud free/discounted access is separate because Eventiva pays real infrastructure/operation cost. Exact eligibility, allowance and renewal wait for measured provider-cost modelling.
- Potential sponsored programmes: verified education/non-profit projects, open communities, public-interest/hardship cases and recognised contributors.
- Sponsorship uses transparent resource credits, budgets/fair-use limits and non-destructive expiry—not feature removal.
- Commercial organisations may sponsor a qualifying project but do not thereby own its entitlement, data or governance.
- Contributor grants measure accepted impact/community value, not raw commit count.
- Publish verification, renewal, appeal and conflict-of-interest rules before launch.

Updated specification: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 Community entitlement, sponsorship, billing and governance contracts.


### Comment 73caf2a5-eadd-41cb-8a23-d51c65fa3d34

Author: jonathan@resnovas.com. Created: 2026-11-11T16:50:20.404Z; updated: 2026-11-11T16:50:20.142Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Marketplace/external module decision confirmed:

- External and private module sales/distribution are permitted. Eventiva charges commission only when it processes the marketplace transaction; no commission on external transactions.
- Optional Eventiva build, scanning, hosting, entitlement and support services can carry explicit service fees independently.
- Standard signed Eventiva Module Bundle supports marketplace, URL, upload and private feed installation.
- Every route uses quarantine, archive safety, malware/secret/dependency/static analysis, provenance/SBOM, capability review, isolated builds/runtime, explicit admin approval and rollback/revocation.
- Uploads/builds receive no uploader session, tenant credentials or production access. Module runtime gets its own least-privilege identity.
- Publisher-signed external entitlements use the open entitlement contract without exposing payment details to Eventiva.
- Verification status reflects evidence, not payment; price/channel never bypasses sandbox/security controls.
- Module data remains exportable after expiry; execution degrades non-destructively.
- Exact marketplace commission, payout, tax/refund and verification-service fees remain to be costed/published.

Updated specification: https://ampcode.com/artifacts/eventiva-licensing-hosting-and-support-levels-fe28b016-2326-4590-baa6-7dfe0a089c77

This refines EVE-13 and EVE-244 marketplace, module, build, entitlement and security contracts.


### Comment 6bdae33b-bc21-4084-addf-fa6a540de91f

Author: jonathan@resnovas.com. Created: 2026-11-11T16:52:48.984Z; updated: 2026-11-11T16:52:48.956Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Unified notification decision confirmed by Jonathan:

Authoritative inbox:
- Eventiva’s encrypted in-app inbox is the primary/source-of-truth communication record for system, workflow, security and operational notifications.
- Email, SMS, push, voice, webhook and chat integrations are delivery/escalation channels pointing back to the authoritative notification where appropriate; they do not silently become the only record.
- Offline clients sync inbox state, preserve locally queued actions and distinguish local receipt from server-confirmed delivery/acknowledgement.

Canonical notification contract:
- Stable notification/event ID, tenant/module/source, category/severity, purpose, recipients/audience, security/privacy profile, content/template/version, related canonical action/resource, created/deadline/expiry, channels, quiet-hours policy, retry/escalation, acknowledgement requirements, cost estimate/funding source and provenance.
- State distinguishes created, queued, sent, provider accepted, delivered where evidence exists, read, acknowledged, acted upon, failed, expired and cancelled. Never label merely submitted messages as delivered.
- Idempotency/deduplication, threading, batching/digests, localisation/terminology, accessibility and immutable audit are core.

Control and policy:
- Users control ordinary preferences, channel routing, quiet hours, digests, accessibility format and personal contact methods.
- Tenant/deployment policy controls operational categories, permitted providers, retention, cost budgets, escalation rosters and mandatory notices.
- Critical security/safety/continuity notices may override quiet hours only through explicit core policy, narrow severity definitions and audit. Channel opt-out rules must respect law and safety obligations without overusing emergency priority.
- External messages minimise sensitive content, use configured anti-phishing phrase/marker where requested and prefer authenticated deep links to the inbox. A phrase is not authentication.
- Resource permissions and data classification determine what each recipient/channel may see. Redact or require app authentication for protected details.
- Bulk/paid channels use pre-execution cost estimates, budgets and funding-source attribution.
- Provider adapters are replaceable Effect services with explicit degraded modes, delivery evidence and residency/privacy metadata.
- Agents and integrations use the same canonical notification action, purpose logging, permissions and delivery status as the UI.

This is an EVE-13 platform requirement and must shape EVE-244 messaging, offline, provider and audit contracts.


### Comment 351ac51e-72a5-48f4-ad84-f60fa7f83023

Author: jonathan@resnovas.com. Created: 2026-11-11T18:57:27.217Z; updated: 2026-11-11T18:57:27.181Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

MDT/live-operations status, classification and resolution requirement confirmed by Jonathan:

Shared coded taxonomy engine:
- Core provides stable canonical code-set contracts; modules/tenants define versioned profiles with labels, terminology, localisation, colours/icons, ordering, transitions, forms, permissions and automation.
- Codes use immutable machine identifiers separated from human labels so Event/gaming/security/emergency-service terminology can differ without breaking analytics, integrations or agents.
- Import/map external organisational standards where authorised; do not claim conformance to a real emergency-service code set without explicit source, jurisdiction and validation.

Operational state families:
- Person/crew state: off duty, available, assigned, responding/travelling, on scene, committed/busy, unavailable, welfare/rest, emergency assistance and configurable domain states.
- Unit/vehicle/resource state: available, reserved, assigned, mobilising, en route, arrived, operational, transporting, returning, out of service, maintenance and emergency.
- Incident/request lifecycle: received, triaged, queued, assigned, acknowledged, active, contained, resolved, closed, reopened and cancelled, with controlled transitions.
- Priority/response grade, incident nature/type, location/site classification, risk/hazard markers, confidentiality, required skills/resources and command/escalation level.
- Disposition/wrap-up codes describe outcome, resolution, cancellation/no-action, referral/handover, false/duplicate report, follow-up and configurable domain results.

Assignment and forms:
- At a glance, dispatchers and assignees see canonical type, priority, risk, required response, location, age/SLA, current ownership, acknowledgement and status evidence.
- Status transitions may require structured forms/checklists, timestamps, location/evidence, reason, disposition and approvals according to integrity/security profile.
- Forms are schema-driven, offline-capable, versioned and attached to canonical actions. A form version remains reconstructable after taxonomy changes.
- Module manifests declare allowed transitions, required fields, timeout/escalation rules, automation hooks and degraded/offline behaviour.

Safety/usability:
- Never rely on colour alone; use text/code/icon plus accessible contrast and configurable display density.
- Resource permissions govern who can view/change each state and classification. Agents/API/MCP use the same canonical actions and provide purpose.
- Every transition is timestamped, attributed, append-only/audited where operational evidence requires it, and distinguishes requested from acknowledged/confirmed state.
- Offline updates preserve sequence/provenance and reconcile conflicts explicitly; never silently overwrite a live safety/dispatch state.
- Analytics aggregate canonical codes while preserving profile/version mappings.

Acknowledgement/escalation levels:
- None, read, explicit acknowledgement, action-required, and dual acknowledgement.
- Policies define recipients/roles/on-call rotas, timeouts, channel sequence, backup recipients, claim/handover, repeat limits, unresolved incident creation and offline/unreachable handling.
- Modules provide safe defaults; tenants may configure profiles within mandatory security/safety floors.

This is a cross-platform EVE-13 requirement, a direct EVE-71 fleet/live-operations requirement, and must shape EVE-244 taxonomy/form/action contracts.


### Comment ca04d31a-1100-428a-a67d-398e1b7211ee

Author: jonathan@resnovas.com. Created: 2026-11-11T19:09:48.188Z; updated: 2026-11-11T19:09:48.133Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

UK emergency-services terminology/profile decision confirmed and researched:

Adopt standards as versioned source-backed profiles over Eventiva’s canonical taxonomy—not hard-coded labels and not one falsely universal emergency code set.

Initial profiles:
1. UK JESIP interoperability profile
- Joint working principles: co-locate, communicate, coordinate, jointly understand risk and shared situational awareness.
- Structured M/ETHANE/ETHANE reports: major-incident declaration, exact location, type, hazards, access, casualty count and emergency services required.
- Joint Decision Model and clear jargon-free multi-agency communication concepts.
- Airwave/interoperability concepts, talkgroup/communication-plan references and cross-agency call-sign clarity where publicly documented and legally usable.

2. NHS ambulance response profile
- Versioned Category 1–4 clinical-response priority mapping and targets sourced from current NHS/ambulance-trust publications.
- Keep category identity separate from changing response-time targets, geography and service policy.

3. UK policing profile family
- THRIVE-style Threat, Harm, Risk, Investigation, Vulnerability and Engagement assessment where supported by current official/local force policy.
- Force-specific grading mappings (for example emergency, urgent, same-day and scheduled categories) remain separate profiles because grading/targets vary by force.

4. UK fire and rescue profile family
- Source from current National Operational Guidance/NFCC/UKFRS incident-command, resource, message and communication guidance after verifying public reuse terms and jurisdiction/version.

5. Event operations and gaming profiles
- Map event/security/community terminology to the same canonical priorities, statuses, resources, risks and actions without claiming official emergency-service affiliation or certification.

Profile governance:
- Every standard profile records source authority/URL, jurisdiction, service/agency, version/effective date, licence/reuse basis, local deviations, review date and supersession mappings.
- Stable canonical IDs remain unchanged; labels, codes, targets, forms, transitions and radio phraseology come from the selected profile/version.
- Allow an organisation to clone/extend a profile while preserving source attribution and a machine-readable diff from the standard.
- Do not expose restricted/sensitive operational guidance or imply endorsement. Only use authoritative public material or properly licensed/authorised organisational packs.
- Plain-language/JESIP interoperability is the cross-agency default. Agency-specific codes and jargon are displayed with canonical/plain-language translations.
- Radio support includes structured call signs, phonetic alphabet/clarification aids, talkgroup/channel plans, message priority, read-back/acknowledgement and communication logs where sourced; avoid importing US “10-codes” or another jurisdiction’s scheme as UK standard.
- Priority display is accessible and never colour-only. Analytics preserve source profile/version and canonical mapping.
- Standards profiles improve operational consistency but do not by themselves establish safety certification, legal compliance or suitability for live emergency-service use.

Official/public sources reviewed 2026-11-11:
- JESIP Joint Doctrine v3.1 (April 2024): https://www.jesip.org.uk/wp-content/uploads/2022/03/JESIP_Joint-Doctrine_Version-3.1_April-2024.pdf
- JESIP M/ETHANE: https://www.jesip.org.uk/joint-doctrine/m-ethane
- College of Policing METHANE/communications guidance: https://www.college.police.uk/app/emergency-procedures-initial-response-and-command/communication
- NHS ambulance categories example: https://www.londonambulance.nhs.uk/about-us/our-performance/ambulance-response-categories
- Force-specific grading example: https://www.sussex.police.uk/SysSiteAssets/foi-media/sussex/policies/force-call-grading-deployment-and-demand-management-policy-785.pdf

This is an EVE-13 shared taxonomy requirement, a direct EVE-71 MDT/live-operations requirement and must shape EVE-244 profile/versioning contracts.


### Comment aaccbbdf-40b3-43dc-99f9-78773ef8b1c9

Author: jonathan@resnovas.com. Created: 2026-11-11T19:14:04.261Z; updated: 2026-11-11T19:14:02.435Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Selectable terminology/phraseology decision confirmed by Jonathan:

Separate four independent layers:
1. Locale/language: en-GB canonical fallback, en-US and future languages; spelling, grammar, date/number/time formats.
2. Domain vocabulary: events, security, gaming/MDT, emergency operations and tenant-specific terminology overlays.
3. Operational/communication profile: UK JESIP/plain-language, agency-specific UK profiles, US public-safety/incident-command profiles where lawfully sourced, ICAO phraseology where lawfully sourced, and event-adapted derivatives.
4. Organisation overrides: versioned tenant terms/codes mapped to canonical Eventiva concepts.

User choice and shared safety:
- Users may select their preferred display locale and terminology profile. Stable canonical concept/action/status IDs remain stored and transmitted so analytics, permissions, agents and integrations do not depend on wording.
- UI can show preferred label plus canonical code/plain-language explanation on demand. Search accepts synonyms across installed profiles.
- Shared operational channels, voice/radio procedure, training exercises and safety-critical workflows also declare a channel/incident profile. Participants see a clear warning/dual label when their personal profile differs; spoken/read-back phraseology follows the shared channel profile to prevent dangerous mismatches.
- Persist the source and target profile/version with messages/forms/training/completion evidence so historical meaning remains reconstructable after updates.
- Agents receive canonical concepts plus active user and operational profiles and must reply in the selected terms without changing underlying action semantics.

Profile governance:
- Every profile records authority/source, jurisdiction, version/effective date, licence/reuse basis, intended context and mapping confidence.
- Do not copy or claim conformance to proprietary/restricted ICAO, emergency-service or industry material without the required permission. Prefer authoritative public definitions and separately licensed packs where necessary.
- “Event-adapted” profiles are labelled adaptations, not official emergency/aviation standards or endorsements.
- Profile tests verify round-trip mapping, ambiguity, plural/grammar/accessibility, agent interpretation and cross-profile handover.
- Training content can render for each profile while assessment evidence records the exact terminology/standard version taught.

Apply this to EVE-13 canonical taxonomy, EVE-28 localisation, EVE-71 MDT/live operations, EVE-245 training and EVE-244 foundational manifest/profile contracts.


### Comment 612b8e91-8a9e-48d3-860c-9f3c9b566770

Author: jonathan@resnovas.com. Created: 2026-11-11T19:15:10.094Z; updated: 2026-11-11T19:15:10.081Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Correction from Jonathan: operational/domain terminology and phraseology are selected by the tenant administrator and apply consistently across the tenant, not chosen independently by each end user.

- Tenant policy selects the active domain vocabulary and operational/communication profile, with optional event/channel-specific profile only where explicitly governed for interoperability.
- End users cannot independently switch MDT/status/radio/operational terminology, because inconsistent wording within one tenant could create confusion and unsafe handovers.
- Personal preference remains available only for language/locale and accessibility presentation where it does not alter canonical operational meaning; tenant policy may also fix locale for regulated/shared forms.
- Admin changes require preview, mapping/ambiguity checks, training/content impact analysis, versioned activation and audit. Historical records retain the profile/version under which they were created.
- Cross-tenant or multi-agency collaboration displays canonical/plain-language equivalents and source profile labels without changing either tenant’s configured vocabulary.
- Agents use the tenant/event/channel profile consistently for every participant.

This supersedes the user-selectable terminology wording in the immediately preceding comment on each issue.


### Comment 9d6fe7ae-93ba-490f-9b71-6780cbb3a294

Author: jonathan@resnovas.com. Created: 2026-11-11T19:41:09.485Z; updated: 2026-11-11T19:41:09.449Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Training, competency and permission decision confirmed by Jonathan:

Evidence levels remain distinct:
1. Viewed/participated.
2. Knowledge demonstrated by assessment.
3. Practical competency signed by an authorised assessor.
4. Operational authorisation for a defined role/resource/action/scope/time.

Credential model:
- Completion, assessment, practical competency, qualification, licence, induction and certification are versioned signed credential/claim records on the worker profile with issuer, subject, scope, evidence, source content/version/profile, issue/valid-from/expiry, renewal, status and revocation.
- A credential is not itself an unrestricted role. Tenant policy explicitly maps an accepted credential type/issuer/level to one or more permission groups, role memberships, feature flags/surfaces or eligibility conditions.
- Roles/permission groups remain live relationship subjects. Prefer conditional/dynamic membership based on valid credentials rather than copying permanent grants.
- When the credential expires, is suspended/revoked, its issuer loses trust, required training changes or evidence is invalidated, derived access is automatically suspended/removed and affected assignments are surfaced.

Grant policy:
- Tenant administrators define whether an outcome auto-activates access, requires assessor approval, requires manager/security approval or only contributes to an eligibility decision.
- Low-risk product training may automatically unlock UI/features after passing.
- Sensitive, regulated, financial, permissions, live-control and safety capabilities require the configured practical assessment/independent approval and cannot be granted merely by viewing or passing a quiz.
- Policy declares scope: tenant, module, event, site, resource class, individual resource, shift/time window and permitted actions.
- Every derived grant shows an explain-access path such as: Jane → signed Event Controller competency → Live Operations role → dispatch action on Event A.
- Permission simulator supports hypothetical credential completion/expiry/revocation and previews gained/lost access before policy publication.

Operational checks:
- Eligibility also considers qualification validity, site/event induction, role/resource permission, required supervision, suspension/restrictions, assurance level and refresher/recency requirements where lawful.
- Assignments re-evaluate at planning time, shift start and sensitive action time according to policy. Offline clients use bounded signed eligibility evidence and reconcile changes visibly.
- Agents may recommend training or initiate an authorised grant workflow but cannot self-issue competency, approve their own evidence or bypass separation of duties.

This is a core EVE-13 authorisation requirement; direct EVE-245 training and EVE-154 qualification/eligibility requirement; related EVE-80 HR and EVE-244 credential/policy contract requirement.


### Comment c91bfee6-c31f-47f4-8c38-31a16e727871

Author: jonathan@resnovas.com. Created: 2026-11-11T19:44:42.582Z; updated: 2026-11-11T19:44:42.528Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

External qualification verification decision confirmed by Jonathan:

- Accept Eventiva-issued signed credentials, standards-based verifiable credentials, trusted issuer API/registry evidence, QR/digital signatures and uploaded certificate/licence evidence.
- Uploaded/unverified evidence may be stored provisionally but cannot activate Sensitive/Restricted operational permissions or eligibility until the tenant’s configured verification policy succeeds.
- Low-risk policy may permit bounded provisional access with explicit expiry/supervision, but this must be visible, auditable and never the default for regulated/safety capability.

Verification states:
- Unverified
- Evidence submitted/pending
- Automatically verified
- Manually verified
- Verification failed/rejected
- Expired
- Suspended
- Revoked
- Superseded

Evidence and trust:
- OCR/AI extracts issuer, subject, qualification, scope, dates, restrictions and identifiers as proposed data only; it never establishes authenticity by itself.
- Verify cryptographic signatures/QRs, issuer endpoints, trusted registries and revocation/status lists where available. Manual verification records named verifier, method, source, timestamp, confidence, notes and evidence.
- Tenant-managed issuer trust registry defines accepted issuers, credential types, assurance/verification methods, jurisdictions, refresh frequency and which permission scopes they may unlock.
- Show credential validity separately from evidence verification and issuer trust. A genuine credential from an untrusted issuer does not automatically satisfy policy.
- Prefer hashes, issuer references and minimised extracted fields over retaining unnecessary document copies. Original evidence uses the declared security/retention/residency profile and subject-erasure/legal-hold rules.
- Periodically revalidate revocation/expiry where supported. Changes immediately re-evaluate live conditional permissions, assignments and eligibility, with offline bounded evidence/degraded behaviour.
- User can inspect and challenge a verification outcome; corrections preserve immutable provenance.
- Import/export uses portable credential/evidence/status representations and does not falsely claim another system’s assurance.

This is a direct EVE-154 qualification/eligibility and EVE-245 training requirement; related EVE-80 HR, EVE-13 authorisation and EVE-244 credential contracts.


### Comment 55486019-53cf-403f-bb95-846bf44179c2

Author: jonathan@resnovas.com. Created: 2026-11-11T19:48:04.544Z; updated: 2026-11-11T19:48:04.496Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Assessment-integrity decision confirmed by Jonathan:

- Do not build or enforce invasive anti-cheating/proctoring as a core Eventiva capability. Webcam monitoring, biometric attention/identity analysis, screen surveillance, lockdown browsers and AI “cheating detection” are out of core scope.
- Eventiva does not need to guarantee that an unsupervised learner completed an assessment without external help.

Core assessment levels remain:
1. Practice: unlimited/low-stakes, immediate feedback.
2. Knowledge check: authenticated learner, configurable attempts, question pools/randomisation and pass mark.
3. Verified knowledge assessment: optional passkey reauthentication, timing, signed result and controlled window.
4. Supervised/practical competency: named authorised assessor, structured rubric, evidence and sign-off.

- High-risk/regulated operational permission must rely on the configured practical/authorised verification rather than algorithmic cheating detection.
- Tenants may integrate a third-party proctoring extension under the normal module sandbox, permissions, privacy, lawful-basis, residency, cost and feature-flag controls, but it remains optional/disabled by default and is not presented as Eventiva’s guarantee.
- Learners receive clear assessment rules, evidence/decision visibility and an appeal/correction route. Accessibility accommodations must not be treated as suspicious behaviour.
- Keep ordinary integrity controls: versioned question banks, randomisation, attempt policy, result provenance, issuer/assessor identity, tamper-evident records and audit.

This narrows EVE-245 scope and informs EVE-154 competency evidence and EVE-13 privacy/policy contracts.


### Comment a67f0cf1-94b9-4dec-94f6-749c95b444df

Author: jonathan@resnovas.com. Created: 2026-11-11T19:51:43.964Z; updated: 2026-11-11T19:51:43.832Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Training content versioning/retraining decision confirmed by Jonathan:

All published training:
- Immutable published versions; edits create a new draft/version.
- Completion/evidence records retain exact course/module/content/question/profile versions.
- Learner/admin views show version, publication date, supersession and available change notes.

Change-impact classes:
- Editorial: wording/presentation only; existing completion remains valid.
- Minor: useful content change without changed competency; optional notification/review.
- Material: procedure, answer or expected behaviour changed; focused delta training/assessment may be assigned.
- Critical: safety, security or regulatory change; affected competency/access may be suspended until required retraining completes.

Eventiva/default course packs:
- Impact classification, structured changelog, source/standard changes, affected lessons/questions/competencies/roles, learner-facing explanation and migration/retraining policy are mandatory before publication.
- Show a clear version-to-version diff and explain how internal Eventiva changes alter training, assessment, qualification and live conditional permissions.
- Generate focused delta paths containing changed mandatory material rather than requiring the entire course where safe.
- Eventiva-owned critical/regulated defaults can impose minimum retraining consequences that tenants cannot silently weaken; they remain transparent and versioned.

Tenant/user-authored courses:
- Exact versioning remains mandatory, but change-impact classification, retraining assignment and access consequence are optional authoring fields by default.
- Authoring UI prompts for impact, suggests a classification/diff using deterministic analysis/AI assistance, and explains consequences. It does not silently enforce retraining when the tenant leaves the optional fields unset.
- Tenants may configure policy requiring impact classification for selected authors, modules, regulated content or integrity profiles.

Governance:
- Named authorised publisher approves classification; AI may propose but not approve critical/regulated impact.
- Changing impact after publication is audited and notifies affected administrators/learners.
- Offline clients receive signed version/impact manifests and cannot present obsolete critical training as current.
- Agents explain why retraining/access changed using the course diff and canonical policy evidence.

This is a direct EVE-245 requirement and refines EVE-154 live competency, EVE-80 HR and EVE-13 authorisation/audit contracts.


### Comment ae0f8d88-d938-4467-a17f-ec7249662c98

Author: jonathan@resnovas.com. Created: 2026-11-15T03:45:44.054Z; updated: 2026-11-15T03:45:44.007Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

## BINDING production provider direction — Neon (2026-11-15)

Jonathan confirmed Neon as Eventiva's intended production PostgreSQL provider. Production tenancy uses a dedicated Neon Postgres project per tenant in AWS London (`eu-west-2`) under the existing EVE-13 policy. The approved PostgreSQL 17 Docker image remains CI/local conformance tooling, not the hosted production database.

EVE-42 must validate the approved `@effect/sql-pg@0.53.1` / `pg@8.23.1` path against Neon pooled and direct connections, SSL and connection lifecycle/autosuspend, direct migration connections where required, DDL and extension availability, transactional semantics, branching/test isolation, controlled tenant routing, regional placement, RLS as control-plane defense, and exact integer/time/UUIDv7 fidelity. Portable contracts remain provider-neutral and no implementation may rely on unavailable Neon features.

A Neon branch is not equivalent to a dedicated tenant production project. Branches may be used for isolated development/conformance only after quota, cost and data isolation are verified. No production mutation, credential exposure, paid resource, destructive test or provider configuration change is authorized by this direction.


### Comment 9695bf67-7b0a-4b6c-8614-34292999acbe

Author: jonathan@resnovas.com. Created: 2026-11-15T10:42:18.481Z; updated: 2026-11-15T10:42:18.418Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Core distributed execution policy — 2026-11-15 (Jonathan approved)

**Effect Cluster sharding is part of the Eventiva core execution architecture NOW**, not an optional feature added only for agent runs or advanced deployments. Preserve **one cluster-capable authorized execution path** across all editions: domain and action contracts remain transport-/driver-neutral, and server-side cluster routing, runner orchestration and storage are composed in backend infrastructure/adapters. There must not be an independent local-only business-execution engine that behaves differently from distributed mode.

**Deployment defaults**
- **Community / single-host default:** run **one Effect Cluster runner** locally (with any required co-located services) in a supported single-host profile, with no requirement for Eventiva Cloud, SaaS identity or a multi-machine cluster. It must run the same action, authorization, transaction, persistence and dispatch semantics as multi-runner mode; a single runner is a deployment size, not a separate implementation.
- **Cloud / Production default:** **multiple independent runner processes/instances**, distributing work/shard ownership and recovering from runner loss. Define a production-ready minimum topology and expose actual achieved runner count, shard ownership, health, degraded state and capacity. Do not silently claim distributed redundancy when only one runner is healthy.
- **Scalability:** Community/self-hosted may explicitly opt into multi-runner; a single physical host may run one or several runner processes. Cloud may scale runner count based on actual capacity/load controls. Work remains stable across runner placement; no process-local state dependency.
- **Runtime config and topology:** typed, validated deployment-profile config selects topology, runner count, shard count, timeouts/leases/health, endpoints and storage. Separate logical compute sharding from the already-approved one operational database per tenant. Support a fully local deployment via supported storage adapters, without requiring the managed Neon project; verify backend/cluster storage compatibility before claiming SQLite-only cluster support.
- **Safety/reliability:** persist business-critical actions by default with stable idempotency and A1 atomic audit/outbox/transition evidence. At-least-once delivery is not exactly-once execution; retain genuine business deduplication. Enforce same delegated permissions and approval gates on every runner and after a shard moves. Protect local and distributed paths equally.
- **Validation:** same conformance suite for single-runner Community and 2+ independent runners; real distribution, deliberate runner drain/SIGKILL, retry/deduplication, ordering, live configuration, restart/recovery, tenant isolation, and no double-applied business mutation. Include CI integration tests plus documented local launch commands; no fake in-memory-only unit tests substituted for cluster evidence. Test availability/reliability before declaring cloud readiness.

**Priority and execution:** Elevate EVE-252 to critical core-foundation implementation. EVE-40 has now landed and is Done. Begin EVE-252 compatibility/harness/contract work immediately on GPT/Codex in an isolated worktree, avoiding EVE-42 SQL implementation files; finish SQL-backed integration once EVE-42's required storage adapters are verified. Preserve the user's approved dependency/version, direct-to-main, signed commits, security approvals and spending guardrails. Ask explicit approval for any genuinely NEW dependency or paid infrastructure, not for ordinary coordination or task dispatch.

This decision supersedes any reading that Effect Cluster is optional, cloud-exclusive, agent-only, or that the archived pre-rebuild sharding prototype is already the active runtime.




### Comment 91262654-d113-41b1-b909-b76ea750c95a

Author: jonathan@resnovas.com. Created: 2026-11-15T16:04:44.360Z; updated: 2026-11-15T16:04:44.280Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Agent-Native parity verification — 2026-11-15 (source-and-main audit)

The owner's highest-priority architectural rule is ALREADY BINDING in EVE-13: Eventiva must be **fully agent-native, not a chat sidebar added to a UI**. BuilderIO/agent-native is an approved capability/design reference, with shared actions, shared SQL-backed data and shared application/screen state. All first-party UI, autonomous agents and supported external protocols must invoke the **same authorized Effect action** and obey tenant, privilege, approval and audit controls.

**Authoritative baseline:** EVE-15's approved 126-row upstream capability matrix is pinned to `@agent-native/core@0.222.2` / `6b5cf68eda4b008357934ba0aca201f32cf6b187` (2026-10-29). Current upstream `BuilderIO/agent-native` main was observed at `5d8c5a62e5a18f48bb20b61d12f59223f15fcc8e` (2026-11-15); update/review version drift separately rather than silently altering the locked reference. Main upstream source now also documents shared actions over UI, agent, HTTP, MCP, A2A and CLI, shared application state, skills/memory, automations, teams and visual UI workflows. See https://github.com/BuilderIO/agent-native/blob/main/README.md and https://github.com/BuilderIO/agent-native/blob/main/PRODUCT.md . Avoid unverified claims that all protocol variants are implemented by upstream; EVE-15 requires source-backed comparison.

**Verified Eventiva implementation facts:** On `Resnovas/Eventiva` current `main`, portable `@eventiva/contracts` action specs/inventory, Effect runtime authorized invocation, provider-safe tool-schema projections, SQL storage, and Cluster execution exist. `validateParity` in `packages/contracts/src/inventory.ts` is a sound generic API, but current `tests/runtime/src/parity.spec.ts` and `apps/server/src/main.ts` only require **server** as the declared surface; they do not prove parity across mobile UI, real agent, MCP, ACP, A2A, CLI or HTTP. The production tree currently contains NO implemented agent turn loop, screen registry/context/navigation actions, inbound MCP/ACP adapters or end-to-end cross-surface tests. These are specified but largely Backlog: EVE-50 screen awareness (requires EVE-16 remote Expo module spike), EVE-52 agent loop (EVE-43 / EVE-40), EVE-46 HTTP, EVE-48 MCP, EVE-49 ACP inbound, EVE-55 thread projections, EVE-29 agent evaluation. **Do not claim 100% deployed parity yet.**

**Guardrails and next steps:**
1. Treat agent-native capability parity as a **mandatory release/acceptance criterion**, not optional future enhancement. Every new domain/feature registers a canonical Effect action, description and schemas, availability to permitted agent and human surfaces, tenant-aware data and auditable approvals.
2. Ensure screen-context projection for current record, selected entity, view/filters and controls; agent must know UI state without DOM scraping, consistently on React Native, web and MDT. Add unbound-interactive-control negative test and per-surface parity fixtures; do not add a separate agent-only business implementation.
3. Preserve the approved EVE-15 priority that **screen awareness comes ahead of MCP/ACP inbound** after their prerequisites (EVE-16), instead of postponing UI/agent shared state until after all protocol work. Existing EVE-52 agent loop and model/provider engine work remain critical for truly usable agents.
4. Maintain versioned capability conformance matrix explicitly separating **approved requirements**, **implemented on main**, **verified by tests**, **upstream-only** and **future/unapproved**. Compare both baseline pin and latest upstream source commit; document changes/new capabilities and necessary issues/dependencies.
5. Eventiva's portable contract uses Effect Schema and server-side Effect action handlers behind provider-neutral integration. Do not quietly replace Effect runtime with Agent-Native's Zod/Promise/Nitro storage, or add upstream npm packages without exact dependency approval. Incorporate beneficial upstream behavior through properly licensed adapters/ports per project rules. EVE-13 earlier said 'build on and use framework'; EVE-14 says 'read for behavior, do not depend'; record this distinction explicitly. User's current wording asks to **replicate the agent-native design and take heavy inspiration**, so audit behavior/feature parity first and do not assume a direct package dependency.

This note is a **verification finding, not a claim of completed functionality or authorization for new dependencies**. Identity EVE-43's existing orb owns its files and should not be interrupted.


### Comment d13959b5-66e4-4ab5-b03c-ae59f4c1dd72

Author: jonathan@resnovas.com. Created: 2026-11-16T09:53:34.902Z; updated: 2026-11-16T09:53:34.861Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: None. Resolved: Not recorded.

Amp (OpenAI GPT-6.1 Sol) delivered the source-reference prerequisite directly to main under the owner's standing authorization.

Verified remote SHA: [5e391211a8783fa250eb561280763b3dd244ea3d](https://github.com/Resnovas/Eventiva/commit/5e391211a8783fa250eb561280763b3dd244ea3d); GitHub signature verification is valid. Other signed commits: [source snapshot e735cba3](https://github.com/Resnovas/Eventiva/commit/e735cba3b8e18eea47e37ab8e7237a1c31c9ad0e), [subtree import 9b745ff4](https://github.com/Resnovas/Eventiva/commit/9b745ff4ff9c5ed5714923cc6b887bc8ae59f85c), [isolation/provenance 927e6a25](https://github.com/Resnovas/Eventiva/commit/927e6a25464964bb5d911e05b0a478bfd20040ac).

The exact coding-preferences vendoring rule is "Vendor external repositories into the project using Git subtree under externals/." Effect separately requires stable and main copies. The subtree contains 45 pinned source entries: 32,662 files and 289,509,098 source bytes. Effect 3.22.4 and main are complete repositories; oversized monorepos retain complete selected implementation/package source trees, not npm artifacts. Matching runtime SDKs, UI stack, compiler, build/test tools and pg 8.23.1 are included. externals/README.md lists every module/version, scope and update procedure. tools/references/catalog.json and externals/upstream/sources.json record upstream URL/tag/commit, original Git identities, licenses and retained notices (MIT/Apache-2.0 summaries; nested licenses preserved).

The generated @expo/metro@56.0.2 wrapper has no accessible public repository/gitHead and is documented under the rule's exception; its actual Metro 0.84.5 implementation dependencies are included instead. No approximate version or compiled npm source substitute was used.

PNPM/Nx/lint/format/Docker/Graphify exclusions plus compiler-resolved runtime/type import rejection keep the trees reference-only. Guards verify bytes/modes, licenses, symlink containment, catalog scope, size and release/dependency pins. Lockfile and runtime dependency versions are unchanged.

Checks passed: pnpm install --frozen-lockfile; node --run check; node --run verify (85 lint/typecheck/test/build/parity tasks and server/web/Android smoke/export); node --test tools/resources/boundaries.test.mjs tools/resources/types.test.mjs tools/references/check.test.mjs (98/98); pnpm nx sync:check; sh tools/graphify/graphify check (matches committed code); git verify-commit on all four commits. Nx 32 projects and PNPM 29 packages are unchanged. Before/after validation confirmed old main accepted the reference import and the new boundary rejects it. The graph was regenerated from a clean archive after incremental output missed four reference nodes.

[CI is running](https://github.com/Resnovas/Eventiva/actions/runs/43843519159), subscribed for the exact head. No production, deployment, billing, provisioning, settings or dependency upgrades were performed. No product/design blocker; feature work stays separate until prerequisite CI completes. GitHub's push warning reports 401 advisories (13 critical), but alert listing is denied (403), so manifest scope/runtime relevance remains unverified. No security upgrade or alert dismissal was attempted.


### Comment 8b38cd05-d23f-4c0e-bc67-41f546feb542

Author: jonathan@resnovas.com. Created: 2026-11-16T10:27:52.578Z; updated: 2026-11-16T10:27:52.524Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: d13959b5-66e4-4ab5-b03c-ae59f4c1dd72. Resolved: Not recorded.

Agent update (Amp, OpenAI GPT-6.1 Sol): the original source-reference head's application CI passed unchanged on attempt 2; the existing telemetry subprocess timeout did not recur. A separate house CodeQL job extracted externals/upstream files and hit its 30-minute limit. I fixed that import-related isolation gap in [8334eaba15e687d8756e232de4a952182622790b](https://github.com/Resnovas/Eventiva/commit/8334eaba15e687d8756e232de4a952182622790b), now verified as remote main.

The repository-owned CodeQL config now excludes only externals/**; active source and all security query suites remain enabled. The reference gate requires the exclusion, with a regression that failed before the fix and passed after it. Passed: node --run check; node --test tools/resources/boundaries.test.mjs tools/resources/types.test.mjs tools/references/check.test.mjs (99/99); changed-file Prettier checks; sh tools/graphify/graphify check. Graph topology was unchanged. Commit is signed with the standing human identity/sign-off and AI credit.

Exact-head CI is subscribed and pending. No settings, production, deployment, billing or dependency versions changed. Feature implementation remains paused. Full 45-entry source/provenance/license inventory and evidence: https://ampcode.com/artifacts/upstream-source-audit-ff13edc5-5716-4a8e-a05d-eefa8a6df802


### Comment b5880b5e-b214-4476-93f9-69e0a9c8c07d

Author: jonathan@resnovas.com. Created: 2026-11-16T10:38:47.500Z; updated: 2026-11-16T10:38:47.454Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and) (comment ID above). Parent: d13959b5-66e4-4ab5-b03c-ae59f4c1dd72. Resolved: Not recorded.

Agent completion update (Amp, OpenAI GPT-6.1 Sol): source-reference prerequisite delivered at verified remote main [8334eaba15e687d8756e232de4a952182622790b](https://github.com/Resnovas/Eventiva/commit/8334eaba15e687d8756e232de4a952182622790b). [Application CI attempt 2](https://github.com/Resnovas/Eventiva/actions/runs/43848902229) passed verify, smoke and application check on unchanged code. [House CodeQL](https://github.com/Resnovas/Eventiva/actions/runs/43848902184) passed source analysis in 81 seconds and passed Actions analysis, verifying the reference-exclusion fix. House check, smartcloud, workflow lint, Graphify refresh and scorecard also passed. Separate non-gating Code Quality analysis remains in progress under the existing EVE-248 exception; I am not claiming all advisory checks finished.

Five signed commits deliver 45 pinned source entries (32,662 files; 289,509,098 source bytes), both complete Effect snapshots, complete declared oversized-monorepo implementation scopes, original licenses/notices, immutable provenance, update instructions and executable isolation/source-identity guards. Full inventory, exact versions/upstream commits/licenses, scope exceptions, five delivery hashes and executed validation: https://ampcode.com/artifacts/upstream-source-audit-ff13edc5-5716-4a8e-a05d-eefa8a6df802 .

No runtime versions, lockfile, production, deployments, billing or shared settings changed. Existing intermittent telemetry bootstrap timeout remains unproven, with same-head passing CI and 150 successful targeted local launches; no assertions or timeouts weakened. GitHub advisory scope remains inaccessible (403). No product/design blocker remains for the source prerequisite. Roadmap/dependencies will be rechecked before choosing the next implementation.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
