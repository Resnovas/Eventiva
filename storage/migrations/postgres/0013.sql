-- Explicit transaction-local, exact-proof deletion permits. No scheduler or permits are seeded.
CREATE TABLE approval_retention_permit (
    proof_id text PRIMARY KEY,
    revision bigint NOT NULL,
    body text NOT NULL,
    cutoff bigint NOT NULL CHECK (cutoff >= -62135596800000 AND cutoff <= 253402300799999)
);
-- statement-breakpoint
-- migration-policy: allow-destructive split UPDATE immutability from guarded elapsed-retention DELETE without changing evidence bodies
DROP TRIGGER immutable_approval_decision ON approval_decision;
-- statement-breakpoint
-- migration-policy: allow-destructive preserve unconditional decision UPDATE denial
CREATE TRIGGER immutable_approval_decision_update BEFORE UPDATE ON approval_decision FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- statement-breakpoint
-- migration-policy: allow-destructive reject deletion without an exact-proof permit and elapsed retention; proof additionally requires expiry
CREATE FUNCTION check_approval_retention_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME = 'approval_decision' THEN
        IF EXISTS (
            SELECT 1 FROM approval_proof p JOIN approval_retention_permit m
            ON m.proof_id = p.id AND m.revision = p.revision AND m.body = p.body
            WHERE p.id = OLD.proof_id
            AND jsonb_typeof(p.body::jsonb -> 'retainUntil') = 'number'
            AND (p.body::jsonb ->> 'retainUntil')::bigint <= m.cutoff
        ) THEN RETURN OLD; END IF;
    ELSE
        IF EXISTS (
            SELECT 1 FROM approval_retention_permit m
            WHERE m.proof_id = OLD.id AND m.revision = OLD.revision AND m.body = OLD.body
            AND jsonb_typeof(OLD.body::jsonb -> 'retainUntil') = 'number'
            AND jsonb_typeof(OLD.body::jsonb -> 'expiresAt') = 'number'
            AND (OLD.body::jsonb ->> 'retainUntil')::bigint <= m.cutoff
            AND (OLD.body::jsonb ->> 'expiresAt')::bigint <= m.cutoff
        ) THEN RETURN OLD; END IF;
    END IF;
    RAISE EXCEPTION 'retained approval evidence';
END;
$$;
-- statement-breakpoint
-- migration-policy: allow-destructive guard every decision DELETE; UPDATE remains unconditionally immutable
CREATE TRIGGER retained_approval_decision_delete BEFORE DELETE ON approval_decision FOR EACH ROW EXECUTE FUNCTION check_approval_retention_delete();
-- statement-breakpoint
-- migration-policy: allow-destructive guard operational proof deletion in addition to the unchanged decision foreign key
CREATE TRIGGER retained_approval_proof_delete BEFORE DELETE ON approval_proof FOR EACH ROW EXECUTE FUNCTION check_approval_retention_delete();
