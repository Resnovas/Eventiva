-- Additive metadata-only marketplace control plane. No canonical tenant records or private payloads.
CREATE TABLE marketplace_guard (id integer PRIMARY KEY CHECK (id = 1), version integer NOT NULL);
-- statement-breakpoint
INSERT INTO marketplace_guard (id, version) VALUES (1, 0);
-- statement-breakpoint
CREATE TABLE marketplace_snapshot (id text PRIMARY KEY, body text NOT NULL);
-- statement-breakpoint
CREATE TABLE marketplace_grant (id text PRIMARY KEY, body text NOT NULL, revoked integer NOT NULL CHECK (revoked IN (0, 1)));
-- statement-breakpoint
CREATE TABLE marketplace_intent (
    id text PRIMARY KEY,
    grant_id text NOT NULL REFERENCES marketplace_grant(id) ON DELETE RESTRICT,
    snapshot_id text NOT NULL REFERENCES marketplace_snapshot(id) ON DELETE RESTRICT,
    body text NOT NULL
);
-- statement-breakpoint
CREATE INDEX marketplace_intent_grant ON marketplace_intent (grant_id);
-- statement-breakpoint
CREATE INDEX marketplace_intent_snapshot ON marketplace_intent (snapshot_id);
-- statement-breakpoint
CREATE TABLE marketplace_delivery (
    command text PRIMARY KEY REFERENCES marketplace_intent(id) ON DELETE RESTRICT,
    state text NOT NULL CHECK (state IN ('pending', 'running', 'retry', 'recorded', 'blocked', 'exhausted')),
    attempt integer NOT NULL CHECK (attempt >= 0),
    max_attempts integer CHECK (max_attempts > 0),
    available_at integer NOT NULL CHECK (available_at >= 0),
    lease text,
    lease_until integer,
    CHECK ((state = 'running' AND lease IS NOT NULL AND lease_until IS NOT NULL AND max_attempts IS NOT NULL)
        OR (state <> 'running' AND lease IS NULL AND lease_until IS NULL)),
    CHECK (max_attempts IS NULL OR attempt <= max_attempts)
);
-- statement-breakpoint
CREATE TABLE marketplace_request (id text PRIMARY KEY, body text NOT NULL, actor text NOT NULL);
-- statement-breakpoint
CREATE TABLE marketplace_audit (id text PRIMARY KEY, scope_key text NOT NULL, body text NOT NULL);
-- statement-breakpoint
CREATE INDEX marketplace_audit_scope ON marketplace_audit (scope_key, id);
-- statement-breakpoint
CREATE TABLE marketplace_settlement (lease text PRIMARY KEY, command text NOT NULL REFERENCES marketplace_intent(id) ON DELETE RESTRICT, body text NOT NULL);
-- statement-breakpoint
CREATE INDEX marketplace_settlement_command ON marketplace_settlement (command);
-- statement-breakpoint
-- migration-policy: allow-destructive preserve exact local settlement replay evidence
CREATE TRIGGER marketplace_settlement_update BEFORE UPDATE ON marketplace_settlement BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive preserve local settlement replay evidence
CREATE TRIGGER marketplace_settlement_delete BEFORE DELETE ON marketplace_settlement BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation of immutable classified snapshot references
CREATE TRIGGER marketplace_snapshot_update BEFORE UPDATE ON marketplace_snapshot BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject deletion of immutable classified snapshot references
CREATE TRIGGER marketplace_snapshot_delete BEFORE DELETE ON marketplace_snapshot BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation of committed intent evidence
CREATE TRIGGER marketplace_intent_update BEFORE UPDATE ON marketplace_intent BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject deletion of committed intent evidence
CREATE TRIGGER marketplace_intent_delete BEFORE DELETE ON marketplace_intent BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation of idempotency evidence
CREATE TRIGGER marketplace_request_update BEFORE UPDATE ON marketplace_request BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject deletion of idempotency evidence
CREATE TRIGGER marketplace_request_delete BEFORE DELETE ON marketplace_request BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation of audit evidence
CREATE TRIGGER marketplace_audit_update BEFORE UPDATE ON marketplace_audit BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive reject deletion of audit evidence
CREATE TRIGGER marketplace_audit_delete BEFORE DELETE ON marketplace_audit BEGIN SELECT RAISE(ABORT, 'immutable marketplace evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive allow only monotonic grant revocation; immutable grant scope and subject
CREATE TRIGGER marketplace_grant_update BEFORE UPDATE ON marketplace_grant WHEN NEW.id <> OLD.id OR NEW.body <> OLD.body OR NEW.revoked < OLD.revoked BEGIN SELECT RAISE(ABORT, 'immutable marketplace grant'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive preserve revoked grant history
CREATE TRIGGER marketplace_grant_delete BEFORE DELETE ON marketplace_grant BEGIN SELECT RAISE(ABORT, 'immutable marketplace grant'); END;
