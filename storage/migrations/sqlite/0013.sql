-- Explicit transaction-local, exact-proof deletion permits. No scheduler or permits are seeded.
CREATE TABLE approval_retention_permit (
    proof_id text PRIMARY KEY,
    revision integer NOT NULL,
    body text NOT NULL,
    cutoff integer NOT NULL CHECK (cutoff >= -62135596800000 AND cutoff <= 253402300799999)
);
-- statement-breakpoint
-- migration-policy: allow-destructive replace only unconditional DELETE denial with exact-proof elapsed-retention checks; UPDATE remains immutable
DROP TRIGGER immutable_approval_decision_delete;
-- statement-breakpoint
-- migration-policy: allow-destructive allow history deletion only for an exact permitted proof whose current terminal retention has elapsed
CREATE TRIGGER retained_approval_decision_delete BEFORE DELETE ON approval_decision
WHEN NOT EXISTS (
    SELECT 1 FROM approval_proof p JOIN approval_retention_permit m
    ON m.proof_id = p.id AND m.revision = p.revision AND m.body = p.body
    WHERE p.id = OLD.proof_id AND json_valid(p.body)
    AND json_type(p.body, '$.retainUntil') = 'integer'
    AND json_extract(p.body, '$.retainUntil') <= m.cutoff
)
BEGIN SELECT RAISE(ABORT, 'retained approval decision'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect operational proof until BOTH expiry and retention, in addition to the unchanged decision foreign key
CREATE TRIGGER retained_approval_proof_delete BEFORE DELETE ON approval_proof
WHEN NOT EXISTS (
    SELECT 1 FROM approval_retention_permit m
    WHERE m.proof_id = OLD.id AND m.revision = OLD.revision AND m.body = OLD.body
    AND json_valid(OLD.body)
    AND json_type(OLD.body, '$.retainUntil') = 'integer'
    AND json_type(OLD.body, '$.expiresAt') = 'integer'
    AND json_extract(OLD.body, '$.retainUntil') <= m.cutoff
    AND json_extract(OLD.body, '$.expiresAt') <= m.cutoff
)
BEGIN SELECT RAISE(ABORT, 'retained approval proof'); END;
