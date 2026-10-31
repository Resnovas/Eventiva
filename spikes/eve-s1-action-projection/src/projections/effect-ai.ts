/**
 * Projection 3b: model tool calling with Effect AI (@effect/ai) instead of
 * the AI SDK, so no Zod is loaded. Effect AI tools are built from Effect
 * Schema natively; the tool's parameters are the action's own input fields.
 *
 * The toolkit decodes the model's arguments, then the handler re-encodes them
 * and calls `invoke`, so authorization and the handler span stay in one place.
 * Failures are returned to the model as values (`failureMode: "return"`).
 */
import { Tool, Toolkit } from "@effect/ai"
import { Effect, type Layer, Schema } from "effect"
import type { Action, Caller } from "../action.js"

type StructInput = Schema.Struct<Schema.Struct.Fields>

const toTool = <R>(action: Action<R>) =>
  Tool.make(action.name, {
    description: action.description,
    parameters: (action.input as unknown as StructInput).fields,
    success: Schema.Unknown,
    failure: Schema.Unknown,
    failureMode: "return"
  })

export const makeToolkit = <R>(actions: ReadonlyArray<Action<R>>) => {
  const toolkit = Toolkit.make(...actions.map(toTool))
  const handlers = Effect.gen(function* () {
    const context = yield* Effect.context<R | Caller>()
    return Object.fromEntries(
      actions.map((action) => {
        const encode = Schema.encode(action.input)
        return [
          action.name,
          (params: unknown) =>
            Effect.orDie(encode(params)).pipe(
              Effect.flatMap(action.invoke),
              Effect.withSpan("projection.effect-ai", { attributes: { "eventiva.action": action.name } }),
              Effect.mapError(action.encodeError),
              Effect.provide(context)
            )
        ] as const
      })
    )
  })
  // The handler record is built dynamically from the inventory, so its keys
  // cannot be checked against the toolkit's literal tool names at compile time.
  const layer = toolkit.toLayer(handlers as never) as unknown as Layer.Layer<
    Tool.HandlersFor<(typeof toolkit)["tools"]>,
    never,
    R | Caller
  >
  return { toolkit, layer }
}
