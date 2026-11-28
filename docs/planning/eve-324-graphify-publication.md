# EVE-324 hosted Graphify publisher proof

This receipt belongs to [EVE-324](https://linear.app/resnovas/issue/EVE-324) / [Eventiva #1144](https://github.com/Resnovas/Eventiva/issues/1144), a child of [EVE-305](https://linear.app/resnovas/issue/EVE-305) / [Eventiva #1108](https://github.com/Resnovas/Eventiva/issues/1108). Ownership of both stays with the existing [implementation thread](https://ampcode.com/threads/T-01a21be5-639d-7648-a3d5-d9b54cf795e2). This session added a read-only evidence slice only.

The session's instruction on 2026-11-28 was not to change `timeline.md` or the roadmap SVGs on branches, citing [EVE-326](https://linear.app/resnovas/issue/EVE-326). EVE-326 has no recorded owner decision yet, so the [lifecycle procedure](README.md#development-task-lifecycle-and-mapping) still asks for a timeline entry. This record leaves both unchanged.

Plane now holds the Graphify issues under new numbers: EVE-324 is Plane EVE-51, EVE-325 is Plane EVE-50 and EVE-305 is Plane EVE-11. Plane numbers collide with unrelated Linear issues, so repository references keep the Linear identifiers.

A Claude Code session (`claude-opus-5-5`) in T3 Code checked the evidence below at about 20:25 UTC on 2026-11-28. It has no shareable thread link. GitHub values come from the REST API or from downloaded artifacts; mappings come from Linear and Plane. This session dispatched, re-ran, merged and reconfigured nothing.

## Scheduled runs

Both callers run the reusable [`graphify-snapshot.yml`](https://github.com/Resnovas/.github/blob/e0eaf130aec53f396067b148696ca9d62b03edc9/.github/workflows/graphify-snapshot.yml) at house revision `e0eaf130`, as the run metadata records. They are the only scheduled runs so far, and the first after the pin correction ([PR1124](https://github.com/Resnovas/Eventiva/pull/1124), [house PR89](https://github.com/Resnovas/.github/pull/89)). Both started about nine hours after the 04:23 UTC cron slot. The cause of that delay is not recorded.

| Repository | Run | Event and source | Result |
| --- | --- | --- | --- |
| Eventiva | [46148373540](https://github.com/Resnovas/Eventiva/actions/runs/46148373540) | `schedule` on `main` at `fe52da2f`, started 13:11:30Z | Success. Generate, artifact upload, scoped token, identity, signed proposal and summary steps all passed. |
| .github | [46148716252](https://github.com/Resnovas/.github/actions/runs/46148716252) | `schedule` on `main` at `1a0ff381`, started 13:15:34Z | Success, with the same steps. |

The job token has `contents: read`. The publisher mints its App token with only `contents: write` and `pull-requests: write`, scoped to the calling repository. Neither repository has a `workflow_dispatch` run of the publisher.

## Artifacts and retention

| Repository | Artifact | Expires | Content check |
| --- | --- | --- | --- |
| Eventiva | `graphify-fe52da2f...-46148373540-1`, 1,315,540 bytes, created 13:13:06Z | 2026-12-05T13:13:05Z | Downloaded. `graph.json` and `provenance.json` match the snapshot merged on `main` by SHA-256. |
| .github | `graphify-1a0ff381...-46148716252-1`, 452,399 bytes, created 13:15:52Z | 2026-12-05T13:15:51Z | Downloaded. Both files match the PR91 head by SHA-256. |

Each artifact expires seven days after upload. The publisher sets `retention-days: 7`, which is below the 90-day repository default in both repositories.

Each `provenance.json` records `source_sha` equal to the run's event SHA, generator `0.9.122` and mode `code-only`. Eventiva fingerprint `9a2b0a75...` and configuration hash `ffc40028...`. House fingerprint `20994672...` and configuration hash `60e50d3c...`.

## Signed snapshot proposals

| Repository | Proposal | Commit | State |
| --- | --- | --- | --- |
| Eventiva | [PR1152](https://github.com/Resnovas/Eventiva/pull/1152) on `house/graphify-navigation` | `e25dafb5` by `resnovas-smartcloud[bot]`, signature valid. It changes only the two snapshot files. | 30 checks passed and 1 was skipped. The `TGTGamer` account queued it at 15:33:20Z with no review. The merge queue merged it at 15:51:01Z as [`294b2132`](https://github.com/Resnovas/Eventiva/commit/294b213203e8b8af84864dca8d5fcd8a188ad752), signature valid. |
| .github | [house PR91](https://github.com/Resnovas/.github/pull/91) on `house/graphify-navigation` | `74708ae7` by `resnovas-smartcloud[bot]`, signature valid, based on `1a0ff381`. It changes only the two snapshot files. | No check failed: 33 passed, 2 were neutral and 1 was skipped at merge. There was no review. Under the AI-21 agent-merge exception, this session queued it at 21:05:57Z. The merge queue merged it at 21:09:17Z as [`bf9d5a2f`](https://github.com/Resnovas/.github/commit/bf9d5a2f92a9393cc9e8e5a06da4e25273bb7c59), signature valid. House `main` now holds the same snapshot bytes as the artifact. |

Neither workflow merged its own proposal.

## Receipts and remaining work

The delivery receipts [Eventiva PR1127](https://github.com/Resnovas/Eventiva/pull/1127) and [house PR90](https://github.com/Resnovas/.github/pull/90) merged on 2026-11-27. This record adds the hosted run proof that those receipts left outstanding.

- The no-change path (`changed=false`: artifact only, no token, no PR) is still unexercised, because both runs found changes.
- The administrator settings inspection is recorded separately under EVE-305.

On 2026-11-28 Jonathan reviewed this task-local record, through T3 Code, and approved it on the condition that it changes records only. He asked for Plane EVE-51 and #1144 to close when it merges.
