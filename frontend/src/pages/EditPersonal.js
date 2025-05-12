import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validatePersonnummer, validateSamordningsnummer } from './validatePersonnummer';

function EditPersonal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/staff/${id}`).then((res) => {
      setForm({
        ...res.data,
        identifierType: res.data.personnummer && parseInt(res.data.personnummer.slice(4, 6), 10) > 60
          ? 'samordningsnummer'
          : 'personnummer',
        personnummer: res.data.personnummer,
        samordningsnummer: res.data.personnummer
      });
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
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
      await axios.put(`http://localhost:5000/api/staff/${id}`, payload);
      setSuccessMsg('✅ Uppdaterad personal!');
      setTimeout(() => navigate('/staff'), 1500);
    } catch (err) {
      console.error(err);
      alert('Något gick fel vid uppdatering.');
    }
  };

  if (!form) return <div style={{ textAlign: 'center', paddingTop: '2rem' }}>⏳ Laddar data...</div>;

  return (
    <div style={{ maxWidth: '650px', margin: 'auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '1rem' }}>✏️ Redigera Personal</h2>
      {successMsg && <div style={{ color: 'green', textAlign: 'center' }}>{successMsg}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>👤 Namn:
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>📌 Identifieringstyp:
          <select name="identifierType" value={form.identifierType} onChange={handleChange}>
            <option value="personnummer">Personnummer</option>
            <option value="samordningsnummer">Samordningsnummer</option>
          </select>
        </label>

        {form.identifierType === 'personnummer' && (
          <label>🆔 Personnummer:
            <input name="personnummer" value={form.personnummer} onChange={handleChange} required />
          </label>
        )}

        {form.identifierType === 'samordningsnummer' && (
          <label>🆔 Samordningsnummer:
            <input name="samordningsnummer" value={form.samordningsnummer} onChange={handleChange} required />
          </label>
        )}

        <label>⚧️ Kön:
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">-- Välj --</option>
            <option value="Man">Man</option>
            <option value="Kvinna">Kvinna</option>
          </select>
        </label>

        <label>📱 Mobilnummer:
          <input name="phone" value={form.phone || ''} onChange={handleChange} />
        </label>

        <label>💼 Anställningsstatus:
          <select name="employmentStatus" value={form.employmentStatus || ''} onChange={handleChange}>
            <option value="">-- Välj --</option>
            <option value="Heltid">Heltid</option>
            <option value="Timanställd vid behov">Timanställd vid behov</option>
          </select>
        </label>

        <label>🚗 Körkort:
          <input type="checkbox" name="driversLicense" checked={form.driversLicense || false} onChange={handleChange} />
        </label>

        <label>🗣️ Språk:
          <input name="languages" value={form.languages?.join(', ') || ''} onChange={(e) => setForm({ ...form, languages: e.target.value.split(',').map(s => s.trim()) })} />
        </label>

        <label>🏠 Adress:
          <input name="address" value={form.address} onChange={handleChange} />
        </label>

        <button type="submit" style={{ background: '#28a745', color: 'white', padding: '0.6rem', border: 'none', borderRadius: '6px' }}>✅ Spara</button>
        <button type="button" onClick={() => navigate('/staff')} style={{ background: '#ccc', padding: '0.5rem', border: 'none', borderRadius: '5px' }}>🔙 Tillbaka</button>
      </form>
    </div>
  );
}

export default EditPersonal;
