import express from 'express';
import Kund from '../models/Kund.js';
import {
  formatPersonnummer,
  formatPhoneNumber,
  formatAddress,
  validateAddress
} from '../utils/format.js';

const router = express.Router();

function isValidDate(yyMMdd) {
  const year = parseInt(yyMMdd.slice(0, 2), 10);
  const month = parseInt(yyMMdd.slice(2, 4), 10);
  const day = parseInt(yyMMdd.slice(4, 6), 10);
  const fullYear = year + (year < 50 ? 2000 : 1900);
  const date = new Date(fullYear, month - 1, day);
  return (
    date.getFullYear() === fullYear &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function luhnCheck(num) {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let n = parseInt(num[i], 10);
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

// GET all kunder with optional pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const kunder = await Kund.find().skip(skip).limit(limit);
    const total = await Kund.countDocuments();

    res.json({
      data: kunder,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Kunde inte hämta kunder', error });
  }
});

// POST create new kund
router.post('/', async (req, res) => {
  try {
    req.body.phone = formatPhoneNumber(req.body.phone || '');
    req.body.address = formatAddress(req.body.address || '');
    req.body.personnummer = formatPersonnummer(req.body.personnummer || '');

    const addressCheck = validateAddress(req.body.address);
    if (!addressCheck.valid) {
      return res.status(400).json({ error: addressCheck.error });
    }

    const { personnummer } = req.body;
    const cleanPn = personnummer.replace(/[- ]/g, '');
    const base = cleanPn.length === 12 ? cleanPn.slice(2, 10) : cleanPn.slice(0, 6);
    const luhnDigits = cleanPn.length === 12 ? cleanPn.slice(2) : cleanPn;

    // Accept 10 or 12 digits only
    if (!/^(\d{10}|\d{12})$/.test(cleanPn)) {
      return res.status(400).json({ error: 'Ogiltigt personnummer-format. Förväntat 10 eller 12 siffror utan bokstäver.' });
    }

    const existing = await Kund.findOne({ personnummer });
    if (existing) {
      return res.status(409).json({ error: 'Denna kund är redan registrerad.' });
    }

    const dayPart = parseInt(base.slice(4, 6), 10);
    if (dayPart >= 61 && dayPart <= 91) {
      req.body.identifierType = 'samordningsnummer';
    } else if (isValidDate(base)) {
      if (!luhnCheck(luhnDigits)) {
        return res.status(400).json({ error: 'Luhn-kontrollen misslyckades (personnummer ogiltigt).' });
      }
      req.body.identifierType = 'personnummer';
    } else {
      return res.status(400).json({ error: 'Ogiltigt födelsedatum eller samordningsnummer.' });
    }

    const newKund = new Kund(req.body);
    await newKund.save();
    res.status(201).json(newKund);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte spara kund', error: err });
  }
});

// GET kund by ID
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

// PUT update kund
router.put('/:id', async (req, res) => {
  try {
    if (req.body.phone) {
      req.body.phone = formatPhoneNumber(req.body.phone);
    }

    if (req.body.address) {
      req.body.address = formatAddress(req.body.address);
      const addrVal = validateAddress(req.body.address);
      if (!addrVal.valid) {
        return res.status(400).json({ error: addrVal.error });
      }
    }

    if (req.body.personnummer) {
      req.body.personnummer = formatPersonnummer(req.body.personnummer);
      const cleanPn = req.body.personnummer.replace(/[- ]/g, '');
      const base = cleanPn.length === 12 ? cleanPn.slice(2, 10) : cleanPn.slice(0, 6);
      const luhnDigits = cleanPn.length === 12 ? cleanPn.slice(2) : cleanPn;
      const dayPart = parseInt(base.slice(4, 6), 10);

      if (!/^(\d{10}|\d{12})$/.test(cleanPn)) {
        return res.status(400).json({ error: 'Ogiltigt personnummer-format.' });
      }

      // Prevent duplicate
      const existing = await Kund.findOne({ personnummer: req.body.personnummer });
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(409).json({ error: 'Personnummer redan i bruk av annan kund.' });
      }

      if (dayPart >= 61 && dayPart <= 91) {
        req.body.identifierType = 'samordningsnummer';
      } else if (isValidDate(base)) {
        if (!luhnCheck(luhnDigits)) {
          return res.status(400).json({ error: 'Ogiltigt personnummer (Luhn-check misslyckades).' });
        }
        req.body.identifierType = 'personnummer';
      } else {
        return res.status(400).json({ error: 'Ogiltigt födelsedatum eller samordningsnummer.' });
      }
    }

    const updatedKund = await Kund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedKund) {
      return res.status(404).json({ message: 'Kund hittades inte' });
    }

    res.json(updatedKund);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kunde inte uppdatera kund', error });
  }
});

// DELETE kund
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Kund.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Kund hittades inte' });
    }
    res.json({ message: 'Raderad' });
  } catch (err) {
    res.status(400).json({ error: 'Kunde inte radera kund', details: err });
  }
});

export default router;
