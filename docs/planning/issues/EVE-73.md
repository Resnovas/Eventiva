<!-- linear:generated:start -->
# EVE-73: F1 Events and production planning: the event record, run of show, departments, cues and show control

[Live Linear source](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:56:56.071Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Audit needed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-166](EVE-166.md), [EVE-167](EVE-167.md), [EVE-169](EVE-169.md), [EVE-171](EVE-171.md), [EVE-173](EVE-173.md), [EVE-201](EVE-201.md), [EVE-203](EVE-203.md), [EVE-206](EVE-206.md), [EVE-208](EVE-208.md), [EVE-210](EVE-210.md), [EVE-229](EVE-229.md), [EVE-230](EVE-230.md), [EVE-231](EVE-231.md), [EVE-232](EVE-232.md), [EVE-233](EVE-233.md), [EVE-254](EVE-254.md), [EVE-255](EVE-255.md) |
| Blocked by | None recorded |
| Blocks | [EVE-123](EVE-123.md), [EVE-129](EVE-129.md), [EVE-135](EVE-135.md) |
| Related to | [EVE-13](EVE-13.md), [EVE-16](EVE-16.md), [EVE-17](EVE-17.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-27](EVE-27.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-64](EVE-64.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-75](EVE-75.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-84](EVE-84.md), [EVE-91](EVE-91.md), [EVE-99](EVE-99.md), [EVE-100](EVE-100.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-110](EVE-110.md), [EVE-111](EVE-111.md), [EVE-112](EVE-112.md), [EVE-125](EVE-125.md), [EVE-131](EVE-131.md), [EVE-137](EVE-137.md), [EVE-146](EVE-146.md), [EVE-152](EVE-152.md), [EVE-154](EVE-154.md), [EVE-162](EVE-162.md), [EVE-168](EVE-168.md), [EVE-172](EVE-172.md), [EVE-176](EVE-176.md), [EVE-183](EVE-183.md), [EVE-191](EVE-191.md), [EVE-211](EVE-211.md), [EVE-219](EVE-219.md), [EVE-236](EVE-236.md), [EVE-238](EVE-238.md), [EVE-239](EVE-239.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Proposed (2026-11-01). Follows the [Feature set spec template and list](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). Planning only: no code, no new dependency and no vendor sign-up until Jonathan approves the decisions in section 15 and asks for the build.

F1 is the core record. Every other feature set (F2 to F14) attaches to the entities named in section 5 by reference and never redefines them.

## Shared planning and live-control model - user clarification

Eventiva does not treat event planning and MDT/live operations as separate products. They are two vocabulary and workflow profiles over one operational engine. The same primitives cover both real events and community role-play environments: a timed plan, incoming request, incident or task; assignment to a person, crew, department, unit or vehicle; acknowledgement and status transitions; controlled communication; append-only operational history; evidence and reports; and automation under permissions and approvals.

The event profile uses terms such as Event, Phase, Segment, Department, Cue, Crew and Show Control. A community/public-safety role-play profile may use operation, call, incident, unit, dispatcher and MDT. Internationalisation and tenant terminology packs change labels, templates, status sets and role names without forking the data model, action contract or client application. A profile can hide irrelevant modules and screens, but agents and APIs still use stable canonical action and entity identifiers. Community deployments are a deliberate proving ground for usability, offline behaviour, dispatch and scale, while test fixtures and documentation must never imply the software is a certified public-safety system.

Planning flows directly into control. Scheduled phases, segments, cues, shifts and readiness checks can create or prepare assignments and operational requests. Live requests can update the event log, task/status state and after-action reporting. A cue or state transition can notify staff and prepare downstream show-control actions. Safety-critical outputs - evacuation messages, door-state instructions, alarms, lighting/audio changes, MIDI/OSC/DMX output and similar actions - use explicit preconfigured procedures, current authorization, an auditable approval/arming policy and a local fail-safe path. An agent may correlate and propose; it cannot invent emergency procedures or bypass the responsible human and venue safety system. Initial releases coordinate these systems and do not claim to replace emergency services, certified alarms or competent-person control. The long-term product goal is a validated live safety and control-room profile. Promotion to that role is a separate safety case: named operational standards and jurisdictions, hazard analysis, independent verification, deterministic local execution, redundancy and degraded modes, immutable audit, competency and approval rules, exercises, maintenance and certification evidence. Until a deployment has that evidence, the UI and documentation state its coordination-only status; terminology or a feature flag cannot promote an uncertified deployment into a safety system.

This means the first product vertical is one Event Operations slice: F1.1 supplies the Event/Phase/Space/Team/Department anchor, then F7.6 to F7.9 supply units, requests/incidents, dispatch, MDT and acknowledged messaging. The deeper planning and production slices then add run-of-show, cues, departmental plans and show-control bridges onto the same request/assignment/log engine rather than building a second operations subsystem.

## 1. Goal

An organiser plans an event from first enquiry to load-out in one place: when and where it happens, who is on it, the run of show, every department's plan (lighting, rigging, sound, staging, screens) and its cues, and then runs the show from the same record, by hand, with the agent, or by delegating to the agent.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Organiser / producer | Create the event, set dates, phases and spaces, invite the team, approve the plan, publish schedules to clients and attendees. |
| Production manager | Own the run of show and itineraries, chase departments, roll equipment needs up to warehousing (F6), track readiness. |
| Department head (lighting, rigging, sound, staging, video) | Draw their plan on the site map, place fixtures, patch, write cue lists, attach riders and paperwork, export to their console. |
| Stage manager / show caller | Call the show live from the run of show: start segments, stand by and fire cues, log what happened. |
| Crew | See their itinerary and call times, read the plan for their department offline on site. |
| Artist / performer and their team | Submit riders and stage plots, see their own itinerary. |
| Vendor (external supplier) | See and edit only the elements and documents shared with them. |
| Client | Review and approve the plan and run of show, read only. |
| Attendee | See the public schedule only (published through F14). |
| Agent (first-party or external) | Every job above, under the delegating user's permissions; proactive checks listed in section 7. |

## 3. Market check

Names stay out of customer-facing copy.

| Area | Leading tools | What they do | Where Eventiva matches or differs |
| -- | -- | -- | -- |
| Run of show | Rundown Studio, Shoflo (now part of Lasso) | Collaborative rundowns with segments, durations, live timers that track over and under run, custom columns per department, cue columns, read-only links and talent prompters. | Match: segments, fixed and relative timing, live drift, department columns, read-only shares. Differ: the rundown is part of the event record, so itineraries, crew calls and cues come from the same data; works offline on site; the agent can build and re-time it. |
| Design and paperwork | Vectorworks Spotlight with Lightwright, Capture for previsualisation | CAD lighting plots, rigging and load calculations, patch and instrument schedules, previsualisation; data exchange through the open GDTF fixture format and MVR scene format. | Match: placed fixtures, patch, rigging points and load summaries, paperwork exports, GDTF and MVR import and export. Differ: Eventiva is not a CAD tool or a 3D previsualiser; it holds the planning data and hands off to those tools through MVR. |
| Show control | QLab, lighting consoles (grandMA3, ETC Eos) | Cue stacks that send MIDI, MIDI Show Control, OSC, timecode and network lighting (sACN, Art-Net) to other systems. | Match: cue lists that fire triggers to consoles, playback and media servers through a local show bridge, plus direct sACN and Art-Net output for small rigs (decision D1 = C). Differ: the console stays the authority for lighting looks; Eventiva calls the show and keeps the log. |
| Event planning suites | Cvent, Momentus, Planning Pod | Event records, venue bookings, itineraries and attendee agendas, mostly corporate and venue focused. | Match: event, phases, spaces, itineraries. Differ: production departments and show control live in the same record, and every action is available to agents. |

Sources: [Rundown Studio vs Shoflo](<https://rundownstudio.app/blog/rundown-studio-vs-shoflo-for-run-of-show>), [Lasso rundown](<https://www.lasso.io/rundown/>), [Vectorworks visualizer data exchange](<https://app-help.vectorworks.net/2024/eng/VW2024_Guide/Export/..%5CLightingDesign1%5CWorkflow_Visualizer_data_exchange.htm>), [GDTF workflow](<https://gdtf-share.com/landing/news/a_GDTF_workflow.php>), [QLab](<https://en.wikipedia.org/wiki/QLab>), [Connecting QLab and Eos](<https://www.controlgeek.net/blog/2026-2-28-show-control-connecting-figure-53-qlab-and-etc-eos>).

## 4. Capabilities as actions

Every operation is one action in the inventory (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />): Effect Schema input and output, typed errors, one permission, approval policy, side-effect class, change record with undo where it mutates. Names follow the inventory convention <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> fixes; the list below uses `domain.verb`. Permission names are `f1:<entity>:<read|write|admin>` evaluated by <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> at the event scope.

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `event.create` | name, timezone, start, end, optional series, venue ref, client ref, template | Event | `f1:event:write` on org | none |
| `event.update` | eventId, field patch | Event | `f1:event:write` | none |
| `event.transition` | eventId, target status | Event | `f1:event:admin` | confirm for `confirmed`, `cancelled`, `closed` |
| `event.clone` / `event.saveAsTemplate` | eventId, options (what to copy, date shift) | Event / EventTemplate | `f1:event:write` | none |
| `event.list` / `event.get` | filters / eventId | Event\[\] / Event | `f1:event:read` | none |
| `series.create`, `series.update`, `series.addEvent` | series fields | EventSeries | `f1:event:write` | none |
| `phase.create`, `phase.update`, `phase.reorder`, `phase.delete` | eventId, phase fields | Phase | `f1:event:write` | none |
| `space.create`, `space.update`, `space.delete` | eventId, name, site map zone ref | Space | `f1:event:write` | none |
| `team.invite`, `team.setRole`, `team.remove` | eventId, contact ref, role, departments | TeamMember | `f1:team:admin` | confirm for external people |
| `department.enable`, `department.update` | eventId, kind, head | Department | `f1:event:write` | none |
| `document.create`, `document.update`, `document.share`, `document.lock` | eventId, kind, department, body (Yjs) | ProductionDocument | `f1:document:write` | confirm for share outside the org |
| `rider.submit`, `rider.review` | eventId, performer, document | Rider | `f1:document:write` | none |
| `runOfShow.create`, `runOfShow.publish`, `runOfShow.lock` | eventId, phase | RunOfShow | `f1:ros:write`, publish `f1:ros:admin` | confirm on publish |
| `segment.create`, `segment.update`, `segment.move`, `segment.delete` | runOfShowId, fields | Segment | `f1:ros:write` | none |
| `show.start`, `show.goSegment`, `show.adjust`, `show.end` | runOfShowId, segmentId, offset | ShowRun | `f1:show:call` | none (live, see section 7) |
| `itinerary.generate`, `itinerary.update`, `itinerary.publish` | eventId, audience (person, group) | Itinerary | `f1:itinerary:write` | confirm on publish |
| `cueList.create`, `cue.create`, `cue.update`, `cue.renumber`, `cue.delete` | department, cue fields | CueList / Cue | `f1:cue:write` | none |
| `cue.export` | cueListId, format (CSV, PDF, OSC script, console import) | file ref | `f1:cue:read` | none |
| `plan.create`, `plan.update` (canvas), `plan.importMvr`, `plan.exportMvr` | eventId, space, layer | ProductionPlan | `f1:plan:write` | none |
| `element.place`, `element.update`, `element.remove` | planId, catalogue item, position, department | DesignElement | `f1:plan:write` | none |
| `fixtureType.import` (GDTF), `fixtureType.list` | file / filters | FixtureType | `f1:plan:write` org | none |
| `patch.assign`, `patch.autoPatch`, `patch.check` | elementId, universe, address | PatchEntry / conflicts | `f1:plan:write` | none |
| `rigging.addPoint`, `rigging.assignLoad`, `rigging.summarise`, `rigging.signOff` | planId, point, loads | RiggingPoint / LoadSummary / SignOff | sign-off `f1:rigging:certify` | always (human only, see section 7) |
| `audio.addChannel`, `audio.updateChannel`, `audio.addMix` | eventId, channel fields | AudioChannel / MonitorMix | `f1:plan:write` | none |
| `screen.addSurface`, `screen.assignContent` | planId, surface, media ref | ScreenSurface / ScreenContent | `f1:plan:write` | none |
| `requirement.rollUp`, `requirement.update`, `requirement.sendToWarehouse` | eventId | EquipmentRequirement\[\] | `f1:plan:write`, send `f1:event:admin` | confirm on send |
| `sequence.create`, `sequence.placeCue`, `sequence.preview` | eventId, timecode settings | ShowSequence | `f1:cue:write` | none |
| `bridge.pair`, `bridge.unpair`, `endpoint.create`, `endpoint.test` | eventId, bridge code, endpoint fields | ShowBridge / ControlEndpoint | `f1:show:admin` | confirm on pair |
| `show.arm`, `show.disarm`, `cue.standby`, `cue.fire`, `show.stopAll` | showRunId, cueId | ShowRunEntry | `f1:show:operate` | arming needs a person (section 7) |

## 5. Data model

All tables carry `org_id` (tenant) and are guarded by <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />. Every table below except `EventSeries`, `EventTemplate`, `FixtureType` and `ShowBridge` also carries `event_id`. Identifiers are UUIDv7 so offline clients create rows without the server.

### Canonical entities other sets reference

| Entity | What it is | Key fields | Referenced by |
| -- | -- | -- | -- |
| **Event** | One occurrence of something being planned and delivered, at a place and time. The anchor record. | name, slug, status, timezone, starts_at, ends_at, series_id, venue_ref (F5), client_ref (F4), owner_id, tags | Every set. |
| **EventSeries** | A grouping of events that share a production: a tour, a festival edition, a recurring night. | name, kind (tour, festival, recurring, other), production package (shared plans and templates) | F8, F11, F14 |
| **Phase** | A block of time in an event with its own purpose. | event_id, kind (advance, build, load_in, tech, rehearsal, show, changeover, derig, load_out, custom), starts_at, ends_at, sort_key | F2 shifts, F3 tasks, F7 vehicle bookings |
| **Space** | A named place within the event's site: a stage, room, zone, dock. | event_id, name, kind, site_map_zone_ref (F10), venue_room_ref (optional, F5 VenueRoom), capacity | F8 access zones, F10, F6 deliveries |
| **TeamMember** | A person's role on this event. | event_id, contact_ref (F4), role, departments\[\], external flag, invited_by | F2, F12, F13 |
| **Department** | A production discipline enabled on the event. | event_id, kind (lighting, rigging, sound, staging, video, power, sfx, general, custom), head_member_id | All F1 production entities, F3 |
| **RunOfShow** | The ordered, timed plan of a phase, usually the show. | event_id, phase_id, status (draft, published, locked), timing mode, version | F2 call sheets, F14 public schedule |
| **Segment** | One item in a run of show. | run_of_show_id, title, sort_key, timing (fixed start or duration after previous), duration, space_id, owner, department columns (map), audience (internal, public), script (Yjs text) | F3, F14 public schedule, F8 session-level admission |
| **Cue** | One numbered instruction for a department, optionally linked to a segment and to a control action. | cue_list_id, number (decimal string), label, segment_id, trigger (manual, follow, timecode), action ref, notes | F10 live positions, show control |
| **Itinerary** | A schedule for one person or group, built from phases, segments, shifts, travel and accommodation. | event_id, audience (member or group), items\[\], published_version | F2, F7, F4 |
| **EquipmentRequirement** | A quantity of a kind of equipment the plan needs, rolled up from placed elements or added by hand. | event_id, phase_id (optional), department_id, catalogue_ref (F6 product id), quantity, needed_from, needed_to, source (rollup, manual), source_element_ids\[\], fulfilment (unfilled, reserved by F6, hired through F5) | F6 reservations, F7 transport, F11 costs |

### F1 internal entities

Admission and attendance (agreed with F8): there is no separate Session entity. Tickets admit to an **Event** (each tour date or recurring night is its own Event inside an EventSeries), optionally narrowed to a **Phase** (for example festival day 2) and a **Space** (a zone or room). Per-slot admission, such as a conference workshop, attaches to a **Segment** with `audience = public`. Venue is F5's record, referenced from `Event.venue_ref`.

| Entity | Key fields |
| -- | -- |
| EventTemplate | name, snapshot of phases, departments, run-of-show skeleton, documents; date offsets relative to day 0 |
| ProductionDocument | event_id, department_id, kind (note, rider, paperwork, safety, custom), body (Yjs document), locked_version, shared_with\[\] |
| Rider | event_id, performer contact_ref, document_id, status (received, reviewed, agreed) |
| ItineraryItem | itinerary_id, kind (call, travel, hotel, meal, segment, shift, custom), starts_at, ends_at, location, source ref |
| CueList | event_id, department_id, name, numbering scheme |
| ProductionPlan | event_id, space_id, layer kind, base map ref (F10), canvas (Yjs document) |
| DesignElement | plan_id, department_id, kind (fixture, truss, speaker, riser, screen, cable run, power, custom), fixture_type_id, catalogue_ref (F6), position, rotation, unit number, weight_kg, power_w |
| FixtureType | org-wide; manufacturer, model, modes\[\] (channel count, footprint), weight, power; source GDTF file ref |
| PatchEntry | element_id, mode, universe, address; unique per (event, universe, address range) |
| RiggingPoint | plan_id, label, position, rated WLL_kg, structure ref |
| LoadAssignment | rigging_point_id, element_id or manual load, weight_kg, dynamic factor |
| RiggingSignOff | plan_id, load summary hash, signed_by, competent person statement, signed_at; void when the hash changes |
| AudioChannel | event_id, number, source, mic or DI, stand, stage box, patch, phantom |
| MonitorMix | event_id, name, recipient, kind (wedge, IEM), channels |
| ScreenSurface | element_id, pixel width and height, aspect, input |
| ScreenContent | surface_id, segment_id or cue_id, media ref (<issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />), playback notes |
| ShowSequence | event_id, timecode format (24, 25, 29.97 df, 30), start offset, cues placed at timecode |
| ShowBridge | org-wide; paired device, name, public key, last heartbeat, version |
| ControlEndpoint | event_id, bridge_id, protocol (OSC, MSC, MIDI, LTC, MTC, sACN, Art-Net), target address, mapping |
| ShowRun | run_of_show_id, started_by, started_at, ended_at, armed_by |
| ShowRunEntry | show_run_id, at, kind (segment_go, cue_standby, cue_fire, cue_result, adjust, stop), actor (person or agent), outcome |

### Offline sync and conflicts (on the engine <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> picks, through <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />)

* Planning data syncs fully offline: everything in the tables above except `ShowBridge` heartbeat fields, which are server only.
* Scalar fields: last writer wins per field by hybrid logical clock, with the losing value kept in the change record so it can be restored.
* Status fields (Event.status, RunOfShow.status) change only through state machines (<issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />). An offline transition is queued; if the server rejects it, the client shows it as a conflict for the person to resolve. Nothing silently reverts.
* Ordered lists (phases, segments, cues within a list) use fractional sort keys, so two offline inserts both survive.
* Cue numbers: two offline creates with the same number both survive and are flagged as a duplicate; `cue.renumber` resolves it. No automatic renumbering, because operators memorise numbers.
* Patch: duplicates and overlaps are allowed to sync and are reported by `patch.check`; the console export refuses while any conflict remains.
* Rigging: any change to a load or point voids `RiggingSignOff` (hash mismatch) on whichever side sees it first.
* Embedded documents: `ProductionDocument.body`, `ProductionPlan.canvas` and `Segment.script` are Yjs documents owned by their record. They share the record's permissions, audit and deletion (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />). A locked document version is immutable.
* Live data is never queued. `show.*` and `cue.fire` need the show bridge or the live channel to be reachable now; if not, they fail fast with a typed error. A cue fired late is worse than a cue not fired.

### Live behaviour without internet

The show caller's device and the show bridge talk over the local network. Internet loss does not stop a show: the bridge keeps the clock and logs entries, and the log syncs when the connection returns. If the caller's device loses the bridge, the device keeps counting locally, marks timings as stale and blocks `cue.fire`.

## 6. Screens

All components come from Rambo-UI. Each screen declares its screen-context projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />) and every control binds to the action named.

| Screen | Main components | Projection | Controls and their actions |
| -- | -- | -- | -- |
| Events list | data table, filters, calendar toggle | visible events, filters, selection | new (`event.create`), open (`nav.open`), clone (`event.clone`) |
| Event overview | header, status stepper, phase timeline, team list, readiness checklist | event, phases, team, readiness items | edit fields (`event.update`), status (`event.transition`), add phase (`phase.create`), invite (`team.invite`) |
| Run of show editor | sortable grid with department columns, timing bar | run of show, segments in view, selection, totals and overrun | add, edit, move, delete segment, publish (`runOfShow.publish`) |
| Show caller | big clock, current and next segment, cue stack, standby and go buttons, stop all | live position, drift, armed state, next cues | go (`show.goSegment`), standby (`cue.standby`), go cue (`cue.fire`), stop all (`show.stopAll`) |
| Itinerary | agenda list by day, per-person filter | audience, items for visible days | generate, edit item, publish |
| Department workspace | tabs: plan, cues, documents, requirements | department, selection, open tab | links to the screens below |
| Plan canvas | canvas over the site map (F10), element palette, inspector | layer, visible elements, selection, warnings | place, move, update, remove element; import and export MVR |
| Patch | grid by universe, conflict list | universes, entries, conflicts | assign, auto patch, check |
| Rigging | points table, load bar per point, sign-off panel | points, loads, utilisation, sign-off state | add point, assign load, summarise, sign off |
| Audio | input list, monitor mixes, stage plot view | channels, mixes | add and edit channel or mix |
| Cue list | numbered list, linked segment, trigger and target columns | cue list, visible cues, selection | create, edit, renumber, export |
| Show sequence | timeline with timecode ruler | sequence, cues in view, playhead | place cue, preview |
| Show bridge settings | device list, endpoint table, test buttons | bridges, endpoints, last heartbeat | pair, unpair, create endpoint, test |
| Documents | document list, editor | documents, open document, sharing | create, edit, share, lock |

Accessibility: WCAG 2.2 AA; the show caller screen works by keyboard with large targets and never depends on colour alone for armed or standby state.

## 7. Agent behaviour

When asked, the agent can do everything in section 4 under the user's permissions, for example "build a run of show for a two hour conference with three panels and a break", "patch all the new spots from universe 3", "make Sam's itinerary for the load-in day".

Proactive checks, offered as suggestions on the relevant screen, never applied without confirmation:

* Run of show totals over the phase length, or a segment in a space with no crew call.
* Patch overlaps, a fixture with no address, a universe over 512 channels.
* Rigging point over its rated load, or a sign-off voided by a change.
* Placed elements with no matching EquipmentRequirement, or requirements beyond F6 stock.
* Cue references to a missing segment, endpoint or media file.
* Itinerary items that overlap for the same person.

Approvals:

* `rigging.signOff` is human only. The agent may compute summaries and draft the statement, never sign. Policy `always`, actor must be a person holding `f1:rigging:certify`.
* `show.arm` is human only. Once a person has armed a show run, the agent may stand by and fire cues only when the person has delegated that run to it, and `show.stopAll` is always available to every person on the run.
* `runOfShow.publish`, `itinerary.publish`, `document.share` outside the org and `requirement.sendToWarehouse` ask for confirmation, for people and agents alike.

## 8. Integrations

Each behind a neutral Effect service in its own integration package; switching vendor changes composition only.

| Port | First implementation | Notes |
| -- | -- | -- |
| `FixtureLibrary` | GDTF files (open format, DIN SPEC 15800) imported by users; optional later lookup on the GDTF share | Parsing GDTF and MVR (zip plus XML) needs a dependency approved on F1.7. |
| `SceneExchange` | MVR import and export | Hand-off to CAD and previsualisation tools. |
| `ConsoleExport` | CSV patch and cue export, plus console-specific import formats picked per console | Per console format listed on F1.5. |
| `ShowBridge` transport | Local Effect process on the show machine (F1.13) | OSC over UDP, MIDI and MIDI Show Control, LTC and MTC; sACN and Art-Net level output in F1.14 (D1 = C). MIDI needs a native dependency approved on F1.13. |
| `Media` | Files port from <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> | Screen content and documents. |
| `Notifications` | <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> | Publishing itineraries and run-of-show changes. |
| `Calendar` | ICS feed per itinerary | Read-only subscribe link. |

## 9. Permissions and roles

| Role (per event) | Sees | Changes |
| -- | -- | -- |
| Owner | everything | everything, including status and team |
| Producer | everything | everything except deleting the event |
| Production manager | everything | run of show, itineraries, requirements, documents |
| Department head | the event, run of show, their department in full, other departments read only | their department's plans, cues, documents, requirements |
| Show caller | run of show, cue lists, show bridge state | `show.*`, `cue.standby`, `cue.fire` when the run is armed |
| Crew | their itinerary, run of show, plans for their departments, read only | their own availability notes |
| Vendor (external) | only elements, documents and requirements shared with them | the shared items, if granted write |
| Artist (external) | their itinerary, their riders | their riders |
| Client (external) | published run of show, shared documents | approvals only |
| Attendee | the public schedule through F14 | nothing |
| Agent | exactly what the delegating person can, minus human-only actions | the same |

`f1:rigging:certify` is an org-level qualification flag held by named people, checked against F13 qualifications once F13 exists. External people never see personal data of other team members beyond name and role.

## 10. Telemetry and flags

* Flags (PostHog, safe default off): `f1-events-core` (F1.1 to F1.4), `f1-production-plans` (F1.5 to F1.11), `f1-show-control` (F1.12 to F1.14), with `f1-show-control-dmx` for F1.14. Each child names its own sub-flag if it needs one.
* Events (snake case, no personal data): `event_created`, `event_status_changed`, `run_of_show_published`, `itinerary_published`, `plan_element_placed`, `patch_conflict_found`, `rigging_signed_off`, `cue_list_exported`, `show_run_started`, `cue_fired` (with latency), `show_stop_all`, `agent_suggestion_accepted` (with check kind).
* Spans: every action through <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />; bridge round trip time as a metric with bounded labels (protocol, outcome).
* Success metrics: share of active events with a published run of show; median time from event created to first published itinerary; cue fire latency p95 under 20 ms on the local network; zero cues fired while disarmed.

## 11. Compliance

* Personal data (UK GDPR and EU GDPR): itineraries hold travel, accommodation and possibly dietary and access needs. Dietary and access needs can be health data, so they are opt-in fields with explicit purpose text, visible only to roles that need them, and deleted with the event's retention period (default 12 months after `closed`, set in the org's configuration schema).
* Rigging and structural safety: Eventiva shows indicative load summaries only. It never certifies. UK work at height and lifting rules (LOLER, PUWER) and the event structures guidance (for example BS 7906, ANSI E1.6 in the US) require a competent person; the sign-off records who that person was and what they signed.
* Electrical: power figures are indicative; temporary installations follow BS 7909 or local equivalent, stated on exports.
* Show safety: arming, stop all and the human-only rules in section 7 are not optional and cannot be turned off by customisation (F14).
* Accessibility: published schedules meet WCAG 2.2 AA.
* Licences: GDTF and MVR are open; imported fixture files keep their source attribution.

