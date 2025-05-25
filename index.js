import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  startTimer,
  stopTimer,
  saveDescription,
  getState,
} from './src/stopwatch.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  next();
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  const stopwatch = getState();
  res.render('index', { stopwatch });
});

app.post('/start', (req, res) => {
  startTimer();
  res.redirect('/');
});

app.post('/stop', (req, res) => {
  stopTimer();
  res.redirect('/');
});

app.post('/save', (req, res) => {
  saveDescription(req.body.description);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
