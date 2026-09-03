CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"address" jsonb NOT NULL,
	"capacity" integer NOT NULL,
	"amenities" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"pricing" jsonb NOT NULL,
	"contact_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "events_tenant_id_idx" ON "events" ("tenant_id");
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" ("status");
CREATE INDEX IF NOT EXISTS "events_contact_id_idx" ON "events" ("contact_id");
