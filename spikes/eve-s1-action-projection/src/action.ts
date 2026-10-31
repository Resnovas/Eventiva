/**
 * Spike EVE-14: the proposed action-definition API.
 *
 * One `Action.make` call is the single source of truth for an operation:
 * schemas (input, output, error), required scopes, description and handler.
 * Every projection (HTTP for the UI, MCP, AI SDK) calls `invoke`, so they share
 * one decode, one authorization check, one handler span and one encode.
 */
import { Context, Effect, Schema } from "effect"

/** Who is calling. Every projection must provide one; none may skip it. */
export class Caller extends Context.Tag("@eventiva/spike/Caller")<
  Caller,
  {
    readonly subject: string
    readonly tenantId: string
    readonly scopes: ReadonlyArray<string>
  }
>() {}

export class Forbidden extends Schema.TaggedError<Forbidden>()("Forbidden", {
  action: Schema.String,
  missingScopes: Schema.Array(Schema.String)
}) {
  override get message() {
    return `Forbidden: ${this.action} needs ${this.missingScopes.join(", ")}`
  }
}

export class InvalidInput extends Schema.TaggedError<InvalidInput>()("InvalidInput", {
  action: Schema.String,
  issues: Schema.String
}) {
  override get message() {
    return `Invalid input for ${this.action}: ${this.issues}`
  }
}

/** Errors every action can fail with, added to each action's error schema. */
export const CommonErrors = Schema.Union(Forbidden, InvalidInput)

export interface ActionConfig<
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E extends Schema.Schema.All,
  R
> {
  readonly description: string
  readonly input: I
  readonly output: O
  readonly error: E
  readonly scopes: ReadonlyArray<string>
  readonly handler: (
    input: Schema.Schema.Type<I>
  ) => Effect.Effect<Schema.Schema.Type<O>, Schema.Schema.Type<E>, R>
}

/**
 * The erased, inventory-friendly shape. `invoke` accepts untrusted wire input
 * and yields wire output, so projections never touch the typed handler.
 */
export interface Action<R = never> {
  readonly name: string
  readonly description: string
  readonly scopes: ReadonlyArray<string>
  readonly input: Schema.Schema.AnyNoContext
  readonly output: Schema.Schema.AnyNoContext
  /** Action errors plus CommonErrors, for encoding and for JSON Schema. */
  readonly error: Schema.Schema.AnyNoContext
  readonly invoke: (raw: unknown) => Effect.Effect<unknown, ActionFailure, R | Caller>
  /** Encode a typed failure for the wire. Pure: the schema is total. */
  readonly encodeError: (error: ActionFailure) => unknown
}

/** Any typed failure an action can produce: a tagged error instance. */
export type ActionFailure = { readonly _tag: string }

export const make = <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E extends Schema.Schema.All,
  R
>(
  name: string,
  config: ActionConfig<I, O, E, R>
): Action<R> => {
  // The union's context is `never` because both members are AnyNoContext; the
  // compiler cannot see that through the generic, hence the one widening cast.
  const error = Schema.Union(config.error, CommonErrors) as unknown as Schema.Schema<
    ActionFailure,
    unknown
  >
  const decodeInput = Schema.decodeUnknown(config.input)
  const encodeOutput = Schema.encode(config.output)
  const encodeErrorSync = Schema.encodeSync(error)

  const authorize = Effect.flatMap(Caller, (caller) => {
    const missing = config.scopes.filter((scope) => !caller.scopes.includes(scope))
    return missing.length === 0
      ? Effect.void
      : Effect.fail(new Forbidden({ action: name, missingScopes: missing }))
  })

  const invoke = (raw: unknown) =>
    authorize.pipe(
      Effect.zipRight(
        decodeInput(raw).pipe(
          Effect.mapError((issue) => new InvalidInput({ action: name, issues: issue.message }))
        )
      ),
      Effect.flatMap(config.handler),
      // Output encoding cannot fail for a well-formed handler result; a failure
      // here is a bug in the handler, so it is a defect, not a typed error.
      Effect.flatMap((output) => Effect.orDie(encodeOutput(output))),
      Effect.withSpan(`action.${name}`, { attributes: { "eventiva.action": name } })
    ) as Effect.Effect<unknown, ActionFailure, R | Caller>

  return {
    name,
    description: config.description,
    scopes: config.scopes,
    input: config.input,
    output: config.output,
    error,
    invoke,
    encodeError: (failure) => encodeErrorSync(failure)
  }
}
