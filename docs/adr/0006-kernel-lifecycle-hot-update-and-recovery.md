# ADR-0006: Kernel Module Lifecycle, Hot Update, and Recovery Fencing

- Status: Accepted
- Date: 2026-11-21
- Owners: Kernel & Runtime

## Context

The Eventiva kernel composes versioned modules, manages explicit capability bindings, drains workflow leases, executes hot updates, and coordinates durable lifecycle journaling. Partial failures, ambiguous journal writes, scope interruptions, or re-entrant rollback locks can otherwise orphan resources, deadlock teardown, or replay side-effecting lifecycle callbacks.

## Decision

1. **Explicit version-pinned bindings and fail-closed isolation**:
   - Capability resolution flows through `KernelEnvironment.resolve` rather than ambient Effect service lookup (`ai-docs/src/21_kernel/01_kernel.ts`).
   - Module composition and hot-update require explicit consumer-to-provider bindings with exact capability version pins; inferred providers, version ranges, downgrades, and implicit major-version compatibility are rejected (`packages/runtime/src/kernel-runtime.ts`).
   - Manifests declaring sandbox or isolation modes that the host cannot enforce fail closed with no fallback to in-process execution.
2. **Durable journal discipline and sticky degraded recovery fence**:
   - Lifecycle execution distinguishes explicit journal opt-out from a failed journal admission; admission failures abort ordinary work.
   - Ambiguous durable outcomes set a sticky degraded recovery fence blocking ordinary mutations until explicit reconciliation rather than blindly retrying journal admission.
   - Mandatory scope cleanup bypasses ordinary journal admission via a `null` intent request so teardown always releases resources while confirmation logic never fabricates durable journal evidence.
   - `recover` restores local runtime state only and never constitutes durable-journal reconciliation or permission to replay side-effecting lifecycle callbacks.
3. **Whole-composition readiness and dependency-ordered failure cascade**:
   - Readiness is a whole-composition property: any committed lifecycle mutation invalidates all ready entries so subsequent readiness checks verify the complete composition.
   - On provider failure, dependent consumer modules tear down before the provider is marked failed.
4. **Concurrency, lock ordering, and teardown safety**:
   - Workflow lease draining runs outside the kernel lifecycle mutex to avoid deadlocking against lease release operations; privileged resource migration fences active workflow leases before running (`ai-docs/src/18_resources/01_resource.ts`).
   - Module cleanup finalizers are attached before publishing the entry into the visible registry so scope teardown still reclaims the module if journal confirmation fails after publication.
   - Teardown keeps interruption masked across the handoff into module release until release installs its own finalization mask.
   - Multi-module `compose` rollback holds the non-reentrant lifecycle mutex and removes partially published entries directly so their scope finalizers become identity no-ops instead of deadlocking on recursive mutex acquisition.
5. **Hot-update identity preservation and post-commit release**:
   - Hot-updating mutates the registration record in place under the original entry identity so the pre-installed scope finalizer retains cleanup ownership over the replacement.
   - The previous module implementation is released only after the replacement passes readiness and commits, and release failures are surfaced visibly.

## Consequences

- Kernel lifecycle transitions remain deadlock-free under cancellation, rollback, and provider failure.
- Ambiguous journal states fail closed until reconciled rather than silently re-running module lifecycle hooks.

## References

- `packages/runtime/src/kernel-runtime.ts`
- `ai-docs/src/21_kernel/01_kernel.ts`
- `ai-docs/src/18_resources/01_resource.ts`
