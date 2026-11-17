<!-- linear:generated:start -->
# EVE-20: S7: Find which AI providers allow users to bring their own subscription to Eventiva

[Live Linear source](https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:49.659Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | Discussion, Product |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-53](EVE-53.md) |
| Related to | [EVE-26](EVE-26.md), [EVE-31](EVE-31.md), [EVE-41](EVE-41.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

A per-provider table of sanctioned ways an Eventiva user can connect their own AI account (subscription or API key) or external agent, so Eventiva never relies on unofficial tokens or silent Eventiva-funded fallback.

## Context

* Spec: <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> End-user subscriptions and external agents.
* House AI stack: AI SDK alongside Effect AI, Vercel Connect for acting on behalf of users (`.agents/skills/coding-preferences/references/ai.md`).
* Upstream Agent-Native supports AI SDK providers (Anthropic, OpenAI, Google, Groq, Mistral, Ollama, OpenRouter) and ACP agents; read `packages/core/src/provider-api/` and `agent/harness/` for how it handles credentials.

## Work

1. For at least Anthropic, OpenAI, Google, Microsoft/GitHub Copilot, Mistral, OpenRouter and local models (Ollama): what official delegation exists (OAuth "sign in with", API keys, organisation keys, ACP or MCP clients the user runs), whether a consumer chat subscription may be used by a third-party app under current terms, scopes, revocation and expiry, and who is billed. Cite the terms or docs page and its date.
2. External agents: which can connect inbound (MCP client, ACP client, A2A) and with what identity.
3. Propose the credential model: storage, scopes, per-run identity, quotas, revocation mid-run, audit, and the no-fallback rule.

## Acceptance

Every "allowed" cell cites a primary source; anything unclear is marked "not permitted until confirmed".

## Out of scope

Building connections; negotiating with providers.

## Done signal

Comment with the table and the credential model, and one action decision: the providers to support at launch.

## Escalation

Never test with scraped cookies or unofficial tokens. If a provider's terms forbid third-party use of a subscription, list it as API-key only.

## Linear comments (3)

### Comment e27c5892-8016-4f84-ba1b-e2b9fb35f8da

Author: GitHub. Created: 2026-10-31T21:49:03.938Z; updated: 2026-10-31T21:49:03.918Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/787). All replies are displayed in both locations.


### Comment abacfa23-8d6c-4647-a909-14de8435285d

Author: jonathan@resnovas.com. Created: 2026-10-31T21:54:44.251Z; updated: 2026-10-31T21:54:44.193Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription) (comment ID above). Parent: None. Resolved: Not recorded.

## S7 findings: bring-your-own AI accounts (checked 2026-10-31)

Research only. No connection was built or tested, and no scraped cookies or unofficial tokens were used. Anything not backed by a primary source below is marked **not permitted until confirmed**.

### 1. Provider table

