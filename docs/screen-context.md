# Portable current-screen state

Use `makeScreenContext` from `@eventiva/ui-modules/screen-context` to keep the
current declarative screen for each authenticated tenant/session pair. A scope
is an Effect lifetime whose finalizers run when it closes. Create the context
inside the host lifetime and mount each screen inside its own shorter lifetime.

This is the portable application-state adapter for EVE-50. It does not activate
the application, render a screen, authenticate a caller, select a route or grant
release authority. Native acceptance and production policy adapters remain
separate gates. Existing foundation/module flags still default to false; this
library adds no rollout switch and does not enable either flag.

## Connect the existing mount contract

1. Create one scoped `makeScreenContext` instance in the trusted host.
2. Keep the admitted `UiRegistration` scope alive while the screen is mounted.
3. Provide `context.service` as `UiScreenContext` to `registration.mount` inside
   the screen scope. Mounting checks the registration before publishing it.
4. Supply the current authenticated `Caller` separately to every `context.read`
   or `context.invoke(nodeId)`. Never provide a saved runtime or an earlier
   caller as a substitute for current authentication.
5. Close the screen scope to remove that selection. Close the host scope at
   logout or host disposal to invalidate all its sessions and pending reads.

The complete compiling example is
[`inspectMountedScreen`](../ai-docs/src/19_declarative-modules/02_screen-context.ts).
It accepts an existing admitted registration and two host-authenticated callers;
it creates a context, mounts, reads and invokes under the current viewer, then
closes the screen and reads absence. Its `open` argument is a node id from the
registered definition, not an action name or submitted action input.

```ts
import { Caller } from '@eventiva/contracts/caller';
import { UiScreenContext } from '@eventiva/contracts/ui-module';
import { makeScreenContext } from '@eventiva/ui-modules/screen-context';
import { Effect } from 'effect';

// registration and currentViewer come from the trusted host composition.
const inspect = Effect.scoped(
    Effect.gen(function* () {
        const context = yield* makeScreenContext;
        yield* registration.mount.pipe(Effect.provideService(UiScreenContext, context.service));
        const visible = yield* context.read.pipe(Effect.provideService(Caller, currentViewer));
        const invoked = yield* context.invoke('open').pipe(Effect.provideService(Caller, currentViewer));
        return { visible, invoked };
    })
);
```

## API and absence

There are no configuration options or implicit background refreshes.

| Member                   | Result and requirements                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `makeScreenContext`      | `Effect<ScreenContext, never, Scope.Scope>`; creates empty state                                |
| `context.service`        | Existing `UiScreenContext` mount service; mount needs `Caller` and the screen `Scope`           |
| `context.read`           | `Effect<Option<UiProjection>, never, Caller>`; freshly masked, available projection or `None`   |
| `context.invoke(nodeId)` | `Effect<Option<void>, never, Caller>`; `Some(undefined)` on canonical success, otherwise `None` |

`None` means no usable screen/result. Missing selection, typed policy failures,
revocation, stale registration, disabled flags and offline/unavailable reads
never return an older projection. Typed invocation failures also become `None`.
The adapter does not expose their reason to its consumers. Defects remain
defects and explicit fiber interruption remains interruption, not success or
policy absence. Use the existing tracing/logging pipeline to diagnose failures.

## Isolation and lifetime guarantees

Selection is keyed by `Caller.tenant` and `Caller.session`, not the subject.
Different authenticated viewers in the same session receive fresh policy-masked
values from the same selected screen. Distinct tenants or sessions cannot read,
invoke, replace or remove one another's selection. An absent tenant remains a
distinct key, as allowed by the existing platform-service Caller contract; the
adapter does not authenticate callers or create sessions.

Only lazy read/invoke capabilities and invalidation identities are retained.
No projection, field value, caller object, credentials or runtime is cached.
Replacing A with B invalidates A immediately. Closing A later cannot remove B.
Closing B leaves the session empty; A is never restored.

Replacement, unmount and host disposal cancel pending operations and check
selection identity before returning their result. A suspended read cannot return
old A after B becomes current. A canonical invocation suspended in its projection
is interrupted before reaching the action. Already-started authorized side
effects cannot be rolled back by this state adapter; approval, audit and execution
remain the canonical host's responsibility. An uninterruptible capability can
delay operation completion, but its old projection is still suppressed.

The host must register only trusted capabilities through this seam. The real
declarative registry rechecks admission, current masking, action inventory,
canonical input, flags and offline policy. This adapter does not duplicate those
checks or invent a second action path. Do not mount manifest-supplied callbacks.

## Diagnose empty state

- Confirm the current viewer uses the same tenant/session as the mount.
- Keep both registration and screen scopes alive; a closed scope is not a route.
- Check current admission, masking and both existing feature flags. Safe defaults
  intentionally hide a module until the host enables it through the flag service.
- Reconnect before invoking an online-only action. Offline data is not cached here.
- Pass a visible action node id, not its canonical action id or arbitrary input.
- Do not remount after host disposal. It fails with `UiModuleFailure('stale')`;
  create a new scoped context for the new host lifetime instead.

Deterministic tests in `tests/ui-modules/src/screen-context.spec.ts` mount the real
registration and cover current-viewer masking, canonical invocation, revocation,
offline/disabled/stale absence, tenant/session separation, replacement finalizers,
interrupted reads and suspended reads/invocations across invalidation. They use
portable test policy ports, not production authentication or native rendering.