## 12. Acceptance (whole set)

* An organiser creates an event with phases and spaces, builds a run of show, generates itineraries for three people and publishes them, entirely offline on a phone, and everything converges with a laptop edit after reconnect.
* The agent builds the same run of show from a one-paragraph brief, and every step appears as ordinary actions in the audit log.
* A lighting head imports a GDTF fixture, places 24 units on a plan over the F10 map, auto-patches them with no overlap, exports CSV and MVR, and the MVR opens in a CAD tool.
* A rigging summary flags an overloaded point; changing a load voids the sign-off; the agent cannot sign.
* A show caller runs a 10 segment show; cues fire OSC to a test receiver through the bridge with p95 under 20 ms on LAN; pulling the internet does not stop the show; pulling the bridge blocks `cue.fire` with a clear error.
* Every screen in section 6 passes the unbound-control check (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />) and axe with no serious issues.
* Other sets reference Event, Phase, Space, TeamMember, Department, RunOfShow, Segment, Cue, Itinerary and EquipmentRequirement by id without duplicating fields.

## 13. Out of scope

* 3D previsualisation and CAD drafting (hand off by MVR).
* Lighting looks and console programming inside Eventiva (D1 = C adds only simple level output for small rigs, F1.14).
* RF frequency coordination, pyrotechnics and laser control.
* Structural engineering calculations beyond point load sums.
* Attendee agendas and session registration for conferences (F8 and F14 own the attendee side).
* Rostering and pay (F2, F12), stock reservation (F6), vehicles (F7), site map drawing (F10).

