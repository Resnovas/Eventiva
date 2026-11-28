CREATE TABLE IF NOT EXISTS "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"role" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"linked_vendor_id" text,
	"linked_venue_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "contacts_tenant_id_idx" ON "contacts" ("tenant_id");
CREATE INDEX IF NOT EXISTS "contacts_type_idx" ON "contacts" ("type");
CREATE INDEX IF NOT EXISTS "contacts_status_idx" ON "contacts" ("status");
CREATE INDEX IF NOT EXISTS "contacts_email_idx" ON "contacts" ("email");
CREATE INDEX IF NOT EXISTS "contacts_tenant_type_idx" ON "contacts" ("tenant_id", "type");
CREATE INDEX IF NOT EXISTS "contacts_tenant_status_idx" ON "contacts" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "contacts_linked_vendor_id_idx" ON "contacts" ("linked_vendor_id");
CREATE INDEX IF NOT EXISTS "contacts_linked_venue_id_idx" ON "contacts" ("linked_venue_id");
