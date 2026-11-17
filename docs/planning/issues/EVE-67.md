<!-- linear:generated:start -->
# EVE-67: F2 Scheduling and rosters: crew availability, shifts, offers, call sheets and timesheets

[Live Linear source](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:34.408Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-128](EVE-128.md), [EVE-129](EVE-129.md), [EVE-130](EVE-130.md), [EVE-131](EVE-131.md), [EVE-132](EVE-132.md), [EVE-134](EVE-134.md), [EVE-135](EVE-135.md), [EVE-136](EVE-136.md), [EVE-138](EVE-138.md), [EVE-140](EVE-140.md), [EVE-142](EVE-142.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-16](EVE-16.md), [EVE-17](EVE-17.md), [EVE-23](EVE-23.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-61](EVE-61.md), [EVE-73](EVE-73.md), [EVE-80](EVE-80.md), [EVE-154](EVE-154.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, Jonathan approved all six decisions in section 15 as recommended). Planning only, no implementation until Jonathan asks. Follows the [Feature set spec template](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). F2 is built on the shared scheduling engine from [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) and attaches to F1 (Events and production planning) entities, which it references by id and never redefines (names fixed in <issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" /> section 5): **Event**, **Phase**, **Space**, **Department**, **TeamMember**, **RunOfShow** and **Segment**, **Itinerary** and **ItineraryItem**.

F1 alignment: a CrewRequirement belongs to an Event and optionally a Phase, Department and Space. When an Assignment is accepted, F2 links it to the person's F1 TeamMember on that Event (creating one through F1's action if missing, with the external flag set for freelancers). Shifts are exposed per TeamMember and Phase so F1 `itinerary.generate` can read them as ItineraryItem kind `shift`. F2 Role is the org-wide job function catalogue (for example Rigger, LX tech); F1 Department stays the production discipline on the Event.

## 1. Goal

A production team can staff every event with the right people at the right times, tell each person exactly when and where to be, and know who actually worked, from one roster that people and agents edit through the same actions, online or offline.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| Organiser or production manager | Turn an Event's Phases into crew requirements; see what is unfilled; approve the roster; publish call sheets. |
| Scheduler or crew chief (department head) | Fill requirements for their department; send offers; resolve conflicts and rule breaches; handle swaps and late drop-outs. |
| Staff crew member | Set availability and time off; see and accept shifts; swap or drop shifts; read call sheets offline on site; clock in and out. |
| Freelancer (external) | Answer availability requests and offers without being an org member; see only their own jobs and the call sheets they are on; submit hours. |
| Staffing agency or vendor (external) | Fill a block of requirements with their own people (phase 2 of F2, see Out of scope). |
| Finance and payroll | Read approved timesheets and hours by event for costing (F11) and pay runs (F12). |
| Agent (first-party or external) | Everything above within the delegated user's permissions: find available crew, propose a roster, explain rule breaches, draft offers, build call sheets, chase unanswered offers. |

## 3. Market check

Desk check of vendor material on 2026-11-01, not hands-on trials. Vendor names stay out of customer-facing copy.

