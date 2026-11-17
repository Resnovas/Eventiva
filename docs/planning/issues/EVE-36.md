<!-- linear:generated:start -->
# EVE-36: Stream agent output from a durable log, not volatile RPCs

[Live Linear source](https://linear.app/resnovas/issue/EVE-36/stream-agent-output-from-a-durable-log-not-volatile-rpcs) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:39.030Z. Generated source mirror; edit Linear and refresh, not this region.

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
| Blocks | None recorded |
| Related to | [EVE-18](EVE-18.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Agent token and event streams survive shard moves: a client that reconnects gets every chunk exactly once by offset.

## Context

* Found in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />. Evidence: `/mnt/project-files/eve-18/*/analysis.txt`, "volatile" sections.
* Non-persisted RPCs (`ClusterSchema.Persisted=false`, which is how `DemoEntity.Shoot` is declared today) are dropped when their shard is moving: 332 of 10,000 lost during a graceful drain, 1,751 lost on SIGKILL with a 20s restart, 4,238 lost on SIGKILL with failover. Persisted RPCs lost 0 in every run.
* Streaming RPC chunks are volatile by nature, so a stream that rides an entity RPC breaks on every shard move.

## Work

1. Each agent run appends output events to a Postgres table keyed by `(runId, offset)` from inside its activities (see the restart issue), in the same transaction as the step result where possible.
2. The client reads with "events after offset N" plus a notify (Postgres `LISTEN/NOTIFY` or polling at 200ms); on reconnect it resumes from its last offset.
3. Test: kill the runner that owns the run mid-stream; assert the client receives offsets 0..N with no gaps and no repeats.

## Acceptance

Gap-and-duplicate test passes against two runners.

## Out of scope

Choosing the client transport (SSE, WebSocket); AI SDK UI integration.

## Done signal

Test green; comment with the test output.

## Linear comments (1)

### Comment 03fbec78-414c-4acc-8ebb-c12e2e93d74c

Author: GitHub. Created: 2026-10-31T22:29:50.991Z; updated: 2026-10-31T22:29:50.958Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-36/stream-agent-output-from-a-durable-log-not-volatile-rpcs) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/803). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
