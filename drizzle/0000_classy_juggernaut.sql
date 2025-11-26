CREATE TABLE "screenshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"filename" text NOT NULL,
	"original_filename" text NOT NULL,
	"image_data" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"capture_date" timestamp,
	"upload_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"folder_date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "screenshots_user_id_idx" ON "screenshots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "screenshots_folder_date_idx" ON "screenshots" USING btree ("folder_date");--> statement-breakpoint
CREATE INDEX "screenshots_upload_date_idx" ON "screenshots" USING btree ("upload_date");