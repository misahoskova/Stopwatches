import { relations } from 'drizzle-orm'
import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

export const stopwatchHistoryTable = sqliteTable('stopwatchHistoryTable', {
  id: int().primaryKey({ autoIncrement: true }),
  description: text().notNull(),
  start: text().notNull(),
  end: text().notNull(),
  duration: int().notNull(),
  sent: int({ mode: 'boolean' }).notNull().default(0),
})

// export const usersTable = sqliteTable('users', {
//   id: int().primaryKey({ autoIncrement: true }),
//   username: text().notNull().unique(),
//   hashedPassword: text().notNull(),
//   salt: text().notNull(),
//   token: text().notNull(),
// })

// export const stopwatchHistoryRelations = relations(stopwatchHistoryTable, ({ one }) => ({
//   user: one(usersTable),
// }))

// export const usersRelations = relations(usersTable, ({ many }) => ({
//   todos: many(stopwatchHistoryTable),
// }))

// export const createUser = async (username, password) => {
//   const salt = crypto.randomBytes(16).toString('hex')
//   const hashedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
//   const token = crypto.randomBytes(16).toString('hex')

//   const user = await db
//     .insert(usersTable)
//     .values({
//       username,
//       hashedPassword,
//       token,
//       salt,
//     })
//     .returning(usersTable)
//     .get()

//   return user
// }

// export const getUser = async (username, password) => {
//   const user = await db.select().from(usersTable).where(eq(usersTable.username, username)).get()

//   if (!user) return null

//   const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha512').toString('hex')

//   if (user.hashedPassword !== hashedPassword) return null

//   return user
// }

// export const getUserByToken = async (token) => {
//   if (!token) return null

//   const user = await db.select().from(usersTable).where(eq(usersTable.token, token)).get()

//   return user
// }