## 14. Dependencies

* Phase 1: <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> actions, <issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" /> config and secrets (bridge keys), <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> storage and state machines, <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> identity, roles and audit, <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" /> telemetry, <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> change feed, <issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" /> HTTP and typed client, <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> screen awareness, <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> collaboration and sync, <issue id="3deaef52-8db8-490c-8143-b293ab5656a8" label="EVE-52" href="https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools" /> agent loop, <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> sync engine, <issue id="a7a66a5c-e747-4245-bc84-3232ef65a16c" label="EVE-16" href="https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web" /> Expo stack.
* Port later: <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> notifications, <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> files, <issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" /> comments on any resource, <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> scheduling primitives.
* Other sets: F4 contacts (TeamMember.contact_ref), F5 venues (Event.venue_ref), F6 catalogue and reservations, F10 site maps (plan base layer), F2 shifts (itinerary items), F13 qualifications (rigging certify), F14 public schedule.

## 15. Decisions for Jonathan

Each is a pick-one with a recommendation. D1 is decided; D2 to D6 stand as recommended unless Jonathan flips them.

* **D1 Live show control scope. Decided 2026-11-08 by Jonathan: C (triggers plus direct DMX); F1.13 and F1.14 are both in scope.** Options were: A: plan and export only. **B (recommended): a show bridge that fires triggers (OSC, MIDI, MIDI Show Control, timecode) to consoles, playback and media servers.** C: B plus direct DMX output (sACN, Art-Net) for small rigs. Why B: covers the MIDI and DMX vision through the console, keeps the console the authority for looks, smallest safety surface. Jonathan picked C, so F1.14 is in scope.
* **D2 Event hierarchy.** **Recommended: Event as the anchor with an optional EventSeries for tours and festivals.** Alternative: a mandatory Project above every event. Why: most events are one-offs; a series adds sharing without a forced extra level.
* **D3 Run-of-show timing.** **Recommended: both fixed start times and durations relative to the previous segment, with live drift.** Alternative: fixed times only. Why: matches the leading tools and real show calling.
* **D4 Fixture data.** **Recommended: GDTF for fixture types and MVR for scene exchange.** Alternative: an Eventiva-only fixture format with CSV import. Why: open standards that CAD tools and consoles already read.
* **D5 Rigging.** **Recommended: compute indicative point loads, flag overloads, require a human competent-person sign-off that voids on change.** Alternative: no load maths, documents only. Why: the check is valuable and the sign-off keeps liability with the qualified person.
* **D6 Show bridge form.** **Recommended: a small headless Effect process on the show machine, paired with the app, that owns all hardware and network IO.** Alternative: hardware access inside the desktop app itself. Why: one process for web, desktop and mobile callers, works with the UI closed or crashed, and keeps native modules out of the app bundle.

