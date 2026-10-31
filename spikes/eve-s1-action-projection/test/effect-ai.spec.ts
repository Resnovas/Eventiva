import { LanguageModel } from "@effect/ai"
import { describe, expect, it } from "@effect/vitest"
import { Effect, JSONSchema, Layer } from "effect"
import { Caller } from "../src/action.js"
import { actions, EventsLive } from "../src/events.js"
import { inventory } from "../src/inventory.js"
import { makeToolkit } from "../src/projections/effect-ai.js"

type CallerValue = typeof Caller.Service
const writer: CallerValue = { subject: "u1", tenantId: "t1", scopes: ["events:write", "events:read"] }
const readerOnly: CallerValue = { subject: "u2", tenantId: "t1", scopes: ["events:read"] }

// A scripted model that asks for one tool call; no provider, no network.
const scriptedModel = (name: string, params: unknown) =>
  Layer.effect(
    LanguageModel.LanguageModel,
    LanguageModel.make({
      generateText: () => Effect.succeed([{ type: "tool-call", id: "call-1", name, params }]),
      streamText: () => Effect.dieMessage("not used")
    })
  )

const callVia = (caller: CallerValue, name: string, params: unknown) => {
  const { toolkit, layer } = makeToolkit(actions)
  return LanguageModel.generateText({ prompt: "spike", toolkit }).pipe(
    Effect.map((response) => response.toolResults[0]),
    Effect.provide(layer),
    Effect.provide(scriptedModel(name, params)),
    Effect.provide(EventsLive),
    Effect.provideService(Caller, caller)
    // The toolkit is built from a runtime list, so its requirements widen to
    // unknown; every one of them is provided above.
  ) as Effect.Effect<{ readonly isFailure: boolean; readonly result: unknown } | undefined, unknown, never>
}

describe("EVE-14 model tool calling without Zod (@effect/ai Toolkit)", () => {
  it.effect("same result and same typed denial as the other projections", () =>
    Effect.gen(function* () {
      const created = yield* callVia(writer, "events.create", { title: "Load-in", startsAt: "2026-11-01T09:00:00.000Z" })
      expect(created?.isFailure).toBe(false)
      expect(created?.result).toEqual({ id: "evt_1" })

      const denied = yield* callVia(readerOnly, "events.create", { title: "Load-in", startsAt: "2026-11-01T09:00:00.000Z" })
      expect(denied?.isFailure).toBe(true)
      expect(denied?.result).toEqual({ _tag: "Forbidden", action: "events.create", missingScopes: ["events:write"] })
    }))

  it.effect("the model sees the inventory's JSON Schema", () =>
    Effect.sync(() => {
      const { toolkit } = makeToolkit(actions)
      const create = toolkit.tools["events.create"]
      expect(create).toBeDefined()
      expect(JSONSchema.make(create!.parametersSchema)).toEqual(inventory(actions)[0]?.inputSchema)
    }))
})
