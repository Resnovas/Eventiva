-- Append-only tenant change feed, independent of subscriber/delivery lifetime.
-- The transactional head lock serializes cursor allocation through commit.
CREATE TABLE hook_feed_head (
    tenant text PRIMARY KEY,
    cursor integer NOT NULL CHECK (cursor >= 0 AND cursor <= 9007199254740991)
);
-- statement-breakpoint
CREATE TABLE hook_event (
    tenant text NOT NULL REFERENCES hook_feed_head(tenant) ON DELETE RESTRICT,
    cursor integer NOT NULL CHECK (cursor > 0 AND cursor <= 9007199254740991),
    event_id text NOT NULL,
    event text NOT NULL,
    PRIMARY KEY (tenant, cursor),
    UNIQUE (tenant, event_id)
);