## 16. Child issues

In build order. Slices 1 to 4 make the core record other sets need first.

 1. <issue id="43e4e4e4-42e9-4d64-8201-aa65787fe66c" label="EVE-166" href="https://linear.app/resnovas/issue/EVE-166/f11-build-the-event-record-event-eventseries-phase-space-team-and" /> F1.1 Event record: Event, EventSeries, Phase, Space, team, departments
 2. <issue id="00799f1e-4bb8-4483-8b3d-4e343f959507" label="EVE-167" href="https://linear.app/resnovas/issue/EVE-167/f12-build-production-documents-and-riders-as-collaborative-documents" /> F1.2 Production documents and riders
 3. <issue id="cb0f80d4-48f4-4e2c-8957-26f36f9a838f" label="EVE-169" href="https://linear.app/resnovas/issue/EVE-169/f13-build-the-run-of-show-segments-fixed-and-relative-timing" /> F1.3 Run of show
 4. <issue id="bbc3ee25-d41f-4d48-91c9-3caa51b04362" label="EVE-171" href="https://linear.app/resnovas/issue/EVE-171/f14-build-itineraries-per-person-and-per-group-schedules-generated" /> F1.4 Itineraries
 5. <issue id="cab9223d-ac24-4174-99b4-092df552d509" label="EVE-173" href="https://linear.app/resnovas/issue/EVE-173/f15-build-department-cue-lists-with-numbering-segment-links-and" /> F1.5 Cue lists and console exports
 6. <issue id="f3615509-1ebf-4495-9f61-e5a0544e56f4" label="EVE-201" href="https://linear.app/resnovas/issue/EVE-201/f16-build-production-plans-a-collaborative-canvas-per-space-and" /> F1.6 Production plans canvas over the site map, MVR
 7. <issue id="ccbe20c9-21c6-40f2-b50f-cd15ce876497" label="EVE-203" href="https://linear.app/resnovas/issue/EVE-203/f17-build-lighting-gdtf-fixture-library-fixture-modes-and-dmx-patch" /> F1.7 Lighting: GDTF fixtures and DMX patch
 8. <issue id="a920d4e5-3f25-4596-b429-27847cd09fb1" label="EVE-206" href="https://linear.app/resnovas/issue/EVE-206/f18-build-rigging-points-loads-indicative-load-summary-and-competent" /> F1.8 Rigging loads and competent-person sign-off
 9. <issue id="433a290f-b3e3-451b-bbea-aa455785bfcd" label="EVE-208" href="https://linear.app/resnovas/issue/EVE-208/f19-build-sound-input-list-monitor-mixes-and-stage-plot" /> F1.9 Sound: input list, mixes, stage plot
