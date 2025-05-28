import express from 'express'
import * as controller from './stopwatchController.js'

import { getFullHistory, getEntryById, createEntry, updateEntry, deleteEntry } from './db.js'

const router = express.Router()

router.post('/start', (req, res) => {
  controller.startStopwatch()
  res.redirect('/')
})

router.post('/stop', (req, res) => {
  controller.stopStopwatch()
  res.redirect('/')
})

router.post('/save', async (req, res) => {
  try {
    const { description, start, end, duration } = req.body
    await createEntry({ description, start, end, duration })
    res.redirect('/')
  } catch (err) {
    console.error('Chyba při ukládání záznamu:', err)
    res.status(500).send('Chyba při ukládání záznamu')
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

router.get('/elapsed', (req, res) => {
  res.json(controller.getElapsed())
})

router.get('/history', async (req, res) => {
  const entries = await getFullHistory()
  res.render('history', { entries })
})

export default router
