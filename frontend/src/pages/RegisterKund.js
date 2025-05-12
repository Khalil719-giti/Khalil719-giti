// 🔄 This version includes emoji-rich inputs and proper endpoint fix
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  formatPhoneNumber,
  formatAddress,
  validateAddress,
  formatPersonnummer
} from '../utils/format';

import {
  containerStyle,
  headingStyle,
  formStyle,
  primaryButtonBase,
  submitButtonBase
} from './styles';

function RegisterKund() {
  const navigate = useNavigate();
  const [hoverHome, setHoverHome] = useState(false);
  const [hoverSubmit, setHoverSubmit] = useState(false);

  const [form, setForm] = useState({
    name: '',
    gender: '',
    identifierType: 'personnummer',
    personnummer: '',
    phone: '',
    language: '',
    address: '',
    foodPreference: '',
    foodAllergy: false,
    petAllergy: false,
    specialNeeds: '',
    relatives: [
      { relation: '', name: '', phone: '' },
      { relation: '', name: '', phone: '' }
    ],
    efforts: [],
    effortDetails: {}
  });

  const effortsList = ['🌅 Morgon', '🌄 Förmiddag', '🌞 Lunch', '🌇 Eftermiddag', '🌃 Kväll', '🚿 Dusch', '🛒 Inköp', '🧺 Tvätt'];
  const days = ['📆 Dagligen', '📅 Måndag', '📅 Tisdag', '📅 Onsdag', '📅 Torsdag', '📅 Fredag', '📅 Lördag', '📅 Söndag'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    }
    if (name === 'address') {
      setForm(prev => ({ ...prev, address: formatAddress(value) }));
    }
    if (name === 'personnummer') {
      setForm(prev => ({ ...prev, personnummer: formatPersonnummer(value) }));
    }
  };

  const handleRelativeChange = (index, field, value) => {
    const updated = [...form.relatives];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, relatives: updated }));
  };

  const toggleEffort = (label) => {
    const exists = form.efforts.includes(label);
    const updatedEfforts = exists
      ? form.efforts.filter(e => e !== label)
      : [...form.efforts, label];

    const updatedDetails = { ...form.effortDetails };
    if (!exists && !updatedDetails[label]) {
      updatedDetails[label] = { time: '', days: [] };
    } else if (exists) {
      delete updatedDetails[label];
    }

    setForm(prev => ({
      ...prev,
      efforts: updatedEfforts,
      effortDetails: updatedDetails
    }));
  };

  const handleEffortDetailChange = (label, field, value) => {
    const current = form.effortDetails[label] || { time: '', days: [] };
    setForm(prev => ({
      ...prev,
      effortDetails: {
        ...prev.effortDetails,
        [label]: {
          ...current,
          [field]: value
        }
      }
    }));
  };

  const toggleDay = (label, day) => {
    const currentDays = form.effortDetails[label]?.days || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];

    setForm(prev => ({
      ...prev,
      effortDetails: {
        ...prev.effortDetails,
        [label]: {
          ...prev.effortDetails[label],
          days: updatedDays
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const addrVal = validateAddress(form.address);
    if (!addrVal.valid) {
      return alert(`❌ ${addrVal.error}`);
    }

    try {
      await axios.post('http://localhost:5000/api/kunder', form);
      alert('✅ Ny kund registrerad!');
      navigate('/kunder');
    } catch (err) {
      console.error(err);
      alert('❌ Kunde inte spara kunden.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>📝 Registrera ny kund</h2>

      <button
        onClick={() => navigate('/')}
        style={{
          ...primaryButtonBase,
          backgroundColor: hoverHome ? '#0056b3' : '#007bff'
        }}
        onMouseEnter={() => setHoverHome(true)}
        onMouseLeave={() => setHoverHome(false)}
      >⬅️ Hem</button>

      <form onSubmit={handleSubmit} style={formStyle}>
        <label>🧓 Namn:
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>⚧️ Kön:
          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">-- Välj --</option>
            <option value="Man">👨 Man</option>
            <option value="Kvinna">👩 Kvinna</option>
          </select>
        </label>

        <label>📌 Identifieringstyp:
          <select name="identifierType" value={form.identifierType} onChange={handleChange}>
            <option value="personnummer">🆔 Personnummer</option>
            <option value="samordningsnummer">🔢 Samordningsnummer</option>
          </select>
        </label>

        {(form.identifierType === 'personnummer' || form.identifierType === 'samordningsnummer') && (
          <label>🎂 {form.identifierType === 'personnummer' ? 'Personnummer:' : 'Samordningsnummer:'}
            <input name="personnummer" placeholder="YYMMDD-XXXX" value={form.personnummer} onChange={handleChange} onBlur={handleBlur} required />
          </label>
        )}

        <label>📱 Mobil:
          <input name="phone" value={form.phone} onChange={handleChange} onBlur={handleBlur} />
        </label>

        <label>🗣️ Språk:
          <select name="language" value={form.language} onChange={handleChange}>
            <option value="">-- Välj --</option>
            <option value="Svenska">🇸🇪 Svenska</option>
            <option value="Arabiska">🇸🇾 Arabiska</option>
            <option value="Persiska">🇮🇷 Persiska</option>
            <option value="Ryska">🇷🇺 Ryska</option>
            <option value="Annat">🌍 Annat</option>
          </select>
        </label>

        <label>🏠 Hemadress:
          <input name="address" value={form.address} onChange={handleChange} onBlur={handleBlur} />
        </label>

        <label>🍽️ Matpreferens:
          <select name="foodPreference" value={form.foodPreference} onChange={handleChange}>
            <option value="">-- Välj --</option>
            <option value="Halal">🕌 Halal</option>
            <option value="Lamm">🐑 Lamm</option>
            <option value="Fisk">🐟 Fisk</option>
            <option value="Ej skaldjur">🚫🦐 Ej skaldjur</option>
            <option value="Kyckling">🍗 Kyckling</option>
            <option value="Vegetarisk">🥗 Vegetarisk</option>
            <option value="Vegan">🌱 Vegan</option>
            <option value="Vanlig kost">🍴 Vanlig kost</option>
            <option value="Annat">❓ Annat</option>
          </select>
        </label>

        <label><input type="checkbox" name="foodAllergy" checked={form.foodAllergy} onChange={handleChange} /> 🥜 Matallergi</label>
        <label><input type="checkbox" name="petAllergy" checked={form.petAllergy} onChange={handleChange} /> 🐶 Husdjursallergi</label>

        <label>🩺 Särskilda besvär:
          <textarea name="specialNeeds" value={form.specialNeeds} onChange={handleChange} />
        </label>

        <h4>🛠️ Insatser:</h4>
        {effortsList.map((label) => (
          <div key={label}>
            <label>
              <input type="checkbox" checked={form.efforts.includes(label)} onChange={() => toggleEffort(label)} /> {label}
            </label>
            {form.efforts.includes(label) && (
              <>
                <label>🕓 Tid:
                  <input type="time" value={form.effortDetails[label]?.time || ''} onChange={(e) => handleEffortDetailChange(label, 'time', e.target.value)} />
                </label>
                <label>📆 Dagar:</label>
                {days.map(day => (
                  <label key={day}>
                    <input type="checkbox" checked={form.effortDetails[label]?.days?.includes(day) || false} onChange={() => toggleDay(label, day)} /> {day}
                  </label>
                ))}
              </>
            )}
          </div>
        ))}

        <h4>👨‍👩‍👧‍👦 Anhöriga:</h4>
        {form.relatives.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
            <input placeholder="🧭 Relation" value={r.relation} onChange={(e) => handleRelativeChange(i, 'relation', e.target.value)} />
            <input placeholder="👤 Namn" value={r.name} onChange={(e) => handleRelativeChange(i, 'name', e.target.value)} />
            <input placeholder="📞 Mobil" value={r.phone} onChange={(e) => handleRelativeChange(i, 'phone', e.target.value)} />
          </div>
        ))}

        <button type="submit" style={submitButtonBase}>✅ Registrera kund</button>
      </form>
    </div>
  );
}

export default RegisterKund;
