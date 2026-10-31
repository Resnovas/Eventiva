import { McpServer } from "@effect/ai"
import { HttpLayerRouter } from "@effect/platform"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { Caller } from "../src/action.js"
import { actions, EventsLive } from "../src/events.js"
import { inventory } from "../src/inventory.js"
import * as McpEffect from "../src/projections/mcp-effect.js"

type CallerValue = typeof Caller.Service

const writer: CallerValue = { subject: "u1", tenantId: "t1", scopes: ["events:write", "events:read"] }
const readerOnly: CallerValue = { subject: "u2", tenantId: "t1", scopes: ["events:read"] }

// A real MCP server over HTTP JSON-RPC, driven by plain fetch-style requests.
const serve = (caller: CallerValue) => {
  const app = McpEffect.layer(actions).pipe(
    Layer.provideMerge(McpServer.layerHttpRouter({ name: "eventiva-spike", version: "0.0.0", path: "/mcp" })),
    Layer.provide(EventsLive),
    Layer.provide(Layer.succeed(Caller, caller))
  )
  const { handler, dispose } = HttpLayerRouter.toWebHandler(app, { disableLogger: true })
  let id = 0
  const rpc = async (method: string, params: unknown, notification = false) => {
    const response = await handler(
      new Request("http://spike.local/mcp", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: JSON.stringify(notification ? { jsonrpc: "2.0", method, params } : { jsonrpc: "2.0", id: ++id, method, params })
      })
    )
    const text = await response.text()
    if (text.length === 0) return undefined
    const parsed = JSON.parse(text)
    // The Effect JSON-RPC serializer answers with a one-element batch.
    return Array.isArray(parsed) ? parsed[0] : parsed
  }
  const connect = async () => {
    await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } })
    await rpc("notifications/initialized", {}, true)
  }
  return { rpc, connect, dispose }
}

describe("EVE-14 MCP without Zod (@effect/ai McpServer)", () => {
  it.effect("lists the inventory's JSON Schema and returns the same results and typed errors", () =>
    Effect.promise(async () => {
      const asWriter = serve(writer)
      await asWriter.connect()
      const listed = await asWriter.rpc("tools/list", {})
      const create = listed.result.tools.find((t: { name: string }) => t.name === "events.create")
      expect(create.inputSchema).toEqual(inventory(actions)[0]?.inputSchema)

      const created = await asWriter.rpc("tools/call", {
        name: "events.create",
        arguments: { title: "Load-in", startsAt: "2026-11-01T09:00:00.000Z" }
      })
      expect(created.result.structuredContent).toEqual({ id: "evt_1" })
      const invalid = await asWriter.rpc("tools/call", { name: "events.create", arguments: { title: " ", startsAt: "x" } })
      expect(invalid.result.isError).toBe(true)
      expect(invalid.result.structuredContent.error._tag).toBe("InvalidInput")
      await asWriter.dispose()

      const asReader = serve(readerOnly)
      await asReader.connect()
      const denied = await asReader.rpc("tools/call", {
        name: "events.create",
        arguments: { title: "Load-in", startsAt: "2026-11-01T09:00:00.000Z" }
      })
      expect(denied.result.isError).toBe(true)
      expect(denied.result.structuredContent).toEqual({
        error: { _tag: "Forbidden", action: "events.create", missingScopes: ["events:write"] }
      })
      await asReader.dispose()
    }))
})

// Interop check only: the official SDK as a *client* (test-time), against the Zod-free server.
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

describe("EVE-14 interop: official MCP client against the Effect server", () => {
  it.effect("initializes, lists and calls a tool", () =>
    Effect.promise(async () => {
      const app = McpEffect.layer(actions).pipe(
        Layer.provideMerge(McpServer.layerHttpRouter({ name: "eventiva-spike", version: "0.0.0", path: "/mcp" })),
        Layer.provide(EventsLive),
        Layer.provide(Layer.succeed(Caller, writer))
      )
      const { handler, dispose } = HttpLayerRouter.toWebHandler(app, { disableLogger: true })
      const transport = new StreamableHTTPClientTransport(new URL("http://spike.local/mcp"), {
        fetch: (input, init) => handler(new Request(input, init))
      })
      const client = new Client({ name: "interop", version: "0" })
      await client.connect(transport)
      const tools = await client.listTools()
      expect(tools.tools.map((t) => t.name).sort()).toEqual(["events.create", "events.get"])
      const result = await client.callTool({
        name: "events.create",
        arguments: { title: "Load-in", startsAt: "2026-11-01T09:00:00.000Z" }
      })
      expect(result.structuredContent).toEqual({ id: "evt_1" })
      await client.close()
      await dispose()
    }))
})
