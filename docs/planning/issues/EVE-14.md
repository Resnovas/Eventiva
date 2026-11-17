<!-- linear:generated:start -->
# EVE-14: S1: Prove one Effect action serves UI, MCP and AI SDK from one inventory entry

[Live Linear source](https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:56.496Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | Code, Discussion |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-40](EVE-40.md), [EVE-47](EVE-47.md) |
| Related to | [EVE-24](EVE-24.md), [EVE-25](EVE-25.md), [EVE-26](EVE-26.md), [EVE-27](EVE-27.md), [EVE-29](EVE-29.md), [EVE-30](EVE-30.md), [EVE-31](EVE-31.md), [EVE-32](EVE-32.md), [EVE-33](EVE-33.md), [EVE-54](EVE-54.md), [EVE-110](EVE-110.md), [EVE-165](EVE-165.md), [EVE-197](EVE-197.md), [EVE-212](EVE-212.md), [EVE-220](EVE-220.md), [EVE-224](EVE-224.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Prove that a single action defined in Effect Schema with one Effect handler and one authorization check can be invoked identically from a UI call, an MCP client and an AI SDK tool call, with the action listed once in a machine-readable inventory.

## Context

* Spec: <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> sections "Highest-priority core architecture rule", ownership and framework direction (Eventiva owns actions, server, auth, database; own Effect-native framework; AI SDK alongside Effect AI).
* Repository: Resnovas/Eventiva at main (322ab45 or later). Read `AGENTS.md`, `.agents/skills/coding-preferences/references/effect.md` and `ai.md` first.
* Upstream reference only: BuilderIO/agent-native at a0356c6, `packages/core/src/action.ts`, `action-*.ts`, `mcp/`, `authorization/`. MIT; read for behaviour, do not depend on it.
* Existing Effect stack in the repo: `effect` 3.19, `@effect/rpc`, `@effect/platform`, `@effect/cluster`.

## Work

1. In a throwaway spike branch (`spike/eve-s1-action-projection`), never merged, define `events.create` (input: title, startsAt; output: id) with Effect Schema, typed errors (`Data.TaggedError`) and a handler that writes to an in-memory store service provided by a `Layer`.
2. Add one authorization service: a caller identity with a tenant id and scopes; deny when scope `events:write` is missing.
3. Build an inventory entry (name, description, input and output JSON Schema derived from the Effect Schema via `JSONSchema.make`, required scopes).
4. Project it three ways: an `@effect/platform` HTTP route (the UI call), an MCP tool served with the official MCP TypeScript SDK wrapped in one `Effect.tryPromise` boundary, and an AI SDK `tool()` whose `execute` runs the same Effect.
5. Tests with `@effect/vitest`: same input gives the same result on all three paths; missing scope is denied on all three with the same typed error; a cross-tenant read is denied.

## Dependencies

The spike may add `@modelcontextprotocol/sdk` and `ai` on the spike branch only. List exact versions in the finding; adding them to main needs approval on <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" />.

## Acceptance

* All three paths call the same handler (show the call graph or a trace with one handler span per call).
* JSON Schema for MCP and AI SDK comes from the one Effect Schema, with no hand-written duplicate.
* Tests above pass; paste the command and output.

## Out of scope

Persistence, real auth provider, UI components, A2A, ACP, webhooks.

## Done signal

A comment on this issue with: result (works / works with caveats / blocked), the shape of the action-definition API proposed for the framework, code links on the spike branch, test output, and any Effect versus vendor-SDK friction. Then give Jonathan one action decision (accept this API shape, or one named alternative).

## Escalation

If MCP or AI SDK cannot accept an Effect-derived schema without a second schema definition, stop and report on <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> with the exact incompatibility.

## Linear comments (3)

### Comment 183e3549-0da5-4795-8d1d-468574cab143

Author: GitHub. Created: 2026-10-31T21:47:51.568Z; updated: 2026-10-31T21:47:51.545Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/781). All replies are displayed in both locations.


### Comment 5ab14c1f-bc67-49a4-acd6-af0b23e2b60e

Author: jonathan@resnovas.com. Created: 2026-10-31T21:58:41.581Z; updated: 2026-10-31T22:00:07.057Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory) (comment ID above). Parent: None. Resolved: Not recorded.

## S1 result: works, with caveats

One `Action.make` definition serves an `@effect/platform` HTTP route (the UI call), an MCP tool and an AI SDK tool. All three run the same decode, the same authorization check and the same handler, and every JSON Schema comes from the one Effect Schema. No second schema definition was needed, so the escalation did not trigger.

Spike branch (throwaway, never merged): https://github.com/Resnovas/Eventiva/tree/spike/eve-s1-action-projection/spikes/eve-s1-action-projection (commit ad68c3c)

