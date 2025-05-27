import express from 'express'
import { startStopwatch, stopStopwatch, saveStopwatch } from './stopwatchController.js'

import { getFullHistory, getEntryById, createEntry, updateEntry, deleteEntry } from './db.js'

const router = express.Router()

router.post('/start', (req, res) => {
  const result = startStopwatch()
  res.json(result)
})

router.post('/stop', (req, res) => {
  const result = stopStopwatch()
  res.json(result)
})

router.post('/save', async (req, res) => {
  try {
    const { description, start, end, duration } = req.body

    if (!description || !start || !end || typeof duration !== 'number') {
      return res.status(400).json({ error: 'Neplatná data' })
    }

    const entry = await createEntry({
      description,
      start: new Date(start),
      end: new Date(end),
      duration,
    })

    res.status(201).json({ message: 'Záznam uložen', entry })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/history', async (req, res) => {
  try {
    const history = await getFullHistory()
    res.json(history)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/entry/:id', async (req, res) => {
  try {
    const entry = await getEntryById(Number(req.params.id))
    if (!entry) return res.status(404).json({ error: 'Záznam nenalezen' })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/entry/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await updateEntry(id, req.body)
    res.json({ message: 'Záznam upraven' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/entry/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await deleteEntry(id)
    res.json({ message: 'Záznam smazán' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
