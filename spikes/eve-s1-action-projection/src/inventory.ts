/**
 * The machine-readable inventory: one entry per action, JSON Schema derived
 * from the action's Effect Schema with `JSONSchema.make`. Nothing is written
 * by hand, so MCP and the AI SDK cannot drift from the handler's contract.
 */
import { JSONSchema } from "effect"
import type { Action } from "./action.js"

export interface InventoryEntry {
  readonly name: string
  readonly description: string
  readonly scopes: ReadonlyArray<string>
  readonly inputSchema: JSONSchema.JsonSchema7Root
  readonly outputSchema: JSONSchema.JsonSchema7Root
  readonly errorSchema: JSONSchema.JsonSchema7Root
}

export const entry = <R>(action: Action<R>): InventoryEntry => ({
  name: action.name,
  description: action.description,
  scopes: action.scopes,
  inputSchema: JSONSchema.make(action.input),
  outputSchema: JSONSchema.make(action.output),
  errorSchema: JSONSchema.make(action.error)
})

export const inventory = <R>(actions: ReadonlyArray<Action<R>>): ReadonlyArray<InventoryEntry> =>
  actions.map(entry)
