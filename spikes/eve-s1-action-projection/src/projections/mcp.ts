/**
 * Projection 2: MCP tools served with the official MCP TypeScript SDK.
 *
 * Friction found: `McpServer.registerTool` only accepts Zod schemas, so it
 * would force a second schema definition. The SDK's low-level `Server` takes
 * plain JSON Schema in `tools/list`, so it serves the inventory unchanged.
 * The server is built per caller (per authenticated MCP session); a real HTTP
 * transport would take the caller from the verified bearer token instead.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { Effect, Exit, Runtime } from "effect"
import { Caller, type Action } from "../action.js"
import { inventory } from "../inventory.js"

type ObjectSchema = { type: "object"; [key: string]: unknown }

const asObjectSchema = (schema: object): ObjectSchema => ({ ...schema, type: "object" })

export const makeServer = <R>(actions: ReadonlyArray<Action<R>>) =>
  Effect.gen(function* () {
    const runtime = yield* Effect.runtime<R | Caller>()
    const byName = new Map(actions.map((action) => [action.name, action] as const))
    const server = new Server(
      { name: "eventiva-spike", version: "0.0.0" },
      { capabilities: { tools: {} } }
    )

    server.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: inventory(actions).map((entry) => ({
        name: entry.name,
        description: entry.description,
        inputSchema: asObjectSchema(entry.inputSchema),
        outputSchema: asObjectSchema(entry.outputSchema)
      }))
    }))

    // effect-boundary: the MCP SDK awaits the handler; this is the one place the Effect runs.
    server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const action = byName.get(request.params.name)
      if (action === undefined) {
        return { isError: true, content: [{ type: "text", text: `Unknown tool ${request.params.name}` }] }
      }
      const program = action.invoke(request.params.arguments ?? {}).pipe(
        Effect.withSpan("projection.mcp", { attributes: { "eventiva.action": action.name } })
      )
      // effect-boundary: the vendor handler must return a Promise.
      const exit = await Runtime.runPromiseExit(runtime)(program)
      return Exit.match(exit, {
        onSuccess: (output) => ({
          structuredContent: { ...(output as object) },
          content: [{ type: "text", text: JSON.stringify(output) }]
        }),
        onFailure: (cause) => {
          const failure = cause._tag === "Fail" ? action.encodeError(cause.error) : { _tag: "Defect" }
          return {
            isError: true,
            structuredContent: { error: failure },
            content: [{ type: "text", text: JSON.stringify(failure) }]
          }
        }
      })
    })

    return server
  })
