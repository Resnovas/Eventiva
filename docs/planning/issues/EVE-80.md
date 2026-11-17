<!-- linear:generated:start -->
# EVE-80: F13 Human resources: worker records, onboarding, qualifications and leave

[Live Linear source](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:23.132Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva product features |
| Archived | No |
| Parent | None recorded |
| Children | [EVE-98](EVE-98.md), [EVE-116](EVE-116.md), [EVE-121](EVE-121.md), [EVE-153](EVE-153.md), [EVE-154](EVE-154.md), [EVE-156](EVE-156.md), [EVE-179](EVE-179.md), [EVE-182](EVE-182.md), [EVE-196](EVE-196.md), [EVE-239](EVE-239.md) |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-13](EVE-13.md), [EVE-17](EVE-17.md), [EVE-23](EVE-23.md), [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-28](EVE-28.md), [EVE-30](EVE-30.md), [EVE-32](EVE-32.md), [EVE-33](EVE-33.md), [EVE-40](EVE-40.md), [EVE-41](EVE-41.md), [EVE-42](EVE-42.md), [EVE-43](EVE-43.md), [EVE-44](EVE-44.md), [EVE-45](EVE-45.md), [EVE-46](EVE-46.md), [EVE-48](EVE-48.md), [EVE-49](EVE-49.md), [EVE-50](EVE-50.md), [EVE-51](EVE-51.md), [EVE-52](EVE-52.md), [EVE-54](EVE-54.md), [EVE-56](EVE-56.md), [EVE-61](EVE-61.md), [EVE-65](EVE-65.md), [EVE-67](EVE-67.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-82](EVE-82.md), [EVE-88](EVE-88.md), [EVE-92](EVE-92.md), [EVE-96](EVE-96.md), [EVE-97](EVE-97.md), [EVE-99](EVE-99.md), [EVE-128](EVE-128.md), [EVE-130](EVE-130.md), [EVE-145](EVE-145.md), [EVE-244](EVE-244.md), [EVE-245](EVE-245.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

Status: Approved (2026-11-08, Jonathan chose decisions 1a, 2a, 3a, 4a, 5a, 6a and 7b on the decision card). Follows the [Feature set spec template](<https://linear.app/resnovas/document/feature-set-spec-template-and-list-26b9f78cf17a>). Planning only until Jonathan asks for implementation; no new dependency or vendor sign-up without approval on the child issue.

## 1. Goal

Every person who works on an event (employee, freelancer, volunteer or agency crew) has one trusted record in Eventiva, is onboarded with signed paperwork, and can only be put on a job they are qualified, entitled and available to do.

## 2. Users and jobs

| User | Jobs |
| -- | -- |
| HR admin (owner, office manager) | Create workers, set engagements and positions, run onboarding and offboarding, keep documents, check right to work, set leave policies, answer audits |
| Line manager / head of department | Approve leave, verify certificates, see their team's onboarding and expiry status |
| Crew coordinator / production manager | See who is eligible for a role on an Event (F1) before rostering (F2); never sees sensitive fields |
| Worker (employee) | Keep own profile, sign documents, upload certificates, request leave, see balances |
| Freelancer or volunteer | Same app and same self-service, scoped to their own record and the tenants they work for |
| Crew agency / supplying vendor | Upload and maintain qualification evidence for the people they supply; sees only their own people |
| Finance and payroll (F12) | Read engagement terms and approved absence that pay runs need |
| Site supervisor at a venue | Check offline that the rigger in front of them holds a valid certificate and completed the site induction |
| Agent (acting for any of the above) | Everything that user can do, through the same actions, with approvals where marked |

## 3. Market check

Names stay out of customer-facing copy.

* **General SME HR platforms (HiBob, Personio)**: strong employee records, org charts, onboarding checklists, document templates with e-signature (often through a partner), leave policies with accruals and approval chains, self-service apps, reporting. They assume salaried employees on fixed contracts; freelancers and volunteers are weak or absent, and there is no link between qualifications and who can be put on a job.
* **Event and rental crew tools (Rentman crew scheduling, CrewBrain)**: built for freelance crew pools: availability requests, crew portals, skills and certificates, rates per function, project-based planning. HR depth is thin: little document signing, basic or no leave accrual, no right-to-work workflow.
* **Shift workforce tools (Deputy and similar)**: qualifications with expiry that block rostering, leave feeding availability, mobile-first self-service, time and attendance feeding payroll.

**Where Eventiva matches**: records, onboarding, documents, leave accrual and approvals, self-service, qualification expiry that gates rostering.

**Where Eventiva differs**: one record type for employees, freelancers, volunteers and agency crew; qualifications checked against the actual role on an Event (F1) and roster (F2), including per-Event site inductions; offline eligibility checks at the venue; and every HR operation is an agent action with the same permissions, approvals and audit as the UI (<issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> parity rule), so the agent can onboard a crew of 30 freelancers or chase every expiring certificate before a show.

## 4. Capabilities as actions

Every operation is one inventory action (<issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />): Effect Schema input and output, typed errors, one authorization check (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />), audit receipt, change record with undo where it mutates. Approval: none, confirm (user confirms on screen or protocol), always (named approver must approve). Permission names are the role grants in section 9.

### Workers and organisation

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.workers.create` | personId (F4) or new person fields, workerType, homeDepartmentId? | Worker | hr:workers:write | none |
| `hr.workers.update` | workerId, patch of non-sensitive fields | Worker | hr:workers:write, or self for own allowed fields | none |
| `hr.workers.get` | workerId | Worker projection masked for the caller | hr:workers:read, line manager, self | none |
| `hr.workers.list` | filters (department, type, status, qualification, text) , cursor | page of Worker summaries | hr:workers:read, line manager (own reports) | none |
| `hr.workers.archive` | workerId, reason | Worker | hr:workers:admin | confirm |
| `hr.engagements.create` | workerId, engagementType, positionId, start, end?, contractedHours?, payBasis, rate?, currency | Engagement | hr:engagements:write | confirm |
| `hr.engagements.update` | engagementId, patch | Engagement (new version, effective date) | hr:engagements:write | confirm |
| `hr.engagements.end` | engagementId, endDate, reason | Engagement | hr:engagements:write | always (second HR admin or owner) |
| `hr.departments.create` / `.update` / `.archive` | name, parentId?, headWorkerId? | Department | hr:org:write | none / none / confirm |
| `hr.positions.create` / `.update` / `.archive` | title, departmentId, requiredQualificationTypeIds | Position | hr:org:write | none / none / confirm |
| `hr.reportingLines.set` | workerId, managerWorkerId, from | ReportingLine | hr:org:write | none |
| `hr.orgChart.get` | rootDepartmentId? | tree | any member | none |

### Sensitive profile

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.sensitive.get` | workerId, fields\[\], purpose | requested fields, decrypted | hr:sensitive:read, or self | none for self; confirm for HR (purpose recorded) |
| `hr.sensitive.update` | workerId, patch | ack (no values echoed) | hr:sensitive:write, or self | none |
| `hr.emergencyContacts.set` | workerId, contacts\[\] | contacts | self, hr:sensitive:write | none |
| `hr.dataExport.subject` | workerId | file reference (<issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />) of all data held | hr:workers:admin, or self | always for HR-initiated; none for self |
| `hr.retention.purge` | workerId or policy run id | purge report | hr:workers:admin | always |

### Documents and signatures

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.documentTemplates.create` / `.update` | name, kind, body (collaborative document, <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />), merge fields | DocumentTemplate version | hr:documents:write | none |
| `hr.documents.generate` | templateId, workerId, engagementId? | HrDocument (draft, merged) | hr:documents:write | none |
| `hr.documents.upload` | workerId, kind, fileId (<issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" />), expires? | HrDocument | hr:documents:write, self for own kinds | none |
| `hr.signatures.request` | documentId, signers\[\] (worker, company signatory), dueDate | SignatureRequest | hr:documents:write | confirm |
| `hr.signatures.sign` | requestId, signerId, consentText hash | SignatureEvent with evidence | the named signer only (agent cannot sign) | always (human, in person) |
| `hr.signatures.decline` / `.void` | requestId, reason | SignatureRequest | signer / hr:documents:write | none / confirm |
| `hr.policies.publish` | documentId, audience filter | Policy with acknowledgement tasks | hr:documents:write | confirm |
| `hr.policies.acknowledge` | policyId | Acknowledgement | the worker only (agent cannot acknowledge) | always (human) |

### Onboarding and offboarding

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.onboardingTemplates.create` / `.update` | name, workerTypes, steps\[\] (document, signature, upload, qualification, task, account invite, training) | OnboardingTemplate version | hr:onboarding:write | none |
| `hr.onboarding.start` | workerId, templateId, startDate | OnboardingRun with steps | hr:onboarding:write | confirm |
| `hr.onboarding.completeStep` | runId, stepId, evidence? | step | step owner (worker, manager, HR) | per step kind |
| `hr.onboarding.cancel` | runId, reason | run | hr:onboarding:write | confirm |
| `hr.invites.send` | workerId, channel | invite (<issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> membership) | hr:onboarding:write | confirm |
| `hr.offboarding.start` | workerId, leaveDate, reason, templateId | OffboardingRun (access removal, kit return F6, final pay flag F12) | hr:onboarding:write | always |
| `hr.access.revoke` | workerId, at | revocation receipt | hr:workers:admin | always |

### Qualifications and training

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.qualificationTypes.create` / `.update` | name, category, validityMonths?, evidenceRequired, verificationRequired, scope (global or Event) | QualificationType | hr:qualifications:admin | none |
| `hr.qualifications.add` | workerId, typeId, issuedAt, expiresAt?, issuer, reference, fileId? | Qualification (unverified) | self, supplying agency, hr:qualifications:write | none |
| `hr.qualifications.verify` | qualificationId, outcome, note | Qualification | hr:qualifications:verify, line manager | confirm |
| `hr.qualifications.revoke` | qualificationId, reason | Qualification | hr:qualifications:verify | confirm |
| `hr.requirements.set` | target (Position, F2 shift role, or F1 Event), qualificationTypeIds | Requirement | hr:qualifications:admin, production manager for Event targets | none |
| `hr.eligibility.check` | workerIds, target, at (date-time) | per worker: eligible, reasons (missing, expired, unverified, on leave, no right to work) | crew:eligibility:read | none |
| `hr.eligibility.override` | workerId, target, reason, until | Override | hr:qualifications:admin | always |
| `hr.inductions.record` | workerId, eventId (F1), completedAt, deliveredBy | Qualification with Event scope | production manager, site supervisor | none |
| `hr.expiries.list` | window, filters | expiring and expired items | hr:qualifications:read, line manager | none |

### Right to work

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.rightToWork.record` | workerId, method (manual document, online share code, provider), documents (fileIds), checkedAt, checkerId, followUpDate? | RightToWorkCheck | hr:rtw:write | confirm |
| `hr.rightToWork.get` | workerId | latest check status (masked) | hr:rtw:read; crew coordinators see only the status flag | none |
| `hr.rightToWork.followUps.list` | window | checks due | hr:rtw:read | none |

### Leave and absence

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.leavePolicies.create` / `.update` | name, leaveType, jurisdictionRule, accrual (fixed, pro rata, per hours worked), carryOver, year start | LeavePolicy version | hr:leave:admin | confirm |
| `hr.leavePolicies.assign` | policyId, workerIds or position | assignments | hr:leave:admin | none |
| `hr.leave.balance` | workerId, asOf | balances per type (ledger sum) | self, line manager, hr:leave:read | none |
| `hr.leave.request` | workerId, type, start, end, partial days, note | LeaveRequest (pending), clash report with F2 rosters | self, or manager on behalf | none |
| `hr.leave.approve` / `.reject` | requestId, note | LeaveRequest and ledger entry; availability block in <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> | line manager, hr:leave:approve | always (named approver; agent can prepare, human approves unless an auto-approve rule exists) |
| `hr.leave.cancel` | requestId | LeaveRequest and reversing ledger entry | requester, approver | confirm |
| `hr.leave.adjust` | workerId, type, amount, reason | ledger entry | hr:leave:admin | confirm |
| `hr.absence.record` | workerId, type (sickness, unpaid, other), start, end?, fitNoteFileId? | AbsenceRecord | line manager, hr:leave:write; self for self-reported sickness | none |
| `hr.leave.calendar` | department or team, range | calendar of approved and pending leave | line manager, members of the team (dates only) | none |
| `hr.publicHolidays.sync` | region, year | holiday list | hr:leave:admin | none |

### Reports

| Action | Input | Output | Permission | Approval |
| -- | -- | -- | -- | -- |
| `hr.reports.headcount` | asOf, group by | table | hr:reports:read | none |
| `hr.reports.compliance` | asOf | onboarding incomplete, unsigned documents, expired qualifications, right-to-work follow-ups | hr:reports:read | none |
| `hr.reports.leave` | range | taken, booked, liability | hr:reports:read, finance | none |

Navigation actions (`nav.open` with screen ids in section 6) come from <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />.

## 5. Data model

All tables live in an `hr` extension through the shared schema package (<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />), tenant-scoped with the <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> tenant guard on every row. Identity of the human comes from F4 (Person); a Worker is the HR view of a Person within one tenant, so a freelancer who works for two tenants has two Worker rows and one Person per tenant, never a shared record across tenants.

| Entity | Key fields | Relations | Offline sync | Conflict rule |
| -- | -- | -- | -- | -- |
| Worker | workerType (employee, freelancer, volunteer, agency), status (candidate, onboarding, active, suspended, left), workerNumber, preferredName, homeDepartmentId, supplierOrgId (F4 Organisation, for agency crew) | Person (F4) 1:1 per tenant | Yes for HR, managers and self; summary only for crew coordinators | Field-level last writer wins for profile fields; status is server-authoritative (changed only by actions that re-check online) |
| Engagement | type (employment, contract for services, volunteer agreement), positionId, start, end, contractedHours, payBasis (salary, hourly, day rate, unpaid), rate, currency, offPayrollStatus (freelancers), version, effectiveFrom | Worker, Position; read by F12 | HR and finance only | Append-only versions; concurrent edits create two versions and the later effectiveFrom wins, both kept and flagged |
| Department, Position, ReportingLine | names, parent, head; required qualification types; effective-dated lines | tree | Yes, read-only for members | Last writer wins; cycles rejected by the action |
| SensitiveProfile | legal name, date of birth, national insurance or tax id, home address, bank details, nationality, health and access needs, diversity data (optional, consented) | Worker 1:1 | Never synced to any device except the worker's own record on their own device | Server-authoritative; offline edits by self queue and apply online |
| EmergencyContact | name, relation, phones | Worker | Self and HR; site supervisors receive name and phone for workers rostered on their Event (F1) on the day | Last writer wins |
| DocumentTemplate | kind, body as a collaborative document ([EVE-51](<https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and>) Yjs), merge fields, version |  | Yes for HR | Yjs merge; publishing a version is an online action |
| HrDocument | kind, fileId ([EVE-25](<https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import>)), status (draft, sent, signed, declined, void, expired), expiresAt | Worker, Engagement?, template version | Metadata yes; file bytes on demand and cached for self | Status server-authoritative |
| SignatureRequest, SignatureEvent | signers, order, evidence (signer identity, timestamp, IP or device id, consent text hash, document hash before and after) | HrDocument | Request metadata yes; signing needs connectivity | Signing is online-only; evidence is immutable |
| Policy, Acknowledgement | document, audience, acknowledgedAt | Worker | Yes | Immutable once recorded |
| OnboardingTemplate, OnboardingRun, OnboardingStep | steps with kind, owner, due offset, dependency | Worker; steps may create F3 tasks | Yes | Step completion is a set-once field; the first completion wins and later ones are recorded as no-ops |
| QualificationType | category (safety, technical, driving, medical, induction, other), validityMonths, evidenceRequired, verificationRequired, scope |  | Yes | Last writer wins |
| Qualification | issuedAt, validFrom, expiresAt, restrictions (codes and text, for example licence restrictions), issuer, reference, fileId, verification status, verifiedBy, scope eventId (F1) for inductions | Worker, QualificationType | Yes, including to site supervisors' devices for workers rostered on their Event | Verification status server-authoritative; evidence fields last writer wins |
| Requirement | target (Position, F2 shift role, F1 Event), qualificationTypeIds |  | Yes | Last writer wins |
| EligibilityOverride | target, reason, until, approvedBy |  | Yes, read-only | Immutable |
| RightToWorkCheck | method, checkedAt, checker, outcome, followUpDate, documents | Worker | Status flag only to coordinators; full record HR only, not offline | Immutable; corrections are new checks |
| LeavePolicy | type, jurisdictionRule, accrual method, carry-over, year start, version |  | Yes for HR | Versions |
| LeaveLedgerEntry | workerId, type, amount (hours or days), reason (accrual, taken, adjustment, carry-over, expiry), sourceId |  | Self and manager read | Append-only ledger; balance is always a sum, never a stored number |
| LeaveRequest | type, start, end, partial days, status (pending, approved, rejected, cancelled) | Worker; creates [EVE-33](<https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters>) availability block when approved | Yes | Requests can be created offline; approval is online and re-checks balance and clashes |
| AbsenceRecord | type, start, end, fit note fileId | Worker | HR and manager | Last writer wins on open records |

Documents embedded in records: DocumentTemplate bodies and onboarding notes are Yjs documents attached to their record (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />), versioned with the record and permissioned by the record's permission. Custom fields on Worker come from F14.

## 6. Screens

Components come from Rambo-UI (names are the generic component kinds Rambo-UI must provide). Each screen declares an Effect Schema screen-context projection (<issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" />) filtered by permission and masking; every control is bound to the action listed.

| Screen id | Components | Projection (what the agent sees) | Controls and actions |
| -- | -- | -- | -- |
| `hr.people` | DataTable, FilterBar, SearchField, Avatar, Badge | visible rows (id, name, type, status, department, compliance badges), filters, selection | New worker `hr.workers.create`; filter `hr.workers.list`; open `nav.open hr.worker`; bulk start onboarding `hr.onboarding.start` |
| `hr.worker` | Header, Tabs, Form, Timeline, Badge | worker summary, active tab, engagements, compliance summary; sensitive fields as masked placeholders unless revealed | Edit `hr.workers.update`; add engagement `hr.engagements.create`; reveal sensitive `hr.sensitive.get`; archive `hr.workers.archive`; end engagement `hr.engagements.end` |
| `hr.orgChart` | Tree, Card | visible nodes, focused node | Move `hr.reportingLines.set`; add department `hr.departments.create` |
| `hr.onboarding` | Kanban board, ProgressBar, Checklist | runs by stage, overdue steps | Start `hr.onboarding.start`; complete step `hr.onboarding.completeStep`; cancel `hr.onboarding.cancel` |
| `hr.templates` | List, collaborative Editor (<issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" />), MergeFieldPicker | template, version, cursor selection | Save `hr.documentTemplates.update`; generate `hr.documents.generate` |
| `hr.sign` | DocumentViewer, SignaturePad, Checkbox | document title, pages viewed, consent state | Sign `hr.signatures.sign`; decline `hr.signatures.decline` |
| `hr.qualifications` | Matrix (workers by qualification types), Badge, DatePicker, FileDropzone | visible matrix cells with status, filters | Add `hr.qualifications.add`; verify `hr.qualifications.verify`; set requirement `hr.requirements.set` |
| `hr.eligibility` (panel inside F2 roster screens and F1 Event crew view) | List, Badge, Tooltip | candidates with eligible flag and reasons | Check `hr.eligibility.check`; override `hr.eligibility.override` |
| `hr.siteCheck` (works offline) | Scanner, Card, Badge | scanned worker, Event, qualifications and induction status as of now | Scan or search `hr.eligibility.check`; record induction `hr.inductions.record` |
| `hr.leave` | Calendar, Form, BalanceCard | visible range, requests, balances shown | Request `hr.leave.request`; approve `hr.leave.approve`; reject `hr.leave.reject`; cancel `hr.leave.cancel` |
| `hr.compliance` | Dashboard of widgets (<issue id="1d65d374-8d06-4d69-a9c6-f3b66d565b47" label="EVE-30" href="https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits" />), DataTable | counts and lists per issue | Drill down via `nav.open`; chase via `hr.signatures.request` or notifications |
| `me.profile`, `me.documents`, `me.qualifications`, `me.leave` | Form, List, FileDropzone, BalanceCard | the user's own record | `hr.workers.update` (self fields), `hr.sensitive.update`, `hr.qualifications.add`, `hr.leave.request`, `hr.policies.acknowledge` |

All screens are the same app on web, desktop and mobile; there is no separate HR or crew app.

## 7. Agent behaviour

When asked, the agent can do anything the user can through the actions above, for example "onboard these 30 freelancers for the festival", "who is qualified to rig on the main stage on Saturday", "book me Friday off".

Proactive (each behind its own flag, results go to a review queue, never silent changes):

* Expiry watch: a durable scheduled run (<issue id="a626308a-598f-41ba-accd-4004cbbd9932" label="EVE-54" href="https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow" />) lists qualifications and right-to-work follow-ups expiring within 60 days and before any rostered Event date, drafts reminders to the worker (<issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" />) and flags affected F2 roster slots.
* Roster guard: when someone is put on a role, the agent runs `hr.eligibility.check` and explains any failure in plain words with the fix (upload certificate, verify, override request).
* Onboarding chase: overdue steps produce a suggested reminder and a summary for HR each morning.
* Leave clash: on `hr.leave.request`, report clashes with F2 rosters and F1 Event dates to the approver.
* Evidence reading: when a certificate image or PDF is uploaded, the agent proposes issuer, reference and dates for a person to confirm; it never verifies its own extraction.

Always needs a human: signing, acknowledging policies, verifying a qualification the agent extracted, approving leave (unless the tenant sets an auto-approve rule), ending an engagement, offboarding, revoking access, eligibility overrides, data subject exports started by HR, and purges. The agent never reads sensitive fields unless the user it acts for could and the purpose is recorded; sensitive values are excluded from prompts, telemetry and agent memory by default (<issue id="e00f04b6-a68b-41ed-8aa3-263fb8721b32" label="EVE-56" href="https://linear.app/resnovas/issue/EVE-56/p18e-build-the-agent-harness-outbound-acp-agent-memory-and-context" />).

## 8. Integrations

Each behind a neutral Effect port in its own integration package; switching vendor changes composition only. No vendor is chosen in this spec.

| Port | Default in phase one | Later adapters |
| -- | -- | -- |
| `ESignature` | Built-in simple electronic signature with evidence record (decision 4) | An external advanced or qualified e-signature provider |
| `IdentityCheck` | Manual check with document capture | A certified identity service provider for digital right-to-work checks |
| `BackgroundCheck` | Manual record of check type, reference and date | A background check provider (for example criminal record checks for work with children) |
| `PublicHolidays` | A public open-data bank holiday feed per region, cached | Other regions |
| `Calendar` | From <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> |  |
| `HrImport` | CSV import and export of workers and qualifications | Connectors to common HR platforms |
| `Notifications` | <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> |  |
| `Files` | <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> (private, encrypted at rest) |  |

## 9. Permissions and roles

Default role grants per tenant (editable in F14 customisation, enforced by <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" />):

| Role | Grants |
| -- | -- |
| HR admin | All `hr:*` grants, including sensitive read with purpose |
| HR officer | hr:workers:write, hr:documents:write, hr:onboarding:write, hr:qualifications:write, hr:rtw:write, hr:leave:write, no admin, sensitive read with confirm |
| Line manager | Read own reports (non-sensitive), approve their leave, verify their qualifications, complete onboarding steps they own |
| Crew coordinator / production manager | crew:eligibility:read (status and reasons only), set Event requirements, record inductions |
| Site supervisor | Offline eligibility and emergency contacts for workers rostered on their Event on the day; record inductions |
| Finance | Read engagement pay fields and approved absence; no sensitive profile except bank details when F12 needs them |
| Worker (any type) | Own record, own documents, own leave, own qualifications; never another worker's data |
| Supplying agency (external) | Add and maintain qualifications and documents for workers whose supplierOrgId is their organisation; see eligibility for those workers only |
| Agent | Exactly the grants of the user it acts for, minus actions marked human-only in section 7 |

Field masking: SensitiveProfile fields are masked in every projection unless the caller holds hr:sensitive:read and has revealed them for a recorded purpose; reveals are audited and expire after the screen closes.

## 10. Telemetry and flags

* Feature flag: `hr-module` (default off in code), with child flags `hr-agent-expiry-watch`, `hr-agent-roster-guard`, `hr-agent-evidence-reading` (default off).
* PostHog events (no personal values, ids pseudonymous): `hr_worker_created`, `hr_onboarding_started`, `hr_onboarding_completed` (with duration), `hr_document_signed`, `hr_qualification_added`, `hr_qualification_verified`, `hr_eligibility_checked` (outcome, reason codes), `hr_eligibility_overridden`, `hr_leave_requested`, `hr_leave_decided`, `hr_site_check_offline`.
* Spans on every action from <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" />; sensitive fields marked secret are never attributes.
* Success metrics: share of rostered people with all required qualifications valid at call time (target 100 percent, overrides counted separately); median days from `hr.onboarding.start` to completion; share of leave requests decided within 2 working days.

## 11. Compliance

Requirements to validate with a qualified adviser before launch; the rules below are the starting point, UK first (decision 6), behind a jurisdiction rule port.

* **Data protection (UK GDPR, EU GDPR)**: lawful basis per field, special category data (health, diversity) separated, consent for optional diversity data, data subject access and export (`hr.dataExport.subject`), rectification, retention schedules with purge (`hr.retention.purge`), records of processing, encryption at rest for SensitiveProfile and files, access audit on every reveal.
* **Right to work (UK)**: checks recorded before work starts, copies kept securely for the engagement plus two years after it ends, then deleted; follow-up checks for time-limited permission.
* **Employment terms**: a written statement of particulars from day one for employees and workers (generated from templates).
* **Working time**: store the 48-hour opt-out signature; rest and weekly limits are enforced in F2 rosters using data held here.
* **Holiday**: statutory minimum 5.6 weeks for full-time staff; rolled-up holiday pay and the 12.07 percent accrual method allowed for irregular-hours and part-year workers in leave years starting on or after 1 April 2024; bank holiday handling per policy.
* **Freelancers**: store the off-payroll (IR35) status determination and its reasoning where the tenant must make one; Eventiva does not decide employment status.
* **E-signatures**: simple electronic signatures are admissible in the UK and EU for most employment documents; evidence must show who signed, when, and that the document was not changed.
* **Safeguarding**: record check type and date for roles that need criminal record checks; never store the certificate content beyond what the tenant's policy allows.
* All customer-facing text is whitelabel and ASCII only.

## 12. Acceptance

* A freelancer, an employee and a volunteer are each created, onboarded from a template with a signed document and an uploaded certificate, and appear as active, by a person in the UI and separately by the agent, with identical audit rows.
* Rostering a worker with an expired or unverified required qualification onto an F2 role for an F1 Event fails with a reason; an override requires approval and is audited.
* A site supervisor's phone, offline, shows the correct eligibility and induction status for every worker rostered on that Event that day, and records an induction that syncs on reconnect.
* A leave request offline is accepted locally, approved online with balance and roster clash re-checked, writes a ledger entry and blocks availability in <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" />.
* A crew coordinator and the agent acting for them can never read any SensitiveProfile field (negative tests across UI, HTTP, MCP and ACP).
* A data subject export contains every HR record for the worker; a purge removes right-to-work copies after the retention date.
* The parity gate passes for every action and every screen control in this set.

## 13. Out of scope

* Pay runs, payslips, tax and pension calculations, timesheets and expenses (F12 and F11).
* Shift building, availability requests and call sheets (F2), beyond the eligibility check and leave block this set provides.
* Recruitment and applicant tracking (job adverts, candidate pipelines); a Worker starts at candidate status when hiring is decided.
* Engagement surveys and compensation planning. Performance reviews, goals and feedback are in scope (decision 7b, <issue id="17b3f12a-4684-475c-8204-fb320edf05fe" label="EVE-239" href="https://linear.app/resnovas/issue/EVE-239/f1310-build-performance-reviews-goals-and-feedback" />).
* Health and safety incident reporting (belongs with live operations).
* Deciding employment status or giving legal advice.

## 14. Dependencies

* Phase one: <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" /> (actions), <issue id="9d08c369-bac9-4eb7-b8a7-329b5ec9bff0" label="EVE-41" href="https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials" /> (settings, secrets, encryption keys), <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> (storage, tenant guards), <issue id="7f612e80-3332-4acf-a74c-d35db06fe4e8" label="EVE-43" href="https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and" /> (identity, approvals, audit), <issue id="a03acb76-125b-4ead-815e-10ec986d8413" label="EVE-44" href="https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor" /> (telemetry), <issue id="ee08644c-eb3c-4a46-aea7-745864ad4263" label="EVE-45" href="https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change" /> (change feed for expiry and status events), <issue id="0ab161c4-ed9c-4581-86fe-91fa1f4216aa" label="EVE-46" href="https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action" /> (HTTP), <issue id="37c126a9-64e0-4235-88f0-494533c8e3a2" label="EVE-48" href="https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory" /> (MCP), <issue id="937d4311-ff71-4bd1-b167-846d08afc64f" label="EVE-49" href="https://linear.app/resnovas/issue/EVE-49/p110-build-inbound-acp-so-editors-can-drive-eventivas-agent" /> (inbound ACP), <issue id="91297309-acc4-4bb9-ad68-33fbc2720e5a" label="EVE-50" href="https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen" /> (screen awareness), <issue id="a1348819-43cc-4005-8e8d-a896a761af03" label="EVE-51" href="https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and" /> (collaborative templates and record sync), <issue id="3deaef52-8db8-490c-8143-b293ab5656a8" label="EVE-52" href="https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools" /> and <issue id="a626308a-598f-41ba-accd-4004cbbd9932" label="EVE-54" href="https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow" /> (agent loop and durable scheduled runs), <issue id="e00f04b6-a68b-41ed-8aa3-263fb8721b32" label="EVE-56" href="https://linear.app/resnovas/issue/EVE-56/p18e-build-the-agent-harness-outbound-acp-agent-memory-and-context" /> (agent memory exclusions), <issue id="60101c56-d4e4-4e4f-b7c8-b4c40f44ada0" label="EVE-17" href="https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and" /> (sync engine choice).
* Port-later: <issue id="9aae6a50-4a43-4327-ae6a-51d18bc69b35" label="EVE-24" href="https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email" /> (notifications), <issue id="8d8d301b-d679-4dac-95bb-c24889179cd0" label="EVE-25" href="https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import" /> (private files), <issue id="2cd1c920-450c-487e-b4c8-e860a382a6b0" label="EVE-26" href="https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource" /> (search), <issue id="b7f17f15-c893-46e9-9b3b-2aefae473802" label="EVE-27" href="https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource" /> (comments), <issue id="338aae77-d10e-4f8a-9189-fe3655bd3572" label="EVE-28" href="https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent" /> (localisation), <issue id="1d65d374-8d06-4d69-a9c6-f3b66d565b47" label="EVE-30" href="https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits" /> (dashboard widgets), <issue id="62f3bba8-9275-4ff1-98bf-62b95f432b37" label="EVE-32" href="https://linear.app/resnovas/issue/EVE-32/port-settings-profiles-navigation-command-menu-and-onboarding" /> (settings and onboarding shell), <issue id="97915f03-fb56-4efc-bb5a-15e8b62b96b2" label="EVE-33" href="https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters" /> (scheduling: availability blocks and roster roles).
* Feature sets: F1 (Event as requirement and induction scope), F2 (roster roles and eligibility gate), F3 (onboarding tasks), F4 (Person and Organisation identity, supplying agencies), F6 (kit return at offboarding), F7 (driving licence qualifications for vehicle allocation), F12 (engagement terms and absence feed pay runs), F14 (custom fields and role editing).

## 15. Decisions for Jonathan

Decided 2026-11-08 by Jonathan: 1a, 2a, 3a, 4a, 5a, 6a, 7b (reviews added as F13.10, <issue id="17b3f12a-4684-475c-8204-fb320edf05fe" label="EVE-239" href="https://linear.app/resnovas/issue/EVE-239/f1310-build-performance-reviews-goals-and-feedback" />).

1. **Who has an HR record**: (a) one Worker record for employees, freelancers, volunteers and agency crew, recommended, because event crews are mostly freelance; (b) employees only, freelancers stay contacts in F4.
2. **Identity**: (a) Worker extends the F4 Person per tenant, recommended, one human one contact record; (b) a separate HR person record.
3. **Qualification gate on rostering**: (a) hard block with an approved, audited override, recommended for safety-critical work like rigging and electrics; (b) warning only; (c) no check.
4. **E-signature in phase one**: (a) built-in simple e-signature with an evidence record behind the `ESignature` port, recommended, no vendor or cost; (b) integrate an external provider first.
5. **Right-to-work checks in phase one**: (a) manual check record with document capture and follow-up reminders, provider port later, recommended; (b) integrate a certified identity provider now.
6. **Leave rules**: (a) UK statutory rule pack first, other jurisdictions as configurable policies, recommended; (b) generic configurable policies only.
7. **Performance reviews**: (a) out of F13 for now and listed as a future set, recommended; (b) add a reviews slice to F13. **Chosen: (b).**

## 16. Child issues (build order)

 1. <issue id="7cc5c061-dd2d-4963-8e03-f0175a4f12b9" label="EVE-98" href="https://linear.app/resnovas/issue/EVE-98/f131-build-worker-records-engagements-and-organisation-structure" /> F13.1 Build worker records, engagements and organisation structure
 2. <issue id="636f7592-553b-41f2-adb0-9a336d0188e3" label="EVE-116" href="https://linear.app/resnovas/issue/EVE-116/f132-build-the-sensitive-profile-with-field-masking-reveal-audit-and" /> F13.2 Build the sensitive profile with field masking, reveal audit and retention
 3. <issue id="dfa50522-8aa1-4d6a-af8b-1dbed0edcb47" label="EVE-121" href="https://linear.app/resnovas/issue/EVE-121/f133-build-hr-documents-templates-and-built-in-e-signature" /> F13.3 Build HR documents, templates and built-in e-signature
 4. <issue id="576185f3-f438-43c7-b694-e5afff0605e7" label="EVE-153" href="https://linear.app/resnovas/issue/EVE-153/f134-build-onboarding-and-offboarding-runs" /> F13.4 Build onboarding and offboarding runs
 5. <issue id="9f305527-7de1-436f-89bd-27341f70624e" label="EVE-154" href="https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check" /> F13.5 Build qualifications, requirements and the eligibility check
 6. <issue id="d9da9830-5771-4e7c-85be-f3c99aed92e6" label="EVE-156" href="https://linear.app/resnovas/issue/EVE-156/f136-build-right-to-work-and-background-check-records" /> F13.6 Build right-to-work and background check records
 7. <issue id="5ca54321-0f0a-461c-ade1-89cf3197dc48" label="EVE-179" href="https://linear.app/resnovas/issue/EVE-179/f137-build-leave-policies-the-leave-ledger-requests-and-absence" /> F13.7 Build leave policies, the leave ledger, requests and absence
 8. <issue id="1f0f3874-a7da-4e7b-8a25-bdc506c85747" label="EVE-182" href="https://linear.app/resnovas/issue/EVE-182/f138-build-self-service-and-the-offline-site-check-screens" /> F13.8 Build self-service and the offline site check screens
 9. <issue id="37316972-9790-4c12-99e4-ce65c0d8f9d7" label="EVE-196" href="https://linear.app/resnovas/issue/EVE-196/f139-build-hr-agent-playbooks-and-compliance-reports" /> F13.9 Build HR agent playbooks and compliance reports
10. <issue id="17b3f12a-4684-475c-8204-fb320edf05fe" label="EVE-239" href="https://linear.app/resnovas/issue/EVE-239/f1310-build-performance-reviews-goals-and-feedback" /> F13.10 Build performance reviews, goals and feedback

## 17. Alignment with other feature sets (2026-11-01)

* **F1 (**[EVE-73](<https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show>)**)**: people on an event are F1 TeamMember (event_id, contact_ref to F4, role, departments, external flag). F13 exposes `hr.qualifications.holds` (personRef, qualificationTypeKey, at) returning holds, expiry, verified and a reason, so F1 can gate `rigging.signOff` (f1:rigging:certify) on the seeded `rigging-competent-person` qualification. Built in [EVE-154](<https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check>). Requirement targets use F1 Event and Space.
* **F4 (**[EVE-65](<https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history>)**)**: every human is one F4 Person (Party, typeid), separate from the login User in [EVE-43](<https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and>). A Worker references the Person by party id and holds employment data only; special category data stays in F13 SensitiveProfile, never in F4. F13 registers as a PartyReferenceOwner ([EVE-99](<https://linear.app/resnovas/issue/EVE-99/f44-find-and-merge-duplicate-contacts-and-import-and-export-them>)) so Person merges rewrite Worker references. Built in [EVE-98](<https://linear.app/resnovas/issue/EVE-98/f131-build-worker-records-engagements-and-organisation-structure>).
* **F2 (**[EVE-67](<https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets>)**)**: F2 reads F13 only through a QualificationReader port (qualifications, age band derived from date of birth without exposing it, contract type) and treats approved leave as an availability exception of kind unavailable ([EVE-128](<https://linear.app/resnovas/issue/EVE-128/f21-build-crew-profiles-roles-and-availability>), [EVE-130](<https://linear.app/resnovas/issue/EVE-130/f23-build-working-time-rules-and-conflict-checks>)). F2 stores no right-to-work documents. Working-time rule packs (UK first) live in F2 and read contract type from F13. F13 implements QualificationReader in [EVE-154](<https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check>) and the leave exception in [EVE-179](<https://linear.app/resnovas/issue/EVE-179/f137-build-leave-policies-the-leave-ledger-requests-and-absence>).
* **F7 (**[EVE-71](<https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and>)**)**: driving licences live in F13 as Qualifications; F7 reads them through the same QualificationReader port for driver eligibility ([EVE-97](<https://linear.app/resnovas/issue/EVE-97/f72-build-driver-eligibility-checks-from-staff-qualifications>)). Each Qualification carries category key (for example UK licence categories B, C1, D1 and extras such as 4x4 or forklift as their own types), validFrom, expiresAt (valid to) and restrictions (list of codes and free text). Built in [EVE-154](<https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check>).
* **F12 payroll (**<issue id="1eff75a6-04b4-446b-a29c-816c50dd169f" label="EVE-92" href="https://linear.app/resnovas/issue/EVE-92/f126-build-freelancer-self-billing-and-worker-status-records" />, <issue id="dd0fdf5c-47be-46e5-a9ac-ba072c3a43a5" label="EVE-88" href="https://linear.app/resnovas/issue/EVE-88/f125-build-the-payroll-provider-port-and-the-first-adapter" />, <issue id="a060ed52-422b-4a20-ba8e-cc47ca2a79de" label="EVE-96" href="https://linear.app/resnovas/issue/EVE-96/f127-build-the-payments-file-and-the-pay-run-events-for-accounting" />): the individual rate stays on Engagement and overrides the F12 rate card (role and event rates, overtime, allowances) for that worker. F12 reads engagement type and offPayrollStatus from Engagement and keeps no status record of its own. F12 reads bank details and tax and NI ids from SensitiveProfile only when building a provider submission or payment file, and never stores them. F12 calculates holiday pay from approved leave (<issue id="5ca54321-0f0a-461c-ade1-89cf3197dc48" label="EVE-179" href="https://linear.app/resnovas/issue/EVE-179/f137-build-leave-policies-the-leave-ledger-requests-and-absence" />). The final-pay flag from offboarding (<issue id="576185f3-f438-43c7-b694-e5afff0605e7" label="EVE-153" href="https://linear.app/resnovas/issue/EVE-153/f134-build-onboarding-and-offboarding-runs" />) becomes an F12 pay run exception.
* Naming: the HR record is **Worker** (not Staff); certificates, licences, trainings and inductions are all **Qualification** of a **QualificationType**.

## Linear comments (4)

### Comment a2d00fbc-9574-472c-9f73-c8e350147d17

Author: GitHub. Created: 2026-11-01T13:06:59.938Z; updated: 2026-11-01T13:06:59.902Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/847). All replies are displayed in both locations.


### Comment 0ba7fcad-6e45-4dbd-8e9e-664d82a8b46b

Author: jonathan@resnovas.com. Created: 2026-11-11T19:41:09.453Z; updated: 2026-11-11T19:41:09.424Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave) (comment ID above). Parent: None. Resolved: Not recorded.

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


### Comment f1b09e07-29d3-4ede-bce1-8c7845b78d87

Author: jonathan@resnovas.com. Created: 2026-11-11T19:44:42.688Z; updated: 2026-11-11T19:44:42.622Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave) (comment ID above). Parent: None. Resolved: Not recorded.

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


### Comment 2270be42-1fc6-4e2e-bec1-ad709eb02a44

Author: jonathan@resnovas.com. Created: 2026-11-11T19:51:43.742Z; updated: 2026-11-11T19:51:43.702Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave) (comment ID above). Parent: None. Resolved: Not recorded.

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
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
