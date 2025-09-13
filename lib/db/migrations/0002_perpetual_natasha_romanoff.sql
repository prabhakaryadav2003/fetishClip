ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_uploader_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_action_idx" ON "activity_logs" USING btree ("action");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_paypal_plan_id_idx" ON "plans" USING btree ("paypal_plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_plan_idx" ON "subscriptions" USING btree ("user_id","plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_paypal_subscription_idx" ON "subscriptions" USING btree ("paypal_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "video_tags_video_id_idx" ON "video_tags" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "videos_uploader_idx" ON "videos" USING btree ("uploader_id");