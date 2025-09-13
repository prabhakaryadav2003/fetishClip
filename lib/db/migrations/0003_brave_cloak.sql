ALTER TABLE "videos" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fetisheros_url" varchar(255) DEFAULT 'fetisheros.com' NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "views" bigint DEFAULT 0 NOT NULL;