ALTER TABLE "budget" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "budget" CASCADE;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "institution" text DEFAULT 'generic' NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "agency" text;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "account_digit" text;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;