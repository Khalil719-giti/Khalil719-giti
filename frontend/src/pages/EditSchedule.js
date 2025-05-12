import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  containerStyle,
  headingStyle,
  formStyle,
  primaryButtonBase,
  submitButtonBase,
} from './styles';

const EditSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [hoverHome, setHoverHome] = useState(false);
  const [hoverSubmit, setHoverSubmit] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load specific schedule
        const res = await axios.get(`http://localhost:5000/api/schedule/${id}`);
        setSchedule(res.data);

        // Load customers and staff for dropdowns
        const customersRes = await axios.get('http://localhost:5000/api/kunder');
        setCustomers(customersRes.data);

        const staffRes = await axios.get('http://localhost:5000/api/staff');
        setStaffList(staffRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('❌ Kunde inte ladda schemainformation.');
      }
    };

    fetchData();
  }, [id]);

  if (!schedule) return <div style={{ padding: '2rem' }}>⏳ Laddar schemat...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/schedule/${id}`, {
        customerId: schedule.customerId._id || schedule.customerId,
        staffId: schedule.staffId._id || schedule.staffId,
        date: schedule.date,
        time: schedule.time,
        effort: schedule.effort,
        notes: schedule.notes
      });
      toast.success('✅ Schema uppdaterat!');
      navigate('/schedule'); // Go back to calendar after saving
    } catch (err) {
      console.error(err);
      toast.error('❌ Kunde inte uppdatera schemat.');
    }
  };

  const handleChange = (e) => {
    setSchedule({ ...schedule, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>✏️ Redigera Schema</h2>

      <button
        onClick={() => navigate('/')}
        style={{
          ...primaryButtonBase,
          backgroundColor: hoverHome ? '#0056b3' : '#007bff',
          marginBottom: '1rem'
        }}
        onMouseEnter={() => setHoverHome(true)}
        onMouseLeave={() => setHoverHome(false)}
      >
        ⬅️ Hem
      </button>



      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Kund:</label>
          <select
            name="customerId"
            value={schedule.customerId._id || schedule.customerId}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Personal:</label>
          <select
            name="staffId"
            value={schedule.staffId._id || schedule.staffId}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            {staffList.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Datum:</label>
          <input
            type="date"
            name="date"
            value={schedule.date}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Tid:</label>
          <input
            type="time"
            name="time"
            value={schedule.time}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Typ:</label>
          <select
            name="effort"
            value={schedule.effort}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="Morgon">Morgon</option>
            <option value="Förmiddag">Förmiddag</option>
            <option value="Lunch">Lunch</option>
            <option value="Eftermiddag">Eftermiddag</option>
            <option value="Kväll">Kväll</option>
            <option value="Dusch">Dusch</option>
            <option value="Inköp">Inköp</option>
            <option value="Tvätt">Tvätt</option>
          </select>
        </div>

        
        <div style={{ marginBottom: '1rem' }}>
          <label>Anteckningar:</label>
          <textarea
            name="notes"
            value={schedule.notes || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button
          type="submit"
          style={{ width: '100%', backgroundColor: 'green', color: 'white', padding: '0.7rem', border: 'none', borderRadius: '5px', fontSize: '1rem' }}
        >
          💾 Spara Ändringar
        </button>
      </form>
    </div>
  );
};

export default EditSchedule;
