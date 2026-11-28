CREATE TABLE IF NOT EXISTS "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"entries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rooms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "schedules_tenant_id_idx" ON "schedules" ("tenant_id");
CREATE INDEX IF NOT EXISTS "schedules_event_id_idx" ON "schedules" ("event_id");
CREATE INDEX IF NOT EXISTS "schedules_status_idx" ON "schedules" ("status");
CREATE INDEX IF NOT EXISTS "schedules_tenant_event_idx" ON "schedules" ("tenant_id", "event_id");
