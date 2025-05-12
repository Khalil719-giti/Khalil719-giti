// ScheduleForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  primaryButtonBase,
} from './styles';

function ScheduleForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // used for editing ✏️
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const prefilledDate = queryParams.get('date');

  const [form, setForm] = useState({
    customerId: '',
    staffId: '',
    date: prefilledDate || '',
    time: '',
    effort: '',
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [hoverHome, setHoverHome] = useState(false);

  useEffect(() => {
    // Load customers and staff 📥
    axios.get('http://localhost:5000/api/kunder').then(res => setCustomers(res.data));
    axios.get('http://localhost:5000/api/staff').then(res => setStaff(res.data));

    if (id) {
      // Load existing schedule 📄
      axios.get(`http://localhost:5000/api/schedule/${id}`)
        .then(res => {
          const sched = res.data;
          setForm({
            customerId: sched.customerId?._id || sched.customerId,
            staffId: sched.staffId?._id || sched.staffId,
            date: sched.date,
            time: sched.time,
            effort: sched.effort,
            notes: sched.notes || ''
          });
        })
        .catch(err => {
          toast.error('❌ Kunde inte ladda schema');
          console.error(err);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/schedule/${id}`, form);
        toast.success('✅ Schema uppdaterat!');
      } else {
        await axios.post('http://localhost:5000/api/schedule', form);
        toast.success('✅ Schema skapat!');
      }
      setTimeout(() => navigate('/schedule'), 1500);
    } catch (err) {
      toast.error('❌ Något gick fel.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {id ? '✏️ Redigera Schema' : '📅 Skapa Nytt Schema'}
      </h2>

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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>👤 Kund:
          <select name="customerId" value={form.customerId} onChange={handleChange} required>
            <option value=''>-- Välj kund --</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>

        <label>👷 Personal:
          <select name="staffId" value={form.staffId} onChange={handleChange} required>
            <option value=''>-- Välj personal --</option>
            {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </label>

        <label>📆 Datum:
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </label>

        <label>⏰ Klockslag:
          <input type="time" name="time" value={form.time} onChange={handleChange} required />
        </label>

        <label>🛠️ Insats:
          <select name="effort" value={form.effort} onChange={handleChange} required>
            <option value=''>-- Välj insats --</option>
            <option value="Morgon">🌅 Morgon</option>
            <option value="Förmiddag">☀️ Förmiddag</option>
            <option value="Lunch">🍽️ Lunch</option>
            <option value="Eftermiddag">🌇 Eftermiddag</option>
            <option value="Kväll">🌙 Kväll</option>
            <option value="Dusch">🚿 Dusch</option>
            <option value="Inköp">🛒 Inköp</option>
            <option value="Tvätt">🧺 Tvätt</option>
          </select>
        </label>

        <label>📝 Anteckningar:
          <textarea name="notes" value={form.notes} onChange={handleChange} />
        </label>

        <button type="submit" style={{ backgroundColor: 'green', color: 'white', padding: '0.8rem' }}>
          💾 {id ? 'Spara Ändringar' : 'Skapa Schema'}
        </button>

        <button type="button" onClick={() => navigate('/schedule')} style={{ padding: '0.6rem', backgroundColor: '#ccc' }}>
          ⬅️ Tillbaka
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default ScheduleForm;
