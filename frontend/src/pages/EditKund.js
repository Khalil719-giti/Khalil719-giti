import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatPhoneNumber, formatAddress, formatPersonnummer } from '../utils/format';

const effortOptions = {
  Morgon: '07:00',
  Förmiddag: '10:00',
  Lunch: '12:00',
  Eftermiddag: '15:00',
  Kväll: '19:00',
  Dusch: '08:30',
  Inköp: '14:00',
  Tvätt: '16:00'
};

const weekdays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

function EditKund() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    personnummer: '',
    identifierType: 'personnummer',
    phone: '',
    language: '',
    address: '',
    foodPreference: '',
    foodAllergy: false,
    petAllergy: false,
    specialNeeds: '',
    efforts: [],
    relatives: [],
    effortDetails: []
  });
  const [pnError, setPnError] = useState('');
  const [effortTouched, setEffortTouched] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/kunder/${id}`).then((res) => {
      const data = res.data;
      const pn = data.personnummer || '';
      const cleanPn = pn.replace(/[- ]/g, '');
      const base = cleanPn.length === 12 ? cleanPn.slice(2, 10) : cleanPn.slice(0, 6);
      const dayPart = parseInt(base.slice(4, 6), 10);
      const identifierType = dayPart >= 61 && dayPart <= 91 ? 'samordningsnummer' : 'personnummer';

      const details = Array.isArray(data.effortDetails)
        ? data.effortDetails
        : typeof data.effortDetails === 'object' && data.effortDetails !== null
          ? Object.entries(data.effortDetails).map(([key, val]) => ({ time: key, ...val }))
          : [];

      setForm({
        ...data,
        identifierType,
        efforts: data.efforts || [],
        relatives: data.relatives || [],
        effortDetails: details
      });

      setEffortTouched(details.map(() => false));
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'personnummer') {
      validatePersonnummer(value);
    }
  };

  const validatePersonnummer = (pn) => {
    const cleanPn = pn.replace(/[- ]/g, '');
    const validFormat = /^\d{10}$|^\d{12}$/.test(cleanPn);
    if (!validFormat) {
      setPnError('❌ Ogiltigt format: 10 eller 12 siffror förväntas.');
    } else {
      setPnError('');
    }
  };

  const handleIdentifierTypeChange = (e) => {
    setForm((prev) => ({ ...prev, identifierType: e.target.value }));
  };

  const handleRelativeChange = (index, field, value) => {
    const updated = [...form.relatives];
    updated[index][field] = value;
    setForm({ ...form, relatives: updated });
  };

  const addRelative = () => {
    setForm((prev) => ({
      ...prev,
      relatives: [...prev.relatives, { name: '', relation: '', phone: '' }]
    }));
  };

  const removeRelative = (index) => {
    const updated = [...form.relatives];
    updated.splice(index, 1);
    setForm({ ...form, relatives: updated });
  };

  const addEffortDetail = () => {
    setForm((prev) => ({
      ...prev,
      effortDetails: [...prev.effortDetails, { time: 'Morgon', clock: effortOptions['Morgon'], days: [] }]
    }));
    setEffortTouched(prev => [...prev, false]);
  };

  const updateEffortDetail = (index, field, value) => {
    const updated = [...form.effortDetails];
    if (field === 'time') {
      updated[index][field] = value;
      if (!effortTouched[index]) {
        updated[index].clock = effortOptions[value];
      }
    } else {
      updated[index][field] = value;
      if (field === 'clock') {
        const touchedClone = [...effortTouched];
        touchedClone[index] = true;
        setEffortTouched(touchedClone);
      }
    }
    setForm({ ...form, effortDetails: updated });
  };

  const toggleEffortDay = (index, day) => {
    const updated = [...form.effortDetails];
    const days = updated[index].days.includes(day)
      ? updated[index].days.filter(d => d !== day)
      : [...updated[index].days, day];
    updated[index].days = days;
    setForm({ ...form, effortDetails: updated });
  };

  const removeEffortDetail = (index) => {
    const updated = [...form.effortDetails];
    const touched = [...effortTouched];
    updated.splice(index, 1);
    touched.splice(index, 1);
    setForm({ ...form, effortDetails: updated });
    setEffortTouched(touched);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert effortDetails array to object
    const effortDetailsObject = {};
    form.effortDetails.forEach(eff => {
      effortDetailsObject[eff.time] = {
        time: eff.time,
        clock: eff.clock,
        days: eff.days
      };
    });

    const formatted = {
      ...form,
      phone: formatPhoneNumber(form.phone || ''),
      address: formatAddress(form.address || ''),
      personnummer: formatPersonnummer(form.personnummer || ''),
      effortDetails: effortDetailsObject
    };

    try {
      await axios.put(`http://localhost:5000/api/kunder/${id}`, formatted);
      navigate('/kunder');
    } catch (err) {
      console.error('Kunde inte uppdatera kund:', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>✏️ Redigera Kund</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>👵 Namn: <input name="name" value={form.name} onChange={handleChange} /></label>

        <label>🔢 Identifieringstyp:
          <select value={form.identifierType} onChange={handleIdentifierTypeChange}>
            <option value="personnummer">Personnummer</option>
            <option value="samordningsnummer">Samordningsnummer</option>
          </select>
        </label>

        <label>🆔 {form.identifierType === 'samordningsnummer' ? 'Samordningsnummer' : 'Personnummer'}:
          <input name="personnummer" value={form.personnummer} onChange={handleChange} />
        </label>
        {pnError && <span style={{ color: 'red' }}>{pnError}</span>}

        <label>📱 Mobilnummer: <input name="phone" value={form.phone} onChange={handleChange} /></label>
        <label>🗣️ Språk: <input name="language" value={form.language} onChange={handleChange} /></label>
        <label>🏡 Adress: <input name="address" value={form.address} onChange={handleChange} /></label>
        <label>🍽️ Matpreferens: <input name="foodPreference" value={form.foodPreference} onChange={handleChange} /></label>
        <label>🥜 Matallergi: <input type="checkbox" name="foodAllergy" checked={form.foodAllergy} onChange={handleChange} /></label>
        <label>🐶 Husdjursallergi: <input type="checkbox" name="petAllergy" checked={form.petAllergy} onChange={handleChange} /></label>
        <label>🩺 Särskilda besvär: <input name="specialNeeds" value={form.specialNeeds} onChange={handleChange} /></label>

        <div>
          <h4>🛠️ Insatsdetaljer:</h4>
          {Array.isArray(form.effortDetails) && form.effortDetails.map((effort, i) => (
            <div key={i} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '5px' }}>
              <label>Tid på dagen:
                <select value={effort.time} onChange={(e) => updateEffortDetail(i, 'time', e.target.value)}>
                  {Object.keys(effortOptions).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              <label style={{ marginLeft: '1rem' }}>🕒 Klockslag:
                <input
                  type="time"
                  value={effort.clock || effortOptions[effort.time] || '07:00'}
                  onChange={(e) => updateEffortDetail(i, 'clock', e.target.value)}
                />
              </label>
              <div style={{ marginTop: '0.5rem' }}>
                {weekdays.map(day => (
                  <label key={day} style={{ marginRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={effort.days.includes(day)}
                      onChange={() => toggleEffortDay(i, day)}
                    /> {day}
                  </label>
                ))}
              </div>
              <button type="button" onClick={() => removeEffortDetail(i)} style={{ marginTop: '0.5rem' }}>❌ Ta bort insats</button>
            </div>
          ))}
          <button type="button" onClick={addEffortDetail}>➕ Lägg till ny insats</button>
        </div>

        <div>
          <h4>👨‍👩‍👧 Anhöriga:</h4>
          {form.relatives.map((rel, i) => (
            <div key={i}>
              <input placeholder="Relation" value={rel.relation} onChange={(e) => handleRelativeChange(i, 'relation', e.target.value)} />
              <input placeholder="Namn" value={rel.name} onChange={(e) => handleRelativeChange(i, 'name', e.target.value)} />
              <input placeholder="Mobil" value={rel.phone} onChange={(e) => handleRelativeChange(i, 'phone', e.target.value)} />
              <button type="button" onClick={() => removeRelative(i)}>❌</button>
            </div>
          ))}
          <button type="button" onClick={addRelative}>➕ Lägg till anhörig</button>
        </div>

        <div>
          <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', padding: '0.5rem 1rem', borderRadius: '5px', border: 'none' }}>
            💾 Spara
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditKund;
