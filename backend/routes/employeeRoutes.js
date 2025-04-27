import express from 'express'
import Employee from '../models/Employee.js'

const router = express.Router()

// Get all employees
router.get('/', async (req, res) => {
  const employees = await Employee.find()
  res.json(employees)
})

// Create a new employee
router.post('/', async (req, res) => {
  const { name, role } = req.body
  const newEmployee = new Employee({ name, role })
  await newEmployee.save()
  res.status(201).json(newEmployee)
})
// ✅ PUT (update employee by ID)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Could not update employee' })
  }
})

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(400).json({ error: 'Could not delete' })
  }
})

export default router
