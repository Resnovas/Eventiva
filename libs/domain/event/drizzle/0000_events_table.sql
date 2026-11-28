CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"venue_id" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"expected_attendees" integer,
	"budget" jsonb,
	"owner_id" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "events_tenant_id_idx" ON "events" ("tenant_id");
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" ("status");
CREATE INDEX IF NOT EXISTS "events_venue_id_idx" ON "events" ("venue_id");
CREATE INDEX IF NOT EXISTS "events_owner_id_idx" ON "events" ("owner_id");
