import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import stopwatchRouter from './src/stopwatchRouter.js'
import { getStateForRender } from './src/stopwatchController.js'
import { getFullHistory } from './src/db.js'
import bodyParser from 'body-parser'

const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use('/', stopwatchRouter)

app.use(bodyParser.json())

app.use('/api/stopwatch', stopwatchRouter)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  const state = getStateForRender()
  res.render('index', state)
})

app.get('/history', async (req, res) => {
  try {
    const entries = await getFullHistory()
    res.render('history', { entries })
  } catch (err) {
    console.error(err)
    res.status(500).send('Chyba při načítání historie')
  }
})

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`)
})
