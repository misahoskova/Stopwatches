import { relations } from 'drizzle-orm'
import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

export const stopwatchHistoryTable = sqliteTable('stopwatchHistoryTable', {
  id: int().primaryKey({ autoIncrement: true }),
  description: text().notNull(),
  start: text().notNull(),
  end: text().notNull(),
  duration: int().notNull(),
  sent: int({ mode: 'boolean' }).notNull().default(0),
  userId: int().references(() => usersTable.id),
})

export const usersTable = sqliteTable('users', {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  hashedPassword: text().notNull(),
  salt: text().notNull(),
  token: text().notNull(),
})

export const stopwatchHistoryRelations = relations(stopwatchHistoryTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [stopwatchHistoryTable.userId],
    references: [usersTable.id],
  }),
}))

export const usersRelations = relations(usersTable, ({ many }) => ({
  entries: many(stopwatchHistoryTable),
}))

export const createUser = async (username, password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  const token = crypto.randomBytes(16).toString('hex')

  const user = await db
    .insert(usersTable)
    .values({
      username,
      hashedPassword,
      token,
      salt,
    })
    .returning(usersTable)
    .get()

  return user
}
