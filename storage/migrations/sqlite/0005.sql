-- Operator redrive history only. Existing facts, receipts and deliveries remain intact.
CREATE TABLE hook_redrive (
    tenant text NOT NULL,
    request_id text NOT NULL,
    subscription text NOT NULL REFERENCES hook_subscription(pin) ON DELETE RESTRICT,
    idempotency_key text NOT NULL REFERENCES hook_delivery(idempotency_key) ON DELETE RESTRICT,
    attempt integer NOT NULL CHECK (attempt > 0),
    reason text NOT NULL CHECK (reason IN ('denied', 'invalid', 'exhausted')),
    occurred_at integer NOT NULL,
    PRIMARY KEY (tenant, request_id)
);
-- statement-breakpoint
CREATE INDEX hook_redrive_subscription ON hook_redrive (subscription);
-- statement-breakpoint
CREATE INDEX hook_redrive_delivery ON hook_redrive (idempotency_key);
