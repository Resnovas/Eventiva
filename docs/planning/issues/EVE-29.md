<!-- linear:generated:start -->
# EVE-29: Port agent evaluations linked to PostHog datasets

[Live Linear source](https://linear.app/resnovas/issue/EVE-29/port-agent-evaluations-linked-to-posthog-datasets) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:19.338Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Enhancement |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-104](EVE-104.md), [EVE-165](EVE-165.md), [EVE-196](EVE-196.md), [EVE-224](EVE-224.md) |
| Related to | [EVE-14](EVE-14.md), [EVE-15](EVE-15.md), [EVE-19](EVE-19.md), [EVE-66](EVE-66.md), [EVE-110](EVE-110.md), [EVE-119](EVE-119.md), [EVE-127](EVE-127.md), [EVE-144](EVE-144.md), [EVE-186](EVE-186.md), [EVE-197](EVE-197.md), [EVE-198](EVE-198.md), [EVE-220](EVE-220.md), [EVE-227](EVE-227.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every agent capability has repeatable evaluations, built from real (redacted) production traces as well as hand-written cases, run in CI and on prompt or model changes.

## Upstream reference (pinned tag from <issue id="cc5eba91-a4f7-4542-b332-10d3e1d70ed8" label="EVE-15" href="https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol" />)

* `eval/` (9 files): `define-eval.ts`, agent runner, scorer, decision classification, `from-trace.ts` (build a case from a production trace), report.

## Eventiva form

* `agent-eval` package: `defineEval` in Effect with Schema-typed cases; runs the real agent against an in-memory or seeded test tenant using the same actions; scorers for correctness, tool choice, permission respect and cost.
* Cases can be generated from traces with PII redacted, and stored as PostHog Datasets (house telemetry `ai.md`: Datasets, prompts with A/B tests); prompt and model changes ship behind flags and must not regress the eval score.
* Nx target `eval` per agent module; fast subset in the gate, full set nightly.

## Acceptance

One eval suite for the events agent passes in CI; a deliberately worse prompt drops the score and fails; a case built from a trace contains no personal data.

## Depends on

<issue id="07c58289-6f1c-488e-a130-5f718b473fce" label="EVE-14" href="https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory" />, <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> (PostHog matrix), agent loop from phase 1.

## Out of scope

Human labelling tools.

## Linear comments (1)

### Comment f5e206af-4f71-498e-b68c-32aa6b8d46c3

Author: GitHub. Created: 2026-10-31T21:59:08.158Z; updated: 2026-10-31T21:59:08.140Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-29/port-agent-evaluations-linked-to-posthog-datasets) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/796). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