10. <issue id="a289f6ba-358b-4652-97ae-6182d1019f79" label="EVE-210" href="https://linear.app/resnovas/issue/EVE-210/f110-build-staging-and-screens-staging-elements-screen-surfaces-and" /> F1.10 Staging and screens content
11. <issue id="a58abd97-6c1f-4235-a66f-e5e161edebc7" label="EVE-229" href="https://linear.app/resnovas/issue/EVE-229/f111-build-equipment-requirements-roll-up-placed-elements-and-hand" /> F1.11 Equipment requirements to warehousing
12. <issue id="e51720db-b1e4-46f2-8709-871d46a6cabd" label="EVE-230" href="https://linear.app/resnovas/issue/EVE-230/f112-build-live-show-calling-and-show-sequences-run-the-run-of-show" /> F1.12 Live show calling and show sequences
13. <issue id="96b947e4-5f8f-4905-9e99-fa55a95a0482" label="EVE-231" href="https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles" /> F1.13 Show bridge (OSC, MIDI, MSC, timecode)
14. <issue id="39b7d4d1-cecf-4031-87c0-fa72276e8739" label="EVE-232" href="https://linear.app/resnovas/issue/EVE-232/f114-build-direct-dmx-output-for-small-rigs-over-sacn-and-art-net-only" /> F1.14 Direct DMX output (sACN, Art-Net)
15. <issue id="265f83d9-0b6e-4b1b-a222-77d386289316" label="EVE-233" href="https://linear.app/resnovas/issue/EVE-233/f115-build-event-templates-and-cloning-reuse-phases-departments-plans" /> F1.15 Event templates and cloning

