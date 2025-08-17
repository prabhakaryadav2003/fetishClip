CREATE TABLE "video_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" uuid NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;