-- Durable producer identities and unresolved callback intents. No callback is replayed by SQL.
CREATE TABLE hook_runtime (
    tenant text NOT NULL,
    incarnation text NOT NULL,
    logical_runtime text NOT NULL,
    PRIMARY KEY (tenant, incarnation)
);
-- statement-breakpoint
CREATE TABLE hook_producer_head (
    tenant text PRIMARY KEY,
    sequence integer NOT NULL CHECK (sequence >= 0 AND sequence <= 9007199254740991)
);
-- statement-breakpoint
CREATE TABLE hook_producer_attempt (
    tenant text NOT NULL,
    request text NOT NULL,
    incarnation text NOT NULL,
    body text NOT NULL,
    state text NOT NULL CHECK (state IN ('unresolved', 'committed', 'abandoned')),
    fact_key text NOT NULL,
    PRIMARY KEY (tenant, request),
    FOREIGN KEY (tenant, incarnation) REFERENCES hook_runtime (tenant, incarnation) ON DELETE RESTRICT
);
-- statement-breakpoint
CREATE INDEX hook_producer_incarnation ON hook_producer_attempt (tenant, incarnation);
-- statement-breakpoint
-- Unconfirmed attempts reserve no fact. Reconciliation may establish at most one ready fact per incarnation/generation.
CREATE UNIQUE INDEX hook_producer_fact ON hook_producer_attempt (tenant, fact_key) WHERE state = 'committed';
