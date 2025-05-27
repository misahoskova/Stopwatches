import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import stopwatchRouter from './src/stopwatchRouter.js'
import { getStateForRender } from './src/stopwatchController.js'

const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// API routy
app.use('/api/stopwatch', stopwatchRouter)

// EJS engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  const state = getStateForRender()
  res.render('index', state)
})

// Spuštění serveru
app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`)
})
