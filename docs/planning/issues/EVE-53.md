<!-- linear:generated:start -->
# EVE-53: P1.8b Build model engines, model selection and user-owned subscriptions

[Live Linear source](https://linear.app/resnovas/issue/EVE-53/p18b-build-model-engines-model-selection-and-user-owned-subscriptions) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:55.674Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-47](EVE-47.md) |
| Children | None recorded |
| Blocked by | [EVE-20](EVE-20.md), [EVE-41](EVE-41.md) |
| Blocks | [EVE-127](EVE-127.md), [EVE-197](EVE-197.md), [EVE-227](EVE-227.md) |
| Related to | [EVE-13](EVE-13.md), [EVE-69](EVE-69.md), [EVE-111](EVE-111.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

The agent can run on any supported provider, on Eventiva's account or the user's own, and never silently falls back to Eventiva-funded inference.

## Context

Upstream reference at 6b5cf68: `agent/engine/` (ai-sdk-engine, anthropic-engine, openrouter-engine, chatgpt-subscription-engine, credential-state, failure-taxonomy, prompt-cache, first-event-timeout, gateway retryability), `provider-model-selection.ts`, `model-catalog.ts`, `model-config.ts`, `app-model-defaults.ts`, and `usage/`. <issue id="a904aa60-b3c7-4bfa-8d2d-995d1e679389" label="EVE-20" href="https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription" /> (S7) decides which providers allow user subscriptions.

**Launch provider set (decided by Jonathan on** <issue id="a904aa60-b3c7-4bfa-8d2d-995d1e679389" label="EVE-20" href="https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription" />**, 2026-10-31):**

* API keys: Anthropic, OpenAI, Google Gemini and Vertex, Mistral, Microsoft Foundry.
* Sign-in flows that bill the user: OpenRouter (OAuth PKCE) and GitHub Copilot (Copilot SDK over GitHub OAuth, per-session token provider).
* Ollama: local endpoint on desktop and self-hosted only, plus Ollama Cloud keys.
* Desktop ACP for the user's own Claude Code, Codex, Gemini CLI and Copilot CLI (Eventiva holds no credential).
* ChatGPT plan usage (Sign in with ChatGPT) only after OpenAI approves Eventiva as a private client; until then OpenAI users bring an API key.
* Not supported: Claude, Gemini or Mistral consumer subscriptions inside Eventiva.
* The <issue id="a904aa60-b3c7-4bfa-8d2d-995d1e679389" label="EVE-20" href="https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription" /> credential model applies: envelope-encrypted per-tenant storage, per-run identity, Eventiva-side quotas, typed `CredentialRevoked` pausing the run, audit per call, and no environment-variable or payer fallback.

## Scope

1. An engine service (`Context.Tag`) with AI SDK providers as layers; model catalog with capabilities (tools, reasoning, images, context size).
2. Model selection per tenant, user and task, with explicit defaults.
3. User-owned credentials through P1.2 handles; if the user's credential fails, the run stops with a typed error and asks the user, it never switches payer.
4. Failure taxonomy and retry policy (retryable vs not) as Effect `Schedule`; first-event timeout.
5. Usage metering per run (tokens, cost, payer) feeding quotas.

## Acceptance criteria

* A test with a failing user credential proves no call is made on Eventiva's credential.
* Retry tests for a retryable and a non-retryable provider error.
* Usage rows recorded for each model call.

## Constraints

Effect-TS v3; only sanctioned login or key flows from S7, never cookies or unofficial tokens; dependencies need approval here; ship to main with check results.

## Done signal

Merged with the no-silent-fallback test green.

## Linear comments (1)

### Comment 5bd16942-0b67-42c1-bd5c-89daf025b44d

Author: GitHub. Created: 2026-10-31T22:32:23.886Z; updated: 2026-10-31T22:32:23.850Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-53/p18b-build-model-engines-model-selection-and-user-owned-subscriptions) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/820). All replies are displayed in both locations.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