| Tool | What it does well | Eventiva matches | Eventiva differs |
| -- | -- | -- | -- |
| Rentman (event and AV rental) | Function-based crew planning on the project: a "function" is a role with times and count, planned alongside equipment; crew portal with availability, job acceptance and hours registration; conflict warnings across projects. ([crew scheduling](<https://rentman.io/products/crew-scheduling-software>), [crew portal](<https://rentman.io/en/features/crew-portal>), [freelance guide](<https://rentman.io/blog/the-complete-guide-to-scheduling-freelance-event-crew-in-2026>)) | Crew requirements live on the Event and Phase; one portal for staff and freelancers; hours captured against the shift. | Conflicts span crew, vehicles (F7) and kit (F6) through one engine; every operation is an agent action; call sheets work offline on device. |
| Deputy (shift workforce) | Demand-based auto-scheduling, open shifts and swaps with manager approval, labour-law compliance warnings, timesheets that flow to payroll. ([features](<https://www.deputy.com/au/features>), [shift planning](<https://www.deputy.com/au/insights/shift-planning>)) | Rule packs warn or block on working-time law; swaps and open shifts; approved timesheets export to F12. | Built for one-off, multi-day events with call times and locations, not only repeating weekly shifts. The solver proposes and a person approves. |
| CrewBrain (event crew) | Availability requests broadcast to a freelancer pool, job offers, crew app with schedules and documents. ([Capterra](<https://www.capterra.com/p/10020543/CrewBrain/>)) | Availability requests and offers to many people at once, answered from a phone. | Freelancers answer from a link without installing the app; same app if they do (one app per device rule). |

Gaps none of them cover well and Eventiva targets: agent parity on every roster operation, offline edit with conflict surfacing on reconnect, and a single conflict check across people, vehicles and kit.

## 4. Capabilities as actions

Every operation is one inventory action (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />): Effect Schema input and output, typed errors, one permission, audit and change records with undo where it mutates. Names extend the <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> set. Approval: none, confirm (agent must ask the user before running), always (a person with the permission must approve, even when the user runs it through an agent). Side effect: read, write, external.

| Action | Input | Output | Permission | Approval (agent) | Effect |
| -- | -- | -- | -- | -- | -- |
| `crew.profile.get` / `crew.profile.update` | personId, roles, home base, travel limits, notes | CrewProfile | `crew:read` / `crew:write` (self for own) | none | read / write |
| `crew.role.define` | name, department, default qualifications | Role | `roster:admin` | none | write |
| `availability.set` | personId, rules (weekly pattern, date ranges), timezone | AvailabilityRule\[\] | self or `crew:write` | none | write |
| `availability.exception.add` | personId, range, kind (unavailable, preferred, tentative), reason | AvailabilityException | self or `crew:write` | none | write |
| `availability.request.send` | personIds or pool, date ranges, eventId, message | AvailabilityRequest | `roster:write` | confirm | external |
| `availability.request.respond` | requestId, per-range answer | AvailabilityResponse | recipient | none | write |
| `availability.query` | role, range, location, qualifications | ranked people with reasons | `roster:read` | none | read |
| `requirement.create` / `.update` / `.delete` | eventId, phaseId?, roleId, count, start, end, location, qualifications, notes | CrewRequirement | `roster:write` | none (delete: confirm) | write |
| `requirement.fromRunOfShow` | eventId, template | CrewRequirement\[\] draft | `roster:write` | confirm | write |
| `shift.generate` | requirementId, split rules | Shift\[\] | `roster:write` | none | write |
| `shift.update` / `shift.cancel` | shiftId, fields or reason | Shift | `roster:write` | cancel with assignee: always | write |
| `roster.assign` | shiftId, personId, override? | Assignment (proposed) and RuleResult\[\] | `roster:write` | none | write |
| `roster.unassign` | assignmentId, reason | Assignment | `roster:write` | confirmed: always | write |
| `rules.check` | assignment set or roster scope | RuleResult\[\] (block, warn, info) | `roster:read` | none | read |
| `rules.override` | ruleResultId, justification | Override | `roster:approve` | always | write |
| `offer.send` | assignmentIds, channel, expiry | Offer\[\] | `roster:write` | confirm | external |
| `offer.respond` | offerId, accept or decline, note | Assignment (accepted or declined) | recipient | none | write |
| `offer.withdraw` | offerId, reason | Offer | `roster:write` | confirm | external |
| `roster.confirm` | eventId or assignmentIds | Assignment\[\] (confirmed) | `roster:approve` | always | write |
| `roster.propose` (auto-roster) | scope, objective, locked assignments | RosterProposal with score and explanation | `roster:write` | none (proposal only) | read |
| `roster.proposal.apply` | proposalId, selected items | Assignment\[\] | `roster:write` | confirm | write |
| `swap.request` / `swap.offer` / `swap.accept` / `swap.approve` | assignmentId, target person or open | SwapRequest | self; approve: `roster:approve` | approve: always | write |
| `shift.open.post` / `shift.open.claim` | shiftId / shiftId | OpenShift / Assignment (proposed) | `roster:write` / eligible crew | none | write |
| `callsheet.generate` | eventId, date | CallSheet draft | `callsheet:write` | none | write |
| `callsheet.update` | callSheetId, sections | CallSheet | `callsheet:write` | none | write |
| `callsheet.publish` | callSheetId, notify? | CallSheetVersion | `callsheet:publish` | confirm | external |
| `callsheet.acknowledge` | callSheetVersionId | Acknowledgement | recipient | none | write |
| `callsheet.export` | callSheetVersionId, format (pdf) | file reference ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)) | recipient or `callsheet:read` | none | read |
| `time.clockIn` / `time.clockOut` / `time.break` | assignmentId, device time, location? | TimeEntry | self (or crew chief on behalf) | none | write |
| `timesheet.submit` | personId, period | Timesheet | self | none | write |
| `timesheet.adjust` | timesheetId, entries, reason | Timesheet | `timesheet:write` | confirm | write |
| `timesheet.approve` / `timesheet.reject` | timesheetId, note | Timesheet | `timesheet:approve` | always | write |
| `timesheet.export` | period, eventId? | export batch for F12 and F11 | `timesheet:export` | confirm | external |
| `timesheet.lock` | period, payRunRef | locked Timesheet\[\] | `timesheet:lock` (F12 pay run) | always | write |
| `calendar.feed.issue` / `.revoke` | personId, scope | ICS feed URL (secret) | self | none | write |
| `nav.open` targets | `roster.board`, `event.staffing`, `my.schedule`, `callsheet.view`, `timesheet.review` | navigation | as screen | none | read |

## 5. Data model

All tables carry `org_id` with tenant guards (<issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" />) and are defined through the shared schema package (<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />). Generic resource, availability and booking tables come from <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" />; F2 adds the people-specific layer.

| Entity | Key fields | Relations | Offline sync | Conflict rule |
| -- | -- | -- | -- | -- |
| CrewProfile | personId, roleIds, homeBase, maxTravelKm, notes | 1:1 person (F4 contact or F13 staff record); [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) Resource kind person | Self and schedulers in scope | Field-level last writer wins; notes as Yjs text |
| Role | name, department, defaultQualificationIds | Qualification (F13) | All org members | Last writer wins (admin only) |
| AvailabilityRule / AvailabilityException | personId, pattern or range, kind, timezone | [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) availability | Owner and schedulers | Merge as a set; overlapping edits both kept and flagged |
| AvailabilityRequest / Response | ranges, recipients, answers | Event (F1) | Recipients see their own | Responses append-only |
| CrewRequirement | eventId, phaseId?, departmentId?, spaceId?, roleId, count, start, end, location, qualificationIds | Event, Phase, Department, Space (F1); Role | Schedulers of the Event | Field-level LWW; count decrease below assigned is rejected at sync |
| Shift | requirementId, start, end, location, status | [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) booking slot | Event scope plus assignees | Times: server state machine; cancelled wins |
| Assignment | shiftId, personId, teamMemberId (F1 TeamMember, set on accept), status (proposed, offered, accepted, declined, confirmed, cancelled, completed), overrides | [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) Booking | Event scope plus assignee | State machine ([EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>)) is authoritative: transitions replay in order at sync; an illegal transition (for example accept after withdraw) is rejected and shown to both sides; a double booking made offline is kept, flagged, and must be resolved by a person |
| RuleResult / Override | rule, severity, subject, justification, approver | Assignment | Read-only on device | Recomputed server-side after sync |
| Offer | assignmentIds, channel, expiry, token | Assignment | Recipient | Server authoritative |
| SwapRequest / OpenShift | from, to, status | Assignment | Participants | State machine |
| CallSheet / CallSheetVersion | eventId, date, sections (generated plus Yjs notes document), published version | Event, Itinerary, RunOfShow and Segments (F1); Assignment | Assignees download published versions for 14 days ahead | Draft notes as Yjs document embedded in the record ([EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>)); published versions immutable |
| Acknowledgement | versionId, personId, at | CallSheetVersion | Recipient | Append-only |
| TimeEntry | assignmentId, kind, deviceTime, serverTime, location? | Assignment | Self | Append-only; device time kept, server time stamped at sync; edits only via `timesheet.adjust` |
| Timesheet | personId, period, entries, status | TimeEntry | Self and approvers | State machine; approved is locked |
| WorkingTimePolicy (rule pack) | jurisdiction, limits, per-contract overrides | Org, contract type (F13) | All | Admin LWW, versioned |

Embedded documents: call sheet notes and crew profile notes are Yjs documents attached to records, versioned with the record and permissioned by it (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />).

## 6. Screens

Every control binds to an action id and every screen publishes an Effect Schema projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />). Rambo-UI has no components yet; the components named below are requests to Rambo-UI, built neutral and bound by Eventiva.

| Screen | Rambo-UI components | Projection (what the agent sees) | Controls and their actions |
| -- | -- | -- | -- |
| Roster board | ResourceTimeline, Avatar, Badge, Popover, FilterBar | visible range, people rows, shifts, unfilled counts, selected cells, rule results in view | drag to assign: `roster.assign`; remove: `roster.unassign`; send offers: `offer.send`; auto-fill: `roster.propose`; confirm: `roster.confirm` |
| Event staffing | DataTable, ProgressBar, Tabs | Event and Phase, requirements with filled vs needed, open offers | add requirement: `requirement.create`; from run of show: `requirement.fromRunOfShow`; generate shifts: `shift.generate` |
| Availability calendar | CalendarMonth, CalendarWeek, DateRangePicker | person, rules, exceptions in range | `availability.set`, `availability.exception.add` |
| Availability request composer | PeoplePicker, DateRangePicker, Form | draft recipients and ranges | `availability.request.send` |
| My schedule (crew) | AgendaList, Card, MapLink | upcoming assignments with status, pending offers, published call sheets | accept or decline: `offer.respond`; swap: `swap.request`; open call sheet: `nav.open callsheet.view` |
| Offer response (link, web) | Card, Button | single offer details | `offer.respond` |
| Call sheet editor | DocumentEditor (Yjs), SectionList, PersonList | sections, recipients, version state | `callsheet.update`, `callsheet.publish`, `callsheet.export` |
| Call sheet viewer | Document, Button | published version, my call time, acknowledgement state | `callsheet.acknowledge`, `callsheet.export` |
| Open shifts and swaps | List, Card | eligible open shifts, my swap requests | `shift.open.claim`, `swap.offer`, `swap.accept` |
| Clock | LargeButton, Timer | current assignment, clock state, offline queue length | `time.clockIn`, `time.break`, `time.clockOut` |
| Timesheet review | DataTable, DiffView | timesheets in period with variance from roster | `timesheet.adjust`, `timesheet.approve`, `timesheet.reject`, `timesheet.export` |
| Rules settings | Form, NumberField, Switch | active rule pack and overrides | `rules.pack.update` (admin) |

Personal contact details on the board and call sheets are masked in the projection unless the viewer is assigned to the same day or holds `crew:read`.

## 7. Agent behaviour

* When asked: "staff the load-in on Friday", "who is free to rig on the 14th", "why can Sam not take this shift", "build tomorrow's call sheet", "swap Alex and Jo on Saturday".
* Proactive (each behind its own flag and off by default for a new org): flag requirements still unfilled 72 hours before call time; chase offers unanswered after a set time with a draft reminder; warn when a Run of show change (F1) moves a Phase outside its shifts and propose the shift changes; flag clock-ins missing 15 minutes after call time to the crew chief.
* The solver (`roster.propose`) is deterministic code; the agent picks the scope, explains the result in plain words and never writes assignments without `roster.proposal.apply`.
* Needs approval: anything external (offers, availability requests, call sheet publish, exports), anything touching a confirmed person (unassign, cancel with assignee), rule overrides, timesheet approval. Agents never approve their own proposals.
* Offline: on device the agent can read the local roster and call sheets, run `rules.check` locally (pure rules) and queue writes; it states that offers and publishing wait for connectivity.

## 8. Integrations

Each behind a neutral Effect port in its own integration package; no vendor is approved by this spec.

| Port | Purpose | First adapter proposed | Vendor sign-up |
| -- | -- | -- | -- |
| `CalendarFeed` | Read-only ICS feed per person | Built in, no vendor | None |
| `CalendarSync` | Two-way Google and Microsoft calendars (busy import, shift export) | Later; <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> names them | Needs approval |
| `Notifier` | Offers, reminders, call sheet published | <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> channels (push, email, SMS) | Through <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> |
| `TravelTime` | Travel buffer between venues | Later, maps vendor via F10 | Needs approval |
| `PayrollExport` | Approved timesheets to F12 and to external payroll files | F12 internal; CSV first | None |
| `GeoLocation` | Optional location stamp on clock-in | Device OS APIs through Expo | None |

## 9. Permissions and roles

| Role | Can see | Can change |
| -- | -- | -- |
| Org admin | Everything | Roles, rule packs, overrides |
| Production manager (per Event) | Event roster, all crew availability summaries | Requirements, shifts, assignments, confirm, publish call sheets |
| Crew chief (per department) | Their department's requirements and crew | Assign and offer within their department; approve swaps; approve timesheets if granted |
| Staff crew member | Own profile, availability, assignments, call sheets they are on, open shifts they are eligible for | Own availability, offer responses, swaps, clock, timesheet submit |
| Freelancer (external guest) | Only offers and assignments addressed to them, and published call sheets for those days | Own availability answers, offer responses, clock, timesheet submit |
| Finance | Approved timesheets and hours by event | Export |
| Agent | Exactly the invoking user's permissions, minus approval-always actions | Same as user with approvals above |

Availability detail (reasons for unavailability) is private to the person and admins; schedulers see only free, busy or tentative. Revoking a freelancer's guest access stops sync and invalidates offer links and ICS feeds at once (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />).

## 10. Telemetry and flags

* Flag: `f2-scheduling` (whole set, default off), plus `f2-auto-roster`, `f2-agent-proactive`, `f2-geo-clock` (default off).
* Spans on every action (<issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />) with attributes `eventiva.event_id`, `eventiva.roster.scope_size`; solver spans record duration and constraint counts, never names.
* PostHog events: `requirement_created`, `offer_sent`, `offer_responded` (accepted or declined, response minutes), `roster_confirmed`, `rule_blocked`, `rule_overridden`, `callsheet_published`, `callsheet_acknowledged`, `swap_completed`, `clock_in_offline`, `timesheet_approved`, `roster_proposal_applied` (share of items applied).
* Success metric: share of required crew positions confirmed 48 hours before call time (target 95 percent for pilot orgs), with secondary metrics offer acceptance rate, time from requirement to fully staffed, and call sheet acknowledgement before call time.

## 11. Compliance

* Working time: UK Working Time Regulations 1998 as the first rule pack (48-hour average week over 17 weeks with opt-out record, 11 hours daily rest, 24 hours weekly rest, 20-minute break over 6 hours; young workers 8 hours a day, 40 a week, 12 hours rest, 30-minute break after 4.5 hours). EU Working Time Directive 2003/88/EC pack follows. Records kept 2 years. Rule packs are data, so other jurisdictions (for example US predictive scheduling laws) are added without code changes.
* Young workers and qualifications: the rules engine reads date of birth band and qualifications from F13 records; F2 never stores right-to-work documents.
* Personal data (UK GDPR): availability reasons, location stamps and contact details are personal data. Location on clock-in is opt-in per org and per person with a stated purpose, stored at clock events only, retention 90 days by default; no background tracking (live positions belong to F10 and dispatch, out of scope here).
* Employment status: F2 records engagement type (employee, freelancer, agency) on the assignment for F12; it does not decide employment status.
* Offer and call sheet messages are transactional, not marketing (<issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> consent rules).

## 12. Acceptance

1. A production manager creates requirements on an F1 Event's Phases, generates shifts, assigns five crew and a van (F7 on the same engine), and gets a conflict for an overlapping booking.
2. A UK rule pack blocks an assignment that leaves under 11 hours rest, and an override needs a person with `roster:approve` and a justification, recorded in audit.
3. A freelancer with no app installed accepts an offer from a link; the board updates within 5 seconds online.
4. Two schedulers offline assign the same person to overlapping shifts; on reconnect both assignments are kept, flagged and shown to both, and no offer is sent until resolved.
5. A crew member opens the published call sheet in airplane mode on Android and web, clocks in offline, and the entry syncs with device and server time on reconnect.
6. The agent answers "who is free to rig on the 14th" from the same `availability.query` the board uses, proposes a roster for a 20-person event, and cannot confirm or send offers without the user approving.
7. Every control on the F2 screens is bound to an action and the unbound-element check passes (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />); every F2 action appears in MCP (<issue id="37c126a9-64e0-4235-88f0-494533c8e3a2" label="EVE-48" href="https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory" />) and HTTP (<issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" />).
8. Approved timesheets export as a batch F12 can read, and approved entries cannot be edited without `timesheet.adjust` and a reason.
9. A DST change does not shift any shift or call time (<issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> acceptance carried forward).

## 13. Out of scope

* Pay rates, pay runs and pay rules (F12); costs and budgets (F11); staff records, contracts, qualifications, right to work and leave approval (F13; F2 reads leave as unavailability).
* Vehicle allocation (F7) and kit booking (F6) beyond sharing the engine and its conflict check.
* Live positions, dispatch and MDT status (live operations).
* Staffing agency portal where an agency fills requirements with its own people: specified as a later F2 slice once F5 marketplace identities exist.
* Public appointment booking pages for attendees (<issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> supports it; no F2 screen).
* Two-way calendar sync with Google and Microsoft in the first release (see decisions).

## 14. Dependencies

* Phase 1: [EVE-40](<https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema>) actions, [EVE-41](<https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials>) config and credentials, [EVE-42](<https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state>) storage and state machines, [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>) identity, guests and audit, [EVE-44](<https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor>) telemetry, [EVE-45](<https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change>) change feed, [EVE-46](<https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action>) HTTP, [EVE-48](<https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory>) MCP, [EVE-50](<https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen>) screen awareness, [EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>) collaboration, [EVE-52](<https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools>) and [EVE-54](<https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow>) agent loop and durable runs; spikes [EVE-16](<https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web>) and [EVE-17](<https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and>).
* Port-later: [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) scheduling engine (hard prerequisite), [EVE-24](<https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email>) notifications, [EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>) files (PDF export), [EVE-27](<https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource>) comments on shifts, [EVE-28](<https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent>) localization of call sheets.
* Feature sets: F1 (<issue id="fbcff205-decd-464a-b8ab-a1278e71fbe4" label="EVE-73" href="https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show" />) Event, Phase, Space, Department, TeamMember, RunOfShow, Itinerary (hard), and F1 reads F2 shifts as ItineraryItem kind shift; F13 qualifications, contracts and leave (soft: F2 ships with a minimal read port until F13 exists); F12 consumes timesheets; F7 and F6 share conflicts; F10 for travel time later.

## 15. Decisions for Jonathan

Decided 2026-11-08: Jonathan chose option (a) for all six.

1. **Timesheet ownership.** (a) F2 owns time capture and approval, F12 consumes approved timesheets. Recommended: hours are captured against shifts and approved by the people who ran the shift. (b) F12 owns timesheets.
2. **Qualifications ownership.** (a) F13 owns qualification records, F2 only reads them for matching. Recommended: one source for compliance records. (b) F2 owns crew skills and qualifications.
3. **Auto-roster engine.** (a) Deterministic constraint solver in plain TypeScript (pure, no dependency), run as a sharded entity for large events, with the agent choosing scope and explaining. Recommended: repeatable, testable, offline-capable. (b) Model-only proposals. (c) External optimisation library (new dependency).
4. **First compliance rule pack.** (a) UK Working Time Regulations first, EU next, packs as data. Recommended: Resnovas is UK based. (b) EU directive first. (c) No built-in packs, org-defined limits only.
5. **Freelancer access.** (a) Invite-based guest account in the same app, plus a signed single-use link to answer offers and availability requests without installing. Recommended: keeps one app and removes the install barrier. (b) Full account required for everything.
6. **Calendar integration in the first release.** (a) Read-only ICS feeds only, no vendor; two-way Google and Microsoft sync is a later slice. Recommended: no vendor approval needed and covers most crew. (b) Two-way sync in the first release.

## 16. Child issues (build order)

Sub-issues with blockers linked in Linear.

 1. <issue id="ad9f6837-0234-4738-b175-cff502418ef7" label="EVE-128" href="https://linear.app/resnovas/issue/EVE-128/f21-build-crew-profiles-roles-and-availability" /> F2.1 Crew profiles, roles and availability
 2. <issue id="548ecd97-5ce8-4a7a-9cae-35aa44a65dfa" label="EVE-129" href="https://linear.app/resnovas/issue/EVE-129/f22-build-crew-requirements-and-shifts-on-events" /> F2.2 Crew requirements and shifts on events
 3. <issue id="e79a91fa-ee7b-4f75-ae67-1a4d79785df2" label="EVE-130" href="https://linear.app/resnovas/issue/EVE-130/f23-build-working-time-rules-and-conflict-checks" /> F2.3 Working-time rules and conflict checks
 4. <issue id="5f3d567b-6a75-4633-80e3-b328a493da47" label="EVE-131" href="https://linear.app/resnovas/issue/EVE-131/f24-build-assignments-offers-and-roster-confirmation" /> F2.4 Assignments, offers and confirmation
 5. <issue id="ffaa3050-a309-484c-8f8f-428c4606750b" label="EVE-132" href="https://linear.app/resnovas/issue/EVE-132/f25-build-external-crew-access-and-offer-links" /> F2.5 External crew access and offer links
 6. <issue id="1acfb70f-5064-4784-8223-bc9c7382127d" label="EVE-134" href="https://linear.app/resnovas/issue/EVE-134/f26-build-the-roster-board-and-event-staffing-screens" /> F2.6 Roster board and event staffing screens
 7. <issue id="6069b55d-a4de-4d07-8cad-5f21af512e17" label="EVE-135" href="https://linear.app/resnovas/issue/EVE-135/f27-build-call-sheets" /> F2.7 Call sheets
 8. <issue id="49f4a3d0-b665-4fd9-8b07-5c7b9cbe6f3a" label="EVE-136" href="https://linear.app/resnovas/issue/EVE-136/f28-build-open-shifts-and-shift-swaps" /> F2.8 Open shifts and swaps
 9. <issue id="522cf0df-8126-444d-8833-1e31bf21345e" label="EVE-138" href="https://linear.app/resnovas/issue/EVE-138/f29-build-time-capture-and-timesheets" /> F2.9 Time capture and timesheets
10. <issue id="aafbbde8-7889-448b-ae5d-47b821250110" label="EVE-140" href="https://linear.app/resnovas/issue/EVE-140/f210-build-personal-calendar-feeds" /> F2.10 Calendar feeds
11. <issue id="18ac9205-bf22-496a-bc5e-53a592e05303" label="EVE-142" href="https://linear.app/resnovas/issue/EVE-142/f211-build-auto-roster-proposals-and-agent-staffing" /> F2.11 Auto-roster proposals and agent staffing

## Linear comments (1)

### Comment a553d8eb-c6f1-45cc-af3d-9f65c23d2f7a

Author: GitHub. Created: 2026-11-01T13:06:16.153Z; updated: 2026-11-01T13:06:16.134Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/834). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
