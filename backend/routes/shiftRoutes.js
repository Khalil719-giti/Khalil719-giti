import express from 'express'
import Shift from '../models/Shift.js'

const router = express.Router()

// ✅ Get all shifts (with populated Kund data)
router.get('/', async (req, res) => {
  try {
    const shifts = await Shift.find().populate('kundId', 'name') // <-- populate kund info
    res.json(shifts)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shifts' })
  }
})

// ✅ Create new shift
router.post('/', async (req, res) => {
  try {
    const { employeeName, kundId, date, startTime, endTime, location, role } = req.body
    const newShift = new Shift({ employeeName, kundId, date, startTime, endTime, location, role })
    await newShift.save()
    res.status(201).json(newShift)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create shift' })
  }
})

// ✅ Update shift
router.put('/:id', async (req, res) => {
  try {
    const updatedShift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updatedShift)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update shift' })
  }
})

// ✅ Delete shift
router.delete('/:id', async (req, res) => {
  try {
    await Shift.findByIdAndDelete(req.params.id)
    res.json({ message: 'Shift deleted' })
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete shift' })
  }
})

export default router
