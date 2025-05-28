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

router.get('/entry/:id/edit', async (req, res) => {
  const id = Number(req.params.id)
  const entry = await getEntryById(id)
  if (!entry) {
    return res.status(404).send('Záznam nenalezen')
  }
  res.render('editEntry', { entry })
})

router.post('/entry/:id/delete', async (req, res) => {
  const id = Number(req.params.id)
  try {
    await deleteEntry(id)
    res.redirect('/history')
  } catch (err) {
    console.error(err)
    res.status(500).send('Chyba při mazání')
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
