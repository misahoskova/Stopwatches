CREATE TABLE `stopwatch_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`start` date NOT NULL,
	`end` date NOT NULL,
	`duration` integer NOT NULL
);
