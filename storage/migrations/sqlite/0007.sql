-- Metadata-only preflight nonce consumption. No key material or release authority.
-- No pruning or retention policy is selected by this additive migration.
CREATE TABLE trust_replay (
    nonce text PRIMARY KEY,
    request text NOT NULL,
    consumed_at integer NOT NULL CHECK (consumed_at >= 0),
    audit text NOT NULL UNIQUE
);
