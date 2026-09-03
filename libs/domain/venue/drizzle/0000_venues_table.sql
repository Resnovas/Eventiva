CREATE TABLE IF NOT EXISTS "venues" (
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

CREATE INDEX IF NOT EXISTS "venues_tenant_id_idx" ON "venues" ("tenant_id");
CREATE INDEX IF NOT EXISTS "venues_status_idx" ON "venues" ("status");
CREATE INDEX IF NOT EXISTS "venues_contact_id_idx" ON "venues" ("contact_id");
