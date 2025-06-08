import express from 'express'
import * as controller from './stopwatchController.js'
import * as functions from './app.js'

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

router.post('/entry/:id/update', async (req, res) => {
  const id = Number(req.params.id)
  const { start, end, duration, description } = req.body

  try {
    await updateEntry(id, { start, end, duration, description })
    res.redirect('/history')
  } catch (err) {
    console.error('Chyba při aktualizaci záznamu:', err)
    res.status(500).send('Nepodařilo se aktualizovat záznam')
  }
})

router.post('/send/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  const { company } = req.body

  try {
    const entry = await getEntryById(id)
    if (!entry) {
      return res.status(404).json({ error: 'Záznam nenalezen' })
    }

    const jsonToSend = {
      winstrom: {
        '@version': '1.0',
        udalost: [
          {
            dokonceni: convertToFlexibeeFormat(entry.end),
            druhUdalK: 'druhUdal.ukol',
            predmet: entry.description,
            zahajeni: convertToFlexibeeFormat(entry.start),
            firma: `code:${company}`,
          },
        ],
      },
    }

    const response = await functions.sendData(
      'sch-solution.flexibee.eu',
      'sch_solution_s_r_o_1',
      '/udalost.json',
      jsonToSend,
    )

    res.status(200).json({ message: 'Úspěšně odesláno', response })
  } catch (error) {
    console.error('Chyba při odesílání dat:', error)
    res.status(500).json({ error: 'Nepodařilo se odeslat záznam', detail: error.message })
  }
})

function convertToFlexibeeFormat(input) {
  if (!input || typeof input !== 'string' || !input.includes(', ')) {
    throw new Error('Invalid input time format: ' + input)
  }

  const [time, date] = input.split(', ')
  const [day, month, year] = date.split('.')

  var x = `${year}-${month}-${day}T${time}+01:00`
  console.log('Converting to FlexiBee format:', x)
  return `${year}-${month}-${day}T${time}+01:00`
}

export default router
