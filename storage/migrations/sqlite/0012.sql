-- Dedicated tenant-local approval evidence. No credentials or raw action input are persisted.
CREATE TABLE approval_proof (
    id text PRIMARY KEY,
    revision integer NOT NULL CHECK (revision >= 0 AND revision <= 9007199254740991),
    body text NOT NULL
);
-- statement-breakpoint
CREATE TABLE approval_decision (
    proof_id text NOT NULL REFERENCES approval_proof(id),
    revision integer NOT NULL,
    body text NOT NULL,
    PRIMARY KEY (proof_id, revision)
);
-- statement-breakpoint
-- migration-policy: allow-destructive protect decision evidence from rewriting; retention cleanup is not activated
CREATE TRIGGER immutable_approval_decision_update BEFORE UPDATE ON approval_decision BEGIN SELECT RAISE(ABORT, 'immutable approval decision'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect decision evidence from deletion; retention cleanup is not activated
CREATE TRIGGER immutable_approval_decision_delete BEFORE DELETE ON approval_decision BEGIN SELECT RAISE(ABORT, 'immutable approval decision'); END;