Cross-set contracts agreed while speccing (2026-11-01): F2 shifts via `shift.listForItinerary` (<issue id="548ecd97-5ce8-4a7a-9cae-35aa44a65dfa" label="EVE-129" href="https://linear.app/resnovas/issue/EVE-129/f22-build-crew-requirements-and-shifts-on-events" />) and TeamMember creation from accepted offers (<issue id="5f3d567b-6a75-4633-80e3-b328a493da47" label="EVE-131" href="https://linear.app/resnovas/issue/EVE-131/f24-build-assignments-offers-and-roster-confirmation" />); F4 Party typeids with a `PartyReferenceOwner` for client_ref, contact_ref and rider performer (<issue id="7692d04c-3444-4989-b2aa-b73a1a69ab02" label="EVE-99" href="https://linear.app/resnovas/issue/EVE-99/f44-find-and-merge-duplicate-contacts-and-import-and-export-them" />); F5 Listing id for venue_ref and optional VenueRoom on Space (<issue id="b22fbb0d-100b-47a3-8c32-eeacadc4c9fe" label="EVE-66" href="https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings" />); F6 reads EquipmentRequirement (<issue id="928dc098-5cc9-4586-88bb-50abbe03071a" label="EVE-63" href="https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing" />); F10 site-local metre frame, Zone feature ids and an external layer source (<issue id="9b8adbfb-05a9-4f10-9c60-baa5bfcfd4fa" label="EVE-146" href="https://linear.app/resnovas/issue/EVE-146/f101-sites-levels-base-layers-and-calibration" />, <issue id="82fab111-6d01-4616-85c7-1e4ff88ca469" label="EVE-152" href="https://linear.app/resnovas/issue/EVE-152/f102-site-maps-and-layers-as-yjs-documents-with-a-feature-record" />); F13 `hr.qualifications.holds` for rigging sign-off (<issue id="9f305527-7de1-436f-89bd-27341f70624e" label="EVE-154" href="https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check" />); F8 admits to Event, Phase, Space or public Segment.

