CREATE TABLE `account` (
	`id` text PRIMARY KEY,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` RENAME TO `user`;--> statement-breakpoint
ALTER TABLE `cases` ADD `file_key` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `email_verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `password_hash` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `image` text;--> statement-breakpoint
ALTER TABLE `user` ADD `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `last_login_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `address` text NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cases` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`priority` text NOT NULL,
	`deadline` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`file_key` text,
	`tenant_id` text NOT NULL,
	`landlord_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_cases_tenant_id_user_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `user`(`id`),
	CONSTRAINT `fk_cases_landlord_id_user_id_fk` FOREIGN KEY (`landlord_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_cases`(`id`, `title`, `description`, `category`, `priority`, `status`, `tenant_id`, `landlord_id`, `created_at`, `deadline`) SELECT `id`, `title`, `description`, `category`, `priority`, `status`, `tenant_id`, `landlord_id`, `created_at`, `deadline` FROM `cases`;--> statement-breakpoint
DROP TABLE `cases`;--> statement-breakpoint
ALTER TABLE `__new_cases` RENAME TO `cases`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'Unauthenticated' NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_login_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`address` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`(`id`, `name`, `email`, `role`) SELECT `id`, `name`, `email`, `role` FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY,
	`case_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_messages_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_messages`(`id`, `case_id`, `sender_id`, `body`, `created_at`) SELECT `id`, `case_id`, `sender_id`, `body`, `created_at` FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_tasks_user_id`;--> statement-breakpoint
CREATE INDEX `idx_cases_tenant_id` ON `cases` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_cases_landlord_id` ON `cases` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `idx_messages_case_id` ON `messages` (`case_id`);--> statement-breakpoint
CREATE INDEX `idx_messages_sender_id` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
DROP TABLE `tasks`;