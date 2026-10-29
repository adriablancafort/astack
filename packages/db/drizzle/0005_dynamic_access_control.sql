CREATE TABLE "organization_role" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"role" text NOT NULL,
	"display_name" text NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "organization_role" ADD CONSTRAINT "organization_role_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_role_organization_id_role_uidx" ON "organization_role" USING btree ("organization_id","role");--> statement-breakpoint
INSERT INTO "organization_role" ("id", "organization_id", "role", "display_name", "permission")
SELECT gen_random_uuid()::text, "id", 'admin', 'Admin', '{"organization":["update"],"invitation":["create","cancel"],"member":["create","update","delete"],"team":["create","update","delete"],"ac":["create","read","update","delete"],"todo":["create","update","delete"]}'
FROM "organization"
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "organization_role" ("id", "organization_id", "role", "display_name", "permission")
SELECT gen_random_uuid()::text, "id", 'member', 'Member', '{"organization":[],"member":[],"invitation":[],"team":[],"ac":["read"]}'
FROM "organization"
ON CONFLICT DO NOTHING;
