/**
 * The spike domain: `events.create` and `events.get` over an in-memory,
 * tenant-partitioned store provided by a Layer.
 */
import { Context, Effect, HashMap, Layer, Option, Ref, Schema } from "effect"
import * as Action from "./action.js"
import { Caller } from "./action.js"

export const EventId = Schema.String.pipe(Schema.brand("EventId"))
export type EventId = typeof EventId.Type

export const Event = Schema.Struct({
  id: EventId,
  tenantId: Schema.String,
  title: Schema.String,
  startsAt: Schema.DateTimeUtc
})
export type Event = typeof Event.Type

export class EventNotFound extends Schema.TaggedError<EventNotFound>()("EventNotFound", {
  id: Schema.String
}) {
  override get message() {
    return `Event ${this.id} not found`
  }
}

/** Ids come from a service so tests are deterministic. */
export class IdGenerator extends Context.Tag("@eventiva/spike/IdGenerator")<
  IdGenerator,
  { readonly next: Effect.Effect<EventId> }
>() {
  static readonly Sequential = Layer.effect(
    IdGenerator,
    Effect.map(Ref.make(0), (counter) => ({
      next: Ref.updateAndGet(counter, (n) => n + 1).pipe(
        Effect.map((n) => EventId.make(`evt_${n}`))
      )
    }))
  )
}

export class EventStore extends Context.Tag("@eventiva/spike/EventStore")<
  EventStore,
  {
    readonly insert: (event: Event) => Effect.Effect<void>
    /** Tenant-scoped: another tenant's event is indistinguishable from a missing one. */
    readonly find: (tenantId: string, id: EventId) => Effect.Effect<Option.Option<Event>>
  }
>() {
  static readonly InMemory = Layer.effect(
    EventStore,
    Effect.map(Ref.make(HashMap.empty<EventId, Event>()), (ref) => ({
      insert: (event) => Ref.update(ref, HashMap.set(event.id, event)),
      find: (tenantId, id) =>
        Ref.get(ref).pipe(
          Effect.map((map) => Option.filter(HashMap.get(map, id), (e) => e.tenantId === tenantId))
        )
    }))
  )
}

export const create = Action.make("events.create", {
  description: "Create an event in the caller's tenant and return its id.",
  input: Schema.Struct({
    title: Schema.NonEmptyTrimmedString.annotations({ description: "Event title" }),
    startsAt: Schema.DateTimeUtc.annotations({ description: "ISO 8601 start time" })
  }),
  output: Schema.Struct({ id: EventId }),
  error: Schema.Never,
  scopes: ["events:write"],
  handler: (input) =>
    Effect.gen(function* () {
      const caller = yield* Caller
      const store = yield* EventStore
      const id = yield* Effect.flatMap(IdGenerator, (ids) => ids.next)
      yield* store.insert({ id, tenantId: caller.tenantId, ...input })
      return { id }
    })
})

export const get = Action.make("events.get", {
  description: "Read one event in the caller's tenant.",
  input: Schema.Struct({ id: EventId }),
  output: Event,
  error: EventNotFound,
  scopes: ["events:read"],
  handler: ({ id }) =>
    Effect.gen(function* () {
      const caller = yield* Caller
      const store = yield* EventStore
      const found = yield* store.find(caller.tenantId, id)
      return yield* Option.match(found, {
        onNone: () => Effect.fail(new EventNotFound({ id })),
        onSome: Effect.succeed
      })
    })
})

export const actions = [create, get] as const

export const EventsLive = Layer.mergeAll(EventStore.InMemory, IdGenerator.Sequential)
