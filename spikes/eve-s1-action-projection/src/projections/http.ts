/**
 * Projection 1: the UI call. An @effect/platform HTTP route per inventory
 * entry, `POST /actions/<name>`, plus `GET /actions` serving the inventory.
 *
 * Spike only: the caller is read from `x-eventiva-*` headers. A real auth
 * provider is out of scope (EVE-14); it would replace `callerFromHeaders`.
 */
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Option } from "effect"
import { Caller, type Action, type ActionFailure } from "../action.js"
import { inventory } from "../inventory.js"

const statusFor = (failure: ActionFailure): number => {
  switch (failure._tag) {
    case "Forbidden":
      return 403
    case "InvalidInput":
      return 400
    case "EventNotFound":
      return 404
    default:
      return 422
  }
}

const callerFromHeaders = Effect.map(HttpServerRequest.HttpServerRequest, (request) => {
  const header = (name: string) => Option.fromNullable(request.headers[name]).pipe(Option.getOrElse(() => ""))
  return {
    subject: header("x-eventiva-subject"),
    tenantId: header("x-eventiva-tenant"),
    scopes: header("x-eventiva-scopes").split(",").filter((s) => s.length > 0)
  }
})

const route = <R>(action: Action<R>) =>
  HttpRouter.makeRoute(
    "POST",
    `/actions/${action.name}`,
    Effect.gen(function* () {
      const caller = yield* callerFromHeaders
      const request = yield* HttpServerRequest.HttpServerRequest
      const body = yield* Effect.orElseSucceed(request.json, () => undefined)
      return yield* action.invoke(body).pipe(
        Effect.provideService(Caller, caller),
        Effect.flatMap((output) => HttpServerResponse.json({ ok: true, output })),
        Effect.catchAll((failure) =>
          HttpServerResponse.json(
            { ok: false, error: action.encodeError(failure) },
            { status: statusFor(failure) }
          )
        ),
        Effect.withSpan("projection.http", { attributes: { "eventiva.action": action.name } })
      )
    }).pipe(Effect.orDie)
  )

export const router = <R>(actions: ReadonlyArray<Action<R>>) =>
  HttpRouter.fromIterable(actions.map(route)).pipe(
    HttpRouter.get("/actions", HttpServerResponse.json(inventory(actions)).pipe(Effect.orDie))
  )
