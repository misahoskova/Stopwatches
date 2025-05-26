import { date } from 'drizzle-orm/mysql-core';
import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';

export const stopwatchHistoryTable = sqliteTable('stopwatch_history', {
  id: int().primaryKey({ autoIncrement: true }),
  description: text().notNull(),
  start: date().notNull(),
  end: date().notNull(),
  duration: int().notNull(),
});
