# EVE-305 Graphify administrator settings inspection

This receipt records the read-only settings evidence that [EVE-305](https://linear.app/resnovas/issue/EVE-305) / [Eventiva #1108](https://github.com/Resnovas/Eventiva/issues/1108) still lacked. The same evidence supplies what [RES-75](https://linear.app/resnovas/issue/RES-75) asks for, under [RES-74](https://linear.app/resnovas/issue/RES-74) / [house #87](https://github.com/Resnovas/.github/issues/87). Ownership of EVE-305 stays with the existing [implementation thread](https://ampcode.com/threads/T-01a21be5-639d-7648-a3d5-d9b54cf795e2). This session added a read-only evidence slice only. Plane now holds EVE-305 as Plane EVE-11.

The session's instruction on 2026-11-28 was not to change `timeline.md` or the roadmap SVGs on branches, citing [EVE-326](https://linear.app/resnovas/issue/EVE-326). EVE-326 has no recorded owner decision yet, so the [lifecycle procedure](README.md#development-task-lifecycle-and-mapping) still asks for a timeline entry. This record leaves both unchanged.

Earlier reads by the Graphify owner returned HTTP 403. On 2026-11-28 at about 20:25 UTC, a Claude Code session (`claude-opus-5-5`) in T3 Code repeated them. It used the `TGTGamer` GitHub token available to the session, which holds repository administrator permission. It made GET requests only and changed no setting. Secret and variable values were not read. This is an agent reading with Jonathan's token, not his personal inspection.

## Results

| Setting | Eventiva | Resnovas/.github | Reading |
| --- | --- | --- | --- |
| Classic branch protection on `main` | None: HTTP 404, branch not protected | None: HTTP 404 | No retired Graphify required check exists there. |
| Required status checks | Ruleset 27203425: `smartcloud`, `house check`, `application check` | Ruleset 24073109: `smartcloud`, `check` | No Graphify check is required. |
| Ruleset bypass | Repository role 5 (admin), `always` | Same | Matches the house preset's locked `adminBypass: true`. |
| Allowed actions and reusable workflows | All; SHA pinning not required | All | The pinned house workflow is callable. Both repositories are public, so the cross-repository access policy does not apply (HTTP 422). |
| Default workflow token | `read` | `read` | Read-only, as required. |
| Actions may create and approve pull requests | `true` | `true` | Finding 1 below. |
| Repository artifact and log retention | 90 days (maximum 90) | 90 days | The publisher's 7-day upload setting is within this. |
| Publishing App `resnovas-smartcloud` | Organization installation, all repositories, not suspended. `contents: write`, `pull_requests: write` | Same installation | The required permissions are present. Finding 2 below. |
| App credentials | Organization secret `RESNOVAS_BOT_PRIVATE_KEY` and organization variable `RESNOVAS_BOT_APP_ID` are visible to the repository | Same | Names only. |

The 2026-11-28 scheduled runs used this configuration successfully in both repositories. See the EVE-324 publisher proof, `eve-324-graphify-publication.md` in this directory, added by [PR1162](https://github.com/Resnovas/Eventiva/pull/1162).

## Findings for owner decision

Neither finding blocks Graphify, and no change is proposed or authorized here.

1. In both repositories the workflow token may create and approve pull requests (`can_approve_pull_request_reviews: true`). The new publisher does not use that ability: it proposes with the App token. The value is locked by the house preset (`actions.createPullRequests: true` in `house-base.yml`), so the legacy `graphify.yml` can fall back to the workflow token. Dropping it is a house-wide preset decision under RES-74.
2. The App's requested permissions are far broader than the publisher needs, including `administration`, `secrets`, `workflows` and `organization_administration` write. The publisher limits its minted token to `contents: write` and `pull-requests: write` for the calling repository. Narrowing the App's requested permissions affects every smartcloud feature, so it needs its own review.

## Owner decisions and status

On 2026-11-28 Jonathan gave these decisions through T3 Code:

- He accepts this agent read as the administrator inspection, so it need not be repeated.
- He approves this task-local record, on the condition that it changes records only, and asks for Plane EVE-11 and #1108 to close when it merges.

Status at the same date:

- House PR91, the first hosted house snapshot, merged through the house merge queue as [`bf9d5a2f`](https://github.com/Resnovas/.github/commit/bf9d5a2f92a9393cc9e8e5a06da4e25273bb7c59).
- The PR1102 supersession review (Plane EVE-50 / #1145) is Done and closed.
- The publisher proof (Plane EVE-51 / #1144) closes with [PR1162](https://github.com/Resnovas/Eventiva/pull/1162).
- The two findings above remain open for a separate owner decision.
