import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import stopwatchRouter from './src/stopwatchRouter.js'
import { getStateForRender } from './src/stopwatchController.js'
import { getFullHistoryByUserId, createUser, getUser, getUserByToken } from './src/db.js'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(cookieParser())

app.use(async (req, res, next) => {
  const token = req.cookies.token
  if (token) {
    const user = await getUserByToken(token)
    if (user) {
      req.user = user
    }
  }
  next()
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  const state = getStateForRender()
  res.render('index', state)
})

app.get('/history', async (req, res) => {
  try {
    const entries = await getFullHistoryByUserId(req.user.id)
    res.render('history', { entries })
  } catch (err) {
    console.error(err)
    res.status(500).send('Chyba při načítání historie')
    console.log('Aktuální uživatel:', req.user)
  }
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/register', (req, res) => {
  res.render('registration')
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await getUser(username, password)
  if (!user) return res.status(401).send('Neplatné přihlašovací údaje')

  res.cookie('token', user.token, { httpOnly: true })
  res.redirect('/')
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await createUser(username, password)

    res.cookie('token', user.token, { httpOnly: true })
    return res.redirect('/history')
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.render('registration.ejs', {
        error: 'Uživatel s tímto jménem již existuje.',
      })
    }

    console.error('Chyba při registraci:', err)
    return res.render('registration.ejs', {
      error: 'Nepodařilo se vytvořit uživatele. Zkuste to prosím znovu.',
    })
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/login')
})

app.use('/api/stopwatch', stopwatchRouter)

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`)
})
