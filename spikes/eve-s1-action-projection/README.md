# EVE-14 spike: one Effect action, three projections

Throwaway spike for Linear EVE-14 (S1). This branch is never merged to main.

It defines `events.create` and `events.get` once with `Action.make` (Effect
Schema input, output and errors, required scopes, one handler) and projects
them three ways:

- `src/projections/http.ts`: `@effect/platform` routes, `POST /actions/<name>` (the UI call) and `GET /actions` (the inventory).
- `src/projections/mcp.ts`: MCP tools on the official SDK's low-level `Server`.
- `src/projections/ai-sdk.ts`: AI SDK `tool()` entries using `jsonSchema()`.

`src/inventory.ts` derives every JSON Schema with `JSONSchema.make`; nothing is
written by hand.

## Run it

The spike is outside the pnpm workspace so it does not touch the root lockfile.

```sh
cd spikes/eve-s1-action-projection
npm ci --ignore-scripts
npx tsc --noEmit -p .
npx vitest run
```

## Dependencies added (spike only)

| Package | Version | Why |
| --- | --- | --- |
| `@modelcontextprotocol/sdk` | 1.32.2 | MCP projection |
| `ai` | 7.0.159 | AI SDK projection and `ai/test` mock model |
| `zod` | 4.1.12 | Required peer of both SDKs; never imported by spike code |
| `@opentelemetry/sdk-trace-base` | 2.0.1 | In-memory span exporter for the call-graph test |
| `vitest` | 3.2.4 | `@effect/vitest` 0.27 needs vitest 3.2; the root still pins 2.1.9 |

Findings are recorded on EVE-14.
