import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DayPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [daySchedules, setDaySchedules] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    const fetchDaySchedules = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/schedule');
        const filtered = res.data.filter(schedule => schedule.date === date);
        setDaySchedules(filtered);
      } catch (err) {
        console.error('Error fetching day schedules:', err);
        toast.error('❌ Kunde inte hämta dagens scheman.');
      }
    };

    fetchDaySchedules();
  }, [date]);

  const handleEdit = (id) => {
    navigate(`/edit-schedule/${id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Är du säker på att du vill ta bort detta schema?')) {
      try {
        await axios.delete(`http://localhost:5000/api/schedule/${id}`);
        setDaySchedules(daySchedules.filter(s => s._id !== id));
        toast.success('✅ Schema raderat!');
      } catch (err) {
        console.error(err);
        toast.error('❌ Kunde inte radera schemat.');
      }
    }
  };

  const filteredSchedules = daySchedules.filter(schedule =>
    (!selectedCustomer || schedule.customerId?.name === selectedCustomer) &&
    (!selectedStaff || schedule.staffId?.name === selectedStaff)
  ).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>📅 Scheman för {date}</h2>

      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <button
          onClick={() => navigate(`/schedule/new?date=${date}`)}
          style={{ backgroundColor: 'green', color: 'white', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '5px', fontSize: '1rem' }}
        >
          ➕ Lägg till nytt schema
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value=''>Filtrera efter kund</option>
          {[...new Set(daySchedules.map(s => s.customerId?.name))]
            .filter(name => name)
            .sort()
            .map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
        </select>

        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value=''>Filtrera efter personal</option>
          {[...new Set(daySchedules.map(s => s.staffId?.name))]
            .filter(name => name)
            .sort()
            .map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
        </select>
      </div>

      {filteredSchedules.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Ingen data för detta datum.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>Tid</th>
              <th style={thStyle}>Kund</th>
              <th style={thStyle}>Personal</th>
              <th style={thStyle}>Typ</th>
              <th style={thStyle}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map(schedule => (
              <tr
                key={schedule._id}
                style={{ ...rowStyle }}
                onClick={() => handleEdit(schedule._id)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <td style={tdStyle}>{schedule.time}</td>
                <td style={tdStyle}>{schedule.customerId?.name || 'Okänd Kund'}</td>
                <td style={tdStyle}>{schedule.staffId?.name || 'Okänd Personal'}</td>
                <td style={tdStyle}>{schedule.effort}</td>
                <td style={tdStyle}>
                  <button onClick={(e) => handleEdit(schedule._id)} style={editButtonStyle}>✏️</button>
                  <button onClick={(e) => handleDelete(schedule._id, e)} style={deleteButtonStyle}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/schedule')}
          style={{ backgroundColor: '#3174ad', color: 'white', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '5px', fontSize: '1rem' }}
        >
          🔙 Tillbaka till Kalender
        </button>
      </div>
    </div>
  );
};

const thStyle = {
  padding: '10px',
  textAlign: 'left'
};

const tdStyle = {
  padding: '10px'
};

const rowStyle = {
  borderBottom: '1px solid #ccc',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};

const editButtonStyle = {
  marginRight: '0.5rem',
  backgroundColor: 'green',
  color: 'white',
  border: 'none',
  padding: '0.4rem 0.8rem',
  borderRadius: '5px',
  cursor: 'pointer'
};

const deleteButtonStyle = {
  backgroundColor: 'red',
  color: 'white',
  border: 'none',
  padding: '0.4rem 0.8rem',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default DayPage;
