<!-- linear:generated:start -->
# EVE-59: Telemetry F3: Implement Early Access enrollment on native and server through the Flags service

[Live Linear source](https://linear.app/resnovas/issue/EVE-59/telemetry-f3-implement-early-access-enrollment-on-native-and-server) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:30:49.344Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-19](EVE-19.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Give every runtime the house-required Early Access capability, even though only posthog-js exposes it (`getEarlyAccessFeatures`, `updateEarlyAccessFeatureEnrollment`); posthog-react-native 4.85.1 and posthog-node 5.61.1 have no API for it.

## Context

* Decided contract: <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> comment "S6 findings" (accepted 2026-10-31). `Flags` is a `Context.Tag` service in core with `evaluate(flag: FlagDef<A>)` and `enrolEarlyAccess(flag, on)`; vendors are Layers in `packages/integrations/*`.
* House: `feature-flags` skill (safe in-code defaults, offline cached values); Effect-TS rule 3.

## Work

1. Read posthog-js `updateEarlyAccessFeatureEnrollment` source to get the exact event name and person property it sends (expected `$feature_enrollment_update` with `$feature_flag`, `$feature_enrollment`, and `$set` of `$feature_enrollment/<flag>`). Record the source file and version in a comment.
2. In the PostHog native and Node Layers, implement `Flags.enrolEarlyAccess` by sending that same capture, then reload flags.
3. Listing features: serve the list from Eventiva's server (one Effect action, permission-checked, agent-invocable like every action) that calls the PostHog early access API with a server-side key; clients call that action, not PostHog.
4. Web Layer keeps using posthog-js directly.
5. Tests with `@effect/vitest`: the native and Node Layers emit the same payload as posthog-js for a given flag (golden test); the Noop Layer is a no-op.

## Acceptance

Enrolling from web, native and server flips the same flag for the person in PostHog; tests pass; docs updated per house rule 6.

## Out of scope

UI for the early access list (belongs to the screen that hosts it).

## Done signal

Merged to main per the Eventiva ship-direct rule, with tests and docs.

## Linear comments (1)

### Comment c391b8c8-201f-4f29-b6b1-00bea139ca52

Author: GitHub. Created: 2026-10-31T22:45:47.775Z; updated: 2026-10-31T22:45:47.748Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-59/telemetry-f3-implement-early-access-enrollment-on-native-and-server) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/826). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
