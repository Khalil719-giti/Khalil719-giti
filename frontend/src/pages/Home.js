import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🗓️ Schemaläggningssystem</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={() => navigate('/register-personal')}
          style={buttonStyle}
        >
          👷‍♀️ Registrera Personal
        </button>

        <button
          onClick={() => navigate('/register-kund')}
          style={buttonStyle}
        >
          🧓 Registrera Kund
        </button>

        <button
          onClick={() => navigate('/kunder')}
          style={buttonStyle}
        >
          📋 Visa Kunder
        </button>

        <button
          onClick={() => navigate('/staff')}
          style={buttonStyle}
        >
          📋 Visa Personal
        </button>


        <button
          onClick={() => navigate('/schedule')}
          style={buttonStyle}
        >
          📅 Gå till Schemaläggning
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '0.6rem 1rem',
  fontSize: '1rem',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#007bff',
  color: 'white',
  cursor: 'pointer'
};

export default Home;
