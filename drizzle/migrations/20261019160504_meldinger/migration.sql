CREATE TABLE `messages` (
	`id` text PRIMARY KEY,
	`case_id` text NOT NULL,
	`sender_id` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_messages_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `idx_messages_case_id` ON `messages` (`case_id`);