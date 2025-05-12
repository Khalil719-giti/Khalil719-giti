import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PersonalList() {
  const [personal, setPersonal] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/staff')
      .then((res) => setPersonal(res.data))
      .catch((err) => console.error('Kunde inte hämta personal:', err));
  }, []);

  const deletePersonal = async (id) => {
    if (window.confirm('Är du säker på att du vill radera personalen?')) {
      await axios.delete(`http://localhost:5000/api/staff/${id}`);
      setPersonal(personal.filter(p => p._id !== id));
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.2rem', marginBottom: '2rem', textAlign: 'center' }}>👥 Lista över Personal</h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          ⬅️ Hem
        </button>
      </div>

      {personal.length === 0 ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic' }}>Ingen personal hittades.</p>
      ) : (
        personal.map((person) => (
          <div
            key={person._id}
            style={{
              background: '#f4f4f4',
              borderRadius: '10px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <p>🧑‍⚕️ <strong>Namn:</strong> {person.name}</p>
            <p>💼 <strong>Yrke:</strong> {person.role}</p>
            <p>🆔 <strong>{person.identifierType === 'samordningsnummer' ? 'Samordningsnummer' : 'Personnummer'}:</strong> {person.personnummer || '–'}</p>
            <p>🧬 <strong>Kön:</strong> {person.gender || '–'}</p>
            <p>📱 <strong>Mobilnummer:</strong> {person.phone || '–'}</p>
            <p>📋 <strong>Status:</strong> {person.employmentStatus || '–'}</p>
            <p>🗣️ <strong>Språk:</strong> {person.languages?.length ? person.languages.join(', ') : '–'}</p>
            <p>🚗 <strong>Körkort:</strong> {person.driversLicense ? '✔️ Ja' : '❌ Nej'}</p>
            <p>🏡 <strong>Adress:</strong> {person.address || '–'}</p>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate(`/edit-personal/${person._id}`)}
                style={{
                  backgroundColor: '#ffc107',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ✏️ Redigera
              </button>
              <button
                onClick={() => deletePersonal(person._id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Radera
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PersonalList;
