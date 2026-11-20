# Function telemetry plan: review before implementation

Refs: EVE-44. Refs: Resnovas/Eventiva#811. The issue remains In Progress/open.

Read `docs/architecture/function-telemetry.md` for the proposed all-exit
Effect instrumentation primitive, owner policy options, enforcement fixtures,
span/metric test strategy and staged migration. Jonathan directed function
timing/spans/attributes/metrics and tests on 2026-11-20 through the cited relay;
privacy, exact exceptions, capacity and cost/opt-out choices remain pending.
No instrumenting behavior, dependency, exporter or new suppression is approved
by a planning recommendation. No runtime example is supplied because the
proposed FunctionTelemetry service does not exist yet.

Reuse the existing sanitized tracer and installed Effect Metric primitives;
never copy archived arbitrary attributes/error logging. Pinned Effect 3.22.4
Metric.trackDuration observes success only. Plan explicit exit finalization
for success/failure/defect/interruption while preserving A/E/R, original exit,
scope, laziness and cancellation. Telemetry assertions supplement business
assertions. Never label metrics by arbitrary identity or reset shared global
metrics during concurrent tests. Native metric export is not implemented by
the current trace-only adapter.

D owns current timing/process-runner/root enforcement changes, including its
normal Resnovas/.github PR. This plan owns no implementation reservation and
must not take over D, renewal or C follow-up paths. Refresh exact occupancy
and allocate the proposed sequential primitive/checker and disjoint migration
slices only after owner selections and released paths; at most five lanes.
EVE-248 stays January 2027; budgets/settings/spend and production activation
remain unchanged. Preserve the archived examples byte-for-byte and do not
import or execute them as the current implementation.
