<!-- linear:generated:start -->
# EVE-71: F7 Fleet and live operations: vehicles, maintenance, units, dispatch and crew MDT

[Live Linear source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:53.016Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-94](EVE-94.md), [EVE-97](EVE-97.md), [EVE-100](EVE-100.md), [EVE-106](EVE-106.md), [EVE-143](EVE-143.md), [EVE-145](EVE-145.md), [EVE-147](EVE-147.md), [EVE-148](EVE-148.md), [EVE-177](EVE-177.md), [EVE-181](EVE-181.md), [EVE-184](EVE-184.md), [EVE-186](EVE-186.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-13](EVE-13.md), [EVE-17](EVE-17.md), [EVE-18](EVE-18.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-33](EVE-33.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-73](EVE-73.md), [EVE-80](EVE-80.md), [EVE-81](EVE-81.md), [EVE-108](EVE-108.md), [EVE-154](EVE-154.md), [EVE-244](EVE-244.md), [EVE-245](EVE-245.md), [EVE-253](EVE-253.md), [EVE-254](EVE-254.md), [EVE-255](EVE-255.md), [EVE-256](EVE-256.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## BINDING owner decision — 15 November 2026: human-in-the-loop for ALL operational emergency actions

**Never automatically actuate a show-control or operational response from an incident, alarm, emergency sensor, issue classification, agent interpretation, integration alert or rules-engine event.** An alarm/event may be ingested, classified, displayed, logged, correlated, escalated to people, propose a configured SOP or preset, and notify designated staff; it must NOT automatically GO/hold/pause/mute audio, set venue lights/DMX, trigger PA/media/announcements, start emergency scene/preset, dispatch units or carry out other consequential incident-response operations. The possibility of false alarms and resulting public panic/harm is the rationale. This is an unconditional product policy for **operational incidents and alarms**, not an admin-configurable bypass or an exception for 'tested integration'. A permissioned, accountable **human must deliberately initiate** the approved action following assessment; log initiator, confirmation, linked incident, preset/version, result, and failures. Provide quick incident-linked actions but not default-on automatic acceptance.

**Differentiate ordinary show automation:** separately programmed and human-armed cue stacks, playback sequences, lighting console input, MIDI/OSC/MSC and timecode may continue to start permitted *non-emergency show cues* according to show programming; that is not authority for automatically activating an incident/emergency response. Incoming external signals claiming to be alarms are treated as alerts for human evaluation even if received over a show-control protocol. An external operator deliberately firing an authorized ordinary cue is still allowed, subject to arming and permissions.

**System-of-systems boundary:** independent certified fire alarms, evacuation/voice alarm, emergency lighting and physical overrides retain their own mandatory automatic functions. Eventiva's human-in-the-loop restriction is for Eventiva-initiated control actions and must not inhibit certified systems, lawful fire-panel interlocks, or physical emergency interventions. Do not call for an extra Eventiva confirmation where it could delay or prevent those independent measures. Any proposed direct control of safety-certified hardware requires separate safety engineering and approval.

**Acceptance criteria:** simulate a false fire/heat alarm and a mistakenly classified crowd incident: both notify MDT with a proposed response and initiate **zero** show/lighting/audio/PA/dispatch outputs without a deliberate authorized human action; no auto approval through agents, tenant rules or remote console input marked as emergency. Authorized manual response from MDT executes only the selected versioned preset and clearly reports partial success/failure. Ordinary human-armed playback and mapped external non-emergency cue input still work independently. Test no deferred/replayed emergency output after reconnect.

Implementation and dependencies remain unapproved.

## Bidirectional show/MDT emergency operation — owner clarification 15 November 2026

The control room must be able to invoke **preapproved venue show-control/emergency-response cue presets directly from an active incident or MDT screen** (e.g. nightclub injury or fire: approved work/house lighting and entertainment audio pause, and external console actions). Show the approved SOP, the responsible operator and each command's actual/unknown outcome alongside the F7 incident; log both linked incident and show events. The separate F1 local show executor remains responsible for cue execution and remote hardware commands; F7 must not have a duplicate playback engine. Conversely allow separately authorized, mapped incoming external control signals to create F7 alerts/issues, update an incident, start an SOP or request actions, and drive eligible F1 cues. Incident creation by itself must NOT automatically fire safety-affecting cues. <issue id="e6838c83-005e-4ec5-bc2f-931de6cd0cb8" label="EVE-256" href="https://linear.app/resnovas/issue/EVE-256/connect-mdt-incidents-and-external-controls-to-live-show-cues-and" /> specifies the bridge, mapping, offline-local, permission, hardware and safety acceptance tests. Independent fire alarm/emergency lighting/PA and physical controls remain authoritative.

Status: Proposed (2026-11-01). Feature set F7 from the [feature set spec template and list](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). Planning only; no code, no new dependency, no vendor sign-up until Jonathan approves the decisions in section 15.

**Why MDT is in this set.** The README says the Fleet Management module began as a tool for the distribution, maintenance and deployment of vehicles in emergency-service role play, and is now used for the same jobs at events. Mobile data terminal (MDT) work, meaning dispatch, units, status and crew comms, is how those vehicles are deployed. No other set in the list covers it (F2 covers rosters, F10 shows positions on a map, neither dispatches). So F7 covers two halves that share one record of vehicles, crews and units: **Fleet** (slices F7.1 to F7.5) and **Live operations** (F7.6 to F7.12). Decision D1 lets Jonathan split live operations into its own set instead.

## Shared planning and live-control model - user clarification

Eventiva does not treat event planning and MDT/live operations as separate products. They are two vocabulary and workflow profiles over one operational engine. The same primitives cover both real events and community role-play environments: a timed plan, incoming request, incident or task; assignment to a person, crew, department, unit or vehicle; acknowledgement and status transitions; controlled communication; append-only operational history; evidence and reports; and automation under permissions and approvals.

The event profile uses terms such as Event, Phase, Segment, Department, Cue, Crew and Show Control. A community/public-safety role-play profile may use operation, call, incident, unit, dispatcher and MDT. Internationalisation and tenant terminology packs change labels, templates, status sets and role names without forking the data model, action contract or client application. A profile can hide irrelevant modules and screens, but agents and APIs still use stable canonical action and entity identifiers. Community deployments are a deliberate proving ground for usability, offline behaviour, dispatch and scale, while test fixtures and documentation must never imply the software is a certified public-safety system.

Planning flows directly into control. Scheduled phases, segments, cues, shifts and readiness checks can create or prepare assignments and operational requests. Live requests can update the event log, task/status state and after-action reporting. A cue or state transition can notify staff and prepare downstream show-control actions. Safety-critical outputs - evacuation messages, door-state instructions, alarms, lighting/audio changes, MIDI/OSC/DMX output and similar actions - use explicit preconfigured procedures, current authorization, an auditable approval/arming policy and a local fail-safe path. An agent may correlate and propose; it cannot invent emergency procedures or bypass the responsible human and venue safety system. Initial releases coordinate these systems and do not claim to replace emergency services, certified alarms or competent-person control. The long-term product goal is a validated live safety and control-room profile. Promotion to that role is a separate safety case: named operational standards and jurisdictions, hazard analysis, independent verification, deterministic local execution, redundancy and degraded modes, immutable audit, competency and approval rules, exercises, maintenance and certification evidence. Until a deployment has that evidence, the UI and documentation state its coordination-only status; terminology or a feature flag cannot promote an uncertified deployment into a safety system.

This means the first product vertical is one Event Operations slice: F1.1 supplies the Event/Phase/Space/Team/Department anchor, then F7.6 to F7.9 supply units, requests/incidents, dispatch, MDT and acknowledged messaging. The deeper planning and production slices then add run-of-show, cues, departmental plans and show-control bridges onto the same request/assignment/log engine rather than building a second operations subsystem.

## 1. Goal

An event company knows every vehicle it owns or hires, keeps each one legal and maintained, books it onto events without clashes, and runs live operations from one control screen that dispatches crews and vehicles to jobs and hears back from them, on any device, with the agent able to do all of it through the same actions.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Fleet manager | Register owned and hired vehicles, keep documents in date, plan services, approve defects off road, see cost per vehicle and per event |
| Event organiser / production manager | Ask for vehicles for an event or phase, see what is allocated and when it arrives |
| Controller (dispatcher) | Open the control log for a live event, create jobs and incidents, assign the nearest suitable unit, watch statuses, message crews, close jobs |
| Crew lead / driver | Do the walkaround check, see today's vehicle and jobs, change status, accept a job, navigate, message control, report defects and fuel |
| Mechanic (staff or external garage) | See work orders, record work done and parts, return a vehicle to service |
| Hire company (external vendor) | See and confirm bookings of their vehicles, upload documents, nothing else |
| Finance | Export fuel, maintenance and hire costs per event to F11 |
| Agent (built in or external, delegated) | Everything above within the delegating user's permissions; proactive checks listed in section 7 |

Main journeys: (J1) hire a van for a festival build and allocate a driver; (J2) daily walkaround finds a defect, vehicle goes off road, the booking is reassigned; (J3) on show day the controller logs a medical call, the agent proposes the nearest available unit, the controller dispatches, the crew accepts on their phone and reports on scene; (J4) a crew loses signal behind a stage, keeps changing status, and control sees the queued updates in order when it reconnects; (J5) after the event, finance exports fleet costs and the safety officer exports the control log.

## 3. Market check

From public product pages, not hands-on trials. Names stay out of customer-facing copy.

| Tool | What it does well | Eventiva matches | Eventiva differs |
| -- | -- | -- | -- |
| Samsara (telematics-first fleet platform) | Own GPS and camera hardware, live location, driver app with inspections (DVIR), hours of service, routing, safety scoring | Driver app inspections, live positions, vehicle documents | No own hardware; location comes from the crew phone first and a telematics port later (D3). No dashcams or safety scoring. Vehicles are booked against events, which Samsara has no notion of |
| Fleetio (maintenance-first fleet software) | Service reminders by date and mileage, work orders, inspections, fuel, parts, integrates many telematics feeds | Service schedules, work orders, inspections, fuel and mileage | No parts inventory of its own (parts are F6 Products); costs flow to event budgets in F11 |
| Resgrid (open-source dispatch for volunteer responders) and event control-log tools | Units and personnel with statuses, calls, assignment, messaging, map; event tools add a timestamped control log for safety audit | Units, configurable status codes, incidents with an append-only log, dispatch, messaging, map via F10 | Not a public-safety CAD and never a replacement for emergency services (section 11). Built into the event record, offline-aware crew mode in the same app, agent proposals with approval |

Gaps we accept for v1: no dashcam or tachograph data (D6), no route optimisation across many stops, no voice radio (D2).

## 4. Capabilities as actions

Every operation is one inventory action ([EVE-40](<https://linear.app/resnovas/issue/EVE-40>)): Effect Schema input and output, typed errors, one permission, audit, change record with undo where it mutates. Names follow the <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> inventory naming once fixed; shown here as `module.entity.verb`. Approval: none unless stated.

| Action | Input | Output | Permission | Side effect / approval |
| -- | -- | -- | -- | -- |
| `fleet.vehicle.create` / `update` / `archive` | registration, type, make, model, ownership (owned, hired, lent), capacity, fuel type, home base | Vehicle | `fleet:vehicle:write` | write |
| `fleet.vehicle.get` / `list` | filters (type, status, base, available between) | Vehicle(s) | `fleet:vehicle:read` | read |
| `fleet.vehicleType.define` | name, licence categories needed, inspection template, service interval | VehicleType | `fleet:config:write` | write |
| `fleet.document.attach` / `expire` | vehicle, kind (insurance, registration, roadworthiness, hire agreement), file ([EVE-25](<https://linear.app/resnovas/issue/EVE-25>)), valid from/to | VehicleDocument | `fleet:vehicle:write` | write |
| `fleet.driver.checkEligibility` | worker, vehicle or type, date | eligible, reasons | `fleet:vehicle:read` | read |
| `fleet.booking.request` / `allocate` / `release` / `reassign` | vehicle or type, F1 Event or Phase, from/to, driver | VehicleBooking | `fleet:booking:write` | write; reassign on a live event asks confirm |
| `fleet.booking.listConflicts` | range | conflicts | `fleet:booking:read` | read |
| `fleet.hire.requestFromVendor` | vendor organisation (F4), type, range | VehicleBooking (pending vendor) | `fleet:booking:write` | external; always approval for agent |
| `fleet.inspection.start` / `submit` | vehicle, template, answers, photos, odometer | Inspection, Defects | `fleet:inspection:submit` | write, works offline |
| `fleet.defect.raise` / `triage` / `close` | vehicle, severity (advisory, fix soon, off road), notes | Defect | raise: `fleet:inspection:submit`; triage: `fleet:maintenance:write` | write; marking a vehicle back on road asks confirm |
| `fleet.vehicle.setRoadStatus` | vehicle, on road / off road, reason | Vehicle | `fleet:maintenance:write` | write; confirm |
| `fleet.service.schedule` / `workOrder.open` / `workOrder.complete` | vehicle, tasks, due by date or mileage, garage, parts, labour, cost | ServiceSchedule, WorkOrder | `fleet:maintenance:write` | write |
| `fleet.fuel.log` / `odometer.record` | vehicle, litres or kWh, cost, receipt, reading | FuelEntry, OdometerReading | `fleet:inspection:submit` | write, offline |
| `fleet.costs.exportForEvent` | event, range | cost lines for F11 | `fleet:finance:read` | read |
| `ops.unit.form` / `update` / `disband` | event, call sign, vehicle (optional), members, capabilities (first aid, tow, 4x4) | Unit | `ops:unit:write` | write |
| `ops.status.define` | event or tenant, code, label, colour, meaning (available, committed, unavailable) | StatusCode | `ops:config:write` | write |
| `ops.unit.setStatus` | unit, status code, device time, location (optional) | StatusChange | `ops:status:set` (own unit) or `ops:dispatch` (any) | write, offline queue |
| `ops.incident.create` / `update` / `close` / `reopen` | event, kind, priority, location (text, map point, F10 zone), caller, notes | Incident | `ops:incident:write` | write |
| `ops.incident.log` | incident, entry text, attachments | IncidentLogEntry (append-only) | `ops:incident:write` | write, offline |
| `ops.dispatch.suggestUnits` | incident | ranked units with reasons | `ops:dispatch` | read |
| `ops.dispatch.assign` / `unassign` | incident, unit(s) | IncidentAssignment | `ops:dispatch` | write; agent always needs controller approval |
| `ops.assignment.acknowledge` / `decline` | assignment, reason | IncidentAssignment | `ops:status:set` | write, offline queue |
| `ops.message.send` / `broadcast` / `acknowledge` | to unit, group or all units on an event; text; priority | Message ([EVE-24](<https://linear.app/resnovas/issue/EVE-24>)) | `ops:message:send` | external (push); broadcast by agent needs approval |
| `ops.position.report` | unit or device, lat, lon, accuracy, time | none (live stream) | `ops:position:report` | write, ephemeral |
| `ops.position.list` | event, units | latest positions | `ops:position:read` | read |
| `ops.controlLog.export` | event, range | file | `ops:log:export` | read |
| `nav.open` (from [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>)) | any F7 screen | screen | screen permission | read |

## 5. Data model

All records carry tenant (organisation) scope and are guarded by [EVE-42](<https://linear.app/resnovas/issue/EVE-42>) tenant guards. F1 entities (names fixed in [EVE-73](<https://linear.app/resnovas/issue/EVE-73>) section 5) are referenced by id and not redefined: **Event** (anchor), **Phase** (load in, show, load out and so on), **Space** (a dock or yard a vehicle is booked to), **EquipmentRequirement** (transport needs per Event, Phase and Department), **TeamMember**, **Department**, **Itinerary** and **ItineraryItem** (kind travel, for moving people). F6 ([EVE-63](<https://linear.app/resnovas/issue/EVE-63>)) models each Vehicle as a stock Location of type vehicle, so loading a truck is an F6 stock movement and F7 does not track load lists. Other sets referenced: F2 **Shift** and **Roster**, F4 **Organisation** (hire company, garage), F6 **Product** (parts, [EVE-81](<https://linear.app/resnovas/issue/EVE-81>)) and **Location** (type vehicle), F10 **Site map**, **Layer** and **Zone**, F11 **Cost line**, F13 ([EVE-80](<https://linear.app/resnovas/issue/EVE-80>)) **Worker** and **Qualification** of a **QualificationType**, read through the shared QualificationReader port ([EVE-154](<https://linear.app/resnovas/issue/EVE-154>)).

| Entity | Key fields | Relations | Offline sync | Conflict rule |
| -- | -- | -- | -- | -- |
| Vehicle | registration, type, ownership, road status, home base, odometer (derived) | VehicleType, Organisation (owner or hirer) | Yes, read and write | Per-field last writer wins; road status follows the latest Defect triage, never a stale offline edit |
| VehicleType | name, licence categories, inspection template, service interval |  | Yes, read only on devices | Admin online only |
| VehicleDocument | kind, file, valid from/to | Vehicle | Yes | Append new version; never overwrite |
| VehicleBooking | vehicle or type, Event, optional Phase and Space, optional EquipmentRequirement it fulfils, range, driver, state (requested, vendor pending, allocated, released) | built on [EVE-33](<https://linear.app/resnovas/issue/EVE-33>) bookings | Read offline; write online only | Server decides; a clash is a typed error, not a merge |
| InspectionTemplate | items, required photos, failure severity per item | VehicleType | Yes | Versioned |
| Inspection | template version, answers, photos, odometer, device time | Vehicle, Worker | Yes, created offline | Append-only |
| Defect | severity, notes, photos, state | Inspection, Vehicle, WorkOrder | Yes | State machine ([EVE-42](<https://linear.app/resnovas/issue/EVE-42>)); server rejects illegal transitions on replay and tells the author |
| ServiceSchedule, WorkOrder | tasks, due date/mileage, garage, parts (F6 Product ids and quantities), labour, cost | Vehicle, Organisation | Yes | Per-field last writer wins; completed is terminal |
| FuelEntry, OdometerReading | amount, cost, receipt, reading | Vehicle | Yes | Append-only; a reading lower than the last one is flagged, not stored as current |
| Unit | call sign, members, vehicle, capabilities | Event, Workers, Vehicle, Shift | Yes | Per-field last writer wins |
| StatusCode | code, label, colour, meaning | tenant or Event | Yes, read only | Admin online only |
| StatusChange | unit, code, device time, server time, source (crew, controller, agent) | Unit | Yes, queued offline | Append-only. Current status = latest by device time, except a controller change made after the device time wins (control is authoritative) |
| Incident | kind, priority, location, state, summary (Yjs text) | Event, F10 Zone | Yes | Fields: last writer wins; summary: Yjs ([EVE-51](<https://linear.app/resnovas/issue/EVE-51>)); state machine on server |
| IncidentLogEntry | text, author, device time, server time | Incident | Yes | Append-only, never edited; corrections are new entries |
| IncidentAssignment | incident, unit, state (assigned, acknowledged, declined, cleared) | Incident, Unit | Yes, acknowledgement queued offline | Assign and unassign only online by control, serialised per event (below) |
| PositionFix | unit or device, lat, lon, accuracy, time | Unit | Not synced through the record engine; live stream only, last known kept on device | Newest time wins; retention per section 11 |

Ordering and safety: each live event's dispatch board is one Effect Cluster entity keyed by event id ([EVE-54](<https://linear.app/resnovas/issue/EVE-54>), sharding first per <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />), so assignments and status for one event are applied in one order on one runner, survive runner loss, and are idempotent by command id ([EVE-39](<https://linear.app/resnovas/issue/EVE-39>)). Changes reach screens through the change feed ([EVE-45](<https://linear.app/resnovas/issue/EVE-45>)). Sync engine per [EVE-17](<https://linear.app/resnovas/issue/EVE-17>) (S4).

## 6. Screens

Components come from Rambo-UI (names proposed, library has no components yet). Each screen declares a screen-context projection ([EVE-50](<https://linear.app/resnovas/issue/EVE-50>)) filtered by permissions; every control binds to an action in section 4.

| Screen | Components | Projection (what the agent sees) | Controls and actions |
| -- | -- | -- | -- |
| Fleet list | DataTable, FilterBar, StatusBadge | visible vehicles, filters, selection | open, create, archive, setRoadStatus |
| Vehicle detail | Tabs, Form, DocumentList, Timeline | vehicle, documents with expiry, open defects, next service, bookings | update, document.attach, service.schedule, booking.allocate |
| Fleet calendar | Timeline (resource rows), Popover | range, rows, clashes | booking.request, allocate, reassign, release, listConflicts |
| Inspection (mobile) | Checklist, Camera, NumberInput | template, answers so far, offline flag | inspection.submit, defect.raise, odometer.record |
| Maintenance board | Kanban, Form | work orders by state | [workOrder.open](<http://workOrder.open>), complete, defect.triage |
| Control (live event) | SplitView: IncidentList, UnitBoard, Map (F10), MessagePanel | open incidents, unit statuses, positions, selected incident, connection state | incident.create, log, dispatch.suggestUnits, assign, unit.setStatus, message.send, broadcast |
| Incident detail | Timeline (log), Form, AssignmentList | incident, log, assignments | update, log, assign, unassign, close |
| Crew MDT mode (mobile, same app) | BigButtonGrid (status), JobCard, MessageList, OfflineBanner | my unit, my status, current job, unread messages, queued updates, last sync time | setStatus, acknowledge, decline, log, message.send, defect.raise, open navigation |
| Fleet settings | Form, Table | vehicle types, status codes, templates | vehicleType.define, status.define |

The crew MDT mode is not a separate app: it is a layout the one app shows when the signed-in person has an active unit on a live event (<issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> one-app rule).

## 7. Agent behaviour

Proactive (shown as suggestions, never acted on alone): documents expiring within 30 days; service due by date or mileage; booking clashes and unbooked vehicle requests; drivers not eligible for an allocated vehicle; an incident with no unit acknowledged after a configurable time (default 2 minutes) with the next best unit; a unit with no status change or position for a configurable time; a defect marked off road that still has a booking.

When asked: create and update vehicles, plan a fleet for an event from its F1 phases, propose allocations, draft hire requests, summarise the control log, answer "where is unit 3 and what is it doing".

Needs approval: `ops.dispatch.assign` and `unassign` (controller must confirm every agent dispatch), `ops.message.broadcast`, `fleet.hire.requestFromVendor` (external), `fleet.vehicle.setRoadStatus` to on road, `fleet.booking.reassign` on a live event. The agent never closes an incident on its own. Offline: the agent can use local data (vehicle list, inspections) and says when a live action needs connection.

## 8. Integrations

Each behind a neutral Effect port in its own integration package; switching vendor changes composition only. No vendor is chosen in this issue.

* **Maps and geocoding**: reused from F10, not owned by F7.
* **Navigation hand-off**: open the device's navigation app with a destination (platform link, no vendor SDK).
* **Push and messaging**: [EVE-24](<https://linear.app/resnovas/issue/EVE-24>) channels.
* **Telematics** (port only in v1, D3): `TelematicsPort` for positions, odometer and fault codes; adapters for a named provider later with approval.
* **Vehicle registration lookup** (optional, later): port for national registry lookups such as the UK DVLA vehicle enquiry; no adapter in v1.
* **Accounting export**: through F11, not direct.

## 9. Permissions and roles

Default roles (tenants can edit through F14 customisation): Fleet manager (all `fleet:*`), Mechanic (`fleet:maintenance:write`, read vehicles), Driver (`fleet:inspection:submit`, read own bookings), Event organiser (`fleet:booking:read`, request), Controller (`ops:*` for events they control), Crew member (`ops:status:set` and `ops:message:send` for own unit, `ops:position:report`, read own incidents), Safety officer (`ops:log:export`, read all ops on an event), Finance (`fleet:finance:read`). External: a hire company sees only bookings of its own vehicles and can upload documents to them; a garage sees only its work orders. Crew see positions of other units only if the event setting allows it (default: off for crew, on for control). Agents act with the delegating user's permissions ([EVE-43](<https://linear.app/resnovas/issue/EVE-43>)) and revocation applies to running sessions.

## 10. Telemetry and flags

Flags: `eventiva-fleet` (slices F7.1 to F7.5) and `eventiva-live-ops` (F7.6 to F7.12), default off in code; `eventiva-fleet-telematics` for F7.11. Events (PostHog, through [EVE-44](<https://linear.app/resnovas/issue/EVE-44>)): `fleet_vehicle_created`, `fleet_booking_allocated`, `fleet_booking_conflict_shown`, `fleet_inspection_submitted` (offline: yes/no), `fleet_defect_raised` (severity), `ops_incident_created`, `ops_unit_assigned` (by: human/agent), `ops_assignment_acknowledged` (seconds since assign), `ops_status_changed` (queued offline: yes/no, delay), `ops_agent_suggestion_accepted`. No positions, names or incident text in analytics. Spans on every action ([EVE-44](<https://linear.app/resnovas/issue/EVE-44>)).

Success metrics: median time from incident created to unit acknowledged under 60 seconds on a live event; zero vehicle double bookings reaching an event day; 95 percent of vehicles used on an event day have a walkaround check that day.

## 11. Compliance

* **Not an emergency service.** Eventiva dispatch coordinates event staff; it does not replace calling emergency services or a public-safety control system. Shown in the control screen and terms.
* **Personal data (UK GDPR / EU GDPR).** Driver licence details and location are personal data. Licence data lives in F13 (D5). Location: one collector for all of Eventiva (F7.10), active only while a person is on an active unit on a live event, or on a current F2 Shift of a live event and has opted in (F10 renders a Crew layer from it), visible indicator in the app, lawful basis and a DPIA template supplied for tenants, default retention 30 days for position history (tenant can shorten), last-known position only otherwise.
* **Control log as a record.** Append-only, timestamped by device and server, exportable; default retention 6 years (common UK limitation period for claims), tenant configurable.
* **Vehicle roadworthiness.** Daily walkaround checks support operators' duties (for example DVSA guidance for HGV and PSV operators); Eventiva records them but does not certify compliance.
* **Drivers' hours and tachographs**: out of scope v1 (D6).
* Whitelabel, ASCII-only customer text.

## 12. Acceptance (set as a whole)

1. Every action in section 4 is in the inventory and reachable from UI, HTTP, MCP and the agent; the parity check passes.
2. Journeys J1 to J5 pass as end-to-end tests, J3 and J4 with a human and the agent each driving.
3. Offline: a crew device in airplane mode submits an inspection, three status changes and an acknowledgement; on reconnect the server applies them in device order, control sees them, and a controller change made in between wins.
4. Two controllers assigning the same unit at once: exactly one assignment succeeds, the other gets a typed conflict error.
5. Dispatch board survives a runner kill mid-event with no lost or duplicated assignments ([EVE-18](<https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and>) harness).
6. A hire company user cannot read another vendor's vehicle or any incident (negative tenant and role tests).
7. Agent dispatch without controller approval is refused.
8. No location is recorded for a person who is neither on an active unit nor on a current Shift with opt-in.

## 13. Out of scope

Own telematics hardware, dashcams and driver scoring; tachograph and drivers' hours (D6); route optimisation over many stops; voice radio and push to talk (D2); public-safety CAD standards (for example NENA or APCO data exchange); parts inventory (F6 owns Products); payroll for drivers (F12); fuel card integrations; vehicle telematics adapters beyond the port (D3).

## 14. Dependencies

* Phase 1: [EVE-40](<https://linear.app/resnovas/issue/EVE-40>) actions, [EVE-41](<https://linear.app/resnovas/issue/EVE-41>) config, [EVE-42](<https://linear.app/resnovas/issue/EVE-42>) storage and state machines, [EVE-43](<https://linear.app/resnovas/issue/EVE-43>) identity and audit, [EVE-44](<https://linear.app/resnovas/issue/EVE-44>) telemetry, [EVE-45](<https://linear.app/resnovas/issue/EVE-45>) change feed, [EVE-46](<https://linear.app/resnovas/issue/EVE-46>) HTTP, [EVE-48](<https://linear.app/resnovas/issue/EVE-48>) MCP, [EVE-50](<https://linear.app/resnovas/issue/EVE-50>) screen awareness, [EVE-51](<https://linear.app/resnovas/issue/EVE-51>) collaboration, [EVE-52](<https://linear.app/resnovas/issue/EVE-52>) agent loop, [EVE-54](<https://linear.app/resnovas/issue/EVE-54>) durable runs, [EVE-17](<https://linear.app/resnovas/issue/EVE-17>) sync engine, [EVE-39](<https://linear.app/resnovas/issue/EVE-39>) idempotent entity actions.
* Port-later: [EVE-24](<https://linear.app/resnovas/issue/EVE-24>) notifications and messaging, [EVE-25](<https://linear.app/resnovas/issue/EVE-25>) files, [EVE-27](<https://linear.app/resnovas/issue/EVE-27>) comments, [EVE-33](<https://linear.app/resnovas/issue/EVE-33>) bookings.
* Feature sets: F1 events (required), F13 staff and qualifications (F7.2), F2 rosters (F7.6 unit members from shifts), F4 organisations (hire companies, garages), F6 Products and vehicle stock Locations (parts, loads), F10 maps (F7.10), F11 costs (F7.5 export), F14 customisation (roles, status codes, templates).

## 15. Decisions for Jonathan

Pick one per row; the recommendation is marked.

| \# | Decision | Options | Recommended |
| -- | -- | -- | -- |
| D1 | Where live operations (MDT) lives | (a) Inside F7, renamed Fleet and live operations, two flags; (b) split into a new set F15 Live operations | **(a)**: one shared record of vehicles, crews and units, and the README origin is dispatch of vehicles |
| D2 | Crew comms in v1 | (a) In-app text messages with acknowledgement and priority; (b) plus in-app push to talk; (c) plus a bridge to existing radio systems | **(a)**: works offline-queued, auditable, no new dependency; push to talk and radio bridges become later issues |
| D3 | Location source in v1 | (a) Crew phone GPS while on an active unit, telematics port defined but no adapter; (b) telematics adapter first; (c) both at once | **(a)**: no hardware or vendor needed, covers hired vehicles |
| D4 | Dispatch while control is offline | (a) Not allowed; control screen goes read-only with a clear banner, crews keep queueing status; (b) allow offline assignment and merge later | **(a)**: two offline controllers could send two units or none; one authoritative order is the safe behaviour |
| D5 | Where driver licences live | (a) F13 owns licences as Qualifications, F7 reads them for eligibility; (b) F7 owns driver licences | **(a)**: one staff record, no duplicate personal data |
| D6 | Drivers' hours and tachographs | (a) Out of scope v1, recorded as a later issue; (b) simple driving-time log per shift in v1 | **(a)**: legal rules differ by vehicle class and country; a half version would mislead |

## 16. Child issues (build order)

Fleet:

1. [EVE-94](<https://linear.app/resnovas/issue/EVE-94>) F7.1 Vehicle register
2. [EVE-97](<https://linear.app/resnovas/issue/EVE-97>) F7.2 Driver eligibility
3. [EVE-100](<https://linear.app/resnovas/issue/EVE-100>) F7.3 Vehicle bookings and allocation to events
4. [EVE-106](<https://linear.app/resnovas/issue/EVE-106>) F7.4 Walkaround inspections and defects
5. [EVE-143](<https://linear.app/resnovas/issue/EVE-143>) F7.5 Maintenance, fuel, mileage and costs

Live operations:

 6. [EVE-145](<https://linear.app/resnovas/issue/EVE-145>) F7.6 Units and operational status
 7. [EVE-147](<https://linear.app/resnovas/issue/EVE-147>) F7.7 Incident control log and dispatch
 8. [EVE-148](<https://linear.app/resnovas/issue/EVE-148>) F7.8 Crew MDT mode
 9. [EVE-177](<https://linear.app/resnovas/issue/EVE-177>) F7.9 Control and crew messaging
10. [EVE-181](<https://linear.app/resnovas/issue/EVE-181>) F7.10 Live positions on the event map
11. [EVE-184](<https://linear.app/resnovas/issue/EVE-184>) F7.11 Telematics port
12. [EVE-186](<https://linear.app/resnovas/issue/EVE-186>) F7.12 Agent assist for fleet and dispatch

## Linear comments (14)

### Comment 06d57ddb-2553-48e9-b7c9-ed194d9ac5b7

Author: GitHub. Created: 2026-11-01T13:06:22.607Z; updated: 2026-11-01T13:06:22.547Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/838). All replies are displayed in both locations.


### Comment c7865da9-d490-4fae-a4c0-f53f93c2cb68

Author: jonathan@resnovas.com. Created: 2026-11-11T18:57:27.234Z; updated: 2026-11-11T18:57:27.149Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

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


### Comment 3b8bd43f-58bb-4a3f-8eb5-3b561204cf4e

Author: jonathan@resnovas.com. Created: 2026-11-11T19:09:48.219Z; updated: 2026-11-11T19:09:48.167Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

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


### Comment 57141262-a413-49a2-9c73-5514ebb8c931

Author: jonathan@resnovas.com. Created: 2026-11-11T19:14:01.475Z; updated: 2026-11-11T19:14:01.386Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

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


### Comment 8aca2a3e-ae72-42de-a731-c29d7c5bd79e

Author: jonathan@resnovas.com. Created: 2026-11-11T19:15:09.734Z; updated: 2026-11-11T19:15:09.628Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

Correction from Jonathan: operational/domain terminology and phraseology are selected by the tenant administrator and apply consistently across the tenant, not chosen independently by each end user.

- Tenant policy selects the active domain vocabulary and operational/communication profile, with optional event/channel-specific profile only where explicitly governed for interoperability.
- End users cannot independently switch MDT/status/radio/operational terminology, because inconsistent wording within one tenant could create confusion and unsafe handovers.
- Personal preference remains available only for language/locale and accessibility presentation where it does not alter canonical operational meaning; tenant policy may also fix locale for regulated/shared forms.
- Admin changes require preview, mapping/ambiguity checks, training/content impact analysis, versioned activation and audit. Historical records retain the profile/version under which they were created.
- Cross-tenant or multi-agency collaboration displays canonical/plain-language equivalents and source profile labels without changing either tenant’s configured vocabulary.
- Agents use the tenant/event/channel profile consistently for every participant.

This supersedes the user-selectable terminology wording in the immediately preceding comment on each issue.


### Comment 4b4184dc-a72e-4f8a-9910-a8127ed644b6

Author: jonathan@resnovas.com. Created: 2026-11-13T20:10:47.350Z; updated: 2026-11-13T20:10:47.301Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

Product design decision confirmed by Jonathan (2026-11-13): **CAD-style, list/queue-first control room for the initial Eventiva live-operations demonstration**. Prioritise the incident/job queue, unit/status board, assignment and acknowledgement workflow, and timestamped operational log over a large map-first interface. The MDT/live-ops capability is the first product vertical; event planning and production tooling will be developed around the same operational core.

**Maps remain an optional/context-dependent view**, not the structural centre of the control room. Map extent, base layers, detail and road/site overlays differ by operational context: a festival in a field needs a detailed site plan and perhaps access roads, while a city-scale public-safety role-play scenario may need a much larger road map. Do not hard-code police/city assumptions or require map/geolocation data to dispatch a unit; keep the underlying units, incidents, assignments, status changes and action contracts consistent.

This is UX/roadmap direction, not approval for new dependencies or implementation. Preserve the existing safety boundary (coordination-only initial deployments, controller approval for AI-proposed dispatch). Follow up with Jonathan on the precise CAD screen priorities and map-switching behaviour. Related: EVE-147, EVE-148, EVE-73.


### Comment 6d21c70e-b56d-402c-8a6d-08184b4278fc

Author: jonathan@resnovas.com. Created: 2026-11-13T20:12:52.978Z; updated: 2026-11-13T20:12:52.907Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

Product design decision from Jonathan (2026-11-13): **initial CAD/live-operations MVP must support both crew-submitted incident/service requests and preconfigured, pre-scheduled production work**. Crew can submit an incident/request from MDT; controllers can also log incoming calls/radio reports manually.

An event producer must be able to create work in advance (e.g. "Crew A rigs the sound system in location X"), assign an intended crew/role and venue/space, and schedule it relative to an Event, Phase or cue. **Separate views/states:** (1) Scheduled/Upcoming for future work not yet active, (2) Active/Dispatch for actionable work and incoming incidents, (3) operational history/completed. A scheduled job should become actionable near its planned start at a configurable lead time, retaining a distinction between planned job vs unscheduled incident/request. Avoid flooding dispatch with far-future work.

**Tour/repeat use case:** production templates define repeatable jobs relative to per-show milestones, with individual Event instances for each venue/date; allow venue-specific location/crew/time substitutions and exceptions without duplicating the core operational-action model. A planned task flows into the same assignment, acknowledgement, status and audit system as a live incident, while retaining its source/type and link to its original plan. Event reschedules should recalculate future relative times with visible conflicts/notifications; do not silently change already active/completed work.

This is design scope, not approval to implement or install dependencies. **Open decision:** should time-triggered jobs enter Active automatically, or require controller release/approval? See EVE-62 (F3 event tasks/templates), EVE-73 (F1 event plans/tours), EVE-147 (incident dispatch), EVE-148 (crew MDT). Maintain coordination-only safety scope and controller approval for AI-dispatched assignments.


### Comment 549af67f-1fb3-417e-8470-9d18d02237f3

Author: jonathan@resnovas.com. Created: 2026-11-13T20:16:01.983Z; updated: 2026-11-13T20:16:01.957Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Live-operations scheduling and dependency decision — Jonathan, 13 Nov 2026

**User-approved design direction:** Support both release modes for pre-scheduled production tasks: **automatic is the preferred default**, and **controller approval before dispatch** is configurable for an organisation/event/task according to its policy. Crew can be assigned to their planned tasks in advance, so work is visible and prepared without requiring controllers to manually dispatch every routine job. An already assigned/scheduled item is **not necessarily active or safe to start**.

**Hard dependency gate:** A scheduled task may activate only when (a) its planned start/release condition is satisfied, (b) **every required predecessor dependency is completed and any required sign-off is valid**, and (c) any configured controller release/approval has occurred. For example **Install power → Install lighting rig**: even when the lighting task's scheduled start time arrives, it must remain blocked if power installation is incomplete. Neither a timer nor an agent may bypass this gate. When prerequisites clear after the scheduled start, auto-release the eligible task in automatic mode; in manual mode place it in the controller's ready-for-release queue. Detect cycles and do not silently ignore broken references, revoked sign-offs or failed completion validation. For work already active when a predecessor is later reopened or invalidated, surface a safety/blocker alert and require a documented operational decision rather than silently rewinding its history.

**CAD/MDT presentation:** Distinguish Upcoming/Scheduled, Blocked/Waiting, Ready-to-release, Active/In progress, Complete and Cancelled in views/status projections, without replacing F3's canonical Task status categories or F7's separate Incident statuses. A task behind schedule with unmet dependencies remains **blocked and late**, not active; display its scheduled time, elapsed delay, precise blocker(s), responsible crew and downstream jobs at risk. Surface this in both the controller's CAD board and the assigned crew's MDT. Use colour + text/icon (not colour alone), with accessible high-contrast and screen-reader status. Make upcoming and blocked tasks visible to assignees but prevent 'start', operational dispatch and unsafe next-step actions until unblocked. Show critical downstream consequences, and consider configurable notifications/escalation while avoiding alert floods.

**Technical boundaries:** Use the F3 canonical TaskTemplate/TaskDependency model, Event/Phase relative dates and F7 operations action inventory, with one auditable workflow rather than duplicating separate task engines. Repeated tour dates instantiate independent task schedules and dependencies with per-venue substitutions. Offline state may show last-known readiness but must not fabricate a verified dependency completion or initiate privileged dispatch without current authorization. Agent proposals remain subject to the same dependency and approval gates; live incident dispatch still requires controller approval. Clarify state-vs-eligibility and exact notification thresholds during implementation planning.

This records UX/functional policy, not approval for code changes or dependencies; do not interrupt the four currently researching foundation orbs.

**F7 scope:** CAD's scheduled/blocked/active lanes and crew MDT mirror eligibility. DispatchBoard consumes canonical F3 readiness; release policy configurable per context.


### Comment cdb2196d-2ef9-472b-adba-68c6fa179e3e

Author: jonathan@resnovas.com. Created: 2026-11-13T20:23:21.517Z; updated: 2026-11-13T20:23:21.494Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

Decision from Jonathan (13 November 2026): **Automatically and continuously recalculate the working/forecast schedule of dependency-linked tasks as their predecessors run late. Preserve the original planned schedule unchanged for comparison and audit.** This supersedes the earlier proposal for human confirmation of each automatic cascade, but does not grant any agent authority to bypass execution approvals or safety-critical sign-offs.

Required model and behaviour:
- Persist an immutable original/baseline scheduled start and finish (or original duration/offset); retain subsequent plan revisions and the reasons/actor/time for changes, rather than overwriting history. Distinguish this baseline from the current forecast/effective planned times and actual start/finish.
- Forecast dependent tasks against predecessor completion/forecast completion, duration, any finish-to-start lag, task's earliest permitted start, and relevant constraints. Recompute downstream critical paths on fresh status/estimate changes; propagate delays through the dependency graph. Don't assume a precise new time when predecessor ETA is unknown: indicate uncertainty/awaiting estimate.
- **Delay = working/forecast start minus original baseline start**, displayed explicitly as a duration, alongside original time, current forecast time, blocking predecessor(s), and affected downstream tasks. Keep an accessible CAD and crew MDT presentation with conspicuous textual/icon overdue/blocked and knock-on indicators; use colour as supplement.
- Keep dependency gating separate from timetable forecasting: scheduled tasks may be preassigned and visible but must not become active before prerequisites/sign-off and applicable release approval. Recalculation must not silently shift actual/historical completions, override a manually locked commitment or erase the original schedule.
- Repeated tour/event templates instantiate per-event baselines. Preserve cross-event visibility without silently modifying a different show's locked commitments.

Example: power work originally due to complete 10:00; lighting originally scheduled to begin 10:00, forecast power completion changes to 10:45 -> lighting forecast start becomes 10:45 or later according to other prerequisites, displayed +45 min versus its original 10:00 baseline. If power ETA changes, update the lighting forecast and downstream impacts accordingly.

This is a product-spec decision, not an instruction to implement now or approve dependencies; foundation AMP orbs remain on their existing tasks.

F7 CAD and crew MDT consume the canonical F3 forecast/impact projection and make original versus current schedule visible. Do not duplicate a scheduler in dispatch.


### Comment 6c1ceaae-6636-4596-a193-ce368f725f27

Author: jonathan@resnovas.com. Created: 2026-11-13T20:25:25.203Z; updated: 2026-11-13T20:25:25.186Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

**Product decision, 13 Nov 2026 (Jonathan): delay tolerance for automated dependency rescheduling.** Set default tolerance to **10 minutes** (correcting initial verbal suggestion of five). It must be configurable as **any numeric minute value from 5 to 60 inclusive**, with range validation; do not limit to preset options such as 5/10/15-minute increments. Expose an editable tolerance in the appropriate authorised scheduling configuration, inherited as the default for new schedules/events, with effective value visible in the UI.

**Semantics:** Continuously calculate and display actual/estimated lateness, original baseline, current projected times and knock-on effects, even below the tolerance. The configured threshold controls when a newly predicted delay should **trigger an automatic rescheduling cascade / revision of the working schedule and corresponding notifications**, not whether users can see the delay. At or above the tolerance, apply the automatic cascade; do not overwrite the immutable original baseline or actual historical times. Required finish-to-start dependencies and any safety/approval gates remain strictly enforced **regardless of tolerance**: a 9-minute delay under a 10-minute tolerance never authorises an otherwise blocked dependent task to start. If a prerequisite is not done, display it as blocked even if no cascade has yet been triggered. Avoid repeatedly duplicating schedule revisions while a delay remains unchanged; use idempotent updates and clearly show a live forecast distinct from the last committed working schedule when relevant.

Avoid making per-person terminology/preferences override tenant operational governance; decide the exact configuration scope as part of the UI/policy design. This is a requirements decision, not permission to change code, introduce packages or interrupt the foundation orbs.
F7 CAD and crew MDT display the effective threshold and reflect F3's projections; do not create an independent dispatch scheduler.


### Comment e49f736c-0dd1-4abf-abe7-70515e14e203

Author: jonathan@resnovas.com. Created: 2026-11-15T01:45:09.727Z; updated: 2026-11-15T01:45:09.713Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Approved foundation policy reference

Jonathan approved A2–A4 and S2–S4 on 2026-11-15. Approval cannot be self-issued or weakened; guarded offline/scheduled work uses explicit state/version/idempotency/deadline and online revalidation; protected audit fails closed; scarce resources use ledgers/reservations/CAS; device records use typed raw tables/migrations; migrations are forward-only expand/contract; canonical IDs/time/decimals follow S4. See [EVE-40](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema), [EVE-42](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) and the [decision sheet](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17). No dependencies or implementation are approved by this cross-reference.


### Comment 3a3bdad5-0f46-4507-9c53-425a2d7bbfb9

Author: jonathan@resnovas.com. Created: 2026-11-15T18:59:10.660Z; updated: 2026-11-15T18:59:10.641Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

## OWNER CLARIFICATION — full live control room, no simulated call intake (2026-11-15)

Following review of the historical SWRPC training slides and existing F7 CAD/MDT spec, Jonathan clarified:
- The **production control room handles real incoming issues, requests and incidents**, already created through the platform. No parallel 999/101 simulated call intake or full simulator is needed for F7.
- Deliver the **full live control-room workflow** through existing F7.6 units/status, F7.7 CAD/incident and dispatch, F7.8 crew MDT and F7.9 messaging: intake/triage of existing issue, classification, dynamic guided SOP, assignment, cross-group comms and acknowledgement, incident status, operator ownership/handover, reports and closeout.
- **Guided SOP/assessment** is useful across the entire platform, not just roleplay or emergencies (e.g., tech faults, safety/welfare reports, equipment troubleshooting). The shared procedure capability should run against an existing linked issue, task or CAD/incident; reuse canonical actions, durable steps, prompts, evidence, current permissions, approved escalation and audit. Avoid a second hard-coded MDT-only workflow engine. Advisory-by-default vs mandatory-step policy is still open (prior assistant proposal, not yet approved).
- SWRPC demonstrated plausible **design gaps to reconcile** with the existing F7 plan: controller ownership and single/multi-service coverage/handovers; service-configured dispatch/communications workflows; structured issue assessment, rationale/regrading; report templates and closure requirements. These are candidate refinements pending design/approval, not approved scope/dependencies or safety standards.
- The **smaller optional scenario simulator belongs inside the education/training platform EVE-245** using synthetic, isolated records. It must never dispatch or send communications into the live F7 board or issue real-world instructions.
- Distinguish roleplay training profiles from real-world coordination. No claim that inherited SWRPC protocols are authoritative emergency-service practice or certification. Eventiva remains coordination-only without a separate safety case.

Preserve historical source confidentiality and original documents; no code/provider/settings changes authorized by this clarification.


### Comment aaa4f6c3-c97c-4fbc-86f0-c7e50ab84214

Author: jonathan@resnovas.com. Created: 2026-11-15T19:05:44.515Z; updated: 2026-11-15T19:05:44.496Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED guided-SOP policy — 2026-11-15

Jonathan approved **advisory-by-default guided procedures**, with tenant admins able to designate relevant steps/procedures as mandatory and require evidence and named authorized sign-off where appropriate. Detailed shared specification and acceptance tests are tracked in **[EVE-253](https://linear.app/resnovas/issue/EVE-253/build-shared-guided-sop-procedures-and-governed-step-execution)**. F7 live control continues to receive **real existing issues, incidents and operational requests**; procedures attach to those records for triage, escalation, operator handover and closeout. No simulated 999-call handling or independent MDT SOP/rules engine. Agent safety/approval and online dispatch gates remain unchanged. This is a product decision, not permission to implement dependencies or modify code.


### Comment b4e8e82c-9a5f-456a-8240-7a9d2bed3bf5

Author: jonathan@resnovas.com. Created: 2026-11-15T19:31:07.614Z; updated: 2026-11-15T19:31:07.587Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) (comment ID above). Parent: None. Resolved: Not recorded.

## Distinct MDT and playback engine — 2026-11-15

Owner expressly wants **native QLab-class local playback and show control as a separate module to F7 MDT/CAD**, while keeping one event lifecycle and shared canonical actions/records. New [EVE-255](https://linear.app/resnovas/issue/EVE-255/build-separate-local-show-playback-and-cue-execution-engine) describes local output and incoming OSC/MIDI/timecode; [EVE-254](https://linear.app/resnovas/issue/EVE-254/define-qlab-class-cue-playback-and-end-to-end-production-control) tracks full cue scope. F7 owns incoming real issues, incident/dispatch/unit assignment, messaging and approved SOP response; it links to show timeline/hold and operator alerts but MUST NOT host local media playback or run arbitrary scripts. Preserve existing coordinated safety boundaries; no changes to F7 implementation authorized.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
