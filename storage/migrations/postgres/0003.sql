-- Additive hook outbox. Existing application/storage tables remain unchanged.
CREATE TABLE hook_subscription (
    pin text PRIMARY KEY,
    tenant text NOT NULL,
    declaration text NOT NULL
);
-- statement-breakpoint
CREATE TABLE hook_delivery (
    idempotency_key text PRIMARY KEY,
    subscription text NOT NULL REFERENCES hook_subscription(pin) ON DELETE RESTRICT,
    event_id text NOT NULL,
    resource text NOT NULL,
    sequence bigint NOT NULL CHECK (sequence > 0 AND sequence <= 9007199254740991),
    event text NOT NULL,
    state text NOT NULL CHECK (state IN ('pending', 'running', 'retry', 'delivered', 'dead-letter')),
    attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0),
    due bigint NOT NULL DEFAULT 0,
    lease text,
    lease_until bigint NOT NULL DEFAULT 0,
    settlement text,
    UNIQUE (subscription, event_id),
    UNIQUE (subscription, resource, sequence),
    CHECK (state <> 'running' OR lease IS NOT NULL)
);
-- statement-breakpoint
CREATE INDEX hook_delivery_due ON hook_delivery (subscription, state, due, lease_until);
