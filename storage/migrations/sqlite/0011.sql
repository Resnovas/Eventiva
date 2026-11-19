-- Run acceptance is immutable. Mutable ownership is separate and serialized with every successful write.
CREATE TABLE module_run_snapshot (
    tenant_id text NOT NULL,
    run_id text NOT NULL,
    input text NOT NULL,
    snapshot text NOT NULL,
    PRIMARY KEY (tenant_id, run_id)
);
-- statement-breakpoint
CREATE TABLE module_run_owner (
    tenant_id text NOT NULL,
    run_id text NOT NULL,
    owner text,
    epoch integer NOT NULL CHECK (epoch >= 0 AND epoch <= 9007199254740991),
    PRIMARY KEY (tenant_id, run_id),
    FOREIGN KEY (tenant_id, run_id) REFERENCES module_run_snapshot(tenant_id, run_id)
);
-- statement-breakpoint
-- migration-policy: allow-destructive protect accepted run identity against replacement
CREATE TRIGGER immutable_run_snapshot_update BEFORE UPDATE ON module_run_snapshot BEGIN SELECT RAISE(ABORT, 'immutable run snapshot'); END;
-- statement-breakpoint
-- migration-policy: allow-destructive protect accepted run identity against deletion
CREATE TRIGGER immutable_run_snapshot_delete BEFORE DELETE ON module_run_snapshot BEGIN SELECT RAISE(ABORT, 'immutable run snapshot'); END;