* Action API: [src/action.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/action.ts)
* Inventory: [src/inventory.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/inventory.ts)
* Actions and store: [src/events.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/events.ts)
* Projections: [http.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/projections/http.ts), [mcp.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/projections/mcp.ts), [ai-sdk.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/projections/ai-sdk.ts)
* Tests: [test/projection.spec.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/test/projection.spec.ts)

## The API shape I propose for the framework

```ts
export const create = Action.make("events.create", {
  description: "Create an event in the caller's tenant and return its id.",
  input: Schema.Struct({ title: Schema.NonEmptyTrimmedString, startsAt: Schema.DateTimeUtc }),
  output: Schema.Struct({ id: EventId }),
  error: Schema.Never,              // action errors; Forbidden and InvalidInput are always added
  scopes: ["events:write"],
  handler: (input) => Effect.gen(function* () {
    const caller = yield* Caller    // subject, tenantId, scopes
    const store = yield* EventStore
    // ...
  })
})
```

`Action.make` returns an erased `Action<R>` with `invoke(raw: unknown): Effect<unknown, ActionFailure, R | Caller>`. `invoke` checks scopes, then decodes input, runs the handler inside an `action.<name>` span and encodes the output. Projections only ever call `invoke` and `encodeError`. `inventory(actions)` gives name, description, scopes, and input, output and error JSON Schema from `JSONSchema.make`. Each projection gets the caller as a `Caller` service (HTTP from the request, MCP and AI SDK per authenticated session), so no path can skip authorization.

## Evidence

```
$ cd spikes/eve-s1-action-projection && npm ci --ignore-scripts && npx tsc --noEmit -p . && npx vitest run
tsc: 0 errors
 ✓ test/projection.spec.ts (6 tests) 392ms
 Test Files  1 passed (1)
      Tests  6 passed (6)
```

The six tests cover these cases, and each one runs all three paths through the real vendor entry point (a web `Request` into the router, an MCP `Client` over `InMemoryTransport`, and `generateText` with `MockLanguageModelV4` emitting a tool call):

1. The same input gives an identical result on all three paths: `{ ok: true, output: { id: "evt_1" } }`, and the read-back is identical too.
2. With `events:write` missing, all three return the same error: `{ _tag: "Forbidden", action: "events.create", missingScopes: ["events:write"] }`.
3. A cross-tenant read is denied as `EventNotFound` on all three paths, so it looks the same as a missing id and does not reveal that the event exists.
4. Invalid input gets the same `InvalidInput` error on all three paths.
5. Call graph (OpenTelemetry in-memory exporter): one handler span under each projection span.
6. MCP `tools/list` and the AI SDK tool advertise exactly the inventory's JSON Schema.

```
action.events.create trace=1a63e1c9 parent=projection.http
projection.http      trace=1a63e1c9 parent=http.server POST
action.events.create trace=07c1bb04 parent=projection.mcp
action.events.create trace=34b388ff parent=projection.ai-sdk
```

Mutation check: I removed the scope check, and test 2 failed on all paths. I then restored it.

## Effect versus vendor SDK friction

1. **MCP high-level API is Zod-only.** `McpServer.registerTool` accepts only Zod schemas, which would force a second schema definition. The SDK's low-level `Server` (`tools/list` and `tools/call` handlers) takes plain JSON Schema and works unchanged. The SDK marks `Server` as for "advanced use cases", but it is not removed. We should own this adapter in the framework.
2. **AI SDK validation should be left off.** `jsonSchema(schema, { validate })` would make the AI SDK reject bad model input before the action runs, with its own error type. Leaving out `validate` makes the Effect decode the only validator, so a bad model call gets the same typed `InvalidInput`.
3. **The AI SDK reports a tool error only when `execute` throws.** The adapter throws one `ActionToolError` that carries the encoded typed error, behind an `effect-boundary` comment. MCP returns `isError` with the encoded error in `structuredContent`.
4. **Zod is a required peer of both SDKs.** Spike code never imports it, but it ends up in the install.
5. **JSON Schema shape.** `JSONSchema.make` puts `$ref` and `$defs` in schemas built from refinements such as `NonEmptyTrimmedString`, with sibling keywords next to `$ref`, and it declares draft-07. Both SDKs accepted it. Some model providers' strict tool modes reject `$ref`, so the framework should inline definitions per provider (follow-up, not a blocker).
6. **Trace continuity.** Each vendor callback starts a new trace, because the SDK sits between the projection and the action. The framework adapter should propagate the incoming trace context (MCP `_meta` traceparent, AI SDK telemetry) so one request is one trace.
7. **Erased generics.** Building the heterogeneous inventory needed one widening cast in `Action.make`, around the union of action errors and common errors. No `any` was used.
8. **Version mismatch in the repo.** `@effect/vitest` 0.27 needs vitest 3.2, but the root pins vitest ^2.1.9. The spike uses 3.2.4.

