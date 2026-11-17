# Declarative modules (initial substrate)

EVE-259 adds a bounded data interpreter, not executable plugins or a component
library. A module supplies JSON text naming exact preinstalled component versions,
localized labels, read-only fields and canonical actions. The application supplies
trusted rendering and authorized platform services. Nothing downloads or evaluates
JavaScript, React Native, HTML, SQL or expressions from the module.

The coordinated increment has real package exports, Nx project ownership and
shared build/CI checks, but is not wired into the client entrypoint. The current
client has no installed Rambo-UI package. The owner deferred that adapter until
Resnovas/Rambo-UI supplies an approved releasable React Native package/API; it does
not block unrelated modular delivery. Approved renderer adoption, native runs and
production authorization adapters remain separate integration gates. The browser
evidence uses injected DOM adapters only.

## Declare a module

1. Obtain consent for the module's capabilities through the host admission policy.
2. Select exact component id/version pairs from the approved application catalogue.
3. Bind each `action` or `menu` node to an existing canonical action and version.
   Navigation is an action too. Supply wire input that its existing schema accepts.
4. Add an en-GB default for every label, terminology concept and fallback message.
   Keys must start with the module id and a dot. Tenant terminology changes labels,
   never action, permission or resource identifiers.
5. Pass JSON text to `DeclarativeRegistry.register` within an Effect Scope and
   authenticated Caller. Closing that Scope removes the module.

The following complete format-1 definition requires a host-installed
`approved.status@1.0.0` renderer, a canonical `status.open@1` action accepting the
shown input, and permission to read `status.total`. These are illustrative names,
not claims that those components or actions are shipped.

```json
{
    "format": 1,
    "id": "status",
    "version": "1.0.0",
    "flag": "status.enabled",
    "root": "screen",
    "nodes": [
        {
            "id": "screen",
            "kind": "view",
            "component": { "id": "approved.status", "version": "1.0.0" },
            "label": "status.title",
            "protected": false,
            "project": true,
            "config": {},
            "children": ["total", "open"]
        },
        {
            "id": "total",
            "kind": "field",
            "component": { "id": "approved.status", "version": "1.0.0" },
            "label": "status.total",
            "field": "status.total",
            "protected": false,
            "project": true,
            "config": {},
            "children": []
        },
        {
            "id": "open",
            "kind": "action",
            "component": { "id": "approved.status", "version": "1.0.0" },
            "label": "status.open",
            "protected": false,
            "project": true,
            "config": {},
            "children": [],
            "binding": {
                "action": "status.open",
                "version": 1,
                "input": { "target": "summary" }
            }
        }
    ],
    "messages": {
        "status.title": "Module status",
        "status.total": "Total",
        "status.open": "Open summary",
        "status.offline": "Reconnect to use this module.",
        "status.unavailable": "This module is unavailable."
    },
    "offline": "status.offline",
    "unavailable": "status.unavailable"
}
```

## Format and limits

All listed fields are required unless marked optional. There are no implicit
defaults for module data. Unknown properties fail decoding before publication.

