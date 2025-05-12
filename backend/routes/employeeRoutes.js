import express from 'express';
import Employee from '../models/Employee.js';
import {
  formatPersonnummer,
  formatPhoneNumber,
  formatAddress,
  validateAddress
} from '../utils/format.js';

const router = express.Router();

// === Helper functions ===
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

// === GET: All employees ===
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Serverfel vid hämtning av personal' });
  }
});

// === GET: One employee by ID ===
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Personalen hittades inte' });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Serverfel', error: err });
  }
});

// === POST: Create new employee ===
router.post('/', async (req, res) => {
  try {
    req.body.personnummer = formatPersonnummer(req.body.personnummer);
    req.body.phone = formatPhoneNumber(req.body.phone);
    req.body.address = formatAddress(req.body.address);

    // ✅ Address structure validation
    const addressValidation = validateAddress(req.body.address);
    if (!addressValidation.valid) {
      return res.status(400).json({ error: addressValidation.error });
    }

    const { personnummer } = req.body;
    const cleanPn = personnummer.replace(/[- ]/g, '');
    const base = cleanPn.length === 12 ? cleanPn.slice(2, 10) : cleanPn.slice(0, 6);
    const luhnDigits = cleanPn.length === 12 ? cleanPn.slice(2) : cleanPn;

    // Format check
    if (!/^(\d{6}|\d{8})[- ]?\d{4}$/.test(personnummer)) {
      return res.status(400).json({ error: 'Ogiltigt personnummer-format.' });
    }

    // Duplicate check
    const existing = await Employee.findOne({ personnummer });
    if (existing) {
      return res.status(409).json({ error: 'Personen är redan registrerad.' });
    }

    // Determine identifier type
    const dayPart = parseInt(base.slice(4, 6), 10);

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

    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ error: 'Kunde inte skapa personal', details: err });
  }
});

// === PUT: Update employee ===
router.put('/:id', async (req, res) => {
  try {
    if (req.body.personnummer) req.body.personnummer = formatPersonnummer(req.body.personnummer);
    if (req.body.phone) req.body.phone = formatPhoneNumber(req.body.phone);
    if (req.body.address) req.body.address = formatAddress(req.body.address);

    // Address validation on update
    if (req.body.address) {
      const addressValidation = validateAddress(req.body.address);
      if (!addressValidation.valid) {
        return res.status(400).json({ error: addressValidation.error });
      }
    }

    // Validate and set identifierType if changing personnummer
    if (req.body.personnummer) {
      const cleanPn = req.body.personnummer.replace(/[- ]/g, '');
      const base = cleanPn.length === 12 ? cleanPn.slice(2, 10) : cleanPn.slice(0, 6);
      const luhnDigits = cleanPn.length === 12 ? cleanPn.slice(2) : cleanPn;
      const dayPart = parseInt(base.slice(4, 6), 10);

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

    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Personalen hittades inte' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Kunde inte uppdatera personal', details: err });
  }
});

// === DELETE: Remove employee ===
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Personalen hittades inte' });
    }
    res.json({ message: 'Raderad' });
  } catch (err) {
    res.status(400).json({ error: 'Kunde inte radera', details: err });
  }
});

export default router;
