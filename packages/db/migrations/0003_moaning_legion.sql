ALTER TABLE "documents" ALTER COLUMN "storage_key" SET DATA TYPE varchar(512);--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id");