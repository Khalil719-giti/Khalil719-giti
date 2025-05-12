import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  containerStyle,
  headingStyle,
  formStyle,
  primaryButtonBase,
  submitButtonBase,
  checkboxContainerStyle,
  checkboxLabelStyle
} from './styles';

import {
  validatePersonnummer,
  validateSamordningsnummer,
  formatPersonnummer,
  formatPhoneNumber,
  formatAddress
} from './validatePersonnummer';

function RegisterStaff() {
  const [form, setForm] = useState({
    name: '',
    role: 'Undersköterska',
    identifierType: 'personnummer',
    personnummer: '',
    samordningsnummer: '',
    gender: '',
    phone: '',
    employmentStatus: '',
    driversLicense: false,
    languages: [],
    address: ''
  });

  const navigate = useNavigate();
  const [hoverHome, setHoverHome] = useState(false);
  const [hoverSubmit, setHoverSubmit] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'languages') {
      const updated = checked
        ? [...form.languages, value]
        : form.languages.filter(l => l !== value);
      setForm({ ...form, languages: updated });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'personnummer' || name === 'samordningsnummer') {
      setForm(prev => ({ ...prev, [name]: formatPersonnummer(value) }));
    }

    if (name === 'phone') {
      setForm(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    }

    if (name === 'address') {
      setForm(prev => ({ ...prev, address: formatAddress(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let idToValidate = form.identifierType === 'personnummer'
      ? form.personnummer
      : form.samordningsnummer;

    const validator = form.identifierType === 'personnummer'
      ? validatePersonnummer
      : validateSamordningsnummer;

    const { valid, error } = validator(idToValidate);
    if (!valid) {
      alert(`❌ ${error}`);
      return;
    }

    const payload = {
      ...form,
      personnummer: form.identifierType === 'personnummer'
        ? form.personnummer
        : form.samordningsnummer
    };

    try {
      await axios.post('http://localhost:5000/api/staff', payload);
      alert('✅ Personal registrerad!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || '❌ Fel vid registrering.');
      console.error(err);
    }
  };

  const languagesList = ['Engelska', 'Franska', 'Arabiska', 'Persiska', 'Ryska', 'Polska'];

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>👤 Registrera Personal</h2>

      <button
        onClick={() => navigate('/')}
        style={{ ...primaryButtonBase, backgroundColor: hoverHome ? '#0056b3' : '#007bff' }}
        onMouseEnter={() => setHoverHome(true)}
        onMouseLeave={() => setHoverHome(false)}
      >
        ⬅️ Hem
      </button>

      <form onSubmit={handleSubmit} style={formStyle}>
        <label>🧍 Namn:
          <input
            name="name"
            placeholder="Namn"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>💼 Roll:
          <input
            name="role"
            placeholder="Undersköterska"
            value={form.role}
            onChange={handleChange}
          />
        </label>

        <label>📌 Identifieringstyp:
          <select name="identifierType" value={form.identifierType} onChange={handleChange}>
            <option value="personnummer">Personnummer</option>
            <option value="samordningsnummer">Samordningsnummer</option>
          </select>
        </label>

        {form.identifierType === 'personnummer' && (
          <label>🆔 Personnummer:
            <input
              name="personnummer"
              placeholder="YYMMDD-XXXX"
              value={form.personnummer}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
          </label>
        )}

        {form.identifierType === 'samordningsnummer' && (
          <label>🆔 Samordningsnummer:
            <input
              name="samordningsnummer"
              placeholder="YYMMDD-XXXX"
              value={form.samordningsnummer}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
          </label>
        )}

        <label>👤 Kön:
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">-- Välj kön --</option>
            <option value="Man">Man</option>
            <option value="Kvinna">Kvinna</option>
          </select>
        </label>

        <label>📱 Mobilnummer:
          <input
            name="phone"
            placeholder="070-123 45 67"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </label>

        <label>💼 Anställningsstatus:
          <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
            <option value="">-- Välj --</option>
            <option value="Heltid">Heltid</option>
            <option value="Timanställd vid behov">Timanställd vid behov</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            name="driversLicense"
            checked={form.driversLicense}
            onChange={handleChange}
          /> 🚗 Körkort
        </label>

        <div>
          🌍 Andra språk:
          <div style={checkboxContainerStyle}>
            {languagesList.map(lang => (
              <label key={lang} style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="languages"
                  value={lang}
                  checked={form.languages.includes(lang)}
                  onChange={handleChange}
                />
                {lang}
              </label>
            ))}
          </div>
        </div>

        <label>🏠 Hemadress:
          <input
            name="address"
            placeholder="Kiko 41 170 77 Solna"
            value={form.address}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </label>

        <button
          type="submit"
          style={{ ...submitButtonBase, backgroundColor: hoverSubmit ? '#0056b3' : '#007bff' }}
          onMouseEnter={() => setHoverSubmit(true)}
          onMouseLeave={() => setHoverSubmit(false)}
        >
          ✅ Registrera Personal
        </button>
      </form>
    </div>
  );
}

export default RegisterStaff;
