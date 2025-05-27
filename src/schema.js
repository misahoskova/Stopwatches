import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

export const stopwatchHistoryTable = sqliteTable('stopwatchHistoryTable', {
  id: int().primaryKey({ autoIncrement: true }),
  description: text().notNull(),
  start: text().notNull(),
  end: text().notNull(),
  duration: int().notNull(),
})