| Provider | Consumer subscription in a third-party app? | Sanctioned delegation for Eventiva | Billed to | Scopes, expiry, revocation | Primary source (read 2026-10-31) |
| --- | --- | --- | --- | --- | --- |
| **Anthropic (Claude)** | **No.** "Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, or Max plan credentials on behalf of their users." Developers may not collect, store or intermediate Claude.ai credentials or session tokens. | (a) User's own Claude Console API key. (b) User's own Bedrock, Google Cloud Agent Platform or Microsoft Foundry credential. (c) The **unmodified Claude Code binary**, which the user signs into themselves (allowed locally, and hosted only under the Commercial Terms, with every end user authenticating as themselves and no resale or intermediation). | The key or plan owner. Programmatic use from a subscription draws a separate monthly credit at API rates since 2026-06-15. | API keys: no expiry, revoked in Console. Claude Code login: Anthropic's own flow only. | [code.claude.com/docs/en/legal-and-compliance](https://code.claude.com/docs/en/legal-and-compliance) ("Authentication and credential use", "Can customers offer Claude Code in their products?"); programmatic credit: [the-decoder, 2026-05-14](https://the-decoder.com/claude-subscriptions-get-separate-budgets-for-programmatic-use-billed-at-full-api-prices/) citing ClaudeDevs |
| **OpenAI (ChatGPT)** | **Yes, but gated.** Sign in with ChatGPT plan usage (DevDay 2026-09-29): Plus and Pro only, not Business or Enterprise. "Available to all open-source partners and selected private clients"; an app must be "approved for ChatGPT plan usage". Eventiva is FCL-1.0 (fair-source, not OSI open source) and hosted, so it falls in the "selected private clients" path. **Not permitted until OpenAI approves our client.** | OIDC with PKCE, scope `chatgpt.tokens.use.direct` (with `openid profile email offline_access resource.invoke`), inference through the Responses API with restrictions (`store:false`, no hosted tools, no Files API). Until approval: user's own OpenAI API key, or Azure OpenAI through Foundry. | User's ChatGPT plan allowance. When it runs out, usage stops; no switch to partner billing. Users set per-app weekly caps. | Access token 1 h, refresh 30 days rolling; revoked when the user disconnects the app in ChatGPT settings, or by the app. Ineligible users get 403 `subscription_sharing_user_not_eligible`. | [developers.openai.com/siwc/quickstart](https://developers.openai.com/siwc/quickstart); [siwc preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations); scope and lifetimes: [WorkOS, 2026-10-01](https://workos.com/blog/sign-in-with-chatgpt-plan-usage-scope); launch: [The New Stack, 2026-09-29](https://thenewstack.io/sign-in-with-chatgpt/) |
| **Google (Gemini)** | **No.** Using third-party software with Gemini CLI or Antigravity OAuth "is a violation of applicable terms and policies" and may lead to suspension (accounts were banned after OpenClaw and OpenCode OAuth use). | User's own Gemini API key (AI Studio, paid or unpaid terms) or Vertex AI credential in the user's own Google Cloud project. Running the user's own unmodified Gemini or Antigravity CLI on their own device over ACP is the CLI's own use, not Eventiva holding the token. | Key or project owner. | Keys revoked in AI Studio or Cloud console. | [Gemini CLI ToS and privacy, updated 2026-04-10](https://www.geminicli.com/docs/resources/tos-privacy) |
| **GitHub Copilot** | **Yes.** The Copilot SDK (GA 2026-06-02) lets an app act for a user who signs in with GitHub; it "requires a Copilot subscription" and the user's plan is billed. Multi-user servers are documented: "pass a per-session `gitHubToken`". | GitHub OAuth App (`gho_`) or GitHub App user token (`ghu_`), or fine-grained PAT; not classic PATs. Server-to-server for org-billed automation. BYOK for other providers without Copilot. | User's Copilot plan (usage-based AI credits since 2026-06-01), or org billing for server-to-server. | GitHub OAuth expiry and revocation rules; docs recommend a per-session token provider over long-lived tokens. | [Authenticate the Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/authenticate-copilot-sdk/authenticate-copilot-sdk); [GA changelog 2026-06-02](https://github.blog/changelog/2026-06-02-copilot-sdk-is-now-generally-available/); [usage billing 2026-05-01](https://github.blog/2026-05-01-github-copilot-is-moving-to-usage-based-billing/) |
| **Microsoft (Foundry / Azure OpenAI)** | Not applicable (no consumer plan delegation found). Microsoft 365 Copilot subscription delegation: **not permitted until confirmed**. | Customer's own Foundry endpoint with API key or Microsoft Entra ID (keyless). | The customer's Azure subscription. | Key rotation in Azure; Entra tokens and RBAC. | [Foundry authentication and authorization](https://learn.microsoft.com/azure/ai-foundry/concepts/authentication-authorization-foundry); [Configure Entra ID](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/how-to/configure-entra-id) |
| **Mistral** | **Not permitted until confirmed.** No documented Le Chat subscription delegation or third-party OAuth. | User's own API key from Mistral Studio, per workspace. | Key owner's organisation. | Keys managed in Studio and Admin. | [Mistral platform overview](https://docs.mistral.ai/getting-started/le-chat-studio-admin) |
| **OpenRouter** | Not a subscription; an account the user tops up. **Allowed** and purpose-built for this. | OAuth PKCE: user authorises Eventiva and Eventiva receives a **user-controlled API key**; headless code flow for devices without a callback. | User's OpenRouter credits. | Auth code expires in 10 min; the key is the user's and they manage it on their key settings page. No spend-limit parameter in the flow, so Eventiva enforces its own cap. | [OpenRouter OAuth PKCE](https://openrouter.ai/docs/guides/overview/auth/oauth) |
| **Ollama (local and cloud)** | Not applicable. | Local `http://localhost:11434`, no auth (desktop and self-hosted only; never reachable from our cloud). Ollama Cloud with the user's `OLLAMA_API_KEY` bearer key. | Local: nobody. Cloud: key owner. | Cloud keys do not expire; revoked on ollama.com. | [Ollama API authentication](https://docs.ollama.com/api/authentication) |

### 2. External agents connecting to Eventiva

| Direction | Protocol | Who | Identity |
| --- | --- | --- | --- |
| Inbound | **MCP server** (Eventiva exposes its actions) | Claude, ChatGPT, Copilot, Cursor, Codex and any MCP client | OAuth 2.1 against Eventiva's own auth; the token is an Eventiva user grant with scoped actions, never a provider credential. |
| Inbound | **A2A** | Other agent platforms | Eventiva-issued agent principal tied to a user or service account; upstream Agent-Native already has `a2a-claims`. |
| Outbound | **ACP client** (Eventiva drives the user's own agent) | Claude Code, Codex CLI, Gemini CLI, GitHub Copilot CLI, OpenCode (all in the ACP registry, [Zed, 2026-01-28](https://zed.dev/blog/acp-registry)) | The agent signs in through its own vendor flow on the user's device. Eventiva never sees or stores that credential. This is the only sanctioned way to use a Claude Pro or Max subscription from Eventiva. |
| Outbound | Webhooks and API | Automations | Eventiva service principal with per-action scopes. |

Upstream note: Agent-Native's `agent/harness/acp-builtin.ts` ships presets for Gemini CLI and Claude Code (`@zed-industries/claude-code-acp`), and `server/credential-provider.ts` stores personal and org provider keys with an org policy that can restrict personal keys. It also has a **deployment env fallback** (`source: "env"`), which Eventiva must disable for model credentials.

### 3. Proposed credential model

1. **Storage.** One `ModelCredential` record per (tenant, owner, provider): owner is a user or the tenant. Secrets are envelope-encrypted with a per-tenant key in the secret store; the database holds only the ciphertext reference, a fingerprint and metadata. Plaintext is never returned to the UI or an agent.
2. **Kinds.** `api-key`, `oauth-delegated` (OpenRouter key, Copilot GitHub token, ChatGPT plan token once approved), `cloud-identity` (Bedrock, Vertex, Foundry with Entra), `local-endpoint` (Ollama, desktop only), `acp-agent` (we hold nothing).
3. **Scopes.** Each credential lists allowed models, allowed Eventiva action classes, and allowed surfaces (interactive, background, automation). Tenant admins can forbid personal credentials or require tenant ones.
4. **Per-run identity.** Every agent run carries `{tenant, actingUser, credentialId, agentPrincipal}`; the credential is resolved per call through an Effect `ModelCredentials` service, never cached across users, and Copilot uses a per-session token provider.
5. **Quotas.** Eventiva-side caps per credential and per run (tokens and spend), on top of the provider's own caps (ChatGPT weekly caps, Copilot credits, OpenRouter balance).
6. **Revocation mid-run.** A provider 401 or 403, a refresh failure or a user revoke ends the current step with a typed `CredentialRevoked` error, pauses the run as `needs-credential`, and never retries with another credential.
7. **Audit.** Every model call logs run id, credential id and fingerprint (never the secret), provider, model, tokens, cost estimate and outcome, traced in OpenTelemetry and PostHog LLM analytics.
8. **No-fallback rule.** If the chosen credential is missing, expired, over quota or revoked, the run stops and asks the user. Eventiva never silently switches to another user's, the tenant's or an Eventiva-funded credential, and there is no environment-variable fallback. Eventiva-funded built-in AI is a separate, explicit, metered product choice.

### 4. Action decision: providers at launch

**Recommended launch set:**
- API keys: Anthropic, OpenAI, Google Gemini (and Vertex), Mistral, Microsoft Foundry.
- Sign-in flows that bill the user: **OpenRouter** (OAuth PKCE) and **GitHub Copilot** (Copilot SDK over GitHub OAuth).
- Local: **Ollama** on desktop and self-hosted, plus Ollama Cloud keys.
- **ACP** on desktop for the user's own Claude Code, Codex, Gemini CLI and Copilot CLI.
- **Apply now** for OpenAI Sign in with ChatGPT plan usage as a private client, and add it when approved.
- Not supported: Claude, Gemini or Mistral consumer subscriptions inside Eventiva itself.


### Comment eb178cb1-00df-496f-9293-6087b94686a6

Author: jonathan@resnovas.com. Created: 2026-10-31T22:51:05.261Z; updated: 2026-10-31T22:51:05.248Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription) (comment ID above). Parent: None. Resolved: Not recorded.

**Decision (Jonathan, 2026-10-31):** go with the full sanctioned launch set and apply to OpenAI.

- API keys: Anthropic, OpenAI, Google Gemini and Vertex, Mistral, Microsoft Foundry.
- Sign-in flows that bill the user: OpenRouter (OAuth PKCE) and GitHub Copilot (Copilot SDK over GitHub OAuth).
- Ollama, both local and cloud keys.
- Desktop ACP for the user's own Claude Code, Codex, Gemini CLI and Copilot CLI.
- Apply to OpenAI for Sign in with ChatGPT plan usage as a private client, and add it once approved.
- Claude, Gemini and Mistral consumer subscriptions are not supported inside Eventiva.

The credential model and no-fallback rule above are part of the decision.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
