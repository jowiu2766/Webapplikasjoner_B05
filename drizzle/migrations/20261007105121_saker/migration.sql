CREATE TABLE `cases` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`priority` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`tenant_id` integer NOT NULL,
	`landlord_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_cases_tenant_id_users_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_cases_landlord_id_users_id_fk` FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'tenant' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_cases_tenant_id` ON `cases` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_cases_landlord_id` ON `cases` (`landlord_id`);