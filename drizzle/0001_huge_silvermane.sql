ALTER TABLE `stopwatch_history` RENAME TO `stopwatchHistoryTable`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_stopwatchHistoryTable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`duration` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_stopwatchHistoryTable`("id", "description", "start", "end", "duration") SELECT "id", "description", "start", "end", "duration" FROM `stopwatchHistoryTable`;--> statement-breakpoint
DROP TABLE `stopwatchHistoryTable`;--> statement-breakpoint
ALTER TABLE `__new_stopwatchHistoryTable` RENAME TO `stopwatchHistoryTable`;--> statement-breakpoint
PRAGMA foreign_keys=ON;