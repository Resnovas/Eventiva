CREATE TABLE operational_record (
    id uuid PRIMARY KEY,
    state text NOT NULL,
    version bigint NOT NULL CHECK (version >= 0 AND version <= 9007199254740991),
    payload text NOT NULL,
    lease_until timestamptz
);
CREATE TABLE transition_history (
    command_id uuid PRIMARY KEY,
    record_id uuid NOT NULL REFERENCES operational_record(id),
    previous_state text NOT NULL,
    next_state text NOT NULL,
    version bigint NOT NULL,
    occurred_at timestamptz NOT NULL
);
CREATE INDEX transition_record ON transition_history(record_id);
CREATE TABLE stock (
    id uuid PRIMARY KEY,
    available bigint NOT NULL CHECK (available >= 0 AND available <= 9007199254740991)
);
CREATE TABLE reservation (
    id uuid PRIMARY KEY,
    resource uuid NOT NULL REFERENCES stock(id),
    quantity bigint NOT NULL CHECK (quantity > 0 AND quantity <= 9007199254740991),
    state text NOT NULL CHECK (state IN ('pending', 'confirmed', 'released', 'expired')),
    expires_at timestamptz NOT NULL
);
CREATE INDEX reservation_resource ON reservation(resource);
CREATE INDEX reservation_expiry ON reservation(state, expires_at);
CREATE TABLE quantity_ledger (
    id text PRIMARY KEY,
    resource uuid NOT NULL REFERENCES stock(id),
    delta bigint NOT NULL,
    occurred_at timestamptz NOT NULL
);
CREATE INDEX quantity_resource ON quantity_ledger(resource);
CREATE TABLE payment_ledger (
    event text PRIMARY KEY,
    payment text NOT NULL,
    currency text NOT NULL,
    minor_units text NOT NULL
);
CREATE INDEX payment_entries ON payment_ledger(payment);
CREATE TABLE action_commit (
    key text PRIMARY KEY,
    input_hash text NOT NULL,
    result text
);
CREATE TABLE action_receipt (id text PRIMARY KEY, receipt text NOT NULL);
CREATE TABLE command_outbox (id text PRIMARY KEY, command text NOT NULL);

-- migration-policy: allow-destructive immutable evidence rejects updates/deletes; restore uses a fresh database
CREATE FUNCTION reject_evidence_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'append-only evidence'; END;
$$;
-- migration-policy: allow-destructive protect transition history
CREATE TRIGGER immutable_history BEFORE UPDATE OR DELETE ON transition_history FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- migration-policy: allow-destructive protect quantity ledger
CREATE TRIGGER immutable_quantity BEFORE UPDATE OR DELETE ON quantity_ledger FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- migration-policy: allow-destructive protect reconciliation ledger
CREATE TRIGGER immutable_payment BEFORE UPDATE OR DELETE ON payment_ledger FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- migration-policy: allow-destructive protect receipts
CREATE TRIGGER immutable_receipt BEFORE UPDATE OR DELETE ON action_receipt FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- migration-policy: allow-destructive protect the applied migration ledger
CREATE TRIGGER immutable_migration BEFORE UPDATE OR DELETE ON storage_migration FOR EACH ROW EXECUTE FUNCTION reject_evidence_change();
-- migration-policy: allow-destructive completed deduplication evidence lives as long as its business record
CREATE FUNCTION protect_commit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' OR OLD.result IS NOT NULL OR NEW.key <> OLD.key OR NEW.input_hash <> OLD.input_hash THEN
        RAISE EXCEPTION 'immutable action commit';
    END IF;
    RETURN NEW;
END;
$$;
-- migration-policy: allow-destructive protect completed deduplication evidence
CREATE TRIGGER immutable_commit BEFORE UPDATE OR DELETE ON action_commit FOR EACH ROW EXECUTE FUNCTION protect_commit();
