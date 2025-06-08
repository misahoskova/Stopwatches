import crypto from 'crypto'
import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { stopwatchHistoryTable } from './schema.js'

const isTest = process.env.NODE_ENV === 'test'

export const db = drizzle({
  connection: isTest ? 'file::memory:' : 'file:db.sqlite',
})
await migrate(db, { migrationsFolder: 'drizzle' })

export const getFullHistory = async () => {
  return await db.select().from(stopwatchHistoryTable).all()
}

export const getEntryById = async (id) => {
  return await db.select().from(stopwatchHistoryTable).where(eq(stopwatchHistoryTable.id, id)).get()
}

export const getEntryByIdWithoutSent = async (id) => {
  return await db
    .select({
      id: stopwatchHistoryTable.id,
      description: stopwatchHistoryTable.description,
      start: stopwatchHistoryTable.start,
      end: stopwatchHistoryTable.end,
      duration: stopwatchHistoryTable.duration,
    })
    .from(stopwatchHistoryTable)
    .where(eq(stopwatchHistoryTable.id, id))
    .get()
}

export const createEntry = async ({ description, start, end, duration }) => {
  return await db
    .insert(stopwatchHistoryTable)
    .values({ description, start, end, duration })
    .returning(stopwatchHistoryTable)
    .get()
}

export const updateEntry = async (id, fields) => {
  return await db.update(stopwatchHistoryTable).set(fields).where(eq(stopwatchHistoryTable.id, id))
}

export const deleteEntry = async (id) => {
  return await db.delete(stopwatchHistoryTable).where(eq(stopwatchHistoryTable.id, id))
}

export const markEntryAsSent = async (id) => {
  await db.update(stopwatchHistoryTable).set({ sent: true }).where(eq(stopwatchHistoryTable.id, id))
}
