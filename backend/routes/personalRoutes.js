import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Kunde inte hämta personal', error });
  }
});

// GET one employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Personalen hittades inte' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Serverfel', error });
  }
});

// PUT update employee by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Personalen hittades inte' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Kunde inte uppdatera', error });
  }
});

export default router;