| Field                        | Contract                                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`                     | Exactly `1`.                                                                                                                                                                                   |
| `id`, node ids               | Lowercase letter followed by lowercase letters, digits or hyphens; at most 64 characters.                                                                                                      |
| `version`, component version | Exact numeric `x.y.z`, no ranges, leading zeroes, prerelease or build suffix.                                                                                                                  |
| `flag`                       | Existing dotted flag-key contract. The module gate and `client.declarative-ui.enabled` both use safe default `false`.                                                                          |
| `root`, `nodes`              | One reachable ordered tree rooted in one `view`. 1-128 nodes; no duplicate/shared children, cycles, missing references or orphan nodes; maximum depth 16.                                      |
| `kind`                       | `view`, `layout`, `slot` contain children. `text` and read-only `field` are leaves. `action` and `menu` are leaf interactions with mandatory bindings.                                         |
| `component`                  | Exact installed approved id/version with support for this node kind; duplicate catalogue keys are rejected, never first-match selected.                                                        |
| `label`, `terminology`       | Namespaced message key and optional canonical terminology key; both need defaults. Protected labels ignore terminology overlays.                                                               |
| `permission`                 | Optional existing permission identifier passed to viewer policy. It cannot replace action/resource authorization.                                                                              |
| `protected`                  | Marks a host-approved protected control. Self-declaration grants no trust. The host must validate ownership, provenance and floors in `admit`.                                                 |
| `project`                    | Explicit participation in the viewer's UI/agent snapshot. `false` removes the node and its descendants.                                                                                        |
| `config`, binding `input`    | Flat JSON object of string, finite number, boolean or null. No nested values or expressions in this initial format. Each approved renderer validates config and the host decodes action input. |
| `binding`                    | Required on `action`/`menu`, forbidden elsewhere. Canonical action id, positive action version, wire input. No alternative handler or permission.                                              |
| `field`                      | Required only on read-only field nodes; dotted canonical field identifier resolved through the masking port.                                                                                   |
| `messages`                   | Module-owned keys and nonempty defaults, at most 4096 characters per text. Whitespace-only required defaults are rejected.                                                                     |
| `unavailable`, `offline`     | Required message keys; safe no-action, no-value placeholders.                                                                                                                                  |

Registration accepts at most 131072 JavaScript string code units of JSON. Reject
functions, malformed JSON, executable fields/imports and selected executable-looking
string syntax. This extra text restriction is not a sanitizer or executable-code
sandbox: safety depends on no executable positions and the approved interpreter.
Do not put secrets in config, labels or action input. Use opaque approved identifiers.

## Application integration contract

Provide `UiPlatform`, `ActionInventory`, `Flags` and `I18n` to
`declarativeRegistry(renderers)`. The resulting Layer supplies
`DeclarativeRegistry`; it has no default permissive platform implementation.

- `admit` checks current Caller, active profile, tenant consent/revocation, provenance, capability scope,
  protected ownership and security/approval floors before registration and each
  projection. It does not grant decryption or protected release.
- `checkInput` uses the existing canonical action input schema without executing
  the action. `invoke` routes to the authorized host, preserving fresh identity,
  post-decode permission, approvals, idempotency, audit and offline policy. Its
  UI-facing result is deliberately `void`; arbitrary handler output is not a
  projection. There is no UI-local business action implementation.
- `visible` and `value` enforce current viewer/tenant/field policy. `value` returns
  a minimized scalar, not a record. A denied field fails the projection rather
  than publishing a partial view with sensitive data. Discovery never authorizes
  invocation. A permission-filtered missing action is reported as `unknown-action`.
- Supply trusted `UiRenderer` adapters for exact installed components. The config
  Schema must actually constrain allowed properties; Effect `Struct({})` alone is
  permissive, not an empty-config validator. Accessibility and supported component
  props are adapter approval requirements. JSON props are never spread into a DOM
  element or arbitrary component by this interpreter.
- `DeclarativeModule` consumes the same fresh masked `UiProjection` exposed to
  agents and gives adapters a typed invocation Effect. Adapters run that Effect in
  the authenticated caller runtime, show safe errors and refresh on revocation,
  flags, connectivity, scope disposal and host generation change. This increment
  adds no listeners, routes or app-wide navigation engine. Bind route/slot publication
  to the same registration Scope during future kernel integration.

Registered definitions are isolated by tenant and module id; node and slot ids are
local to that registration. Discovery requires the current Caller, filters tenant
and current admission, and rechecks registration identity after admission. A handle
from a different tenant fails `denied`, even when both tenants use the same module
id. A replaced or disposed handle fails `stale`. Protected-containing modules
refuse every replacement, even a version bump, and reject author-hidden/project-disabled or permission-conditional nodes.
Viewer denial in such a module fails closed. Original protected label defaults are
retained. This conservative policy is not a patch designer or a bypass around the
host's authorized removal policy.

The registry retains its decoded definition privately. `admit`, `visible`,
`checkInput` and `invoke` receive detached format-1 data, including node children,
component/config records, messages and binding input. Adapter writes, including
writes through a retained argument, cannot clear protection, change canonical
labels or redirect later dispatch. For example, if `admit` clears `protected` on
its argument and the viewer then hides that action, projection still fails with
`protected-node`; an unprotected replacement is still refused. Each invocation
rechecks the admitted action/version against the live inventory and passes the
original canonical input. This isolation does not cache admission, flags,
connectivity or viewer policy, and does not replace host authorization.

Replacement requires explicit `replace: true` (default `false`). Validation failure
leaves the old registration intact. Publication, invocation and disposal serialize
locally, waiting for an admitted invocation to finish. Old handles fail `stale`;
closing an old Scope cannot delete a newer replacement. Repeated or already-closed
Scope disposal leaves no registration. There are no background fibers or listeners.
This local serialization is not kernel leases, distributed fencing or durability.

### Screen context and telemetry

`UiRegistration.mount` requires `Caller | Scope | UiScreenContext`. The trusted
`UiScreenContext.mount` port receives a lazy `read` Effect and `invoke(nodeId)`
capability, not a cached projection, action handler or caller snapshot. Its Effect
requires `Caller | Scope` and fails with `UiModuleFailure`. A real application-state
adapter must run those capabilities under the current authenticated Caller, treat
denied/stale reads as absence and dispose by registration identity. This port is
not an implementation of EVE-50 or a second global screen registry.

Projection admission is checked again after asynchronous field reads and before
releasing the result. The final snapshot is decoded with `UiProjection`: a masking
adapter returning `NaN`, for example, fails `invalid-projection`; it is never
rendered or used to authorize an interaction. This does not replace live masking
and revocation checks in the trusted adapter.

Operations use the existing Effect logger and tracer, not a new telemetry store:
`ui.module.project`, `ui.module.invoke`, `ui.module.mount` and the scoped
`ui.module.unmount` span inherit the selected tracer. Typed failures log only
`ui.module.failed` with bounded `ui.failure.reason`; no definition, module id,
viewer identity, field value or binding payload is attached by this lane. The
target adapter still owns render exceptions, navigation events, exporter wiring
and the selected telemetry/consent policy. These seams do not establish
`platform.ready` or full central UI telemetry acceptance.

## Verify and diagnose

Run the focused checks after coordinator-owned package/test integration:

```sh
pnpm --dir tests/ui-modules exec vitest run
pnpm exec tsc -p tests/ui-modules/tsconfig.json --pretty false
pnpm exec eslint packages/contracts/src/ui-module.ts packages/ui-modules/src/declarative-registry.ts packages/ui-modules/src/DeclarativeModule.tsx
```

`invalid-definition` means decode/tree/default/binding shape failed; no submitted
JSON is returned. `invalid-config` means approved component/action validation failed.
`unknown-component` means no exact supported adapter; do not install one implicitly.
`unknown-action` can mean unknown, version mismatch or caller-filtered denial.
`invalid-projection` means the masking adapter returned a value outside the
projection codec. `denied`, `offline`, `unavailable`, `protected-node`, `duplicate`,
`stale` and `unbound-action` remain bounded public failure codes with an Effect
Schema codec.

The reusable registry and interpreter live in the internal frontend library
`packages/ui-modules`, tagged `type:extension`, `layer:frontend`, `capability:ui`.
Consumers import `@eventiva/ui-modules/DeclarativeModule` and
`@eventiva/ui-modules/declarative-registry`. The recovered prototype lived under
the client application; integration moved it without changing behavior because
Nx forbids libraries from importing applications, including through private
subpaths. Test projects now use real library exports and retain the boundary rule.
Run full verification, docgen and Graphify in the shared integration window.
Local aliases alone do not verify exports, Nx, Metro or whole-workspace cycles.

The refinement suite has 40 focused cases. It adds tenant-bound discovery and
handles, invalid masking output, admission revocation during reads, lazy scoped
screen capabilities and parent-trace correlation to the original 35 cases. Strict
compile fixtures constrain input/output/error/environment/Layer types and reject
erased requirements without suppressions. Projection JSON roundtrip and negative
action-version checks exercise the versioned output codec. A CLI-enabled v8 run
with all four thresholds at 90% passed: registry 97.23% statements, 94.4% branches,
97.95% functions and 99.32% lines; interpreter 92.85%, 90%, 100% and 100%; schema
100% statements/functions/lines with no branch sites. Thresholds were not lowered.

## Approved renderer identity and unresolved release choice

EVE-13 decision D8 identifies **Resnovas/Rambo-UI**, not an arbitrary similarly named
package. Inspection on 2026-11-16 found repository main at
[b47a58c](https://github.com/Resnovas/Rambo-UI/commit/b47a58cc45c7c982deaaa4f002eee686e775ab98),
last pushed 2022-11-17. Its root README
describes components/frameworks as coming soon, uses generic
`@resnovas/rambo-...` placeholders and lists accessibility as future work. No tag,
release, root package or approved published component catalogue was found.

Historical templates do exist. `template/basic/package.json` identifies the sample
as `@builder.io/basic-example@0.0.1`; `template/basic/src/blocks/button.lite.tsx`
is a Mitosis template with a broad attributes type and span/link behavior. It is
not an approved React Native export or accessibility/action-binding contract. Do
not reinterpret this template version as production dependency approval.

The installed client has Expo 56.0.24, React 19.2.3, React Native 0.85.3 and
react-native-web 0.21.4, but no Rambo dependency. EVE-16 spike pins are not
production renderer approval. The remaining material choice is an owner-approved
Rambo package/release or digest, exact exports/component catalogue, compatibility,
accessibility and licensed source evidence. Recommend a separately authorized
minimum external Rambo release for these targets; do not silently install another
vendor or create an Eventiva-private component library.

## Remaining gates

No approved Rambo/native renderer, real authorized-host/masking adapter, live
tenant consent/revocation, kernel lease/route integration,
central navigation/render-error telemetry or native accessibility proof is delivered
by the injected tests. The portable [screen-context adapter](screen-context.md)
implements scoped per-session selection over fresh lazy capabilities; it does not
activate a client screen or provide authentication. Effect mount/unmount/failure
instrumentation remains a composition seam, not production exporter proof.
External component approval and full EVE-261 target-specific gates remain open.
