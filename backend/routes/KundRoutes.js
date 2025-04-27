import express from 'express'
import Kund from '../models/Kund.js'

const router = express.Router()

// GET all kunder
router.get('/', async (req, res) => {
  const kunder = await Kund.find()
  res.json(kunder)
})

// POST a new kund
router.post('/', async (req, res) => {
  const { name, address, notes } = req.body
  const newKund = new Kund({ name, address, notes })
  await newKund.save()
  res.status(201).json(newKund)
})

// GET en kund via ID
router.get('/:id', async (req, res) => {
  try {
    const kund = await Kund.findById(req.params.id);
    if (!kund) {
      return res.status(404).json({ message: 'Kund hittades inte' });
    }
    res.json(kund);
  } catch (error) {
    res.status(500).json({ message: 'Serverfel', error });
  }
});

// PUT – uppdatera kund via ID
router.put('/:id', async (req, res) => {
  try {
    const updatedKund = await Kund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedKund) {
      return res.status(404).json({ message: 'Kund hittades inte' });
    }
    res.json(updatedKund);
  } catch (error) {
    res.status(500).json({ message: 'Kunde inte uppdatera kund', error });
  }
});


export default router
