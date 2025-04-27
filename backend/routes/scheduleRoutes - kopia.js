// backend/routes/scheduleRoutes.js

import express from 'express';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// Hämta alla scheman
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Skapa nytt schema
router.post('/', async (req, res) => {
  const { customerId, staffId, date, time, effort, notes } = req.body;
  try {
    const schedule = new Schedule({ customerId, staffId, date, time, effort, notes });
    const savedSchedule = await schedule.save();
    res.status(201).json(savedSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Uppdatera schema
router.put('/:id', async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Radera schema
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schema raderat' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
