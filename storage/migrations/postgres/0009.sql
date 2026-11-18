-- Optional telemetry consent. No seed grants; revoked rows retain optimistic revisions.
CREATE TABLE telemetry_consent (
    scope text PRIMARY KEY,
    expires_at bigint NOT NULL CHECK (expires_at >= 0 AND expires_at <= 9007199254740991),
    version bigint NOT NULL CHECK (version >= 0 AND version < 9007199254740991)
);
