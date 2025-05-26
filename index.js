import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import stopwatchRouter from './src/stopwatchRouter.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// API routy
app.use('/api/stopwatch', stopwatchRouter);

// EJS engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Hlavní stránka
app.get('/', (req, res) => {
  res.render('index');
});

// Spuštění serveru
app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