## Linear comments (2)

### Comment bd653a40-5ad5-466b-9179-8428f1feea14

Author: GitHub. Created: 2026-11-01T13:06:33.862Z; updated: 2026-11-01T13:06:33.805Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/840). All replies are displayed in both locations.


### Comment 42d78d06-088c-4d4b-8ba2-b74ee22042fe

Author: jonathan@resnovas.com. Created: 2026-11-15T19:20:55.623Z; updated: 2026-11-15T19:20:55.589Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show) (comment ID above). Parent: None. Resolved: Not recorded.

## QLab-class lifecycle and cue parity direction — owner request 2026-11-15

The owner explicitly wants Eventiva's **one system for pre-show rigging/construction, show calling/cues/tasks/emergencies, and derig/postshow**, with QLab (https://qlab.app/) as a major cue-control functionality benchmark. I reviewed the current F1/QLab 5 manual and created a detailed product-gap review and major scope decision: [EVE-254](https://linear.app/resnovas/issue/EVE-254/define-qlab-class-cue-playback-and-end-to-end-production-control).

Our current F1.5/F1.12/F1.13/F1.14 specifications capture numbered cue lists, segments, timecode, remote OSC/MIDI/MSC, and limited local DMX, **but not the native QLab-level media/playback/rendering or full cue graph**: audio/mic/video/camera/text cue types, fades/routing/loops, nested groups, non-linear carts, transport controls, preflight, rehearsal separation, view/edit/control roles and fully verified physical output/recovery. EVE-254 records both the detailed capability matrix and proposed local deterministic show-execution boundary, still subject to technical review. The Eventiva event/phase/task/rigging/dispatch/SOP model remains one shared operational graph, with local show-control safety and no dependence on WAN/cloud per cue.

One major question remains for owner: **A) Native media playback/rendering as an eventual Eventiva core capability, alongside external QLab/consoles, or B) Eventiva orchestrates external playback only.** Do not automatically interpret 'replicate QLab' as B. Existing F1.13 decision C (OSC/MIDI/MSC plus simple direct DMX) is preserved pending approval of this expanded scope. No new dependencies, hardware or implementation authorized by this review.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
