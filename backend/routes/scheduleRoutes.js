// backend/routes/scheduleRoutes.js

import express from 'express';
import Schedule from '../models/Schedule.js';
import Kund from '../models/Kund.js';
import Employee from '../models/Employee.js';

const router = express.Router();
// --- ADD THIS ROUTE ---
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('customerId')
      .populate('staffId');
    if (!schedule) {
      return res.status(404).json({ message: 'Schema hittades inte.' });
    }
    res.status(200).json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serverfel vid hämtning av schemat.' });
  }
});
// --- END OF ROUTE ---

// Hämta alla scheman
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('customerId staffId');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Skapa nytt schema
router.post('/', async (req, res) => {
  const { customerId, staffId, date, time, effort, notes } = req.body;

  try {
    const customer = await Kund.findById(customerId);
    const staff = await Employee.findById(staffId);

    if (!customer || !staff) {
      return res.status(400).json({ message: 'Ogiltig kund eller personal.' });
    }

    const newSchedule = new Schedule({
      customerId,
      staffId,
      date,
      time,
      effort,
      notes
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Uppdatera schema
router.put('/:id', async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Old Delete

/*
// Radera schema
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schema raderat.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

*/

// --- New Delete

router.delete('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schema hittades inte.' });
    }
    res.status(200).json({ message: 'Schema raderat.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
