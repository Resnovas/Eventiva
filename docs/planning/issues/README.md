<!-- linear:generated:start -->
# EVE issue mirror

[Planning authority and refresh rules](../README.md) | [Human-maintained timeline and Mermaid roadmap](../timeline.md)

Generated from the owner-authorized normalized snapshot in `tools/documentation/linear-snapshot.json`. Linear is the live issue/status source. Repository Markdown is a durable implementation mirror, not independent approval.

## Completeness

Captured 2026-11-17. 258 unique EVE issues including archived items, 258 per-issue pages, 587 comments. Full pagination (250/page, creation order) and an independent enumeration (100/page, update order) reached terminal pages and returned identical ID sets. SHA-256 of numerically ordered IDs: `63c82c8d548871ac91ee60e593c440e111dafee1b4fe14376db29fff08b3e0ee`. This proves completeness for the connected key's visible EVE set, not administrator-only/deleted issues the service cannot expose.

Metadata/relations unavailable: none in this snapshot. Descriptions and comments are mirrored under Jonathan's explicit publication instruction on 2026-11-17. There is no independent server total endpoint in the connected MCP schema; two full enumerations provide the count cross-check. Live changes during acquisition can require a retry; this is not an atomic Linear snapshot.

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Delivery status

- Backlog: 220
- Done: 19
- Duplicate: 2
- In Progress: 17

Done means Linear's recorded state, not renewed release approval. In Progress/started issues are current; Backlog/unstarted issues are upcoming; canceled/duplicate records remain visible rather than being silently dropped.

## Eventiva platform foundations

| Issue | Title | Status | Priority | Blocked by |
| --- | --- | --- | --- | --- |
| [EVE-13](EVE-13.md) | Establish modular core foundations for database adapters, Expo and observability | In Progress | 0 | None recorded |
| [EVE-14](EVE-14.md) | S1: Prove one Effect action serves UI, MCP and AI SDK from one inventory entry | Done | 0 | None recorded |
| [EVE-15](EVE-15.md) | S2: Build the upstream Agent-Native capability map and protocol conformance matrix | Done | 0 | None recorded |
| [EVE-16](EVE-16.md) | S3: Prove runtime loading and switching of a remote module on Expo web and Android | In Progress | 0 | None recorded |
| [EVE-17](EVE-17.md) | S4: Choose the offline sync engine for record edits and live text and canvas editing | Done | 0 | None recorded |
| [EVE-18](EVE-18.md) | S5: Verify sharding across two independent runners with drain and runner-loss recovery | Done | 0 | None recorded |
| [EVE-19](EVE-19.md) | S6: Map PostHog and OpenTelemetry support across web, native and backend | Done | 0 | None recorded |
| [EVE-20](EVE-20.md) | S7: Find which AI providers allow users to bring their own subscription to Eventiva | Done | 0 | None recorded |
| [EVE-21](EVE-21.md) | Remove Sentry from core and make telemetry export vendor-neutral | Backlog | 0 | None recorded |
| [EVE-22](EVE-22.md) | Correct boundary docs to match lint, use colon tags, and fix the house reference | Backlog | 0 | None recorded |
| [EVE-23](EVE-23.md) | Split core into portable contracts and backend runtime, with a shared schema package | Done | 0 | None recorded |
| [EVE-24](EVE-24.md) | Port notifications, messaging channels and transactional email | Backlog | 0 | None recorded |
| [EVE-25](EVE-25.md) | Port files, private attachments, artifacts and document import | Backlog | 0 | None recorded |
| [EVE-26](EVE-26.md) | Port search and embeddings across every resource | Backlog | 0 | None recorded |
| [EVE-27](EVE-27.md) | Port comments, mentions and review suggestions on any resource | Backlog | 0 | None recorded |
| [EVE-28](EVE-28.md) | Port localization for people and for the agent | In Progress | 0 | None recorded |
| [EVE-29](EVE-29.md) | Port agent evaluations linked to PostHog datasets | Backlog | 0 | None recorded |
| [EVE-30](EVE-30.md) | Port data widgets, saved dashboards and brand kits | Backlog | 0 | None recorded |
| [EVE-31](EVE-31.md) | Port voice input and transcription for the agent | Backlog | 0 | None recorded |
| [EVE-32](EVE-32.md) | Port settings, profiles, navigation, command menu and onboarding | Backlog | 0 | None recorded |
| [EVE-33](EVE-33.md) | Port scheduling primitives for availability, bookings and rosters | Backlog | 0 | None recorded |
| [EVE-34](EVE-34.md) | Agent runs restart from scratch when their shard moves | Backlog | 0 | None recorded |
| [EVE-35](EVE-35.md) | Keep a long agent run from blocking its entity's other messages | Backlog | 0 | None recorded |
| [EVE-36](EVE-36.md) | Stream agent output from a durable log, not volatile RPCs | Backlog | 0 | None recorded |
| [EVE-37](EVE-37.md) | Remove the shard-manager process that owns shards with no entities | Backlog | 0 | None recorded |
| [EVE-38](EVE-38.md) | Cut runner-loss failover from 36s and expose the cluster settings in config | Backlog | 0 | None recorded |
| [EVE-39](EVE-39.md) | Make every entity action idempotent and persisted by default | Backlog | 0 | None recorded |
| [EVE-40](EVE-40.md) | P1.1 Build the action contract and inventory in Effect Schema | Done | 0 | [EVE-14](EVE-14.md), [EVE-23](EVE-23.md) |
| [EVE-41](EVE-41.md) | P1.2 Build app config, settings, secrets and credentials | In Progress | 0 | None recorded |
| [EVE-42](EVE-42.md) | P1.3 Build the storage layer: Drizzle on Postgres and SQLite, state machines and tenant guards | In Progress | 0 | [EVE-23](EVE-23.md) |
| [EVE-43](EVE-43.md) | P1.4 Build identity and access: orgs, authorization, user profiles and audit | In Progress | 1 | None recorded |
| [EVE-44](EVE-44.md) | P1.5 Build telemetry: OpenTelemetry spans on every call and a vendor-neutral tracking port | In Progress | 0 | [EVE-19](EVE-19.md), [EVE-21](EVE-21.md) |
| [EVE-45](EVE-45.md) | P1.6 Build the change flow: domain events and a durable resource change feed | In Progress | 0 | None recorded |
| [EVE-46](EVE-46.md) | P1.7 Build the HTTP API, streaming and the typed client from the action inventory | Backlog | 0 | None recorded |
| [EVE-47](EVE-47.md) | P1.8 Build the agent: loop, engines, durable runs, threads and harness | Backlog | 0 | [EVE-14](EVE-14.md) |
| [EVE-48](EVE-48.md) | P1.9 Build inbound MCP from the action inventory | Backlog | 0 | None recorded |
| [EVE-49](EVE-49.md) | P1.10 Build inbound ACP so editors can drive Eventiva's agent | Backlog | 0 | None recorded |
| [EVE-50](EVE-50.md) | P1.11 Build screen awareness: app state, navigation and the screen registry on React Native | In Progress | 0 | [EVE-16](EVE-16.md) |
| [EVE-51](EVE-51.md) | P1.12 Build collaboration: Yjs for text and canvas with record sync and authorization at sync | Backlog | 0 | [EVE-17](EVE-17.md) |
| [EVE-52](EVE-52.md) | P1.8a Build the agent turn loop with actions as tools | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md) |
| [EVE-53](EVE-53.md) | P1.8b Build model engines, model selection and user-owned subscriptions | Backlog | 0 | [EVE-20](EVE-20.md), [EVE-41](EVE-41.md) |
| [EVE-54](EVE-54.md) | P1.8c Build durable agent runs on Effect Cluster and Workflow | Backlog | 0 | [EVE-18](EVE-18.md), [EVE-42](EVE-42.md) |
| [EVE-55](EVE-55.md) | P1.8d Build chat threads and message projections | Backlog | 0 | [EVE-42](EVE-42.md), [EVE-45](EVE-45.md) |
| [EVE-56](EVE-56.md) | P1.8e Build the agent harness: outbound ACP, agent memory and context inspection | Backlog | 0 | [EVE-40](EVE-40.md) |
| [EVE-57](EVE-57.md) | Telemetry F1: Spike Effect OTLP export of traces and metrics from Expo on Hermes | Backlog | 0 | None recorded |
| [EVE-58](EVE-58.md) | Telemetry F2: Smoke test PostHog OTLP endpoints and auth for logs, traces, metrics and AI spans | Backlog | 0 | None recorded |
| [EVE-59](EVE-59.md) | Telemetry F3: Implement Early Access enrollment on native and server through the Flags service | Backlog | 0 | None recorded |
| [EVE-60](EVE-60.md) | Telemetry F4: Propagate session and person context from clients into server spans, logs, errors and AI spans | Backlog | 0 | None recorded |
| [EVE-240](EVE-240.md) | S4 follow-up: run the PowerSync and Yjs device test on iOS | Backlog | 0 | None recorded |
| [EVE-241](EVE-241.md) | Add social publishing, shared inbox, and analytics suite | Done | 0 | None recorded |
| [EVE-242](EVE-242.md) | Archive the manual pre-Amp packages and create a clean package tree | Done | 0 | None recorded |
| [EVE-243](EVE-243.md) | Fully enrol Eventiva in Smartcloud house synchronization | Done | 0 | [EVE-242](EVE-242.md) |
| [EVE-244](EVE-244.md) | Scaffold the fresh Nx, Expo, Effect and testing foundation | Done | 0 | [EVE-243](EVE-243.md) |
| [EVE-248](EVE-248.md) | Revisit and remove Eventiva's temporary house AI-gate override | Backlog | 0 | None recorded |
| [EVE-249](EVE-249.md) | Rebase investor tests into production and merge changes | Done | 0 | None recorded |
| [EVE-253](EVE-253.md) | Build shared guided SOP procedures and governed step execution | Backlog | 2 | None recorded |
| [EVE-257](EVE-257.md) | Implement the composable module kernel and safe lifecycle/provider contracts | In Progress | 1 | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md) |
| [EVE-258](EVE-258.md) | Add the database-neutral Resources API and privileged tenant migration adapter | In Progress | 1 | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md) |
| [EVE-259](EVE-259.md) | Implement the initial declarative UI module registry over approved native components | In Progress | 2 | [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-257](EVE-257.md) |
| [EVE-260](EVE-260.md) | Build the clean word-art reference extension after verified platform readiness | Backlog | 2 | [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-50](EVE-50.md), [EVE-257](EVE-257.md), [EVE-258](EVE-258.md), [EVE-259](EVE-259.md) |
| [EVE-261](EVE-261.md) | Integrate the modular platform and prove every owner-required acceptance gate | In Progress | 1 | [EVE-41](EVE-41.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-251](EVE-251.md), [EVE-252](EVE-252.md), [EVE-257](EVE-257.md), [EVE-258](EVE-258.md), [EVE-259](EVE-259.md), [EVE-260](EVE-260.md), [EVE-262](EVE-262.md), [EVE-263](EVE-263.md) |
| [EVE-262](EVE-262.md) | Implement governed observation-only execution and lifecycle hooks with protected event gateway | Backlog | 2 | [EVE-257](EVE-257.md), [EVE-258](EVE-258.md) |
| [EVE-263](EVE-263.md) | Enforce acyclic module/dependency graphs and exact Effect-TS types across the extension platform | Backlog | 2 | None recorded |
| [EVE-264](EVE-264.md) | Rename the top-level Examples directory to lowercase examples | In Progress | 3 | None recorded |

