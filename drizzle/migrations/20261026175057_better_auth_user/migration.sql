DROP TABLE IF EXISTS `messages`;--> statement-breakpoint
DROP TABLE IF EXISTS `cases`;--> statement-breakpoint
DROP TABLE IF EXISTS `tasks`;--> statement-breakpoint
DROP TABLE IF EXISTS `users`;--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`password_hash` text,
	`role` text DEFAULT 'tenant' NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_login_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`address` text
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
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`priority` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`deadline` integer NOT NULL,
	`tenant_id` text NOT NULL,
	`landlord_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_cases_tenant_id_user_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_cases_landlord_id_user_id_fk` FOREIGN KEY (`landlord_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY,
	`case_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_messages_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_messages_sender_id_user_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `idx_cases_tenant_id` ON `cases` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_cases_landlord_id` ON `cases` (`landlord_id`);--> statement-breakpoint
CREATE INDEX `idx_messages_case_id` ON `messages` (`case_id`);--> statement-breakpoint
CREATE INDEX `idx_messages_sender_id` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);
