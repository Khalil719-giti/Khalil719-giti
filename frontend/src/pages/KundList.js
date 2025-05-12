
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function KundList() {
  const [kunder, setKunder] = useState([]);
  const [search, setSearch] = useState('');
  const [filterEffort, setFilterEffort] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterBirthYear, setFilterBirthYear] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/kunder')
      .then((res) => {
        console.log("✅ API response:", res.data);
        setKunder(res.data.data || []);
      })
      .catch((err) => {
        console.error("❌ Kunde inte hämta kunder:", err);
        setKunder([]);
      });
  }, []);

  const deleteKund = async (id) => {
    if (!window.confirm('❌ Är du säker på att du vill radera denna kund?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/kunder/${id}`);
      setKunder(prev => prev.filter(k => k._id !== id));
      alert('🗑️ Kunden har raderats.');
    } catch (err) {
      console.error('Kunde inte radera kund:', err);
      alert('❌ Fel vid borttagning av kund');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(kunder);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kunder');
    XLSX.writeFile(wb, 'kunder.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const headers = [['Namn', 'Kön', 'Födelsedatum', 'Mobil', 'Språk', 'Adress']];
    const data = kunder.map(k => [k.name, k.gender, k.birthdate, k.phone, k.language, k.address]);
    autoTable(doc, { head: headers, body: data });
    doc.save('kunder.pdf');
  };

  const filteredKunder = kunder.filter(k => {
    const matchName = k.name.toLowerCase().includes(search.toLowerCase());
    const matchEffort = !filterEffort || (k.efforts && k.efforts.includes(filterEffort));
    const matchGender = !filterGender || k.gender === filterGender;
    const matchLanguage = !filterLanguage || k.language === filterLanguage;
    const matchBirthYear = !filterBirthYear || (k.birthdate && new Date(k.birthdate).getFullYear().toString() === filterBirthYear);
    return matchName && matchEffort && matchGender && matchLanguage && matchBirthYear;
  });

  const birthYearOptions = [...new Set(kunder.map(k => k.birthdate && new Date(k.birthdate).getFullYear().toString()).filter(Boolean))];

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋 Lista över Kunder</h2>

      <button
        onClick={() => navigate('/')}
        style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
        ⬅️ Hem
      </button>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Sök namn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterEffort} onChange={(e) => setFilterEffort(e.target.value)}>
          <option value="">🔧 Filtrera på insats</option>
          {['Morgon', 'Förmiddag', 'Lunch', 'Eftermiddag', 'Kväll', 'Dusch', 'Inköp', 'Tvätt'].map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
          <option value="">⚧️ Filtrera på kön</option>
          <option value="Man">Man</option>
          <option value="Kvinna">Kvinna</option>
        </select>
        <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)}>
          <option value="">🗣️ Filtrera på språk</option>
          <option value="Svenska">Svenska</option>
          <option value="Arabiska">Arabiska</option>
          <option value="Persiska">Persiska</option>
          <option value="Ryska">Ryska</option>
          <option value="Annat">Annat</option>
        </select>
        <select value={filterBirthYear} onChange={(e) => setFilterBirthYear(e.target.value)}>
          <option value="">📅 Födelseår</option>
          {birthYearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button onClick={exportToExcel}>📋 Exportera till Excel</button>
        <button onClick={exportToPDF}>📄 Exportera till PDF</button>
      </div>

      {filteredKunder.map((kund) => (
        <div key={kund._id} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p>👵 <strong>Namn:</strong> {kund.name}</p>
          <p>🧬 <strong>Kön:</strong> {kund.gender || '–'}</p>
          <p>🆔 <strong>Typ:</strong> {kund.identifierType === 'samordningsnummer' ? 'Samordningsnummer' : 'Personnummer'}</p>
          <p>🔢 <strong>Personnummer:</strong> {kund.personnummer || '–'}</p>
          <p>📱 <strong>Mobil:</strong> {kund.phone || '–'}</p>
          <p>🗣️ <strong>Språk:</strong> {kund.language || '–'}</p>
          <p>🏡 <strong>Hemadress:</strong> {kund.address || '–'}</p>
          <p>🍽️ <strong>Matpreferens:</strong> {kund.foodPreference || '–'}</p>
          <p>🥜 <strong>Matallergi:</strong> {kund.foodAllergy ? '✔️ Ja' : '❌ Nej'}</p>
          <p>🐶 <strong>Husdjursallergi:</strong> {kund.petAllergy ? '✔️ Ja' : '❌ Nej'}</p>
          <p>🩺 <strong>Särskilda besvär:</strong> {kund.specialNeeds || '–'}</p>
          <p>🛠️ <strong>Insatser:</strong> {kund.efforts?.length > 0 ? kund.efforts.join(', ') : '–'}</p>
          <p>👨‍👩‍👧 <strong>Anhöriga:</strong></p>
          {kund.relatives?.length > 0 ? kund.relatives.map((r, i) => (
            <p key={i} style={{ marginLeft: '1rem' }}>{r.relation} – {r.name} ({r.phone})</p>
          )) : <p style={{ marginLeft: '1rem' }}>–</p>}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate(`/edit-kund/${kund._id}`)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>✏️ Redigera</button>
            <button onClick={() => deleteKund(kund._id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Radera</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KundList;
