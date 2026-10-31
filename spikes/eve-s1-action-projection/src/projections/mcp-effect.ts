/**
 * Projection 2b: MCP tools on Effect AI's `McpServer` (@effect/ai), with no
 * Zod anywhere in its dependency tree. `addTool` takes the inventory's JSON
 * Schema as-is, and the handler is an Effect, so there is no Promise boundary.
 *
 * As with the SDK version, the caller is bound when the server layer is built
 * (per authenticated session in a real deployment).
 */
import { McpSchema, McpServer } from "@effect/ai"
import { Effect, Layer } from "effect"
import type { Action, Caller } from "../action.js"
import { entry } from "../inventory.js"

export const registerActions = <R>(actions: ReadonlyArray<Action<R>>) =>
  Effect.gen(function* () {
    const server = yield* McpServer.McpServer
    const context = yield* Effect.context<R | Caller>()
    for (const action of actions) {
      const described = entry(action)
      yield* server.addTool({
        tool: new McpSchema.Tool({
          name: described.name,
          description: described.description,
          inputSchema: described.inputSchema
        }),
        handle: (payload: unknown) =>
          action.invoke(payload).pipe(
            Effect.withSpan("projection.mcp-effect", { attributes: { "eventiva.action": action.name } }),
            Effect.provide(context),
            Effect.match({
              onSuccess: (output) =>
                new McpSchema.CallToolResult({
                  structuredContent: output,
                  content: [{ type: "text", text: JSON.stringify(output) }]
                }),
              onFailure: (failure) => {
                const error = action.encodeError(failure)
                return new McpSchema.CallToolResult({
                  isError: true,
                  structuredContent: { error },
                  content: [{ type: "text", text: JSON.stringify(error) }]
                })
              }
            })
          )
      })
    }
  })

/** A layer that registers every action; provide it alongside an McpServer layer. */
export const layer = <R>(actions: ReadonlyArray<Action<R>>) => Layer.effectDiscard(registerActions(actions))
