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
    attempt bigint NOT NULL CHECK (attempt >= 0),
    max_attempts bigint CHECK (max_attempts > 0),
    available_at bigint NOT NULL CHECK (available_at >= 0),
    lease text,
    lease_until bigint,
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
CREATE TRIGGER marketplace_settlement_immutable BEFORE UPDATE OR DELETE ON marketplace_settlement FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation or deletion of immutable snapshot references
CREATE TRIGGER marketplace_snapshot_immutable BEFORE UPDATE OR DELETE ON marketplace_snapshot FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation or deletion of committed intent evidence
CREATE TRIGGER marketplace_intent_immutable BEFORE UPDATE OR DELETE ON marketplace_intent FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation or deletion of idempotency evidence
CREATE TRIGGER marketplace_request_immutable BEFORE UPDATE OR DELETE ON marketplace_request FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- statement-breakpoint
-- migration-policy: allow-destructive reject mutation or deletion of audit evidence
CREATE TRIGGER marketplace_audit_immutable BEFORE UPDATE OR DELETE ON marketplace_audit FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- statement-breakpoint
-- migration-policy: allow-destructive allow only monotonic grant revocation; immutable grant scope and subject
CREATE FUNCTION marketplace_protect_grant() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'immutable marketplace grant'; END IF;
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.body IS DISTINCT FROM OLD.body OR NEW.revoked < OLD.revoked THEN
        RAISE EXCEPTION 'immutable marketplace grant';
    END IF;
    RETURN NEW;
END $$;
-- statement-breakpoint
-- migration-policy: allow-destructive preserve immutable grant fields and revoked history
CREATE TRIGGER marketplace_grant_immutable BEFORE UPDATE OR DELETE ON marketplace_grant FOR EACH ROW EXECUTE FUNCTION marketplace_protect_grant();
