import crypto from 'crypto'
import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { stopwatchHistoryTable, usersTable } from './schema.js'

const isTest = process.env.NODE_ENV === 'test'

export const db = drizzle({
  connection: isTest ? 'file::memory:' : 'file:db.sqlite',
})
await migrate(db, { migrationsFolder: 'drizzle' })

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

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export const getFullHistoryByUserId = async (userId) => {
  if (!userId) throw new Error('userId is undefined')
  return await db.select().from(stopwatchHistoryTable).where(eq(stopwatchHistoryTable.userId, userId)).all()
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

export const createEntry = async ({ description, start, end, duration, userId }) => {
  return await db
    .insert(stopwatchHistoryTable)
    .values({ description, start, end, duration, userId })
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

export const createUser = async (username, password) => {
  const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, username)).get()

  if (existingUser) {
    throw new Error('Uživatel s tímto jménem již existuje.')
  }

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
    .returning()
    .get()

  return user
}

export const getUser = async (username, password) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.username, username)).get()

  if (!user) return null

  const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha512').toString('hex')

  if (user.hashedPassword !== hashedPassword) return null

  return user
}

export const getUserByToken = async (token) => {
  if (!token) return null

  const user = await db.select().from(usersTable).where(eq(usersTable.token, token)).get()

  return user
}
