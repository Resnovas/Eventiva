/**
 * Projection 3: AI SDK tools. `jsonSchema()` takes the inventory's JSON
 * Schema and the action's Effect Schema decode is the only validator, so there
 * is no second schema. The tool set is built per caller, like the MCP server.
 */
import { jsonSchema, tool, type ToolSet } from "ai"
import { Effect, Exit, Runtime } from "effect"
import type { Action, Caller } from "../action.js"
import { entry } from "../inventory.js"

/** Thrown into the AI SDK so it records a `tool-error`; carries the wire error. */
export class ActionToolError extends Error {
  constructor(readonly action: string, readonly error: unknown) {
    super(JSON.stringify(error))
    this.name = "ActionToolError"
  }
}

export const makeTools = <R>(actions: ReadonlyArray<Action<R>>) =>
  Effect.gen(function* () {
    const runtime = yield* Effect.runtime<R | Caller>()
    const tools: ToolSet = {}
    for (const action of actions) {
      tools[action.name] = tool({
        description: action.description,
        // No `validate`: the action's own decode is the only validator, so a bad
        // model call gets the same typed InvalidInput as HTTP and MCP callers.
        inputSchema: jsonSchema<unknown>(entry(action).inputSchema),
        // effect-boundary: the AI SDK awaits execute; this is the one place the Effect runs.
        execute: async (input) => {
          const program = action.invoke(input).pipe(
            Effect.withSpan("projection.ai-sdk", { attributes: { "eventiva.action": action.name } })
          )
          // effect-boundary: the vendor callback must return a Promise.
          const exit = await Runtime.runPromiseExit(runtime)(program)
          if (Exit.isSuccess(exit)) return exit.value
          const failure = exit.cause._tag === "Fail" ? action.encodeError(exit.cause.error) : { _tag: "Defect" }
          // effect-boundary: the AI SDK only records a tool-error when execute rejects.
          throw new ActionToolError(action.name, failure)
        }
      })
    }
    return tools
  })
