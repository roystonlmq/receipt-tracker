-- Add downloaded column to screenshots table
ALTER TABLE "screenshots" ADD COLUMN "downloaded" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
-- Add index for performance on user_id and downloaded
CREATE INDEX "screenshots_user_downloaded_idx" ON "screenshots" USING btree ("user_id", "downloaded");
