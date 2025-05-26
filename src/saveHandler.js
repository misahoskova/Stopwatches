// saveHandler.js
import express from 'express';

const router = express.Router();

router.post('/save', (req, res) => {
  try {
    const { title, beginTime, endTime } = req.body;

    if (!title || !beginTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(beginTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start >= end) {
      return res
        .status(400)
        .json({ error: 'Start time must be before end time' });
    }

    const duration = end.getTime() - start.getTime();

    const event = {
      title,
      beginTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMs: duration,
    };

    console.log('Získaná událost:', event);

    return res.status(200).json({ message: 'Event saved successfully', event });
  } catch (err) {
    console.error('Chyba v /save:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
