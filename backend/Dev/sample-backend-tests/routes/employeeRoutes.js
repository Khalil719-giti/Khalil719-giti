import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { personnummer } = req.body;
  const exists = await Employee.findOne({ personnummer });
  if (exists) return res.status(409).json({ error: 'Duplicate' });
  const created = await Employee.create(req.body);
  res.status(201).json(created);
});

export default router;