-- Dedicated tenant-local approval evidence. No credentials or raw action input are persisted.
CREATE TABLE approval_proof (
    id text PRIMARY KEY,
    revision bigint NOT NULL CHECK (revision >= 0 AND revision <= 9007199254740991),
    body text NOT NULL
);
-- statement-breakpoint
-- Every state revision has one append-only minimal decision; the prefix index also covers its foreign key.
CREATE TABLE approval_decision (
    proof_id text NOT NULL REFERENCES approval_proof(id),
    revision bigint NOT NULL,
    body text NOT NULL,
    PRIMARY KEY (proof_id, revision)
);
-- statement-breakpoint
-- migration-policy: allow-destructive protect decision evidence from rewriting or deletion; retention cleanup is not activated
CREATE TRIGGER immutable_approval_decision BEFORE UPDATE OR DELETE ON approval_decision FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