## Eventiva product features

| Issue | Title | Status | Priority | Blocked by |
| --- | --- | --- | --- | --- |
| [EVE-61](EVE-61.md) | F12 Payroll: pay staff and crew from rosters and approved timesheets | Backlog | 0 | None recorded |
| [EVE-62](EVE-62.md) | F3 Tasks: task lists, assignments, dependencies and checklists per event | Backlog | 0 | None recorded |
| [EVE-63](EVE-63.md) | F6 Warehousing and inventory: equipment, stock, availability, purchasing and maintenance | Backlog | 0 | None recorded |
| [EVE-64](EVE-64.md) | F3.1 Build task lists and tasks as synced records with actions | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-51](EVE-51.md) |
| [EVE-65](EVE-65.md) | F4 Contacts and CRM: people, organisations, relationships and history | Backlog | 0 | None recorded |
| [EVE-66](EVE-66.md) | F5 Directory and marketplace: vendor, venue and professional listings, search, enquiries, quotes and reviews | Backlog | 0 | None recorded |
| [EVE-67](EVE-67.md) | F2 Scheduling and rosters: crew availability, shifts, offers, call sheets and timesheets | Backlog | 0 | None recorded |
| [EVE-68](EVE-68.md) | F4.1 Build people, organisations and contact points as CRM actions | Backlog | 0 | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| [EVE-69](EVE-69.md) | F11 Accounting: ledgers, invoices, bills, event budgets and tax | Backlog | 3 | None recorded |
| [EVE-70](EVE-70.md) | F3.2 Build checklists with photo evidence and sign-off that work offline on site | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-43](EVE-43.md), [EVE-64](EVE-64.md) |
| [EVE-71](EVE-71.md) | F7 Fleet and live operations: vehicles, maintenance, units, dispatch and crew MDT | Backlog | 0 | None recorded |
| [EVE-72](EVE-72.md) | F3.3 Build subtasks and finish-to-start dependencies with blocker queries | Backlog | 0 | [EVE-64](EVE-64.md) |
| [EVE-73](EVE-73.md) | F1 Events and production planning: the event record, run of show, departments, cues and show control | Backlog | 0 | None recorded |
| [EVE-74](EVE-74.md) | F11.1 Build the ledger port, chart of accounts, journals and periods | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md) |
| [EVE-75](EVE-75.md) | F5.1 Build the listing model, category taxonomy and listing actions | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| [EVE-76](EVE-76.md) | F8 Ticketing: ticket types, capacity, issuance, admissions and scanning | Backlog | 0 | None recorded |
| [EVE-77](EVE-77.md) | F5.2 Build the listing editor screens for vendors, venues and professionals | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-50](EVE-50.md), [EVE-75](EVE-75.md) |
| [EVE-78](EVE-78.md) | F5.3 Build business verification, publishing and content moderation | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-43](EVE-43.md), [EVE-75](EVE-75.md) |
| [EVE-79](EVE-79.md) | F5.4 Build directory search, filters, geo radius and transparent ranking | Backlog | 0 | [EVE-26](EVE-26.md), [EVE-45](EVE-45.md), [EVE-75](EVE-75.md) |
| [EVE-80](EVE-80.md) | F13 Human resources: worker records, onboarding, qualifications and leave | Backlog | 0 | None recorded |
| [EVE-81](EVE-81.md) | F6.1 Build the equipment catalogue: products, tracking modes and kits | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-50](EVE-50.md) |
| [EVE-82](EVE-82.md) | F12.1 Build pay rules, rate cards and pay profiles | Backlog | 0 | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| [EVE-83](EVE-83.md) | F12.2 Build time capture: clock in and out and time entries, offline | Duplicate | 0 | None recorded |
| [EVE-84](EVE-84.md) | F3.4 Build event-relative due dates, task templates and reschedule cascade | Backlog | 0 | [EVE-64](EVE-64.md), [EVE-72](EVE-72.md) |
| [EVE-85](EVE-85.md) | F12.3 Build timesheets: draft from roster, submit and approve | Duplicate | 0 | None recorded |
| [EVE-86](EVE-86.md) | F3.5 Build the task screens with screen projections on web and mobile | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-27](EVE-27.md), [EVE-50](EVE-50.md), [EVE-64](EVE-64.md), [EVE-70](EVE-70.md), [EVE-72](EVE-72.md) |
| [EVE-87](EVE-87.md) | F12.4 Build pay run calculation on durable runs | Backlog | 0 | [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-54](EVE-54.md), [EVE-82](EVE-82.md) |
| [EVE-88](EVE-88.md) | F12.5 Build the payroll provider port and the first adapter | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-87](EVE-87.md) |
| [EVE-89](EVE-89.md) | F3.6 Build task reminders, watchers and notifications | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-64](EVE-64.md) |
| [EVE-90](EVE-90.md) | F11.2 Build posting rules that turn sales, stock and payroll events into journals | Backlog | 0 | [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-74](EVE-74.md) |
| [EVE-91](EVE-91.md) | F4.2 Link contacts to events with roles and to each other with relationships | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-68](EVE-68.md) |
| [EVE-92](EVE-92.md) | F12.6 Build freelancer self-billing and worker status records | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-43](EVE-43.md), [EVE-87](EVE-87.md) |
| [EVE-93](EVE-93.md) | F3.7 Build recurring tasks on the shared scheduling rules | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-64](EVE-64.md) |
| [EVE-94](EVE-94.md) | F7.1 Build the vehicle register: vehicles, types and documents | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-50](EVE-50.md) |
| [EVE-95](EVE-95.md) | F4.3 Build the activity timeline: interactions, notes and history from other sets | Backlog | 0 | [EVE-45](EVE-45.md), [EVE-51](EVE-51.md), [EVE-68](EVE-68.md) |
| [EVE-96](EVE-96.md) | F12.7 Build the payments file and the pay run events for accounting | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-88](EVE-88.md), [EVE-92](EVE-92.md) |
| [EVE-97](EVE-97.md) | F7.2 Build driver eligibility checks from staff qualifications | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-154](EVE-154.md) |
| [EVE-98](EVE-98.md) | F13.1 Build worker records, engagements and organisation structure | Backlog | 0 | [EVE-23](EVE-23.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| [EVE-99](EVE-99.md) | F4.4 Find and merge duplicate contacts, and import and export them | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-54](EVE-54.md), [EVE-68](EVE-68.md) |
| [EVE-100](EVE-100.md) | F7.3 Build vehicle bookings and allocation to events without clashes | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-45](EVE-45.md) |
| [EVE-101](EVE-101.md) | F12.8 Build labour cost reporting per event and phase | Backlog | 0 | [EVE-30](EVE-30.md), [EVE-40](EVE-40.md), [EVE-50](EVE-50.md), [EVE-87](EVE-87.md) |
| [EVE-102](EVE-102.md) | F4.5 Organise contacts with tags, lists and smart lists | Backlog | 0 | [EVE-68](EVE-68.md), [EVE-105](EVE-105.md) |
| [EVE-103](EVE-103.md) | F6.2 Build locations and the append-only stock movement ledger | Backlog | 0 | [EVE-39](EVE-39.md), [EVE-42](EVE-42.md), [EVE-45](EVE-45.md), [EVE-51](EVE-51.md), [EVE-81](EVE-81.md) |
| [EVE-104](EVE-104.md) | F12.9 Build the payroll agent: explanations, anomaly suggestions and approval gates | Backlog | 0 | [EVE-29](EVE-29.md), [EVE-50](EVE-50.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-96](EVE-96.md), [EVE-101](EVE-101.md) |
| [EVE-105](EVE-105.md) | F4.8 Record consent and fulfil privacy requests for contacts | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-43](EVE-43.md), [EVE-54](EVE-54.md), [EVE-68](EVE-68.md), [EVE-99](EVE-99.md) |
| [EVE-106](EVE-106.md) | F7.4 Build offline walkaround inspections and defect reporting | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-50](EVE-50.md) |
| [EVE-107](EVE-107.md) | F9 Online and in-person sales: storefront, point of sale, orders, payments, fulfilment and refunds | Backlog | 0 | None recorded |
| [EVE-108](EVE-108.md) | F10 Interactive site maps | Backlog | 0 | None recorded |
| [EVE-109](EVE-109.md) | F3.8 Build guest assignees so vendors and freelancers see only their tasks | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-43](EVE-43.md), [EVE-51](EVE-51.md), [EVE-64](EVE-64.md) |
| [EVE-110](EVE-110.md) | F3.9 Build agent behaviour for tasks: planning, blockers, digests and rescheduling | Backlog | 0 | [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-64](EVE-64.md), [EVE-72](EVE-72.md), [EVE-84](EVE-84.md), [EVE-86](EVE-86.md) |
| [EVE-111](EVE-111.md) | F14: Website builder and in-app customisation | Backlog | 0 | None recorded |
| [EVE-112](EVE-112.md) | F8.1 Build the ticket catalogue: ticket types, capacity pools, sales windows and access codes | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-50](EVE-50.md) |
| [EVE-113](EVE-113.md) | F5.5 Build the public directory web section for anonymous visitors and search engines | Backlog | 0 | [EVE-46](EVE-46.md), [EVE-78](EVE-78.md), [EVE-79](EVE-79.md) |
| [EVE-114](EVE-114.md) | F8.2 Build the capacity engine: oversell-proof holds on a cluster entity per pool | Backlog | 0 | [EVE-38](EVE-38.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-112](EVE-112.md) |
| [EVE-115](EVE-115.md) | F5.6 Build shortlists of suppliers per event | Backlog | 0 | [EVE-50](EVE-50.md), [EVE-79](EVE-79.md) |
| [EVE-116](EVE-116.md) | F13.2 Build the sensitive profile with field masking, reveal audit and retention | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-41](EVE-41.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-50](EVE-50.md), [EVE-56](EVE-56.md), [EVE-98](EVE-98.md) |
| [EVE-117](EVE-117.md) | F8.3 Build ticket issuance and delivery: signed tickets from paid orders, comps, voids and reissue | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-41](EVE-41.md), [EVE-45](EVE-45.md), [EVE-114](EVE-114.md) |
| [EVE-118](EVE-118.md) | F6.3 Build the serialised asset register, containers and labels | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-103](EVE-103.md) |
| [EVE-119](EVE-119.md) | F5.7 Build cross-tenant enquiries (RFPs) and private message threads | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-75](EVE-75.md) |
| [EVE-120](EVE-120.md) | F10.0 Spike: map engine with offline tiles and Yjs-bound editing on Expo web and Android | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-17](EVE-17.md) |
| [EVE-121](EVE-121.md) | F13.3 Build HR documents, templates and built-in e-signature | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-43](EVE-43.md), [EVE-51](EVE-51.md), [EVE-98](EVE-98.md) |
| [EVE-122](EVE-122.md) | F8.4 Build the attendee view: my tickets, holder details and transfers in the one app | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-117](EVE-117.md) |
| [EVE-123](EVE-123.md) | F6.4 Build availability and reservations against events, carts and production plans | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-73](EVE-73.md), [EVE-103](EVE-103.md) |
| [EVE-124](EVE-124.md) | F5.8 Build quotes, quote comparison and the acceptance handoff to the event | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-54](EVE-54.md), [EVE-119](EVE-119.md) |
| [EVE-125](EVE-125.md) | F11.3 Build event dimensions, budgets and budget vs actual | Backlog | 0 | [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-74](EVE-74.md) |
| [EVE-126](EVE-126.md) | F11.4 Build sales invoices, credit notes and receivables | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-46](EVE-46.md), [EVE-74](EVE-74.md), [EVE-90](EVE-90.md) |
| [EVE-127](EVE-127.md) | F11.5 Build bills, expense claims, approvals and payables | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-43](EVE-43.md), [EVE-52](EVE-52.md), [EVE-53](EVE-53.md), [EVE-74](EVE-74.md), [EVE-90](EVE-90.md) |
| [EVE-128](EVE-128.md) | F2.1 Build crew profiles, roles and availability | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| [EVE-129](EVE-129.md) | F2.2 Build crew requirements and shifts on events | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-45](EVE-45.md), [EVE-73](EVE-73.md), [EVE-128](EVE-128.md) |
| [EVE-130](EVE-130.md) | F2.3 Build working-time rules and conflict checks | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-128](EVE-128.md), [EVE-129](EVE-129.md) |
| [EVE-131](EVE-131.md) | F2.4 Build assignments, offers and roster confirmation | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-129](EVE-129.md), [EVE-130](EVE-130.md) |
| [EVE-132](EVE-132.md) | F2.5 Build external crew access and offer links | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-46](EVE-46.md), [EVE-131](EVE-131.md) |
| [EVE-133](EVE-133.md) | F14.1 Custom fields on any entity, in the action inventory | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-51](EVE-51.md) |
| [EVE-134](EVE-134.md) | F2.6 Build the roster board and event staffing screens | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-131](EVE-131.md) |
| [EVE-135](EVE-135.md) | F2.7 Build call sheets | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-51](EVE-51.md), [EVE-73](EVE-73.md), [EVE-131](EVE-131.md) |
| [EVE-136](EVE-136.md) | F2.8 Build open shifts and shift swaps | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-42](EVE-42.md), [EVE-130](EVE-130.md), [EVE-131](EVE-131.md) |
| [EVE-137](EVE-137.md) | F4.6 Capture enquiries and track opportunities through a pipeline into events | Backlog | 0 | [EVE-91](EVE-91.md), [EVE-95](EVE-95.md) |
| [EVE-138](EVE-138.md) | F2.9 Build time capture and timesheets | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-82](EVE-82.md), [EVE-131](EVE-131.md) |
| [EVE-139](EVE-139.md) | F4.7 Sync mailbox and calendar history into the contact timeline | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-54](EVE-54.md), [EVE-95](EVE-95.md) |
| [EVE-140](EVE-140.md) | F2.10 Build personal calendar feeds | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-46](EVE-46.md), [EVE-131](EVE-131.md) |
| [EVE-141](EVE-141.md) | F4.9 Let external contacts manage their own details and consent in a portal | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-105](EVE-105.md) |
| [EVE-142](EVE-142.md) | F2.11 Build auto-roster proposals and agent staffing | Backlog | 0 | [EVE-35](EVE-35.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-130](EVE-130.md), [EVE-131](EVE-131.md) |
| [EVE-143](EVE-143.md) | F7.5 Build maintenance schedules, work orders, fuel, mileage and cost export | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-54](EVE-54.md) |
| [EVE-144](EVE-144.md) | F4.10 Give the agent CRM skills: summaries, follow-up suggestions and health checks | Backlog | 0 | [EVE-52](EVE-52.md), [EVE-95](EVE-95.md), [EVE-99](EVE-99.md) |
| [EVE-145](EVE-145.md) | F7.6 Build units and operational status with an ordered offline queue | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-45](EVE-45.md), [EVE-54](EVE-54.md) |
| [EVE-146](EVE-146.md) | F10.1 Sites, levels, base layers and calibration | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-120](EVE-120.md) |
| [EVE-147](EVE-147.md) | F7.7 Build the incident control log and dispatch for live events | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-54](EVE-54.md) |
| [EVE-148](EVE-148.md) | F7.8 Build crew MDT mode in the one app | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-32](EVE-32.md), [EVE-50](EVE-50.md) |
| [EVE-149](EVE-149.md) | F6.5 Build prep, pick lists and offline scan out and scan in | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-118](EVE-118.md), [EVE-123](EVE-123.md) |
| [EVE-150](EVE-150.md) | F6.6 Build discrepancies, damage reports and asset quarantine | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-27](EVE-27.md), [EVE-103](EVE-103.md), [EVE-118](EVE-118.md) |
| [EVE-151](EVE-151.md) | F6.7 Build maintenance, repairs and safety inspections for lifting and electrical equipment | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-41](EVE-41.md), [EVE-118](EVE-118.md) |
| [EVE-152](EVE-152.md) | F10.2 Site maps and layers as Yjs documents with a feature record mirror | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-51](EVE-51.md), [EVE-146](EVE-146.md) |
| [EVE-153](EVE-153.md) | F13.4 Build onboarding and offboarding runs | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-43](EVE-43.md), [EVE-54](EVE-54.md), [EVE-98](EVE-98.md), [EVE-121](EVE-121.md) |
| [EVE-154](EVE-154.md) | F13.5 Build qualifications, requirements and the eligibility check | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-25](EVE-25.md), [EVE-33](EVE-33.md), [EVE-45](EVE-45.md), [EVE-98](EVE-98.md) |
| [EVE-155](EVE-155.md) | F14.2 Custom record types | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-133](EVE-133.md) |
| [EVE-156](EVE-156.md) | F13.6 Build right-to-work and background check records | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-54](EVE-54.md), [EVE-98](EVE-98.md), [EVE-116](EVE-116.md) |
| [EVE-157](EVE-157.md) | F11.6 Build bank import, feeds, matching and reconciliation | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-74](EVE-74.md), [EVE-126](EVE-126.md), [EVE-127](EVE-127.md) |
| [EVE-158](EVE-158.md) | F11.7 Build VAT codes, VAT returns and MTD submission | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-43](EVE-43.md), [EVE-74](EVE-74.md) |
| [EVE-159](EVE-159.md) | F11.8 Build financial reports, event P and L and exports | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-30](EVE-30.md), [EVE-74](EVE-74.md), [EVE-125](EVE-125.md) |
| [EVE-160](EVE-160.md) | F11.9 Build period close, year end and ledger migration export | Backlog | 0 | [EVE-74](EVE-74.md), [EVE-90](EVE-90.md) |
| [EVE-161](EVE-161.md) | F5.9 Build availability signals on listings from the vendor's own calendar | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-75](EVE-75.md) |
| [EVE-162](EVE-162.md) | F8.5 Build check-in lists and online scanning in the app | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-46](EVE-46.md), [EVE-50](EVE-50.md), [EVE-117](EVE-117.md) |
| [EVE-163](EVE-163.md) | F5.10 Build verified reviews, vendor responses and review moderation | Backlog | 0 | [EVE-78](EVE-78.md), [EVE-124](EVE-124.md) |
| [EVE-164](EVE-164.md) | F5.11 Build listing insights for vendors | Backlog | 0 | [EVE-30](EVE-30.md), [EVE-44](EVE-44.md), [EVE-79](EVE-79.md), [EVE-119](EVE-119.md), [EVE-124](EVE-124.md) |
| [EVE-165](EVE-165.md) | F5.12 Build agent sourcing for organisers and quote drafting for vendors | Backlog | 0 | [EVE-29](EVE-29.md), [EVE-48](EVE-48.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-79](EVE-79.md), [EVE-115](EVE-115.md), [EVE-119](EVE-119.md), [EVE-124](EVE-124.md), [EVE-161](EVE-161.md) |
| [EVE-166](EVE-166.md) | F1.1 Build the event record: Event, EventSeries, Phase, Space, team and departments | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md) |
| [EVE-167](EVE-167.md) | F1.2 Build production documents and riders as collaborative documents on the event | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-27](EVE-27.md), [EVE-43](EVE-43.md), [EVE-51](EVE-51.md), [EVE-166](EVE-166.md) |
| [EVE-168](EVE-168.md) | F14.3 Views: generated screens and patches over base screens | Backlog | 0 | [EVE-32](EVE-32.md), [EVE-50](EVE-50.md), [EVE-133](EVE-133.md) |
| [EVE-169](EVE-169.md) | F1.3 Build the run of show: segments, fixed and relative timing, department columns and publishing | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-45](EVE-45.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-166](EVE-166.md) |
| [EVE-170](EVE-170.md) | F9.1 Build money, tax categories and the sales catalogue | Backlog | 0 | [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md) |
| [EVE-171](EVE-171.md) | F1.4 Build itineraries: per-person and per-group schedules generated from the event and published | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-33](EVE-33.md), [EVE-43](EVE-43.md), [EVE-129](EVE-129.md), [EVE-166](EVE-166.md), [EVE-169](EVE-169.md) |
| [EVE-172](EVE-172.md) | F9.2 Build carts, orders and the line provider contract | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-45](EVE-45.md), [EVE-170](EVE-170.md) |
| [EVE-173](EVE-173.md) | F1.5 Build department cue lists with numbering, segment links and console exports | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-40](EVE-40.md), [EVE-51](EVE-51.md), [EVE-166](EVE-166.md), [EVE-169](EVE-169.md) |
| [EVE-174](EVE-174.md) | F9.3 Build the payment gateway port and online card payments | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-172](EVE-172.md) |
| [EVE-175](EVE-175.md) | F9.4 Build the online storefront and checkout | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-28](EVE-28.md), [EVE-46](EVE-46.md), [EVE-50](EVE-50.md), [EVE-174](EVE-174.md) |
| [EVE-176](EVE-176.md) | F9.5 Build the point of sale register, cash sessions and offline sales | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-43](EVE-43.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-172](EVE-172.md) |
| [EVE-177](EVE-177.md) | F7.9 Build control and crew messaging with acknowledgement | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-40](EVE-40.md), [EVE-54](EVE-54.md) |
| [EVE-178](EVE-178.md) | F10.3 Map editor screen with screen awareness | Backlog | 0 | [EVE-50](EVE-50.md), [EVE-152](EVE-152.md) |
| [EVE-179](EVE-179.md) | F13.7 Build leave policies, the leave ledger, requests and absence | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-24](EVE-24.md), [EVE-33](EVE-33.md), [EVE-43](EVE-43.md), [EVE-98](EVE-98.md) |
| [EVE-180](EVE-180.md) | F10.4 Symbol library and linked placements | Backlog | 0 | [EVE-152](EVE-152.md) |
| [EVE-181](EVE-181.md) | F7.10 Build live unit positions on the event map with consent and retention | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-54](EVE-54.md), [EVE-152](EVE-152.md) |
| [EVE-182](EVE-182.md) | F13.8 Build self-service and the offline site check screens | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-32](EVE-32.md), [EVE-50](EVE-50.md), [EVE-153](EVE-153.md), [EVE-154](EVE-154.md), [EVE-179](EVE-179.md) |
| [EVE-183](EVE-183.md) | F10.5 Measurements, zones, routes and rule checks | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-152](EVE-152.md), [EVE-238](EVE-238.md) |
| [EVE-184](EVE-184.md) | F7.11 Define the telematics port with a test adapter | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-41](EVE-41.md) |
| [EVE-185](EVE-185.md) | F14.4 Change sets: draft, preview, publish, rollback and packages | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-133](EVE-133.md), [EVE-155](EVE-155.md), [EVE-168](EVE-168.md) |
| [EVE-186](EVE-186.md) | F7.12 Build agent assist for fleet and dispatch with approvals | Backlog | 0 | [EVE-50](EVE-50.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-55](EVE-55.md) |
| [EVE-187](EVE-187.md) | F6.8 Build purchasing: supplier products, requests, orders, receiving and reorder points | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-69](EVE-69.md), [EVE-103](EVE-103.md), [EVE-118](EVE-118.md) |
| [EVE-188](EVE-188.md) | F6.9 Build sub-hire: renting in equipment from other suppliers for an event | Backlog | 0 | [EVE-123](EVE-123.md), [EVE-149](EVE-149.md) |
| [EVE-189](EVE-189.md) | F6.10 Build stock counts and cycle counts with offline counting | Backlog | 0 | [EVE-149](EVE-149.md), [EVE-150](EVE-150.md) |
| [EVE-190](EVE-190.md) | F6.11 Build stock valuation, asset depreciation and the per-period export to accounting | Backlog | 0 | [EVE-69](EVE-69.md), [EVE-187](EVE-187.md) |
| [EVE-191](EVE-191.md) | F14.5 Automations: extend the F3 rules engine across every feature set | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-185](EVE-185.md) |
| [EVE-192](EVE-192.md) | F8.6 Build offline scanning: validity snapshots, local scan ledger, sync and duplicate alerts | Backlog | 0 | [EVE-17](EVE-17.md), [EVE-41](EVE-41.md), [EVE-51](EVE-51.md), [EVE-162](EVE-162.md) |
| [EVE-193](EVE-193.md) | F8.7 Build the box office: in-person ticket sales, reprints and offline quota sales | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-162](EVE-162.md), [EVE-192](EVE-192.md) |
| [EVE-194](EVE-194.md) | F8.8 Build the waiting list and face-value resale | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-114](EVE-114.md), [EVE-122](EVE-122.md) |
| [EVE-195](EVE-195.md) | F8.9 Build ticketing reports, the sales dashboard and attendee exports | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-30](EVE-30.md), [EVE-162](EVE-162.md) |
| [EVE-196](EVE-196.md) | F13.9 Build HR agent playbooks and compliance reports | Backlog | 0 | [EVE-29](EVE-29.md), [EVE-30](EVE-30.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-153](EVE-153.md), [EVE-154](EVE-154.md), [EVE-156](EVE-156.md), [EVE-179](EVE-179.md) |
| [EVE-197](EVE-197.md) | F14.6 Agent-designed customisations and AI fields | Backlog | 0 | [EVE-52](EVE-52.md), [EVE-53](EVE-53.md), [EVE-185](EVE-185.md), [EVE-191](EVE-191.md) |
| [EVE-198](EVE-198.md) | F6.12 Build the inventory agent behaviours: shortages, inspections due, reorders and overdue returns | Backlog | 0 | [EVE-45](EVE-45.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-123](EVE-123.md), [EVE-151](EVE-151.md), [EVE-187](EVE-187.md), [EVE-188](EVE-188.md) |
| [EVE-199](EVE-199.md) | F10.6 Bill of quantities and exports | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-54](EVE-54.md), [EVE-180](EVE-180.md) |
| [EVE-200](EVE-200.md) | F10.7 Revisions, approvals and share links | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-27](EVE-27.md), [EVE-43](EVE-43.md), [EVE-152](EVE-152.md) |
| [EVE-201](EVE-201.md) | F1.6 Build production plans: a collaborative canvas per space and department over the site map, with MVR exchange | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-146](EVE-146.md), [EVE-152](EVE-152.md), [EVE-166](EVE-166.md) |
| [EVE-202](EVE-202.md) | F10.8 Offline map packs and the crew map | Backlog | 0 | [EVE-26](EVE-26.md), [EVE-178](EVE-178.md) |
| [EVE-203](EVE-203.md) | F1.7 Build lighting: GDTF fixture library, fixture modes and DMX patch with conflict checks | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-166](EVE-166.md), [EVE-173](EVE-173.md), [EVE-201](EVE-201.md) |
| [EVE-204](EVE-204.md) | F14.7 Site and page model with the block registry | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-51](EVE-51.md) |
| [EVE-205](EVE-205.md) | F10.9 Crew positions layer and as-built reporting | Backlog | 0 | [EVE-44](EVE-44.md), [EVE-46](EVE-46.md), [EVE-178](EVE-178.md), [EVE-181](EVE-181.md) |
| [EVE-206](EVE-206.md) | F1.8 Build rigging: points, loads, indicative load summary and competent-person sign-off | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-166](EVE-166.md), [EVE-201](EVE-201.md) |
| [EVE-207](EVE-207.md) | F10.10 Public attendee map and website embed | Backlog | 0 | [EVE-178](EVE-178.md), [EVE-200](EVE-200.md), [EVE-238](EVE-238.md) |
| [EVE-208](EVE-208.md) | F1.9 Build sound: input list, monitor mixes and stage plot | Backlog | 0 | [EVE-166](EVE-166.md), [EVE-167](EVE-167.md), [EVE-173](EVE-173.md), [EVE-201](EVE-201.md) |
| [EVE-209](EVE-209.md) | F8.10 Add wallet passes for tickets behind a neutral port | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-117](EVE-117.md) |
| [EVE-210](EVE-210.md) | F1.10 Build staging and screens: staging elements, screen surfaces and pre-programmed screen content per segment and cue | Backlog | 0 | [EVE-25](EVE-25.md), [EVE-166](EVE-166.md), [EVE-169](EVE-169.md), [EVE-173](EVE-173.md), [EVE-201](EVE-201.md) |
| [EVE-211](EVE-211.md) | F8.11 Build the seat map editor and reserved seating in F8 | Backlog | 0 | [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-112](EVE-112.md), [EVE-114](EVE-114.md), [EVE-120](EVE-120.md) |
| [EVE-212](EVE-212.md) | F8.12 Build ticketing agent behaviour: watchers, gate briefing and approval rules | Backlog | 0 | [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-55](EVE-55.md), [EVE-195](EVE-195.md) |
| [EVE-213](EVE-213.md) | F9.6 Build card readers, offline card payments and POS peripherals | Backlog | 0 | [EVE-16](EVE-16.md), [EVE-41](EVE-41.md), [EVE-174](EVE-174.md), [EVE-176](EVE-176.md) |
| [EVE-214](EVE-214.md) | F9.7 Build fulfilment for shipping, collection, on-site hand over and digital items | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-172](EVE-172.md) |
| [EVE-215](EVE-215.md) | F9.8 Build refunds, cancellations, exchanges and disputes | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-52](EVE-52.md), [EVE-174](EVE-174.md) |
| [EVE-216](EVE-216.md) | F9.9 Build discounts, vouchers and gift cards | Backlog | 0 | [EVE-172](EVE-172.md) |
| [EVE-217](EVE-217.md) | F14.8 Visual page editor: drag and drop on wide screens, structured editing on phones | Backlog | 0 | [EVE-50](EVE-50.md), [EVE-204](EVE-204.md) |
| [EVE-218](EVE-218.md) | F9.10 Build bookable services sold through checkout | Backlog | 0 | [EVE-33](EVE-33.md), [EVE-172](EVE-172.md) |
| [EVE-219](EVE-219.md) | F14.9 Data-bound blocks, collection pages and forms | Backlog | 0 | [EVE-46](EVE-46.md), [EVE-133](EVE-133.md), [EVE-204](EVE-204.md) |
| [EVE-220](EVE-220.md) | F10.11 Agent layout drafting, templates and proactive checks | Backlog | 0 | [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-183](EVE-183.md), [EVE-199](EVE-199.md) |
| [EVE-221](EVE-221.md) | F14.10 Publishing and public rendering | Backlog | 0 | [EVE-44](EVE-44.md), [EVE-46](EVE-46.md), [EVE-204](EVE-204.md) |
| [EVE-222](EVE-222.md) | F9.11 Build receipts, reconciliation, sales reporting and accounting events | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-30](EVE-30.md), [EVE-45](EVE-45.md), [EVE-174](EVE-174.md), [EVE-176](EVE-176.md) |
| [EVE-223](EVE-223.md) | F9.12 Build vendor sales at events with split payments | Backlog | 0 | [EVE-43](EVE-43.md), [EVE-174](EVE-174.md), [EVE-215](EVE-215.md) |
| [EVE-224](EVE-224.md) | F9.13 Build the sales agent behaviours and approvals | Backlog | 0 | [EVE-29](EVE-29.md), [EVE-50](EVE-50.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-215](EVE-215.md), [EVE-222](EVE-222.md) |
| [EVE-225](EVE-225.md) | F9.14 Build quotes, deposits and equipment hire orders | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-172](EVE-172.md), [EVE-174](EVE-174.md) |
| [EVE-226](EVE-226.md) | F14.11 Domains, hosting, redirects and abuse handling | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-221](EVE-221.md) |
| [EVE-227](EVE-227.md) | F14.12 AI site generation and editing by instruction | Backlog | 0 | [EVE-30](EVE-30.md), [EVE-52](EVE-52.md), [EVE-53](EVE-53.md), [EVE-217](EVE-217.md), [EVE-219](EVE-219.md) |
| [EVE-228](EVE-228.md) | F14.13 SEO, agent-readable output, localisation and consent on published sites | Backlog | 0 | [EVE-28](EVE-28.md), [EVE-44](EVE-44.md), [EVE-221](EVE-221.md) |
| [EVE-229](EVE-229.md) | F1.11 Build equipment requirements: roll up placed elements and hand them to warehousing | Backlog | 0 | [EVE-45](EVE-45.md), [EVE-166](EVE-166.md), [EVE-201](EVE-201.md) |
| [EVE-230](EVE-230.md) | F1.12 Build live show calling and show sequences: run the run of show, live drift, timecode timelines and the show log | Backlog | 0 | [EVE-44](EVE-44.md), [EVE-46](EVE-46.md), [EVE-52](EVE-52.md), [EVE-169](EVE-169.md), [EVE-173](EVE-173.md) |
| [EVE-231](EVE-231.md) | F1.13 Build the show bridge: a local process that fires cues to consoles, playback and media servers over OSC, MIDI, MSC and timecode | Backlog | 0 | [EVE-41](EVE-41.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-173](EVE-173.md), [EVE-210](EVE-210.md), [EVE-230](EVE-230.md) |
| [EVE-232](EVE-232.md) | F1.14 Build direct DMX output for small rigs over sACN and Art-Net | Backlog | 0 | [EVE-203](EVE-203.md), [EVE-231](EVE-231.md) |
| [EVE-233](EVE-233.md) | F1.15 Build event templates and cloning: reuse phases, departments, plans and run-of-show skeletons with date shifting | Backlog | 0 | [EVE-54](EVE-54.md), [EVE-166](EVE-166.md), [EVE-169](EVE-169.md), [EVE-173](EVE-173.md), [EVE-201](EVE-201.md) |
| [EVE-234](EVE-234.md) | F14.14 Site templates and brand themes | Backlog | 0 | [EVE-30](EVE-30.md), [EVE-204](EVE-204.md), [EVE-219](EVE-219.md) |
| [EVE-235](EVE-235.md) | F3.10 Build the task rule builder: when X then Y, on a generic rule engine | Backlog | 0 | [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-45](EVE-45.md), [EVE-54](EVE-54.md), [EVE-64](EVE-64.md), [EVE-72](EVE-72.md) |
| [EVE-236](EVE-236.md) | F5.13 Build seeded listings, claiming, claim disputes and removal requests | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-78](EVE-78.md) |
| [EVE-237](EVE-237.md) | F5.14 Build quote payments with commission deducted at source | Backlog | 0 | [EVE-126](EVE-126.md), [EVE-174](EVE-174.md), [EVE-215](EVE-215.md) |
| [EVE-238](EVE-238.md) | F10.12 Venue and building plans: arenas, halls, custom structures and festival builds | Backlog | 0 | [EVE-146](EVE-146.md), [EVE-152](EVE-152.md), [EVE-178](EVE-178.md) |
| [EVE-239](EVE-239.md) | F13.10 Build performance reviews, goals and feedback | Backlog | 0 | [EVE-24](EVE-24.md), [EVE-51](EVE-51.md), [EVE-54](EVE-54.md), [EVE-98](EVE-98.md), [EVE-116](EVE-116.md) |
| [EVE-246](EVE-246.md) | Define provider-neutral connected-account invoicing and settlement orchestration | Backlog | 0 | None recorded |
| [EVE-247](EVE-247.md) | Research supplier product-catalogue coverage and bulk inventory onboarding | Backlog | 4 | None recorded |
| [EVE-250](EVE-250.md) | Decide controlled cross-tenant marketplace gateway architecture | In Progress | 2 | None recorded |
| [EVE-251](EVE-251.md) | Decide marketplace service attestation and cryptographic trust architecture | In Progress | 0 | None recorded |
| [EVE-254](EVE-254.md) | Define QLab-class cue playback and end-to-end production control | Backlog | 2 | None recorded |
| [EVE-255](EVE-255.md) | Build separate local show playback and cue execution engine | Backlog | 2 | None recorded |

