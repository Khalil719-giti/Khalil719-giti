import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/Loader'; // Import Loader component
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  containerStyle,
  headingStyle,
  formStyle,
  primaryButtonBase,
  submitButtonBase,
} from './styles';



const localizer = momentLocalizer(moment);

const ScheduleCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true); // Added loading state

  const [hoverHome, setHoverHome] = useState(false);
  const [hoverSubmit, setHoverSubmit] = useState(false);



  const fetchSchedules = async () => {
    setLoading(true); // Start loading
    try {
      const res = await axios.get('http://localhost:5000/api/schedule');
      const schedules = res.data.map((s) => ({
        ...s,
        start: new Date(`${s.date}T${s.time}`),
        end: new Date(`${s.date}T${s.time}`),
        title: `${s.customerId?.name || 'Kund'} - ${s.staffId?.name || 'Personal'} (${s.effort})`
      }));
      setAllEvents(schedules);
      setEvents(schedules);
    } catch (err) {
      console.error('Fel vid hämtning av scheman:', err);
    }
    setLoading(false); // Stop loading
  };

  useEffect(() => {
    if (location.state?.refresh) {
      fetchSchedules();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    if (event.effort === 'Morgon') backgroundColor = '#ffe599';
    else if (event.effort === 'Förmiddag') backgroundColor = '#cfe2f3';
    else if (event.effort === 'Lunch') backgroundColor = '#b6d7a8';
    else if (event.effort === 'Eftermiddag') backgroundColor = '#f9cb9c';
    else if (event.effort === 'Kväll') backgroundColor = '#d9d2e9';
    else if (event.effort === 'Dusch') backgroundColor = '#f4cccc';
    else if (event.effort === 'Inköp') backgroundColor = '#c9daf8';
    else if (event.effort === 'Tvätt') backgroundColor = '#d0e0e3';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'black',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleFilterChange = () => {
    let filtered = allEvents;
    if (selectedCustomer) {
      filtered = filtered.filter(e => e.customerId?.name === selectedCustomer);
    }
    if (selectedStaff) {
      filtered = filtered.filter(e => e.staffId?.name === selectedStaff);
    }
    setEvents(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedCustomer, selectedStaff]);

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleSelectEvent = (event) => {
    if (view !== Views.DAY) {
      const clickedDate = new Date(event.start);
      setDate(clickedDate);
      setView(Views.DAY);
    }
  };

  const handleDoubleClickEvent = (event) => {
    const clickedDate = new Date(event.start);
    const formattedDate = clickedDate.toISOString().split('T')[0];
    navigate(`/schedule/day/${formattedDate}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>📅 Schema Kalender</h2>

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


          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <select id="customerSelect" name="customer" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
              <option value=''>Filtrera efter kund</option>
              {[...new Set(allEvents.map(e => e.customerId?.name))].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select id="staffSelect" name="staff" value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
              <option value=''>Filtrera efter personal</option>
              {[...new Set(allEvents.map(e => e.staffId?.name))].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <button
              onClick={() => navigate('/schedule/new')}
              style={{ backgroundColor: 'green', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}
            >
              ➕ Lägg till Schema
            </button>
          </div>

          <div style={{ height: '80vh' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              view={view}
              onView={handleViewChange}
              date={date}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              onDoubleClickEvent={handleDoubleClickEvent}
              messages={{
                today: 'Idag',
                previous: 'Tillbaka',
                next: 'Nästa',
                month: 'Månad',
                week: 'Vecka',
                day: 'Dag',
                agenda: 'Agenda'
              }}
              formats={{
                timeGutterFormat: (date, culture, localizer) =>
                  localizer.format(date, 'HH:mm', culture),
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                  `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleCalendar;