## Dependencies (spike branch only; need approval on EVE-13 before main)

`@modelcontextprotocol/sdk` 1.32.2, `ai` 7.0.159, `zod` 4.1.12 (required peer), `@opentelemetry/sdk-trace-base` 2.0.1 (test exporter), `vitest` 3.2.4. Already in the repo: `effect` 3.19.19, `@effect/platform` 0.94.5, `@effect/opentelemetry` 0.61.0, `@effect/vitest` 0.27.0.

## Caveats on how the spike was done

* The spike lives in its own folder with an npm lockfile, outside the pnpm workspace and Nx, so main's lockfile is untouched. The repo's `check` gate was not run against it.
* The spike commit is authored by the session's configured AI identity and has no sign-off. I made it before I saw the Eventiva delivery exception (058251e), which sets the standing author and sign-off. Re-authoring it would need a force-push, and that was blocked in this session. Because the branch never merges, I left the commit as it is.
* HTTP identity comes from `x-eventiva-*` headers, which stand in for a real auth provider (out of scope).
* I read the vendor SDK APIs from their installed type definitions, not from Context7.

## Decision for Jonathan

**Recommend: approve this action API shape** (`Action.make` with schemas, scopes and handler, `invoke` as the only entry point, `Caller` as a required service, inventory from `JSONSchema.make`) and approve adding `@modelcontextprotocol/sdk` and `ai` to main, with the MCP adapter built on the SDK's low-level `Server`.

The named alternative is to build actions on `@effect/rpc` `Rpc.make` and `RpcGroup`. That would reuse the RPC stack the repo already has, but scopes, descriptions and the inventory would have to live in annotations, and every projection would still need the same adapters.

*Posted by Claude (AI agent) for Jonathan.*


### Comment 542a6bd6-5968-4c9b-b3e4-64c05488a788

Author: jonathan@resnovas.com. Created: 2026-10-31T22:37:43.234Z; updated: 2026-10-31T22:37:43.191Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory) (comment ID above). Parent: None. Resolved: Not recorded.

## Follow-up: running the projections without Zod

Jonathan asked for no Zod.

**Both vendor SDKs load Zod at runtime, so neither can be made Zod-free.** The MCP TypeScript SDK imports `zod/v4` in `dist/esm/types.js`, which defines its protocol messages. The AI SDK imports `zod/v4` in `ai`, `@ai-sdk/provider-utils` and `@ai-sdk/gateway`. Making Zod a peer we never import does not stop it being installed.

**Zod-free route, proven on the spike branch (commit 4d01d75):** use Effect AI (`@effect/ai` 0.33.2, the last line for effect 3.19) for both agent paths.

* MCP: [src/projections/mcp-effect.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/projections/mcp-effect.ts). `McpServer.addTool` takes the inventory's JSON Schema unchanged and an Effect handler, so there is no Promise boundary at all. It is tested over real HTTP JSON-RPC, and also against the official MCP client for interop (initialize, list, call all work).
* Model tool calling: [src/projections/effect-ai.ts](https://github.com/Resnovas/Eventiva/blob/spike/eve-s1-action-projection/spikes/eve-s1-action-projection/src/projections/effect-ai.ts). An Effect AI `Toolkit` is built from each action's input fields, and the model sees the same JSON Schema as the inventory. Errors go back to the model as values (`failureMode: "return"`).
* An install of `effect`, `@effect/ai`, `@effect/platform`, `@effect/rpc` and `@effect/experimental` contains no Zod (`npm ls zod` is empty).

```
$ npx tsc --noEmit -p . && npx vitest run
 ✓ test/effect-ai.spec.ts (2 tests)
 ✓ test/mcp-effect.spec.ts (2 tests)
 ✓ test/projection.spec.ts (6 tests)
      Tests  10 passed (10)
```

**What this costs.**

1. It drops the AI SDK, which the house standard (`references/ai.md`, "AI SDK alongside Effect AI") requires. For Eventiva this needs Jonathan's explicit override of that rule.
2. Without the AI SDK we lose its UI hooks (`useChat`), so the chat UI is built on Effect or Rambo-UI.
3. We get fewer model providers. Effect AI on v3 ships OpenAI, Anthropic, Google, Bedrock and OpenRouter; the AI SDK ships many more.
4. The newest `@effect/ai` (0.37) and its providers need effect 3.22, and the repo pins 3.19.19, so an effect bump is a follow-up.

**Smaller findings.**

* Effect's JSON-RPC serializer answers a single request with a one-element batch. The official client accepted it.
* The `McpSchema.Tool` in `@effect/ai` 0.33 has no `outputSchema` field.
* Toolkit typing widens when tools are built from a runtime list, which needs two casts in the adapter and none in action code.

*Posted by Claude (AI agent) for Jonathan.*
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
