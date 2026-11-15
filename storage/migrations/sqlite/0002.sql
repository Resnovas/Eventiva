CREATE TABLE identity_guard (id integer PRIMARY KEY CHECK (id = 1), version integer NOT NULL);
-- statement-breakpoint
INSERT INTO identity_guard (id, version) VALUES (1, 0);
-- statement-breakpoint
CREATE TABLE identity_principal (id text PRIMARY KEY, version integer NOT NULL CHECK (version >= 0), body text NOT NULL);
-- statement-breakpoint
CREATE TABLE identity_session (id text PRIMARY KEY, version integer NOT NULL CHECK (version >= 0), body text NOT NULL);
-- statement-breakpoint
CREATE TABLE identity_organization (id text PRIMARY KEY CHECK (id = 'organization'), version integer NOT NULL CHECK (version >= 0), body text NOT NULL);
-- statement-breakpoint
CREATE TABLE identity_membership (id text PRIMARY KEY REFERENCES identity_principal(id), version integer NOT NULL CHECK (version >= 0), body text NOT NULL);
-- statement-breakpoint
CREATE TABLE identity_role (id text PRIMARY KEY, version integer NOT NULL CHECK (version >= 0), body text NOT NULL);
-- statement-breakpoint
CREATE TABLE identity_team (id text PRIMARY KEY, version integer NOT NULL CHECK (version >= 0), body text NOT NULL);
-- statement-breakpoint
CREATE TABLE identity_profile (id text PRIMARY KEY REFERENCES identity_principal(id), version integer NOT NULL CHECK (version >= 0), body text NOT NULL);
-- statement-breakpoint
CREATE TABLE identity_federation (issuer text NOT NULL, external_subject text NOT NULL, subject text NOT NULL REFERENCES identity_principal(id), PRIMARY KEY (issuer, external_subject));
-- statement-breakpoint
CREATE INDEX identity_federation_subject ON identity_federation (subject);
