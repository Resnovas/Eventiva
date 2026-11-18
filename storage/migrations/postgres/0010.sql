-- Durable output is independent of workflow replies; logical identity deduplicates the crash window.
CREATE TABLE agent_output_run (
    tenant_id text NOT NULL,
    run_id text NOT NULL,
    next_offset bigint NOT NULL CHECK (next_offset >= 0 AND next_offset <= 9007199254740991),
    PRIMARY KEY (tenant_id, run_id)
);
-- statement-breakpoint
CREATE TABLE agent_output_event (
    tenant_id text NOT NULL,
    run_id text NOT NULL,
    "offset" bigint NOT NULL CHECK ("offset" >= 0 AND "offset" < 9007199254740991),
    event_id text NOT NULL,
    payload text NOT NULL,
    PRIMARY KEY (tenant_id, run_id, "offset"),
    UNIQUE (tenant_id, run_id, event_id)
);
