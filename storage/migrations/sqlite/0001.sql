CREATE TABLE operational_record (
    id text PRIMARY KEY NOT NULL,
    state text NOT NULL,
    version integer NOT NULL CHECK (version >= 0 AND version <= 9007199254740991),
    payload text NOT NULL,
    lease_until integer
);
-- statement-breakpoint
CREATE TABLE transition_history (
    command_id text PRIMARY KEY NOT NULL,
    record_id text NOT NULL REFERENCES operational_record(id),
    previous_state text NOT NULL,
    next_state text NOT NULL,
    version integer NOT NULL,
    occurred_at integer NOT NULL
);
-- statement-breakpoint
CREATE INDEX transition_record ON transition_history(record_id);
-- statement-breakpoint
CREATE TABLE stock (
    id text PRIMARY KEY NOT NULL,
    available integer NOT NULL CHECK (available >= 0 AND available <= 9007199254740991)
);
-- statement-breakpoint
CREATE TABLE reservation (
    id text PRIMARY KEY NOT NULL,
    resource text NOT NULL REFERENCES stock(id),
    quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 9007199254740991),
    state text NOT NULL CHECK (state IN ('pending', 'confirmed', 'released', 'expired')),
    expires_at integer NOT NULL
);
-- statement-breakpoint
CREATE INDEX reservation_resource ON reservation(resource);
-- statement-breakpoint
CREATE INDEX reservation_expiry ON reservation(state, expires_at);
-- statement-breakpoint
CREATE TABLE quantity_ledger (
    id text PRIMARY KEY NOT NULL,
    resource text NOT NULL REFERENCES stock(id),
    delta integer NOT NULL,
    occurred_at integer NOT NULL
);
-- statement-breakpoint
CREATE INDEX quantity_resource ON quantity_ledger(resource);
-- statement-breakpoint
CREATE TABLE payment_ledger (
    event text PRIMARY KEY NOT NULL,
    payment text NOT NULL,
    currency text NOT NULL,
    minor_units text NOT NULL
);
-- statement-breakpoint
CREATE INDEX payment_entries ON payment_ledger(payment);
-- statement-breakpoint
CREATE TABLE action_commit (key text PRIMARY KEY NOT NULL, input_hash text NOT NULL, result text);
-- statement-breakpoint
CREATE TABLE action_receipt (id text PRIMARY KEY NOT NULL, receipt text NOT NULL);
-- statement-breakpoint
CREATE TABLE command_outbox (id text PRIMARY KEY NOT NULL, command text NOT NULL);

-- statement-breakpoint
-- migration-policy: allow-destructive protect transition history updates
CREATE TRIGGER immutable_history_update BEFORE UPDATE ON transition_history BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect transition history deletion
CREATE TRIGGER immutable_history_delete BEFORE DELETE ON transition_history BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect quantity ledger updates
CREATE TRIGGER immutable_quantity_update BEFORE UPDATE ON quantity_ledger BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect quantity ledger deletion
CREATE TRIGGER immutable_quantity_delete BEFORE DELETE ON quantity_ledger BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect reconciliation ledger updates
CREATE TRIGGER immutable_payment_update BEFORE UPDATE ON payment_ledger BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect reconciliation ledger deletion
CREATE TRIGGER immutable_payment_delete BEFORE DELETE ON payment_ledger BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect receipts updates
CREATE TRIGGER immutable_receipt_update BEFORE UPDATE ON action_receipt BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect receipts deletion
CREATE TRIGGER immutable_receipt_delete BEFORE DELETE ON action_receipt BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect the applied migration ledger from updates
CREATE TRIGGER immutable_migration_update BEFORE UPDATE ON storage_migration BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect the applied migration ledger from deletes
CREATE TRIGGER immutable_migration_delete BEFORE DELETE ON storage_migration BEGIN SELECT RAISE(ABORT, 'append-only evidence'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect completed deduplication evidence
CREATE TRIGGER immutable_commit_update BEFORE UPDATE ON action_commit WHEN OLD.result IS NOT NULL OR NEW.key <> OLD.key OR NEW.input_hash <> OLD.input_hash BEGIN SELECT RAISE(ABORT, 'immutable action commit'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive deduplication evidence lives as long as its business record
CREATE TRIGGER immutable_commit_delete BEFORE DELETE ON action_commit BEGIN SELECT RAISE(ABORT, 'immutable action commit'); END;