## No project

| Issue | Title | Status | Priority | Blocked by |
| --- | --- | --- | --- | --- |
| [EVE-2](EVE-2.md) | 🐛 bug(projects\workflows\environments\discord\bot):  'module' must be set to 'NodeNext' | Done | 0 | None recorded |
| [EVE-3](EVE-3.md) | 🔧chore(.github/workflows/cla.yml): update to add the restyled-io&#91;bot&#93; to allowed list | Done | 0 | None recorded |
| [EVE-4](EVE-4.md) | Sweep: fix the bit-tasks init process | Done | 0 | None recorded |
| [EVE-5](EVE-5.md) | Sweep: Refactor the `setTimeout` in `initialize`  | Done | 0 | None recorded |
| [EVE-9](EVE-9.md) | Set up Home Assistant OS runbook and OLED Status app | Done | 0 | None recorded |
| [EVE-11](EVE-11.md) | Enable verified investor/press tickets without checkout | Done | 0 | None recorded |
| [EVE-245](EVE-245.md) | Build the integrated training, competency and certification platform | Backlog | 3 | None recorded |
| [EVE-252](EVE-252.md) | Implement Effect Cluster sharding and multi-runner recovery in the fresh Eventiva backend | In Progress | 1 | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md) |
| [EVE-256](EVE-256.md) | Connect MDT incidents and external controls to live show cues and emergency response presets | Backlog | 0 | None recorded |

