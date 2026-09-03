CREATE TABLE IF NOT EXISTS "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"contact_id" text NOT NULL,
	"services" jsonb NOT NULL,
	"pricing_model" text DEFAULT 'custom' NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"portfolio" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "vendors_tenant_id_idx" ON "vendors" ("tenant_id");
CREATE INDEX IF NOT EXISTS "vendors_category_idx" ON "vendors" ("category");
CREATE INDEX IF NOT EXISTS "vendors_tenant_category_idx" ON "vendors" ("tenant_id", "category");
CREATE INDEX IF NOT EXISTS "vendors_status_idx" ON "vendors" ("status");
CREATE INDEX IF NOT EXISTS "vendors_contact_id_idx" ON "vendors" ("contact_id");
CREATE INDEX IF NOT EXISTS "vendors_rating_idx" ON "vendors" ("rating");
