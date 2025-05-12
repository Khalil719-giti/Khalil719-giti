import React, { useEffect, useState } from 'react'
import axios from 'axios'

function ShiftList() {
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [kunder, setKunder] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchShifts()
    axios.get('http://localhost:5000/api/kunder')
      .then(res => setKunder(res.data))
    axios.get('http://localhost:5000/api/employees')
      .then(res => setEmployees(res.data))
  }, [])

  const fetchShifts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/shifts')
      setShifts(res.data)
    } catch (err) {
      console.error('Failed to fetch shifts:', err)
    }
  }

  const deleteShift = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await axios.delete(`http://localhost:5000/api/shifts/${id}`)
        setShifts(shifts.filter(shift => shift._id !== id))
      } catch (err) {
        console.error('Failed to delete shift:', err)
        alert('Error deleting shift.')
      }
    }
  }

  const startEditing = (shift) => {
    setEditingId(shift._id)
    setEditForm({
      employeeName: shift.employeeName,
      kundId: shift.kundId,
      date: shift.date.slice(0, 10),
      startTime: shift.startTime,
      endTime: shift.endTime
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/shifts/${id}`, editForm)
      setEditingId(null)
      setEditForm({})
      fetchShifts()
    } catch (err) {
      console.error('Failed to update shift:', err)
      alert('Error updating shift.')
    }
  }

  const getKundName = (id) => {
    const kund = kunder.find(k => k._id === id)
    return kund ? kund.name : 'Unknown Kund'
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Saved Shifts</h2>
      <ul>
        {shifts.map((shift) => (
          <li key={shift._id} style={{ marginBottom: '1rem' }}>
            {editingId === shift._id ? (
              <>
                <input
                  name="employeeName"
                  value={editForm.employeeName}
                  onChange={handleEditChange}
                  required
                />
                <select name="kundId" value={editForm.kundId} onChange={handleEditChange}>
                  {kunder.map(k => (
                    <option key={k._id} value={k._id}>{k.name}</option>
                  ))}
                </select>
                <input
                  name="date"
                  type="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                />
                <input
                  name="startTime"
                  type="time"
                  value={editForm.startTime}
                  onChange={handleEditChange}
                  required
                />
                <input
                  name="endTime"
                  type="time"
                  value={editForm.endTime}
                  onChange={handleEditChange}
                  required
                />
                <button onClick={() => saveEdit(shift._id)}>💾 Save</button>
                <button onClick={cancelEdit}>✖ Cancel</button>
              </>
            ) : (
              <>
                <strong>{shift.employeeName}</strong> – {new Date(shift.date).toLocaleDateString()} | {shift.startTime} to {shift.endTime}  
                <br />
                🧓 Kund: <strong>{getKundName(shift.kundId)}</strong>
                <br />
                <button onClick={() => startEditing(shift)} style={{ marginRight: '0.5rem' }}>✏️ Edit</button>
                <button onClick={() => deleteShift(shift._id)} style={{ color: 'red' }}>🗑 Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ShiftList
