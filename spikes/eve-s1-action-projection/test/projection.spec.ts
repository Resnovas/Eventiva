import { NodeSdk } from "@effect/opentelemetry"
import { HttpApp } from "@effect/platform"
import { describe, expect, it } from "@effect/vitest"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { InMemorySpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { asSchema, generateText } from "ai"
import { MockLanguageModelV4 } from "ai/test"
import { Effect, Layer, Runtime } from "effect"
import { Caller } from "../src/action.js"
import { actions, EventsLive } from "../src/events.js"
import { inventory } from "../src/inventory.js"
import { ActionToolError, makeTools } from "../src/projections/ai-sdk.js"
import { makeServer } from "../src/projections/mcp.js"
import { router } from "../src/projections/http.js"

type CallerValue = typeof Caller.Service
type Outcome = { readonly ok: true; readonly output: unknown } | { readonly ok: false; readonly error: unknown }
type Env = Layer.Layer.Success<typeof EventsLive>
type Call = (caller: CallerValue, name: string, input: unknown) => Promise<Outcome>

const writer: CallerValue = { subject: "u1", tenantId: "t1", scopes: ["events:write", "events:read"] }
const readerOnly: CallerValue = { subject: "u2", tenantId: "t1", scopes: ["events:read"] }
const otherTenant: CallerValue = { subject: "u3", tenantId: "t2", scopes: ["events:write", "events:read"] }

const createInput = { title: "Load-in", startsAt: "2026-11-01T09:00:00.000Z" }

// ---- the three projections, each driven through its real vendor entry point ----

const viaHttp = (runtime: Runtime.Runtime<Env>): Call => {
  const handler = HttpApp.toWebHandlerRuntime(runtime)(router(actions))
  return async (caller, name, input) => {
    const response = await handler(
      new Request(`http://spike.local/actions/${name}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-eventiva-subject": caller.subject,
          "x-eventiva-tenant": caller.tenantId,
          "x-eventiva-scopes": caller.scopes.join(",")
        },
        body: JSON.stringify(input)
      })
    )
    return (await response.json()) as Outcome
  }
}

const viaMcp = (runtime: Runtime.Runtime<Env>): Call => async (caller, name, input) => {
  const server = await Runtime.runPromise(runtime)(makeServer(actions).pipe(Effect.provideService(Caller, caller)))
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: "spike-test", version: "0.0.0" })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  try {
    const result = await client.callTool({ name, arguments: input as Record<string, unknown> })
    const structured = result.structuredContent as Record<string, unknown>
    return result.isError ? { ok: false, error: structured.error } : { ok: true, output: structured }
  } finally {
    await client.close()
  }
}

const viaAiSdk = (runtime: Runtime.Runtime<Env>): Call => async (caller, name, input) => {
  const tools = await Runtime.runPromise(runtime)(makeTools(actions).pipe(Effect.provideService(Caller, caller)))
  const model = new MockLanguageModelV4({
    doGenerate: {
      content: [{ type: "tool-call", toolCallId: "call-1", toolName: name, input: JSON.stringify(input) }],
      finishReason: { unified: "tool-calls", raw: undefined },
      usage: {
        inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 1, text: 1, reasoning: undefined }
      },
      warnings: []
    }
  })
  const result = await generateText({ model, tools, prompt: "spike" })
  for (const part of result.content) {
    if (part.type === "tool-result") return { ok: true, output: part.output }
    if (part.type === "tool-error") {
      if (part.error instanceof ActionToolError) return { ok: false, error: part.error.error }
      return { ok: false, error: { _tag: "UnexpectedToolError", message: String(part.error) } }
    }
  }
  return { ok: false, error: { _tag: "NoToolCall" } }
}

const paths = { http: viaHttp, mcp: viaMcp, "ai-sdk": viaAiSdk } as const
type PathName = keyof typeof paths

// ---- harness: a fresh store per path, one shared span exporter ----

const withPaths = <A>(body: (calls: Record<PathName, Call>, exporter: InMemorySpanExporter) => Promise<A>) =>
  Effect.gen(function* () {
    const exporter = new InMemorySpanExporter()
    const tracing = NodeSdk.layer(() => ({
      resource: { serviceName: "eve-s1-spike" },
      spanProcessor: new SimpleSpanProcessor(exporter)
    }))
    const calls = {} as Record<PathName, Call>
    for (const name of Object.keys(paths) as Array<PathName>) {
      const runtime = yield* Layer.toRuntime(Layer.merge(EventsLive, tracing))
      calls[name] = paths[name](runtime as Runtime.Runtime<Env>)
    }
    return yield* Effect.promise(() => body(calls, exporter))
  })

const forEachPath = (calls: Record<PathName, Call>, run: (call: Call) => Promise<Outcome>) =>
  Promise.all((Object.keys(calls) as Array<PathName>).map(async (name) => [name, await run(calls[name])] as const)).then(
    Object.fromEntries
  ) as Promise<Record<PathName, Outcome>>

describe("EVE-14 one action, three projections", () => {
  it.scoped("same input gives the same result on all three paths", () =>
    withPaths(async (calls) => {
      const results = await forEachPath(calls, (call) => call(writer, "events.create", createInput))
      expect(results.http).toEqual({ ok: true, output: { id: "evt_1" } })
      expect(results.mcp).toEqual(results.http)
      expect(results["ai-sdk"]).toEqual(results.http)

      const reads = await forEachPath(calls, (call) => call(writer, "events.get", { id: "evt_1" }))
      expect(reads.http).toEqual({
        ok: true,
        output: { id: "evt_1", tenantId: "t1", title: "Load-in", startsAt: "2026-11-01T09:00:00.000Z" }
      })
      expect(reads.mcp).toEqual(reads.http)
      expect(reads["ai-sdk"]).toEqual(reads.http)
    }))

  it.scoped("missing events:write is denied on all three paths with the same typed error", () =>
    withPaths(async (calls) => {
      const results = await forEachPath(calls, (call) => call(readerOnly, "events.create", createInput))
      const expected = { ok: false, error: { _tag: "Forbidden", action: "events.create", missingScopes: ["events:write"] } }
      expect(results.http).toEqual(expected)
      expect(results.mcp).toEqual(expected)
      expect(results["ai-sdk"]).toEqual(expected)
    }))

  it.scoped("a cross-tenant read is denied on all three paths, indistinguishable from a missing id", () =>
    withPaths(async (calls) => {
      await forEachPath(calls, (call) => call(writer, "events.create", createInput))
      const crossTenant = await forEachPath(calls, (call) => call(otherTenant, "events.get", { id: "evt_1" }))
      const missing = await forEachPath(calls, (call) => call(writer, "events.get", { id: "evt_999" }))
      const expected = { ok: false, error: { _tag: "EventNotFound", id: "evt_1" } }
      expect(crossTenant.http).toEqual(expected)
      expect(crossTenant.mcp).toEqual(expected)
      expect(crossTenant["ai-sdk"]).toEqual(expected)
      expect(missing.http).toEqual({ ok: false, error: { _tag: "EventNotFound", id: "evt_999" } })
    }))

  it.scoped("invalid input is rejected by the same Effect Schema on all three paths", () =>
    withPaths(async (calls) => {
      const results = await forEachPath(calls, (call) => call(writer, "events.create", { title: "  ", startsAt: "nope" }))
      for (const outcome of Object.values(results)) {
        expect(outcome.ok).toBe(false)
      }
      expect(results.http).toMatchObject({ error: { _tag: "InvalidInput", action: "events.create" } })
      expect(results.mcp).toEqual(results.http)
      expect(results["ai-sdk"]).toEqual(results.http)
    }))

  it.scoped("all three paths run the one handler: one action span under each projection span", () =>
    withPaths(async (calls, exporter) => {
      await forEachPath(calls, (call) => call(writer, "events.create", createInput))
      const spans = exporter.getFinishedSpans()
      const actionSpans = spans.filter((span) => span.name === "action.events.create")
      expect(actionSpans).toHaveLength(3)
      const parents = actionSpans
        .map((span) => spans.find((candidate) => candidate.spanContext().spanId === span.parentSpanContext?.spanId)?.name)
        .sort()
      expect(parents).toEqual(["projection.ai-sdk", "projection.http", "projection.mcp"])
      // Printed for the EVE-14 evidence comment.
      console.log(
        spans
          .filter((span) => span.name.startsWith("action.") || span.name.startsWith("projection."))
          .map((span) => `${span.name} trace=${span.spanContext().traceId.slice(0, 8)} parent=${spans.find((p) => p.spanContext().spanId === span.parentSpanContext?.spanId)?.name ?? "-"}`)
          .join("\n")
      )
    }))

  it.scoped("MCP and the AI SDK advertise exactly the inventory's JSON Schema", () =>
    withPaths(async () => {
      const entries = inventory(actions)
      const runtime = await Effect.runPromise(Effect.scoped(Layer.toRuntime(EventsLive)))
      const server = await Runtime.runPromise(runtime)(makeServer(actions).pipe(Effect.provideService(Caller, writer)))
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
      const client = new Client({ name: "spike-test", version: "0.0.0" })
      await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
      const listed = await client.listTools()
      await client.close()

      const tools = await Runtime.runPromise(runtime)(makeTools(actions).pipe(Effect.provideService(Caller, writer)))
      for (const entry of entries) {
        const mcpTool = listed.tools.find((t) => t.name === entry.name)
        expect(mcpTool?.inputSchema).toEqual({ ...entry.inputSchema, type: "object" })
        expect(mcpTool?.outputSchema).toEqual({ ...entry.outputSchema, type: "object" })
        const aiTool = tools[entry.name]
        expect(aiTool).toBeDefined()
        expect(await asSchema(aiTool?.inputSchema).jsonSchema).toEqual(entry.inputSchema)
      }
      console.log(JSON.stringify(entries[0], null, 2))
    }))
})
