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

function calculateDuration(startStr, endStr) {
  const start = new Date(startStr)
  const end = new Date(endStr)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null
  }

  return Math.round((end - start) / 1000)
}

function parseCzechDatetime(input) {
  const [timePart, datePart] = input.split(', ')
  const [hours, minutes, seconds] = timePart.split(':').map(Number)
  const [day, month, year] = datePart.split('.').map(Number)
  return new Date(year, month - 1, day, hours, minutes, seconds)
}

function calculateDurationInSeconds(startStr, endStr) {
  const start = parseCzechDatetime(startStr)
  const end = parseCzechDatetime(endStr)
  return Math.floor((end - start) / 1000)
}

export function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

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
  if (fields.start && fields.end) {
    try {
      const duration = calculateDurationInSeconds(fields.start, fields.end)
      if (!isNaN(duration) && duration >= 0) {
        fields.duration = duration
      } else {
        throw new Error('Výpočet selhal – neplatné hodnoty')
      }
    } catch (err) {
      console.error('Chyba při výpočtu duration:', err)
      throw new Error('Výpočet duration selhal')
    }
  }

  return await db.update(stopwatchHistoryTable).set(fields).where(eq(stopwatchHistoryTable.id, id))
}

export const deleteEntry = async (id) => {
  return await db.delete(stopwatchHistoryTable).where(eq(stopwatchHistoryTable.id, id))
}

export const markEntryAsSent = async (id) => {
  await db.update(stopwatchHistoryTable).set({ sent: true }).where(eq(stopwatchHistoryTable.id, id))
}
