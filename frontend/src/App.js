import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import KundList from './pages/KundList';
import RegisterKund from './pages/RegisterKund';
import RegisterStaff from './pages/RegisterStaff';
import PersonalList from './pages/PersonalList';
import EditKund from './pages/EditKund';
import EditPersonal from './pages/EditPersonal';
import ScheduleCalendar from './pages/ScheduleCalendar';
import ScheduleForm from './pages/ScheduleForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DayPage from './pages/DayPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kunder" element={<KundList />} />
        <Route path="/register-kund" element={<RegisterKund />} />
        <Route path="/staff" element={<PersonalList />} />
        <Route path="/register-personal" element={<RegisterStaff />} />
        <Route path="/edit-kund/:id" element={<EditKund />} />
        <Route path="/edit-personal/:id" element={<EditPersonal />} />
        <Route path="/schedule" element={<ScheduleCalendar />} />
        <Route path="/schedule/new" element={<ScheduleForm />} />
        <Route path="/edit-schedule/:id" element={<ScheduleForm />} />
        <Route path="/schedule/day/:date" element={<DayPage />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;