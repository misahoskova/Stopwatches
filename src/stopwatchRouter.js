import express from 'express';
import {
  startStopwatch,
  stopStopwatch,
  saveStopwatch,
} from './stopwatchController.js';

const router = express.Router();

router.post('/start', (req, res) => {
  const result = startStopwatch();
  res.json(result);
});

router.post('/stop', (req, res) => {
  const result = stopStopwatch();
  res.json(result);
});

router.post('/save', (req, res) => {
  try {
    const { description } = req.body;
    const result = saveStopwatch(description);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