## Complete recorded dependency roadmap

All 258 issues are grouped by Linear state type; arrows are recorded `blocks` relations only, never inferred approvals or new sequencing decisions. The tables above and each issue's relations provide the text equivalent. The curated platform sequence remains in the human-maintained timeline.

<details>
<summary>Expand the full Mermaid dependency graph</summary>

```mermaid
flowchart LR
    subgraph completed[Completed]
        E2["EVE-2"]
        E3["EVE-3"]
        E4["EVE-4"]
        E5["EVE-5"]
        E9["EVE-9"]
        E11["EVE-11"]
        E14["EVE-14"]
        E15["EVE-15"]
        E17["EVE-17"]
        E18["EVE-18"]
        E19["EVE-19"]
        E20["EVE-20"]
        E23["EVE-23"]
        E40["EVE-40"]
        E241["EVE-241"]
        E242["EVE-242"]
        E243["EVE-243"]
        E244["EVE-244"]
        E249["EVE-249"]
    end
    subgraph current[Current]
        E13["EVE-13"]
        E16["EVE-16"]
        E28["EVE-28"]
        E41["EVE-41"]
        E42["EVE-42"]
        E43["EVE-43"]
        E44["EVE-44"]
        E45["EVE-45"]
        E50["EVE-50"]
        E250["EVE-250"]
        E251["EVE-251"]
        E252["EVE-252"]
        E257["EVE-257"]
        E258["EVE-258"]
        E259["EVE-259"]
        E261["EVE-261"]
        E264["EVE-264"]
    end
    subgraph upcoming[Upcoming]
        E21["EVE-21"]
        E22["EVE-22"]
        E24["EVE-24"]
        E25["EVE-25"]
        E26["EVE-26"]
        E27["EVE-27"]
        E29["EVE-29"]
        E30["EVE-30"]
        E31["EVE-31"]
        E32["EVE-32"]
        E33["EVE-33"]
        E34["EVE-34"]
        E35["EVE-35"]
        E36["EVE-36"]
        E37["EVE-37"]
        E38["EVE-38"]
        E39["EVE-39"]
        E46["EVE-46"]
        E47["EVE-47"]
        E48["EVE-48"]
        E49["EVE-49"]
        E51["EVE-51"]
        E52["EVE-52"]
        E53["EVE-53"]
        E54["EVE-54"]
        E55["EVE-55"]
        E56["EVE-56"]
        E57["EVE-57"]
        E58["EVE-58"]
        E59["EVE-59"]
        E60["EVE-60"]
        E61["EVE-61"]
        E62["EVE-62"]
        E63["EVE-63"]
        E64["EVE-64"]
        E65["EVE-65"]
        E66["EVE-66"]
        E67["EVE-67"]
        E68["EVE-68"]
        E69["EVE-69"]
        E70["EVE-70"]
        E71["EVE-71"]
        E72["EVE-72"]
        E73["EVE-73"]
        E74["EVE-74"]
        E75["EVE-75"]
        E76["EVE-76"]
        E77["EVE-77"]
        E78["EVE-78"]
        E79["EVE-79"]
        E80["EVE-80"]
        E81["EVE-81"]
        E82["EVE-82"]
        E84["EVE-84"]
        E86["EVE-86"]
        E87["EVE-87"]
        E88["EVE-88"]
        E89["EVE-89"]
        E90["EVE-90"]
        E91["EVE-91"]
        E92["EVE-92"]
        E93["EVE-93"]
        E94["EVE-94"]
        E95["EVE-95"]
        E96["EVE-96"]
        E97["EVE-97"]
        E98["EVE-98"]
        E99["EVE-99"]
        E100["EVE-100"]
        E101["EVE-101"]
        E102["EVE-102"]
        E103["EVE-103"]
        E104["EVE-104"]
        E105["EVE-105"]
        E106["EVE-106"]
        E107["EVE-107"]
        E108["EVE-108"]
        E109["EVE-109"]
        E110["EVE-110"]
        E111["EVE-111"]
        E112["EVE-112"]
        E113["EVE-113"]
        E114["EVE-114"]
        E115["EVE-115"]
        E116["EVE-116"]
        E117["EVE-117"]
        E118["EVE-118"]
        E119["EVE-119"]
        E120["EVE-120"]
        E121["EVE-121"]
        E122["EVE-122"]
        E123["EVE-123"]
        E124["EVE-124"]
        E125["EVE-125"]
        E126["EVE-126"]
        E127["EVE-127"]
        E128["EVE-128"]
        E129["EVE-129"]
        E130["EVE-130"]
        E131["EVE-131"]
        E132["EVE-132"]
        E133["EVE-133"]
        E134["EVE-134"]
        E135["EVE-135"]
        E136["EVE-136"]
        E137["EVE-137"]
        E138["EVE-138"]
        E139["EVE-139"]
        E140["EVE-140"]
        E141["EVE-141"]
        E142["EVE-142"]
        E143["EVE-143"]
        E144["EVE-144"]
        E145["EVE-145"]
        E146["EVE-146"]
        E147["EVE-147"]
        E148["EVE-148"]
        E149["EVE-149"]
        E150["EVE-150"]
        E151["EVE-151"]
        E152["EVE-152"]
        E153["EVE-153"]
        E154["EVE-154"]
        E155["EVE-155"]
        E156["EVE-156"]
        E157["EVE-157"]
        E158["EVE-158"]
        E159["EVE-159"]
        E160["EVE-160"]
        E161["EVE-161"]
        E162["EVE-162"]
        E163["EVE-163"]
        E164["EVE-164"]
        E165["EVE-165"]
        E166["EVE-166"]
        E167["EVE-167"]
        E168["EVE-168"]
        E169["EVE-169"]
        E170["EVE-170"]
        E171["EVE-171"]
        E172["EVE-172"]
        E173["EVE-173"]
        E174["EVE-174"]
        E175["EVE-175"]
        E176["EVE-176"]
        E177["EVE-177"]
        E178["EVE-178"]
        E179["EVE-179"]
        E180["EVE-180"]
        E181["EVE-181"]
        E182["EVE-182"]
        E183["EVE-183"]
        E184["EVE-184"]
        E185["EVE-185"]
        E186["EVE-186"]
        E187["EVE-187"]
        E188["EVE-188"]
        E189["EVE-189"]
        E190["EVE-190"]
        E191["EVE-191"]
        E192["EVE-192"]
        E193["EVE-193"]
        E194["EVE-194"]
        E195["EVE-195"]
        E196["EVE-196"]
        E197["EVE-197"]
        E198["EVE-198"]
        E199["EVE-199"]
        E200["EVE-200"]
        E201["EVE-201"]
        E202["EVE-202"]
        E203["EVE-203"]
        E204["EVE-204"]
        E205["EVE-205"]
        E206["EVE-206"]
        E207["EVE-207"]
        E208["EVE-208"]
        E209["EVE-209"]
        E210["EVE-210"]
        E211["EVE-211"]
        E212["EVE-212"]
        E213["EVE-213"]
        E214["EVE-214"]
        E215["EVE-215"]
        E216["EVE-216"]
        E217["EVE-217"]
        E218["EVE-218"]
        E219["EVE-219"]
        E220["EVE-220"]
        E221["EVE-221"]
        E222["EVE-222"]
        E223["EVE-223"]
        E224["EVE-224"]
        E225["EVE-225"]
        E226["EVE-226"]
        E227["EVE-227"]
        E228["EVE-228"]
        E229["EVE-229"]
        E230["EVE-230"]
        E231["EVE-231"]
        E232["EVE-232"]
        E233["EVE-233"]
        E234["EVE-234"]
        E235["EVE-235"]
        E236["EVE-236"]
        E237["EVE-237"]
        E238["EVE-238"]
        E239["EVE-239"]
        E240["EVE-240"]
        E245["EVE-245"]
        E246["EVE-246"]
        E247["EVE-247"]
        E248["EVE-248"]
        E253["EVE-253"]
        E254["EVE-254"]
        E255["EVE-255"]
        E256["EVE-256"]
        E260["EVE-260"]
        E262["EVE-262"]
        E263["EVE-263"]
    end
    subgraph other[Other recorded states]
        E83["EVE-83"]
        E85["EVE-85"]
    end
    E14 --> E40
    E14 --> E47
    E16 --> E50
    E16 --> E77
    E16 --> E86
    E16 --> E120
    E16 --> E134
    E16 --> E149
    E16 --> E182
    E16 --> E204
    E16 --> E213
    E17 --> E51
    E17 --> E64
    E17 --> E106
    E17 --> E120
    E17 --> E128
    E17 --> E138
    E17 --> E145
    E17 --> E148
    E17 --> E154
    E17 --> E172
    E17 --> E176
    E17 --> E179
    E17 --> E192
    E18 --> E54
    E19 --> E44
    E20 --> E53
    E21 --> E44
    E23 --> E40
    E23 --> E42
    E23 --> E64
    E23 --> E68
    E23 --> E82
    E23 --> E98
    E23 --> E257
    E23 --> E258
    E24 --> E78
    E24 --> E89
    E24 --> E92
    E24 --> E105
    E24 --> E109
    E24 --> E117
    E24 --> E119
    E24 --> E121
    E24 --> E126
    E24 --> E131
    E24 --> E135
    E24 --> E136
    E24 --> E153
    E24 --> E169
    E24 --> E171
    E24 --> E175
    E24 --> E177
    E24 --> E179
    E24 --> E187
    E24 --> E194
    E24 --> E200
    E24 --> E214
    E24 --> E222
    E24 --> E225
    E24 --> E236
    E24 --> E239
    E25 --> E70
    E25 --> E75
    E25 --> E88
    E25 --> E92
    E25 --> E99
    E25 --> E116
    E25 --> E117
    E25 --> E118
    E25 --> E121
    E25 --> E126
    E25 --> E127
    E25 --> E135
    E25 --> E146
    E25 --> E150
    E25 --> E151
    E25 --> E154
    E25 --> E156
    E25 --> E159
    E25 --> E167
    E25 --> E173
    E25 --> E193
    E25 --> E195
    E25 --> E199
    E25 --> E201
    E25 --> E203
    E25 --> E210
    E25 --> E214
    E26 --> E79
    E26 --> E202
    E27 --> E86
    E27 --> E150
    E27 --> E167
    E27 --> E200
    E28 --> E175
    E28 --> E228
    E29 --> E104
    E29 --> E165
    E29 --> E196
    E29 --> E224
    E30 --> E101
    E30 --> E159
    E30 --> E164
    E30 --> E195
    E30 --> E196
    E30 --> E222
    E30 --> E227
    E30 --> E234
    E32 --> E148
    E32 --> E168
    E32 --> E182
    E33 --> E93
    E33 --> E100
    E33 --> E123
    E33 --> E124
    E33 --> E128
    E33 --> E129
    E33 --> E130
    E33 --> E138
    E33 --> E154
    E33 --> E161
    E33 --> E171
    E33 --> E179
    E33 --> E218
    E35 --> E142
    E38 --> E114
    E39 --> E103
    E39 --> E114
    E39 --> E145
    E39 --> E170
    E39 --> E172
    E40 --> E52
    E40 --> E56
    E40 --> E64
    E40 --> E68
    E40 --> E74
    E40 --> E75
    E40 --> E81
    E40 --> E82
    E40 --> E88
    E40 --> E94
    E40 --> E96
    E40 --> E97
    E40 --> E98
    E40 --> E100
    E40 --> E101
    E40 --> E106
    E40 --> E112
    E40 --> E114
    E40 --> E128
    E40 --> E129
    E40 --> E130
    E40 --> E133
    E40 --> E138
    E40 --> E143
    E40 --> E145
    E40 --> E146
    E40 --> E147
    E40 --> E166
    E40 --> E170
    E40 --> E172
    E40 --> E173
    E40 --> E177
    E40 --> E181
    E40 --> E184
    E40 --> E204
    E40 --> E235
    E40 --> E252
    E40 --> E257
    E40 --> E258
    E40 --> E259
    E41 --> E53
    E41 --> E74
    E41 --> E88
    E41 --> E116
    E41 --> E117
    E41 --> E130
    E41 --> E139
    E41 --> E151
    E41 --> E157
    E41 --> E158
    E41 --> E174
    E41 --> E183
    E41 --> E184
    E41 --> E192
    E41 --> E209
    E41 --> E213
    E41 --> E226
    E41 --> E231
    E41 --> E259
    E41 --> E261
    E42 --> E54
    E42 --> E55
    E42 --> E64
    E42 --> E68
    E42 --> E74
    E42 --> E75
    E42 --> E81
    E42 --> E82
    E42 --> E87
    E42 --> E94
    E42 --> E98
    E42 --> E100
    E42 --> E103
    E42 --> E106
    E42 --> E112
    E42 --> E128
    E42 --> E129
    E42 --> E131
    E42 --> E133
    E42 --> E136
    E42 --> E138
    E42 --> E143
    E42 --> E145
    E42 --> E146
    E42 --> E166
    E42 --> E170
    E42 --> E172
    E42 --> E204
    E42 --> E252
    E43 --> E81
    E43 --> E82
    E43 --> E87
    E43 --> E91
    E43 --> E92
    E43 --> E94
    E43 --> E96
    E43 --> E97
    E43 --> E98
    E43 --> E105
    E43 --> E109
    E43 --> E112
    E43 --> E116
    E43 --> E119
    E43 --> E121
    E43 --> E122
    E43 --> E127
    E43 --> E128
    E43 --> E131
    E43 --> E132
    E43 --> E133
    E43 --> E138
    E43 --> E140
    E43 --> E141
    E43 --> E146
    E43 --> E147
    E43 --> E152
    E43 --> E153
    E43 --> E155
    E43 --> E158
    E43 --> E162
    E43 --> E166
    E43 --> E167
    E43 --> E170
    E43 --> E171
    E43 --> E174
    E43 --> E176
    E43 --> E179
    E43 --> E181
    E43 --> E185
    E43 --> E191
    E43 --> E200
    E43 --> E204
    E43 --> E206
    E43 --> E215
    E43 --> E223
    E43 --> E231
    E43 --> E235
    E43 --> E261
    E44 --> E74
    E44 --> E87
    E44 --> E116
    E44 --> E164
    E44 --> E181
    E44 --> E205
    E44 --> E221
    E44 --> E228
    E44 --> E230
    E44 --> E231
    E44 --> E260
    E44 --> E261
    E45 --> E55
    E45 --> E64
    E45 --> E79
    E45 --> E89
    E45 --> E90
    E45 --> E95
    E45 --> E96
    E45 --> E100
    E45 --> E103
    E45 --> E114
    E45 --> E117
    E45 --> E119
    E45 --> E129
    E45 --> E131
    E45 --> E138
    E45 --> E145
    E45 --> E147
    E45 --> E152
    E45 --> E154
    E45 --> E155
    E45 --> E166
    E45 --> E169
    E45 --> E172
    E45 --> E174
    E45 --> E191
    E45 --> E198
    E45 --> E222
    E45 --> E229
    E45 --> E235
    E45 --> E260
    E45 --> E261
    E46 --> E113
    E46 --> E126
    E46 --> E132
    E46 --> E140
    E46 --> E162
    E46 --> E174
    E46 --> E175
    E46 --> E205
    E46 --> E219
    E46 --> E221
    E46 --> E230
    E48 --> E165
    E50 --> E77
    E50 --> E81
    E50 --> E86
    E50 --> E94
    E50 --> E101
    E50 --> E104
    E50 --> E106
    E50 --> E112
    E50 --> E115
    E50 --> E116
    E50 --> E122
    E50 --> E125
    E50 --> E134
    E50 --> E138
    E50 --> E147
    E50 --> E148
    E50 --> E162
    E50 --> E166
    E50 --> E168
    E50 --> E169
    E50 --> E175
    E50 --> E176
    E50 --> E178
    E50 --> E182
    E50 --> E186
    E50 --> E201
    E50 --> E211
    E50 --> E217
    E50 --> E224
    E50 --> E260
    E51 --> E64
    E51 --> E95
    E51 --> E103
    E51 --> E109
    E51 --> E121
    E51 --> E122
    E51 --> E125
    E51 --> E133
    E51 --> E134
    E51 --> E135
    E51 --> E138
    E51 --> E147
    E51 --> E152
    E51 --> E166
    E51 --> E167
    E51 --> E169
    E51 --> E173
    E51 --> E176
    E51 --> E192
    E51 --> E201
    E51 --> E204
    E51 --> E211
    E51 --> E239
    E52 --> E104
    E52 --> E110
    E52 --> E127
    E52 --> E142
    E52 --> E144
    E52 --> E165
    E52 --> E186
    E52 --> E196
    E52 --> E197
    E52 --> E198
    E52 --> E212
    E52 --> E215
    E52 --> E220
    E52 --> E224
    E52 --> E227
    E52 --> E230
    E53 --> E127
    E53 --> E197
    E53 --> E227
    E54 --> E87
    E54 --> E89
    E54 --> E90
    E54 --> E99
    E54 --> E104
    E54 --> E105
    E54 --> E110
    E54 --> E114
    E54 --> E124
    E54 --> E139
    E54 --> E142
    E54 --> E143
    E54 --> E145
    E54 --> E147
    E54 --> E153
    E54 --> E156
    E54 --> E165
    E54 --> E177
    E54 --> E181
    E54 --> E186
    E54 --> E191
    E54 --> E196
    E54 --> E198
    E54 --> E199
    E54 --> E212
    E54 --> E220
    E54 --> E224
    E54 --> E233
    E54 --> E235
    E54 --> E239
    E54 --> E261
    E55 --> E186
    E55 --> E212
    E56 --> E116
    E64 --> E70
    E64 --> E72
    E64 --> E84
    E64 --> E86
    E64 --> E89
    E64 --> E93
    E64 --> E109
    E64 --> E110
    E64 --> E235
    E68 --> E91
    E68 --> E95
    E68 --> E99
    E68 --> E102
    E68 --> E105
    E69 --> E187
    E69 --> E190
    E70 --> E86
    E72 --> E84
    E72 --> E86
    E72 --> E110
    E72 --> E235
    E73 --> E123
    E73 --> E129
    E73 --> E135
    E74 --> E90
    E74 --> E125
    E74 --> E126
    E74 --> E127
    E74 --> E157
    E74 --> E158
    E74 --> E159
    E74 --> E160
    E75 --> E77
    E75 --> E78
    E75 --> E79
    E75 --> E119
    E75 --> E161
    E78 --> E113
    E78 --> E163
    E78 --> E236
    E79 --> E113
    E79 --> E115
    E79 --> E164
    E79 --> E165
    E81 --> E103
    E82 --> E87
    E82 --> E138
    E84 --> E110
    E86 --> E110
    E87 --> E88
    E87 --> E92
    E87 --> E101
    E88 --> E96
    E90 --> E126
    E90 --> E127
    E90 --> E160
    E91 --> E137
    E92 --> E96
    E95 --> E137
    E95 --> E139
    E95 --> E144
    E96 --> E104
    E98 --> E116
    E98 --> E121
    E98 --> E153
    E98 --> E154
    E98 --> E156
    E98 --> E179
    E98 --> E239
    E99 --> E105
    E99 --> E144
    E101 --> E104
    E103 --> E118
    E103 --> E123
    E103 --> E150
    E103 --> E187
    E105 --> E102
    E105 --> E141
    E112 --> E114
    E112 --> E211
    E114 --> E117
    E114 --> E194
    E114 --> E211
    E115 --> E165
    E116 --> E156
    E116 --> E239
    E117 --> E122
    E117 --> E162
    E117 --> E209
    E118 --> E149
    E118 --> E150
    E118 --> E151
    E118 --> E187
    E119 --> E124
    E119 --> E164
    E119 --> E165
    E120 --> E146
    E120 --> E211
    E121 --> E153
    E122 --> E194
    E123 --> E149
    E123 --> E188
    E123 --> E198
    E124 --> E163
    E124 --> E164
    E124 --> E165
    E125 --> E159
    E126 --> E157
    E126 --> E237
    E127 --> E157
    E128 --> E129
    E128 --> E130
    E129 --> E130
    E129 --> E131
    E129 --> E171
    E130 --> E131
    E130 --> E136
    E130 --> E142
    E131 --> E132
    E131 --> E134
    E131 --> E135
    E131 --> E136
    E131 --> E138
    E131 --> E140
    E131 --> E142
    E133 --> E155
    E133 --> E168
    E133 --> E185
    E133 --> E219
    E146 --> E152
    E146 --> E201
    E146 --> E238
    E149 --> E188
    E149 --> E189
    E150 --> E189
    E151 --> E198
    E152 --> E178
    E152 --> E180
    E152 --> E181
    E152 --> E183
    E152 --> E200
    E152 --> E201
    E152 --> E238
    E153 --> E182
    E153 --> E196
    E154 --> E97
    E154 --> E182
    E154 --> E196
    E155 --> E185
    E156 --> E196
    E161 --> E165
    E162 --> E192
    E162 --> E193
    E162 --> E195
    E166 --> E167
    E166 --> E169
    E166 --> E171
    E166 --> E173
    E166 --> E201
    E166 --> E203
    E166 --> E206
    E166 --> E208
    E166 --> E210
    E166 --> E229
    E166 --> E233
    E167 --> E208
    E168 --> E185
    E169 --> E171
    E169 --> E173
    E169 --> E210
    E169 --> E230
    E169 --> E233
    E170 --> E172
    E172 --> E174
    E172 --> E176
    E172 --> E214
    E172 --> E216
    E172 --> E218
    E172 --> E225
    E173 --> E203
    E173 --> E208
    E173 --> E210
    E173 --> E230
    E173 --> E231
    E173 --> E233
    E174 --> E175
    E174 --> E213
    E174 --> E215
    E174 --> E222
    E174 --> E223
    E174 --> E225
    E174 --> E237
    E176 --> E213
    E176 --> E222
    E178 --> E202
    E178 --> E205
    E178 --> E207
    E178 --> E238
    E179 --> E182
    E179 --> E196
    E180 --> E199
    E181 --> E205
    E183 --> E220
    E185 --> E191
    E185 --> E197
    E187 --> E190
    E187 --> E198
    E188 --> E198
    E191 --> E197
    E192 --> E193
    E195 --> E212
    E199 --> E220
    E200 --> E207
    E201 --> E203
    E201 --> E206
    E201 --> E208
    E201 --> E210
    E201 --> E229
    E201 --> E233
    E203 --> E232
    E204 --> E217
    E204 --> E219
    E204 --> E221
    E204 --> E234
    E210 --> E231
    E215 --> E223
    E215 --> E224
    E215 --> E237
    E217 --> E227
    E219 --> E227
    E219 --> E234
    E221 --> E226
    E221 --> E228
    E222 --> E224
    E230 --> E231
    E231 --> E232
    E238 --> E183
    E238 --> E207
    E242 --> E243
    E243 --> E244
    E251 --> E261
    E252 --> E261
    E257 --> E259
    E257 --> E260
    E257 --> E261
    E257 --> E262
    E258 --> E260
    E258 --> E261
    E258 --> E262
    E259 --> E260
    E259 --> E261
    E260 --> E261
    E262 --> E261
    E263 --> E261
    click E2 "https://linear.app/resnovas/issue/EVE-2"
    click E3 "https://linear.app/resnovas/issue/EVE-3"
    click E4 "https://linear.app/resnovas/issue/EVE-4"
    click E5 "https://linear.app/resnovas/issue/EVE-5"
    click E9 "https://linear.app/resnovas/issue/EVE-9"
    click E11 "https://linear.app/resnovas/issue/EVE-11"
    click E13 "https://linear.app/resnovas/issue/EVE-13"
    click E14 "https://linear.app/resnovas/issue/EVE-14"
    click E15 "https://linear.app/resnovas/issue/EVE-15"
    click E16 "https://linear.app/resnovas/issue/EVE-16"
    click E17 "https://linear.app/resnovas/issue/EVE-17"
    click E18 "https://linear.app/resnovas/issue/EVE-18"
    click E19 "https://linear.app/resnovas/issue/EVE-19"
    click E20 "https://linear.app/resnovas/issue/EVE-20"
    click E21 "https://linear.app/resnovas/issue/EVE-21"
    click E22 "https://linear.app/resnovas/issue/EVE-22"
    click E23 "https://linear.app/resnovas/issue/EVE-23"
    click E24 "https://linear.app/resnovas/issue/EVE-24"
    click E25 "https://linear.app/resnovas/issue/EVE-25"
    click E26 "https://linear.app/resnovas/issue/EVE-26"
    click E27 "https://linear.app/resnovas/issue/EVE-27"
    click E28 "https://linear.app/resnovas/issue/EVE-28"
    click E29 "https://linear.app/resnovas/issue/EVE-29"
    click E30 "https://linear.app/resnovas/issue/EVE-30"
    click E31 "https://linear.app/resnovas/issue/EVE-31"
    click E32 "https://linear.app/resnovas/issue/EVE-32"
    click E33 "https://linear.app/resnovas/issue/EVE-33"
    click E34 "https://linear.app/resnovas/issue/EVE-34"
    click E35 "https://linear.app/resnovas/issue/EVE-35"
    click E36 "https://linear.app/resnovas/issue/EVE-36"
    click E37 "https://linear.app/resnovas/issue/EVE-37"
    click E38 "https://linear.app/resnovas/issue/EVE-38"
    click E39 "https://linear.app/resnovas/issue/EVE-39"
    click E40 "https://linear.app/resnovas/issue/EVE-40"
    click E41 "https://linear.app/resnovas/issue/EVE-41"
    click E42 "https://linear.app/resnovas/issue/EVE-42"
    click E43 "https://linear.app/resnovas/issue/EVE-43"
    click E44 "https://linear.app/resnovas/issue/EVE-44"
    click E45 "https://linear.app/resnovas/issue/EVE-45"
    click E46 "https://linear.app/resnovas/issue/EVE-46"
    click E47 "https://linear.app/resnovas/issue/EVE-47"
    click E48 "https://linear.app/resnovas/issue/EVE-48"
    click E49 "https://linear.app/resnovas/issue/EVE-49"
    click E50 "https://linear.app/resnovas/issue/EVE-50"
    click E51 "https://linear.app/resnovas/issue/EVE-51"
    click E52 "https://linear.app/resnovas/issue/EVE-52"
    click E53 "https://linear.app/resnovas/issue/EVE-53"
    click E54 "https://linear.app/resnovas/issue/EVE-54"
    click E55 "https://linear.app/resnovas/issue/EVE-55"
    click E56 "https://linear.app/resnovas/issue/EVE-56"
    click E57 "https://linear.app/resnovas/issue/EVE-57"
    click E58 "https://linear.app/resnovas/issue/EVE-58"
    click E59 "https://linear.app/resnovas/issue/EVE-59"
    click E60 "https://linear.app/resnovas/issue/EVE-60"
    click E61 "https://linear.app/resnovas/issue/EVE-61"
    click E62 "https://linear.app/resnovas/issue/EVE-62"
    click E63 "https://linear.app/resnovas/issue/EVE-63"
    click E64 "https://linear.app/resnovas/issue/EVE-64"
    click E65 "https://linear.app/resnovas/issue/EVE-65"
    click E66 "https://linear.app/resnovas/issue/EVE-66"
    click E67 "https://linear.app/resnovas/issue/EVE-67"
    click E68 "https://linear.app/resnovas/issue/EVE-68"
    click E69 "https://linear.app/resnovas/issue/EVE-69"
    click E70 "https://linear.app/resnovas/issue/EVE-70"
    click E71 "https://linear.app/resnovas/issue/EVE-71"
    click E72 "https://linear.app/resnovas/issue/EVE-72"
    click E73 "https://linear.app/resnovas/issue/EVE-73"
    click E74 "https://linear.app/resnovas/issue/EVE-74"
    click E75 "https://linear.app/resnovas/issue/EVE-75"
    click E76 "https://linear.app/resnovas/issue/EVE-76"
    click E77 "https://linear.app/resnovas/issue/EVE-77"
    click E78 "https://linear.app/resnovas/issue/EVE-78"
    click E79 "https://linear.app/resnovas/issue/EVE-79"
    click E80 "https://linear.app/resnovas/issue/EVE-80"
    click E81 "https://linear.app/resnovas/issue/EVE-81"
    click E82 "https://linear.app/resnovas/issue/EVE-82"
    click E83 "https://linear.app/resnovas/issue/EVE-83"
    click E84 "https://linear.app/resnovas/issue/EVE-84"
    click E85 "https://linear.app/resnovas/issue/EVE-85"
    click E86 "https://linear.app/resnovas/issue/EVE-86"
    click E87 "https://linear.app/resnovas/issue/EVE-87"
    click E88 "https://linear.app/resnovas/issue/EVE-88"
    click E89 "https://linear.app/resnovas/issue/EVE-89"
    click E90 "https://linear.app/resnovas/issue/EVE-90"
    click E91 "https://linear.app/resnovas/issue/EVE-91"
    click E92 "https://linear.app/resnovas/issue/EVE-92"
    click E93 "https://linear.app/resnovas/issue/EVE-93"
    click E94 "https://linear.app/resnovas/issue/EVE-94"
    click E95 "https://linear.app/resnovas/issue/EVE-95"
    click E96 "https://linear.app/resnovas/issue/EVE-96"
    click E97 "https://linear.app/resnovas/issue/EVE-97"
    click E98 "https://linear.app/resnovas/issue/EVE-98"
    click E99 "https://linear.app/resnovas/issue/EVE-99"
    click E100 "https://linear.app/resnovas/issue/EVE-100"
    click E101 "https://linear.app/resnovas/issue/EVE-101"
    click E102 "https://linear.app/resnovas/issue/EVE-102"
    click E103 "https://linear.app/resnovas/issue/EVE-103"
    click E104 "https://linear.app/resnovas/issue/EVE-104"
    click E105 "https://linear.app/resnovas/issue/EVE-105"
    click E106 "https://linear.app/resnovas/issue/EVE-106"
    click E107 "https://linear.app/resnovas/issue/EVE-107"
    click E108 "https://linear.app/resnovas/issue/EVE-108"
    click E109 "https://linear.app/resnovas/issue/EVE-109"
    click E110 "https://linear.app/resnovas/issue/EVE-110"
    click E111 "https://linear.app/resnovas/issue/EVE-111"
    click E112 "https://linear.app/resnovas/issue/EVE-112"
    click E113 "https://linear.app/resnovas/issue/EVE-113"
    click E114 "https://linear.app/resnovas/issue/EVE-114"
    click E115 "https://linear.app/resnovas/issue/EVE-115"
    click E116 "https://linear.app/resnovas/issue/EVE-116"
    click E117 "https://linear.app/resnovas/issue/EVE-117"
    click E118 "https://linear.app/resnovas/issue/EVE-118"
    click E119 "https://linear.app/resnovas/issue/EVE-119"
    click E120 "https://linear.app/resnovas/issue/EVE-120"
    click E121 "https://linear.app/resnovas/issue/EVE-121"
    click E122 "https://linear.app/resnovas/issue/EVE-122"
    click E123 "https://linear.app/resnovas/issue/EVE-123"
    click E124 "https://linear.app/resnovas/issue/EVE-124"
    click E125 "https://linear.app/resnovas/issue/EVE-125"
    click E126 "https://linear.app/resnovas/issue/EVE-126"
    click E127 "https://linear.app/resnovas/issue/EVE-127"
    click E128 "https://linear.app/resnovas/issue/EVE-128"
    click E129 "https://linear.app/resnovas/issue/EVE-129"
    click E130 "https://linear.app/resnovas/issue/EVE-130"
    click E131 "https://linear.app/resnovas/issue/EVE-131"
    click E132 "https://linear.app/resnovas/issue/EVE-132"
    click E133 "https://linear.app/resnovas/issue/EVE-133"
    click E134 "https://linear.app/resnovas/issue/EVE-134"
    click E135 "https://linear.app/resnovas/issue/EVE-135"
    click E136 "https://linear.app/resnovas/issue/EVE-136"
    click E137 "https://linear.app/resnovas/issue/EVE-137"
    click E138 "https://linear.app/resnovas/issue/EVE-138"
    click E139 "https://linear.app/resnovas/issue/EVE-139"
    click E140 "https://linear.app/resnovas/issue/EVE-140"
    click E141 "https://linear.app/resnovas/issue/EVE-141"
    click E142 "https://linear.app/resnovas/issue/EVE-142"
    click E143 "https://linear.app/resnovas/issue/EVE-143"
    click E144 "https://linear.app/resnovas/issue/EVE-144"
    click E145 "https://linear.app/resnovas/issue/EVE-145"
    click E146 "https://linear.app/resnovas/issue/EVE-146"
    click E147 "https://linear.app/resnovas/issue/EVE-147"
    click E148 "https://linear.app/resnovas/issue/EVE-148"
    click E149 "https://linear.app/resnovas/issue/EVE-149"
    click E150 "https://linear.app/resnovas/issue/EVE-150"
    click E151 "https://linear.app/resnovas/issue/EVE-151"
    click E152 "https://linear.app/resnovas/issue/EVE-152"
    click E153 "https://linear.app/resnovas/issue/EVE-153"
    click E154 "https://linear.app/resnovas/issue/EVE-154"
    click E155 "https://linear.app/resnovas/issue/EVE-155"
    click E156 "https://linear.app/resnovas/issue/EVE-156"
    click E157 "https://linear.app/resnovas/issue/EVE-157"
    click E158 "https://linear.app/resnovas/issue/EVE-158"
    click E159 "https://linear.app/resnovas/issue/EVE-159"
    click E160 "https://linear.app/resnovas/issue/EVE-160"
    click E161 "https://linear.app/resnovas/issue/EVE-161"
    click E162 "https://linear.app/resnovas/issue/EVE-162"
    click E163 "https://linear.app/resnovas/issue/EVE-163"
    click E164 "https://linear.app/resnovas/issue/EVE-164"
    click E165 "https://linear.app/resnovas/issue/EVE-165"
    click E166 "https://linear.app/resnovas/issue/EVE-166"
    click E167 "https://linear.app/resnovas/issue/EVE-167"
    click E168 "https://linear.app/resnovas/issue/EVE-168"
    click E169 "https://linear.app/resnovas/issue/EVE-169"
    click E170 "https://linear.app/resnovas/issue/EVE-170"
    click E171 "https://linear.app/resnovas/issue/EVE-171"
    click E172 "https://linear.app/resnovas/issue/EVE-172"
    click E173 "https://linear.app/resnovas/issue/EVE-173"
    click E174 "https://linear.app/resnovas/issue/EVE-174"
    click E175 "https://linear.app/resnovas/issue/EVE-175"
    click E176 "https://linear.app/resnovas/issue/EVE-176"
    click E177 "https://linear.app/resnovas/issue/EVE-177"
    click E178 "https://linear.app/resnovas/issue/EVE-178"
    click E179 "https://linear.app/resnovas/issue/EVE-179"
    click E180 "https://linear.app/resnovas/issue/EVE-180"
    click E181 "https://linear.app/resnovas/issue/EVE-181"
    click E182 "https://linear.app/resnovas/issue/EVE-182"
    click E183 "https://linear.app/resnovas/issue/EVE-183"
    click E184 "https://linear.app/resnovas/issue/EVE-184"
    click E185 "https://linear.app/resnovas/issue/EVE-185"
    click E186 "https://linear.app/resnovas/issue/EVE-186"
    click E187 "https://linear.app/resnovas/issue/EVE-187"
    click E188 "https://linear.app/resnovas/issue/EVE-188"
    click E189 "https://linear.app/resnovas/issue/EVE-189"
    click E190 "https://linear.app/resnovas/issue/EVE-190"
    click E191 "https://linear.app/resnovas/issue/EVE-191"
    click E192 "https://linear.app/resnovas/issue/EVE-192"
    click E193 "https://linear.app/resnovas/issue/EVE-193"
    click E194 "https://linear.app/resnovas/issue/EVE-194"
    click E195 "https://linear.app/resnovas/issue/EVE-195"
    click E196 "https://linear.app/resnovas/issue/EVE-196"
    click E197 "https://linear.app/resnovas/issue/EVE-197"
    click E198 "https://linear.app/resnovas/issue/EVE-198"
    click E199 "https://linear.app/resnovas/issue/EVE-199"
    click E200 "https://linear.app/resnovas/issue/EVE-200"
    click E201 "https://linear.app/resnovas/issue/EVE-201"
    click E202 "https://linear.app/resnovas/issue/EVE-202"
    click E203 "https://linear.app/resnovas/issue/EVE-203"
    click E204 "https://linear.app/resnovas/issue/EVE-204"
    click E205 "https://linear.app/resnovas/issue/EVE-205"
    click E206 "https://linear.app/resnovas/issue/EVE-206"
    click E207 "https://linear.app/resnovas/issue/EVE-207"
    click E208 "https://linear.app/resnovas/issue/EVE-208"
    click E209 "https://linear.app/resnovas/issue/EVE-209"
    click E210 "https://linear.app/resnovas/issue/EVE-210"
    click E211 "https://linear.app/resnovas/issue/EVE-211"
    click E212 "https://linear.app/resnovas/issue/EVE-212"
    click E213 "https://linear.app/resnovas/issue/EVE-213"
    click E214 "https://linear.app/resnovas/issue/EVE-214"
    click E215 "https://linear.app/resnovas/issue/EVE-215"
    click E216 "https://linear.app/resnovas/issue/EVE-216"
    click E217 "https://linear.app/resnovas/issue/EVE-217"
    click E218 "https://linear.app/resnovas/issue/EVE-218"
    click E219 "https://linear.app/resnovas/issue/EVE-219"
    click E220 "https://linear.app/resnovas/issue/EVE-220"
    click E221 "https://linear.app/resnovas/issue/EVE-221"
    click E222 "https://linear.app/resnovas/issue/EVE-222"
    click E223 "https://linear.app/resnovas/issue/EVE-223"
    click E224 "https://linear.app/resnovas/issue/EVE-224"
    click E225 "https://linear.app/resnovas/issue/EVE-225"
    click E226 "https://linear.app/resnovas/issue/EVE-226"
    click E227 "https://linear.app/resnovas/issue/EVE-227"
    click E228 "https://linear.app/resnovas/issue/EVE-228"
    click E229 "https://linear.app/resnovas/issue/EVE-229"
    click E230 "https://linear.app/resnovas/issue/EVE-230"
    click E231 "https://linear.app/resnovas/issue/EVE-231"
    click E232 "https://linear.app/resnovas/issue/EVE-232"
    click E233 "https://linear.app/resnovas/issue/EVE-233"
    click E234 "https://linear.app/resnovas/issue/EVE-234"
    click E235 "https://linear.app/resnovas/issue/EVE-235"
    click E236 "https://linear.app/resnovas/issue/EVE-236"
    click E237 "https://linear.app/resnovas/issue/EVE-237"
    click E238 "https://linear.app/resnovas/issue/EVE-238"
    click E239 "https://linear.app/resnovas/issue/EVE-239"
    click E240 "https://linear.app/resnovas/issue/EVE-240"
    click E241 "https://linear.app/resnovas/issue/EVE-241"
    click E242 "https://linear.app/resnovas/issue/EVE-242"
    click E243 "https://linear.app/resnovas/issue/EVE-243"
    click E244 "https://linear.app/resnovas/issue/EVE-244"
    click E245 "https://linear.app/resnovas/issue/EVE-245"
    click E246 "https://linear.app/resnovas/issue/EVE-246"
    click E247 "https://linear.app/resnovas/issue/EVE-247"
    click E248 "https://linear.app/resnovas/issue/EVE-248"
    click E249 "https://linear.app/resnovas/issue/EVE-249"
    click E250 "https://linear.app/resnovas/issue/EVE-250"
    click E251 "https://linear.app/resnovas/issue/EVE-251"
    click E252 "https://linear.app/resnovas/issue/EVE-252"
    click E253 "https://linear.app/resnovas/issue/EVE-253"
    click E254 "https://linear.app/resnovas/issue/EVE-254"
    click E255 "https://linear.app/resnovas/issue/EVE-255"
    click E256 "https://linear.app/resnovas/issue/EVE-256"
    click E257 "https://linear.app/resnovas/issue/EVE-257"
    click E258 "https://linear.app/resnovas/issue/EVE-258"
    click E259 "https://linear.app/resnovas/issue/EVE-259"
    click E260 "https://linear.app/resnovas/issue/EVE-260"
    click E261 "https://linear.app/resnovas/issue/EVE-261"
    click E262 "https://linear.app/resnovas/issue/EVE-262"
    click E263 "https://linear.app/resnovas/issue/EVE-263"
    click E264 "https://linear.app/resnovas/issue/EVE-264"
```

</details>
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
