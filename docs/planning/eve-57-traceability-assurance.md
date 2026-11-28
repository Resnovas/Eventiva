# EVE-57 traceability assurance

This record belongs to Plane EVE-57 / [Eventiva #1143](https://github.com/Resnovas/Eventiva/issues/1143), a child of Plane EVE-24 / [#1053](https://github.com/Resnovas/Eventiva/issues/1053). Plane imported them on 2026-11-28 from [Linear EVE-323](https://linear.app/resnovas/issue/EVE-323) and [Linear EVE-266](https://linear.app/resnovas/issue/EVE-266), reusing the `EVE` key with different numbers. Under owner decision 3, a bare `EVE-N` means the Plane work item. Every Linear number in this record is historical and labelled "Linear".

A Claude Code session (Claude Opus 5.5) did this reconciliation on 2026-11-28, against Eventiva main `f8b60fff` and house main `e6e89a1e`. Its only writes are this record and one README paragraph. It changed no token, setting, ruleset or workflow, and it reran and dispatched nothing. The task's instructions said to record outcomes in planning documents and not to edit the timeline while timeline conflicts (Linear EVE-326) are open. No owner decision was found that extends the PR #1118 timeline exception to this item, so the timeline statements below remain as written. This record says where newer evidence supersedes them.

This record is EVE-57's reconciliation. Its pull request closes EVE-57 and #1143 when the owner merges it. The parent EVE-24 stays open.

## Delivered evidence receipt (EVE-58)

[PR #1094](https://github.com/Resnovas/Eventiva/pull/1094) landed through the protected queue at [458051c7](https://github.com/Resnovas/Eventiva/commit/458051c7ad71fcfe35d640399a988c2c02b8f82b) on 2026-11-28 at 02:14:06 UTC. All six push workflows passed on that commit, including [main CI](https://github.com/Resnovas/Eventiva/actions/runs/46097050137) (verify, smoke and application check) and [smartcloud](https://github.com/Resnovas/Eventiva/actions/runs/46097050331). That is the delivery and post-merge evidence EVE-58 / [#1142](https://github.com/Resnovas/Eventiva/issues/1142) (formerly [Linear EVE-322](https://linear.app/resnovas/issue/EVE-322)) asks for. Plane EVE-58 was set to Done on 2026-11-28. The [Linear EVE-312 receipt](eve-312-recovery.md) records the delivery itself.

## Original acceptance clauses

| Clause | Status on current mains | Remaining |
| --- | --- | --- |
| C1 Render canonical guidance through house tooling; add local mapping guidance | Met, by a local probe. House `scripts/render.mjs --check` at `e6e89a1e` with Eventiva's sync values reports Eventiva main up to date. Removing `TASK_LINEAR_PREFIX` makes it report the prefix file stale, and a one-line edit to `.cursor/commands/verify.md` makes it report that file. The AGENTS.md and CLAUDE.md managed blocks and `tools/dev/commit-check.mjs` are byte-identical to the house templates. The prefix file holds `EVE`, the rendered value of `{{TASK_LINEAR_PREFIX:-none}}`. | None. |
| C2 Record start, blockage, handoff and delivery | Followed for the parent: Linear EVE-266, #1053 and the timeline carry dated entries. This is guidance; nothing checks it. | Guidance only. |
| C3 Preserve other slices; never infer whole-issue completion | Met. #1053 is open. No commit since adoption pairs a closing keyword with an issue reference. | Guidance only. |
| C4 Narrow offline commit check with regression tests; unmapped repositories default to `none` | Met. The house checker suite passes 15/15. Prefix `none` skips the pair check, and an invalid or missing prefix fails closed. | The tests live in the house repository. |
| C5 Every task commit cites both issues with non-closing references | Partly met. See the enforcement findings. | Decisions 1 and 2: a PR-level `Closes:` check (EVE-330) and a template default (EVE-329), not per-commit enforcement. |
| C6 Deliver house through normal acceptance and Eventiva through its exception | House #50 merged through the merge queue as signed `b00f3772`. In that queue build the required `check` passed, but the required `smartcloud` check was skipped (house #65 later removed that skip). The owner merged sync [#1087](https://github.com/Resnovas/Eventiva/pull/1087) at `bababa52` on 2026-11-26 while the required checks on head `b9aa0903` were failing, which implies the administrator bypass. Main stayed red after `f46ecad1` regenerated LLMS.md. It passed again at `c083ed86` (#1107), which repaired the `tools/test-process/process.d.mts` declaration. | Decision 4: #1087 does not count. The next house sync that passes its checks will. |
| C7 Record delivered heads on both trackers and the timeline | Partly met. The timeline names `b00f3772`, `6cc188f7`, `7a404d5f` and `4dc441b8`, but not the adoption commit `bababa52`. | Record `bababa52` on EVE-24, #1053 and the timeline, or the owner accepts this record in their place. |
| C8 Keep the parent open until complete acceptance | Met: EVE-24 and #1053 are open. House acceptance is on main. Under decision 4, #1087 does not count as the sync acceptance. | The closing conditions below. |

## Host mirrors and enforcement

House [#61](https://github.com/Resnovas/.github/pull/61) added `templates/.claude/commands/verify.md` and `templates/.cursor/commands/verify.md`, so the host copies of `.agents/prompts/verify.md` sync downstream. Each of the three files is byte-identical across house `templates/`, the house root and Eventiva main. The host copies differ from the prompt only in front matter. Eventiva's `surfaces.mjs check` passes locally and in the [main house check](https://github.com/Resnovas/Eventiva/actions/runs/46170366507).

PR [#1087](https://github.com/Resnovas/Eventiva/pull/1087) adopted the checker from bot head `b9aa0903`. That checker differed from candidate `6cc188f7` only in one sign-off message. #1106 and #1115 have since updated it. Traceability is enforced only by a local syntax guard:

- The commit-msg hook exists only where `node --run setup` installed it. The shared Eventiva hooks directory on the owner's workstation has no commit-msg hook.
- `--no-verify` skips the hook. `HOUSE_SKIP_COMMIT_CHECK=1` skips the message checks, including the pair check, but not the generated-graph guard. Subjects starting with `Merge`, `Revert "`, `fixup!` or `squash!` skip the pair check.
- No CI job, merge-queue check, smartcloud feature or ruleset rule checks the references. The smartcloud `commits` feature checks DCO and AI attribution only. GitHub's squash commits never pass through the hook.
- The checker accepts any `EVE-N` and any `owner/repo#N`, including pull request numbers and other repositories, so it cannot tell a Plane number from a Linear one. It accepts `Fixes` and `Closes` next to a valid pair.
- Of the 27 first-parent commits after `bababa52`, 23 carry the pair. The four without it are three `resnovas-smartcloud[bot]` commits (`9c669cf1`, `6e949dff`, `294b2132`) and GitHub's squash commit `1e28b567` for #1121. Neither #1121 branch commit carried the pair. The first was made with `--no-verify` on the owner's instruction, to skip failing pre-commit tests. Jonathan recorded #1121 as a known historical gap, with no retroactive exemption.

## Draft-restoration permission

This permission needs no fix. House job [136035163453](https://github.com/Resnovas/.github/actions/runs/44659864127/job/136035163453) ran `gh pr ready 61 --undo` with a `GITHUB_TOKEN` limited to Metadata read and PullRequests write. It failed with `Resource not accessible by integration (convertPullRequestToDraft)`. All 11 of the workflow's failed jobs logged that error, and every rerun that succeeded was an already-draft no-op. No draft was ever restored automatically.

House [#65](https://github.com/Resnovas/.github/pull/65), merged by Jonathan at `cf50bdfd` on 2026-11-20, deleted the workflow and its template without a replacement. House `docs/funnel-timeline.md` records the retirement as his decision, relayed through the owner coordination thread. The exact time of that decision is unavailable. The workflow never synced downstream, and no automatic draft restoration remains on either main. An organization code search finds only smartcloud's user-invoked `/draft` command, which is not automatic.

This supersedes the timeline's Linear EVE-266 rollout statements that the restoration permission "remains unfixed" and is a "real blocker". Granting the permission now would bring back automation that was retired, and it would be an access change that needs approval.

## Cancelled dispatch 44610405568

[Run 44610405568](https://github.com/Resnovas/Eventiva/actions/runs/44610405568) was a manual smartcloud dispatch at main `129069e0`, started at 20:36:31 UTC on 2026-11-19. Its smartcloud step was cancelled at 20:37:11 UTC, and the run completed at 20:37:21. Before the cancellation the step printed its two standard settings notices, and the bot force-pushed `house/sync` to signed `6cc188f7`. Smartcloud's code at `2d5c398d` prints those notices only after every feature returns. That suggests settings, sync and labels had finished, but no per-feature result was recorded.

- Proven: the dispatch did not change ruleset 27203425. The ruleset history API ends at version 58548798 (09:04:31 UTC), and the live ruleset is identical to it. The only ref change was the `house/sync` force-push.
- Bounded: the dispatch used the same smartcloud release, configuration and preset as the push runs at 11:57 and 21:19 UTC that day. Both of those passed `smartcloud / settings`. Every declared repository, security, Actions, label and ruleset value matches the live state today, and settings passed again on current main.
- Not provable: which values outside the ruleset the dispatch wrote. The organization audit log returns 404 on the free plan. The job summary that would list changes has no API, and the activity API covers refs only.

No rollback or remediation is indicated. Jonathan did not accept this as the settings evidence; see owner decision 5.

## Owner decisions - 2026-11-28

Jonathan answered all five questions on 2026-11-28, relayed to this session through T3 Code. Decision 3 was recorded on EVE-24 at 21:13 UTC and the others at about 21:24 UTC; the exact times he made them are not recorded.

1. Enforcement: no strict per-commit enforcement. Pull requests get a light check that a `Closes:` reference is present, as a smartcloud rule (EVE-330). The house PR template gets a default `Closes:` line (EVE-329). Both are children of EVE-24, handled by separate tasks.
2. Exemptions: none by rule, except GitHub-native automations whose pull requests cannot carry a reference. These include Dependabot, the Graphify snapshot workflow and the house sync bot, and the exemption is by bot author. #1121 gets no retroactive exemption and stays a known historical gap.
3. Tracker identity: `EVE-N` means the Plane work item from now on. Linear is disconnected from GitHub and its tasks are being deleted, so Linear numbering is ignored. The house templates, the `TASK_LINEAR_PREFIX` name and the guidance still say Linear; changing them is house work.
4. Sync acceptance: #1087 does not count as the sync acceptance C6 requires. The next house sync that passes its checks will be used instead.
5. Settings evidence: the cancelled dispatch is not accepted as-is. The next settings run will be used instead.

The draft-restoration item needed no decision. EVE-24 stays open until EVE-329 and EVE-330 are merged, and until a clean house sync and the next settings run have been recorded.
