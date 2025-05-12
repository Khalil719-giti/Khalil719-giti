import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

function ShiftForm() {
  const [form, setForm] = useState({
    employeeName: '',
    kundId: '',
    date: '',
    startTime: '',
    endTime: ''
  })

  const [employees, setEmployees] = useState([])
  const [kunder, setKunder] = useState([])

  useEffect(() => {
    axios.get('http://localhost:5000/api/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error('Failed to load employees:', err))

    axios.get('http://localhost:5000/api/kunder')
      .then(res => setKunder(res.data))
      .catch(err => console.error('Failed to load kunder:', err))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().slice(0, 10)
    setForm({ ...form, date: formattedDate })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/shifts', form)
      alert('Shift saved!')
      setForm({ employeeName: '', kundId: '', date: '', startTime: '', endTime: '' })
    } catch (err) {
      alert('Something went wrong.')
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create a Shift</h2>

      {/* Staff Selector */}
      <select
        name="employeeName"
        onChange={handleChange}
        value={form.employeeName}
        required
      >
        <option value="">-- Select Staff --</option>
        {employees.map(emp => (
          <option key={emp._id} value={emp.name}>
            {emp.name}
          </option>
        ))}
      </select>

      {/* Kund Selector */}
      <select
        name="kundId"
        onChange={handleChange}
        value={form.kundId}
        required
      >
        <option value="">-- Select Kund --</option>
        {kunder.map(kund => (
          <option key={kund._id} value={kund._id}>
            {kund.name}
          </option>
        ))}
      </select>

      {/* Date */}
      <DatePicker
        selected={form.date ? new Date(form.date) : null}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="Select Date"
        required
      />

      {/* Time */}
      <input
        name="startTime"
        type="time"
        onChange={handleChange}
        value={form.startTime}
        required
      />
      <input
        name="endTime"
        type="time"
        onChange={handleChange}
        value={form.endTime}
        required
      />

      <button type="submit">Save Shift</button>
    </form>
  )
}

export default ShiftForm
