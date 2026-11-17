# Central telemetry

EVE-44 provides structured Effect logs and correlated spans with bounded local sinks, composed into the diagnostic server in `apps/server/src/main.ts`. EVE-21 adds an explicitly configured, default-off OTLP/HTTP JSON span adapter below the existing governed export boundary. Neither provides security audit, production ingestion authorization, a ready event, or the banner extension. Shared package exports, package/project metadata and combined verification belong to the integration coordinator. Source-condition tests are not a combined package build.

## EVE-21 scope after the foundation reset

[EVE-21](https://linear.app/resnovas/issue/EVE-21) names the retired `packages/core` tracing implementation. Its active equivalents are `@eventiva/runtime/telemetry`, the neutral `@eventiva/contracts/observability` sink contract and `@eventiva/integrations.telemetry.server/logger`. Runtime imports no vendor SDK and the server adapter imports no runtime code. The server composition supplies the sink. The 2026-11-17 reconciliation found no Sentry references in `packages`, `apps` or `pnpm-lock.yaml`; the historical snapshots are not active implementation targets.

The existing tests demonstrate a sample span reaching an in-memory sink and the actual diagnostic executable persisting a correlated startup span to local JSONL before process exit. They also exercise main telemetry disabled, bootstrap failure diagnostics retained, and sink failures isolated from business work. No duplicate exporter or removal shim is needed for those criteria. Reproduce the focused proof with `pnpm exec vitest run --config tests/telemetry/vitest.config.mts`; the relevant cases are "correlates action -> resource -> asynchronous observer without feature exporters", "retains safe span metadata, durations and an explicit asynchronous handoff parent", "flushes the real file layer before process exit and releases its scoped lock" and "optional telemetry opt-out cannot turn off bootstrap failure diagnostics".

Jonathan approved the original OTLP scope on 2026-11-17. `integrations.telemetry.server/otlp` uses `@effect/opentelemetry` 0.64.2, compatible with pinned Effect 3.22.4 and Platform 0.97.3. Runtime remains vendor-neutral. The separate PostHog diagnostic-event adapter is not OTLP. The new tests exercise actual nested Effect spans through runtime, the governed sink and the real Fetch HTTP adapter into an in-memory collector. This is wire/export evidence, not production collector acceptance or permission to close EVE-21. Replace the obsolete `--projects=core` command with checks on runtime, telemetry.server and their telemetry test project.

## Opt in to governed OTLP spans

Use `otlpTelemetryLayer(binding, configuration?)` only in trusted server composition. It returns `Layer<TelemetryExportProvider, TelemetrySinkFailure, HttpClient>`. Keep it below `governedTelemetrySinkLayer`, which requires a fresh flag and release-authority decision for each write and flush. A configured endpoint alone grants nothing. Never install this tenant-bound pipeline as a mixed-tenant global logger, or let feature code acquire its provider. Existing diagnostic-main/local routing is unchanged.

This complete denied-by-default example needs no credentials or network. The synthetic binding is not a production grant; `FlagsSafeDefaults` and `TelemetryExportDeny` deliberately prevent release even if OTLP is later configured on:

```typescript
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import { TelemetryExportDeny, type TelemetryExportBinding } from '@eventiva/contracts/telemetry-export';
import { otlpTelemetryLayer } from '@eventiva/integrations.telemetry.server/otlp';
import { telemetryLayer } from '@eventiva/runtime/telemetry';
import { governedTelemetrySinkLayer } from '@eventiva/runtime/telemetry-export';
import { Effect, Layer, Schema } from 'effect';

const binding: TelemetryExportBinding = {
    tenantId: Schema.decodeSync(TenantId)('11111111-1111-4111-8111-111111111111'),
    moduleId: 'example.logger',
    moduleVersion: '1.0.0',
    generation: 1,
    profile: 'baseline',
    operation: 'ordinary',
    purpose: 'diagnostics',
    destinationId: '99999999-9999-4999-8999-999999999999',
};
const policy = { messages: { 'sample.completed': 'Completed.' } };
const OptionalSink = governedTelemetrySinkLayer(binding, policy).pipe(
    Layer.provide(otlpTelemetryLayer(binding)),
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(FlagsSafeDefaults),
    Layer.provide(TelemetryExportDeny)
);
const program = Effect.void.pipe(
    Effect.withSpan('sample.completed'),
    Effect.provide(telemetryLayer({ ...policy, attributes: {} }).pipe(Layer.provide(OptionalSink)))
);
```

To permit an authorized test destination, inject configuration through the host's Effect ConfigProvider and supply the real approved flag/authority services. Do not paste credentials into source, shell history, issues or logs. Endpoints and header JSON use `Config.redacted`; errors retain only closed reason codes, never the HTTP request/response, credential or decoder cause.

| Config path                | Default                           | Accepted value                                                                                                                                                                                           |
| -------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `telemetry.otlp.enabled`   | `false`                           | Boolean; additional provider opt-in, not a release flag                                                                                                                                                  |
| `telemetry.otlp.endpoint`  | `http://127.0.0.1:4318/v1/traces` | Full trace URL, HTTPS or HTTP loopback only; no userinfo, query or fragment                                                                                                                              |
| `telemetry.otlp.headers`   | `{}`                              | Redacted JSON string object, at most 16 unique case-insensitive names of 1..64 characters and printable values of at most 2048 characters; no transport/framing/content-type/trace-propagation overrides |
| `telemetry.otlp.timeoutMs` | `1000`                            | Integer 1..10000; bounds request and acknowledgement                                                                                                                                                     |
| `telemetry.export.enabled` | `false`                           | Existing live feature flag, not Config; still requires current release authority                                                                                                                         |

With the default environment ConfigProvider, names are case-sensitive and underscore-separated, for example `telemetry_otlp_enabled`, `telemetry_otlp_endpoint`, `telemetry_otlp_headers`, `telemetry_otlp_timeoutMs`. Other providers may map the same paths differently. Missing values require no secret. Disabled providers send nothing. Even when enabled, Restricted/Vault and non-ordinary bindings reject; record profile and every authority-bearing binding field must match.

The adapter sends one span per request, with original validated trace/span/parent IDs, catalog code, start/end derived from record timestamp and duration, and succeeded/failed status. Resource metadata contains only static `service.name=eventiva`; text, attributes, identities, events, links and failure payloads are dropped. Logs are not an OTLP signal in this adapter. The existing runtime queue is the only queue; export has no batching, retry/backlog or shutdown replay. Direct provider contention fails rather than queueing under an aging grant. Flush is a current-binding barrier, not a resend.

Effect's OTLP JSON serializer is used without its automatic exporter: its buffering/retry and swallowed delivery failures do not meet the existing live-grant/no-retained-backlog contract. Inject an un-retried client such as FetchHttpClient. HTTP tracing and redirects are disabled. Non-2xx, malformed/oversized acknowledgements (over 16 KiB), rejected spans, warnings, transport failures and timeouts return safe failures. Cancellation aborts the cooperative HTTP transport; closed handles cannot send. A successful acknowledgement proves an attempted delivery, not durable ingestion or exactly-once output. Scope release, SDK presence and fixture success are not kernel-installed-exporter or production evidence. See [the governed release contract](telemetry-export.md).

## Synthetic local request correlation (EVE-60 checkpoint)

Use `withRequestCorrelation(headers, policy, innerRequest)` from `apps/server/src/telemetry-correlation.ts` only in trusted local composition. This app-owned Effect wrapper creates `request.received`, closes scoped children before returning, and emits the fixed ERROR code `request.failed` on failure without logging the Cause. The original value, typed failure or interruption remains unchanged. Log and span annotations are installed before request-span construction and cover nested spans, scoped fibers and failure logging, then restore the caller's context. Detached/daemon work is unsupported.

Pass header entries without discarding duplicate names. Names are case-insensitive: `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID`, matching the installed `@posthog/core` 1.64.1 tracing-header constants. A normalized comma join also rejects. Both values must be present exactly once, nonempty, 1..96 characters from `[a-zA-Z0-9._-]`, and individually declared in the same static `TelemetryPolicy.attributes` passed to `telemetryLayer`. Empty, partial, malformed, control-containing, duplicated, overlong or unallowlisted pairs add neither annotation and do not fail business work or emit decoder diagnostics. Do not derive an allowlist from headers. This deliberately narrow synthetic subset is not a production identifier specification.

The local keys are `posthog.distinct_id` and `posthog.session_id`. The session key is a schema-compatible local alias, not verified PostHog `$session_id` linkage. Declare only reviewed synthetic tokens. Jonathan's [2026-11-17 identifier decision](https://linear.app/resnovas/issue/EVE-60#comment-55507185-3858-42e4-b1f9-e868357b54f7) permits only pseudonymous correlation under per-request opt-in, current user consent and protected-profile exclusion; his [dedicated-key choice](https://linear.app/resnovas/issue/EVE-60#comment-9cb2d84b-90b0-41b8-aeb9-1253346d5f39) selects separate tenant/destination/purpose custody and rotation, not a concrete lifetime or algorithm. Those choices do not activate real identifiers here: raw SDK tracing headers and production export remain prohibited. These untrusted synthetic hints never establish Caller, authenticated session, tenant, authorization, grants or delegation. Protected profiles remain authoritative: Restricted/Vault and invalid explicit profiles discard application attributes through the existing minimizer.

The exported `correlationFlag` declares `telemetry.correlation.enabled` with `safeDefault: false` and owner `Eventiva server`. Inject `Flags`; `FlagsSafeDefaults` keeps this capability off when the flag is absent. An explicit false also disables it. Existing Effect Config `telemetry.enabled` (default true) independently prevents identifier installation when false; an invalid value fails correlation closed. There is no new environment switch. Optional sink opt-out does not disable bootstrap diagnostics or mandatory audit. This wrapper is not installed in diagnostic main and activates no listener or production ingress.

This complete local composition enables only the synthetic checkpoint and supplies the existing neutral sink in memory. Use `FlagsSafeDefaults` instead of `LocalFlags` to retain the default-off behavior. No exporter, credentials or external request are involved:

```typescript
import { Flags } from '@eventiva/contracts/flags';
import { TelemetryRecord, TelemetrySink } from '@eventiva/contracts/observability';
import { telemetryLayer, type TelemetryPolicy } from '@eventiva/runtime/telemetry';
import { ConfigProvider, Effect, Layer } from 'effect';
import { correlationFlag, withRequestCorrelation } from '../apps/server/src/telemetry-correlation.ts';

const policy: TelemetryPolicy = {
    messages: { 'request.received': 'Synthetic request.', 'request.failed': 'Request failed.' },
    attributes: {
        'posthog.distinct_id': ['synthetic-person-a'],
        'posthog.session_id': ['synthetic-session-101'],
    },
};
const records: TelemetryRecord[] = [];
const LocalSink = Layer.succeed(TelemetrySink, {
    /** Collect only records already filtered by the central minimizer. */
    write: (record) =>
        Effect.sync(
            /** Retain fixture evidence, not raw annotations or payloads. */
            () => {
                records.push(record);
            }
        ),
    flush: Effect.void,
});
const LocalFlags = Layer.succeed(Flags, {
    /** Enable this finite synthetic fixture only; all other flags retain their safe defaults. */
    evaluate: (flag) =>
        Effect.succeed({
            flag: flag.key,
            value: flag.key === correlationFlag.key || flag.safeDefault,
            reason: 'STATIC',
            fallback: false,
        }),
});
const program = withRequestCorrelation(
    [
        ['X-POSTHOG-DISTINCT-ID', 'synthetic-person-a'],
        ['X-POSTHOG-SESSION-ID', 'synthetic-session-101'],
    ],
    policy,
    Effect.succeed('safe-response')
).pipe(
    Effect.provide(Layer.merge(telemetryLayer(policy).pipe(Layer.provide(LocalSink)), LocalFlags)),
    Effect.withConfigProvider(ConfigProvider.fromMap(new Map([['telemetry.enabled', 'true']]))),
    Effect.scoped
);
```

Run `pnpm exec vitest run --config apps/server/vitest.config.mts tests/telemetry-correlation.spec.ts --coverage.include=apps/server/src/telemetry-correlation.ts` from the root for focused iteration. Normal server coverage also includes this module and AgentRun; run `pnpm nx run @eventiva/server:test` with the approved disposable PostgreSQL fixture for the unchanged aggregate gate and process conformance. The six acceptance groups exercise real ephemeral loopback HTTP via the pinned FetchHttpClient/Node server, deterministic interleaving, typed failure/interruption and child cleanup, schema boundaries, independent annotation opt-out probes, protected profiles/identity preservation/canaries, and lossy rejection/outage through the existing bounded worker. Control-character inputs are tested directly at the wrapper boundary because HTTP libraries reject those bytes before sending. Fixture senders are SDK-shaped synthetic requests, not actual web/native SDK execution.

If correlation is missing, check both opt-outs, the complete unique pair, exact static allowlists and the trusted profile before inspecting sink health. Never print rejected headers or raw decoder errors. Sink write/flush failures remain lossy and cannot change the business result; no retry, backlog or side sink is added. Failed-span and ERROR-log evidence is not a captured exception event. Actual browser/native propagation, authenticated HTTP/RPC ingress, agent-run fallback, AI spans, PostHog association, real identifier/OTLP log export and production ingestion/release remain unproven and out of scope. EVE-60 stays open.

## Instrument features

Use `Effect.logInfo('inventory.completed')`, `Effect.annotateLogs` and `Effect.withSpan('action.inventory')`. Register these codes and their static readable text in the composition-owned `TelemetryPolicy.messages` catalog first. Features must not acquire `TelemetrySink`, manufacture exporters or perform console/file IO. Existing `contracts/telemetry.ts` semantic constants remain unchanged.

Only one catalog code is accepted per log call. Multiple arguments, objects, errors, unregistered codes and arbitrary free text become `redacted` / `[redacted]`. Cause payloads, defects, stacks, configuration values and span events/links are never serialized. Record failure outcome rather than including an error message. The catalog is trusted, reviewed source, never user input, secret text, translated user templates or remote configuration. It permits at most 128 messages of 8192 UTF-16 code units. Control characters, terminal escapes, carriage returns and directional controls are rejected; trusted LF newlines and historical Unicode artwork are preserved byte-for-byte. JSONL escapes newlines so one physical line remains one record. Console output has a structured header followed by the unchanged trusted text, with no per-line artwork indentation.

`TelemetryPolicy.attributes` permits at most 16 keys, each with up to 32 exact string values of at most 96 ASCII identifier characters. Include reviewed module/version/generation/provider/outcome or synthetic execution/step/tenant tokens there. Unlisted values and keys disappear. Never allow real tenant/principal/resource identities, payloads or secrets. This is intentionally not an unrestricted attribute bag. Logging inspects only declared keys, not every supplied annotation. Trace/span IDs come from Effect context, are bounded lowercase hex, and correlate log records with span records. Span records include parent ID, duration in milliseconds and a fixed succeeded/failed outcome; Exit contents never cross the sink boundary. Effect's native IDs are correlation tokens, not cryptographic identifiers.

`eventiva.profile` preserves `baseline`, `sensitive`, `restricted` and `vault`. Restricted/Vault records have no application attributes. Invalid explicit profile values become Vault; absent profile defaults to Baseline. Set the profile on both log annotations and span attributes when instrumenting protected work; this classification is minimization, not authorization, attestation or permission to release data. Even Baseline never accepts raw messages or payloads. Logs inherit the ambient minimum log level; install `Logger.minimumLogLevel` at composition if another level is required.

Effect fibers inherit parent context across fork/join. For a persisted or cross-runner handoff, explicitly validate the approved minimized trace/span identifiers at that transport boundary and restore them with Effect's `Tracer.externalSpan` / `Effect.withParentSpan`. This lane proves an explicit local handoff, not a durable outbox, distributed propagation or production OpenTelemetry ingestion. No metrics exporter is supplied; use Effect Metric contracts with bounded semantic labels, not resource identifiers.

## Compose bootstrap before configuration

`contracts/observability.ts` owns the version-1 `TelemetryRecord` Schema, `TelemetrySink` Context tag and `TelemetrySinkFailure`. Both runtime and server adapter import that lower-level port. Neither imports the other. The asynchronous sink is a composition/exporter boundary, not an alternative feature logger or an audit store.

`telemetryLayer(policy, configuration?)` returns `Layer<TelemetryControl, TelemetrySinkFailure, TelemetrySink>`. `bootstrapTelemetryLayer()` has the same type, needs no application Config and recognizes `bootstrap.failure`, `bootstrap.config-rejected`, `bootstrap.service-failed` and `bootstrap.activation-failed`. `consoleLoggerLayer(write?)` supplies a Config-free sink. `serverLoggerLayer(configuration?, consoleWrite?)` supplies console plus files and requires Effect Platform FileSystem. `formatConsoleRecord` is the pure readable formatter. `TelemetryControl` exposes typed `flush` and `health` Effects for the composition root.

Install bootstrap around main Config/provider/activation acquisition, not in parallel with it. Run the main scope in a supervised child fiber and await its Exit without inheriting its FiberRefs. The following composition shape is typechecked in `tests/telemetry/src/telemetry.spec.ts`; the coordinator supplies the package subpaths:

```typescript
const Bootstrap = bootstrapTelemetryLayer().pipe(Layer.provide(consoleLoggerLayer()));
const Local = telemetryLayer(policy).pipe(Layer.provide(serverLoggerLayer()), Layer.provide(NodeFileSystem.layer));
const program = Effect.logInfo('app.ready').pipe(
    Effect.withSpan('module.start'),
    Effect.provide(Local),
    Effect.fork,
    Effect.flatMap(Fiber.await),
    Effect.flatten,
    Effect.catchAllCause(() =>
        Effect.logError('bootstrap.service-failed').pipe(
            Effect.zipRight(Effect.fail(new TelemetrySinkFailure({ reason: 'unavailable' })))
        )
    ),
    Effect.provide(Bootstrap)
);
```

`NodeFileSystem` is the already pinned `@effect/platform-node/NodeFileSystem` implementation. Choose that implementation only in a Node composition. Browser/native targets can inject a supported sink through the same neutral port; filesystem support for those targets is not claimed. Catch/map application failure before the outer runMain/reporting boundary too: a logger cannot prevent a caller from separately printing an escaped raw Cause. Do not let a generic outer failure reporter serialize protected failures.

Use one central Layer value per composition. Effect memoization shares repeated builds within one graph. Nested central installation replaces the logger set and unwraps the central tracer before installing its own exporter, preventing duplicate records. Do not assume a completed Layer build restores the consuming fiber's instrumentation: Effect propagates Layer FiberRef patches. In particular, joining a child imports its now-closed logger/tracer. `Fiber.await` returns its Exit without importing those patches, so the parent retains the live bootstrap logger for fallback diagnostics. Independent compositions have independent queues, policies and lifetimes. None of this deduplicates business events or physical output across process crashes.

## Diagnostic server composition

The diagnostic executable acquires Config-free console bootstrap first. The child then acquires the main telemetry sink and bounded pipeline, followed by FlagsLive/MainLive and the existing deployment profile. Its static catalog recognizes only `diagnostic.unavailable`, `diagnostic.registered` and `diagnostic.startup`; no arbitrary profile object or action array is printed. The two existing readable diagnostic messages remain, followed by one correlated startup span. The static span text explicitly denies a readiness claim; its outcome records success or failure. Registration checks and the existing `FailClosed` audit/policy/integrity composition are unchanged. No business action executes in this shell.

With no `telemetryFile.directory`, the executable uses console only and provisions nothing. Supplying that existing configuration selects the bounded Node file sink. The default environment ConfigProvider uses case-sensitive underscore-separated names, for example `telemetryFile_directory`, `telemetry_capacity`, `telemetry_enabled` and `telemetryFile_maxFiles`. Other providers can inject the same Config paths. A configured invalid sink fails startup; it does not silently fall back. Malformed main configuration and service failures unwind the child before the parent emits fixed `bootstrap.failure` and returns a safe `TelemetrySinkFailure`. Pure interruption stays interruption, not a fabricated service failure. `NodeRuntime.runMain` has `disableErrorReporting: true` and `disablePrettyLogger: true`; its default post-scope reporter must not print an escaped raw Cause. The bootstrap sink drains before runMain selects the exit code.

Optional telemetry opt-out silences main log/span output, not bootstrap failure diagnostics or mandatory audit. A clean exit waits for the scoped drain and file lock release. Optional sink/drain failure remains lossy and does not certify delivery; this diagnostic exit code is not a telemetry acknowledgement or platform-ready signal. The executable tests launch the actual main in fresh processes with a minimal environment, verify exit codes/output/closed-file records, and check the real fail-closed Audit service separately. They never inherit production keys or connect a telemetry provider.

### Drain failed roots without forced native exit

After all Effect scopes close, the executable sets `process.exitCode = 1` for a non-interruption failure and lets Node drain naturally. Success and pure interruption still use runMain's original callback, including its signal handling. This preserves failure status, sanitized output, scope ownership and file drain; it changes only the final failed-root termination path. There is no new option, retry, deadline or production V8 flag. Keep resource cleanup scoped: natural drain is not permission to leave handles open.

The 2026-11-17 [CI recurrence](https://github.com/Resnovas/Eventiva/actions/runs/44136214792/job/134226340803) reached root completion and Node's exit event at 1041 ms but timed out at 10031 ms. A Node `exit` event is not proof of native process termination. On pinned Node 24.22.3, the real server reproduced a native shutdown deadlock under test-only worker/allocation pressure: the main thread joined a V8 worker waiting for main-thread garbage collection. Native stacks matched [Node issue 64274](https://github.com/nodejs/node/issues/64274); its proposed [upstream fix](https://github.com/nodejs/node/pull/66171) was still open when checked. CI did not capture native stacks, so its exact V8 job and the cause of every earlier timeout remain unverified. See [EVE-261 evidence](https://linear.app/resnovas/issue/EVE-261#comment-0a5d61f4-2406-4d01-93ef-bd20b20abac4).

Run the focused regression with `pnpm exec vitest run --config tests/telemetry/vitest.config.mts src/bootstrap-diagnostics.spec.ts -t 'native workers' --coverage.enabled=false`. It launches the actual executable with a finite crypto task at failed-root completion and Node's test-only concurrent-allocation stressor, a four-thread V8 pool and 512 MiB old-space limit. Before the fix it reached the unchanged 10000 ms child bound with ETIMEDOUT; after the fix it exited 1 naturally in 3540 ms, with empty stderr, safe bootstrap output and a beforeExit event. These flags belong only to the regression, never normal startup. The focused coverage override is for iteration, not aggregate acceptance; run the complete suite and repository verify for the unchanged gates.

## Diagnose bounded bootstrap subprocess failures

The server process tests keep their 10000 ms child timeout, default SIGTERM behavior, 65536-byte output bound, isolated environment and existing output/redaction assertions. They preload `tests/telemetry/fixtures/bootstrap-diagnostics.mjs` only for testing. The preload writes a deduplicated, closed phase journal of at most 4096 bytes to descriptor 3, never to stdout or stderr. Parent assertion context adds the spawn timestamp and elapsed duration. It validates the entire journal before including it in a failing assertion message; missing, malformed and oversized journals become fixed states with no raw content. Expected exit 1 is not itself a reason to print diagnostics. Successful tests remain silent.

Run the complete telemetry suite from the repository root:

```sh
pnpm exec vitest run --config tests/telemetry/vitest.config.mts
```

For example, an opted-out invalid-profile assertion failure can report a parent `spawnedAtMs` and `elapsedMs`, status null, signal SIGTERM, errorCode ETIMEDOUT, stdout length and recognized event names, and a validated journal containing `child-start`, module milestones, `root-start` and `bootstrap-failure-logged`. Journal timestamps are integer Unix-epoch milliseconds derived from each process's monotonic performance clock. Subtract the parent spawn timestamp to estimate when each child phase occurred within the ten-second budget. This is phase evidence, not a CPU profile or a proof of a leaked handle.

`module-first`, `module-64`, `module-256` and `module-1024` are completed source-load counts. `entry-source-loaded` and `effect-source-loaded` mean source became available, not that module evaluation completed. `root-start` occurs when the executable Effect starts, before bootstrap layer acquisition. On failure, `main-use-exit:failure` is before main-service release, `main-services-released:failure` is after that release and before main telemetry release, and `main-telemetry-released:failure` is after the nested telemetry scope. Acquisition failures can skip inner markers. `bootstrap-failure-logged` means the sanitized log Effect returned; the asynchronous sink may not yet have written stdout. `bootstrap-use-exit:failure` precedes outer bootstrap release. `root-exit:failure` follows that release but precedes runMain's root observer and exit selection. Success and interruption use the corresponding closed outcome suffixes. `process-before-exit` observes natural event-loop drain; `process-exit-success` or `process-exit-failure` observes Node's exit event. Default SIGTERM does not emit those exit events; the parent result supplies the signal. A missing marker means unobserved, not completed, and cannot by itself identify which finalizer or scheduler operation stalled.

No subscribers means no lifecycle publication and unchanged effect boundaries from the exit observers. The test preload installs no timers, workers, signal handlers, forced exit, retry or exporter. Descriptor write failure disables capture without failing bootstrap. The channel carries phase strings only, never Cause, configuration, paths, raw errors, telemetry payloads or process handles. This diagnostic-only observation adds no application setting, production telemetry export or release authorization.

EVE-261 remains an investigation, not a verified timeout fix. Historical output alone does not distinguish a late bootstrap record near the ten-second deadline from a long post-log shutdown stall. The bounded journal is intended to make that distinction on the next actual occurrence. Keep the original termination bound and assertions; do not rerun CI or weaken checks to hide a recurrence.

## Configure bounds

Configuration is read through the injected Effect ConfigProvider, never direct environment reads. Dot-separated keys below describe provider paths; provider-specific environment naming/delimiters remain the composition's responsibility.

| Key                           | Default               | Accepted value                                                                                                             |
| ----------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `telemetry.enabled`           | `true`                | Boolean; disables this optional log/span pipeline when false                                                               |
| `telemetry.capacity`          | `256`                 | Integer 1..4096 queued records                                                                                             |
| `telemetry.timeoutMs`         | `1000`                | Integer 1..10000 for each write and each flush/drain                                                                       |
| `telemetryFile.directory`     | Required by file sink | Redacted absolute canonical private directory, no symlink ancestry or traversal; absent selects console in diagnostic main |
| `telemetryFile.maxFileBytes`  | `1048576`             | Integer 1024..67108864 bytes, including JSON and newline                                                                   |
| `telemetryFile.maxFiles`      | `7`                   | Integer 1..1024 managed segments total, not per day                                                                        |
| `telemetryFile.retentionDays` | `7`                   | Integer 1..365 UTC calendar dates, including today                                                                         |

Bootstrap deliberately uses fixed enabled=true, capacity=32, timeoutMs=1000 rather than reading the main descriptor. File paths use Config.redacted/Redacted and failure fields contain only fixed reason codes. These local descriptors accept no credential, endpoint, exporter provider, sampling switch or production destination; the optional OTLP descriptor above is separate and is not installed in diagnostic main. Local sampling is none: every enabled accepted record is attempted once.

The dropping FIFO queue never waits for exporters in a feature's log/span callback. Its bound is capacity records plus one in flight; a validated record is conservatively below 64 KiB encoded. A full queue drops the newest record. A single scoped worker serializes writes. `health` reports accepted/completed/dropped/failed counts, closed and shutdownFailed; no error object is retained. Worker defects/timeouts count as failures without recursive logging. A failed record is not retried; file/console delivery can therefore be partial. Business success never depends on optional telemetry delivery. Callback implementations must not log recursively or perform uninterruptible work.

`flush` waits for the accepted watermark at its start and then the sink flush barrier. Later producers are not part of that watermark; a sink's own barrier may include later work. Prior sink failures make flush fail with a safe typed code. Dropped records are visible in health, not recovered by flush. Scope shutdown closes admission, attempts one deadline-bounded drain, records shutdownFailed and interrupts/releases the worker. Interrupted or timed-out queued records are lost; accepted minus completed exposes the undrained count. Cooperative cancellation is required of an injected exporter. An uninterruptible foreign exporter or hung OS filesystem cannot acquire a stronger deadline guarantee merely by being wrapped in Effect.

## Operate files safely

Use a dedicated POSIX directory owned by the service account, mode 0700, with no other writers. Do not point this sink at a shared log directory. Newly created files use mode 0600. A scoped exclusive `.eventiva-telemetry.lock` refuses a second owner. Clean shutdown removes it. After a crash, an operator must establish that no owner remains before removing a stale lock; startup never guesses or steals it. This is single-host ownership, not distributed fencing or a Windows target claim. A compromised same-user process can defeat filesystem checks and is outside this sink's assurance.

Files are named `YYYY-MM-DD.NNNNNN.jsonl`. Rotation uses the injected Clock's current UTC ingestion date, not the record's supplied timestamp or local timezone. Restart opens a new segment. A write crossing the byte limit opens another segment before writing; an oversized record fails instead of being split or exceeding the limit. Retention removes older UTC dates and then oldest named segments before a new segment is created. Acquisition also prunes count/age and refuses an oversized, linked or insecure surviving segment without truncating it. The managed steady-state bound is maxFiles times maxFileBytes. Unrelated files are never removed and do not count toward that bound. Retention is enforced on acquisition and writes, not by an idle timer; this is not a hard wall-clock deletion service.

Each record uses scoped open/writeAll/fsync/close. Flush is a semaphore barrier because completed writes are already synced and closed. This is not directory-fsync crash consistency or tamper evidence. Partial write failure abandons that segment for future appends, reports failure and starts a fresh segment on the next attempt. A partial tail can remain until retention removes it. Console still gets a validated record after a disk failure; a console failure does not undo a completed file write. No retry or acknowledgement protocol promises exactly-once physical output, and a crash after output but before durable observer acknowledgement can duplicate a replayed banner. Keep the word-art implementation gated on verified ready plus the coordinated delivery contract.

## Validate and troubleshoot

Run from the repository root:

```sh
pnpm exec vitest run --config tests/telemetry/vitest.config.mts
pnpm exec tsc -p tests/telemetry/tsconfig.json --pretty false
pnpm exec eslint apps/server/src/main.ts packages/contracts/src/observability.ts packages/runtime/src/telemetry.ts packages/integrations/telemetry.server/src/logger.ts tests/telemetry/vitest.config.mts tests/telemetry/src/*.ts
```

An unregistered message means the composition catalog is missing the code; never restore unrestricted string formatting. A configuration failure means a missing/redacted path, invalid bounds, insecure directory, stale lock or filesystem acquisition failure; diagnose through the outer bootstrap console without dumping Config/Cause. Increasing capacity trades bounded memory for burst tolerance, not reliability. A failed drain means telemetry loss, never permission to skip mandatory audit.

For OTLP-only iteration, run `pnpm exec vitest run --config tests/telemetry/vitest.config.mts src/otlp.spec.ts --coverage.enabled=false` for wire/gating/failure fixtures. This is not coverage evidence: run the full suite without the selector or coverage override for the unchanged 90% gate. No request usually means default-off provider, denied export flag/authority, a protected binding, or main telemetry opt-out; check those independently without weakening any gate. A write failure may be a non-2xx/rejected/invalid acknowledgement, timeout or transport outage; do not print the collector body or retry an old record after a grant changes. Verify a real authorized collector separately before claiming production ingestion.

The focused tests cover types, compiler-resolved direct/transitive/type-only/alias/reexport cycles including the diagnostic-main closure, console/file formatting, correlation, all profiles, redaction canaries, opt-out, audit independence, UTC boundaries, limits, outage, timeout, interruption, flush and repeated acquisition. One audit test uses an independent denial fixture; the composed-server suite also checks the real production `FailClosed` Audit service. Neither is production tamper-evident audit. Mandatory security/audit receipts retain their existing fail-closed transaction rules regardless of telemetry.enabled or sink availability. Root cycle CI, actual package exports, full platform bootstrap, durable propagation, native adapters, cryptographic audit/provider choices and production ingestion remain separate gates.

## Approved private vendor type boundary

On 2026-11-17, the owner approved the existing private Effect 3.22.4 Logger/Tracer callback boundaries described here under EVE-263. The approval permits required vendor `any`/`unknown` only in this extremely limited scope, where opaque input is the correct type and is narrowed or discarded before use. It does not permit erased public types, unchecked casts, suppressions or unrelated opaque inputs. Application services, errors, environments, Config and exporter declarations remain concrete; no authored explicit any/unknown, assertion or suppression is used to hide these inputs. The private built-in logger callback at `packages/runtime/src/telemetry.ts:217-249` receives vendor `Logger.Options` (`effect/dist/dts/Logger.d.ts:54-62`): opaque messages, Cause and annotations. It accepts one Schema-checked code, narrows only finite approved string attributes, and inspects Cause emptiness only. Logging the payload is forbidden.

The private `CentralTracer.context` at line 94 implements the vendor generic callback whose ignored RuntimeFiber uses vendor any (`Tracer.d.ts:24`). Span construction/attribute/end callbacks at runtime lines 254-312 implement vendor opaque attributes and Exit (`Tracer.d.ts:37,72,97,101-103`). The generic callback preserves its return type; no replacement placeholder type is invented. The original Context and rich parent span are discarded before calling the ambient tracer: only a fresh empty Context, validated identifier-only external parent, no links, safe name and stack-disabled options reach it. Attribute values are narrowed; events/links are dropped; only Exit success is inspected and the underlying span is ended with Exit.void. The test suite canaries these vendor-facing context/parent inputs as well as sink output. These are approved private adaptations to Effect's required signatures, not approval of an OTel adapter, arbitrary ambient exporter, production ingestion or opaque public contracts. Combined cycle/type/build gates remain required. Any expansion beyond these existing callbacks requires a separate review; the source/declaration checks are not weakened by this approval.
