CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`action` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`ip_address` varchar(45),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paypal_plan_id` text NOT NULL,
	`name` text NOT NULL,
	`price` text NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_paypal_plan_id_idx` UNIQUE(`paypal_plan_id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`paypal_subscription_id` text NOT NULL,
	`plan_id` int NOT NULL,
	`status` text NOT NULL,
	`start_time` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_user_plan_idx` UNIQUE(`user_id`,`plan_id`),
	CONSTRAINT `subscriptions_paypal_subscription_idx` UNIQUE(`paypal_subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`email` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'viewer',
	`fetisheros_url` varchar(255) NOT NULL DEFAULT 'fetisheros.com',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `video_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_id` varchar(36) NOT NULL,
	`tag` text NOT NULL,
	CONSTRAINT `video_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`title` text NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`thumbnail` text,
	`uploader_id` int NOT NULL,
	`is_public` boolean NOT NULL DEFAULT false,
	`views` bigint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_tags` ADD CONSTRAINT `video_tags_video_id_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_uploader_id_users_id_fk` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `activity_logs_user_id_idx` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_action_idx` ON `activity_logs` (`action`);--> statement-breakpoint
CREATE INDEX `video_tags_video_id_idx` ON `video_tags` (`video_id`);--> statement-breakpoint
CREATE INDEX `videos_uploader_idx` ON `videos` (`uploader_id`);