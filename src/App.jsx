import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CalendarDisplay from './pages/Calendar';
import Clients from './pages/Clients';
import Login from './pages/Login';
import auth from './utils/auth';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(auth.loggedIn());
  const [calendarChecked, setCalendarChecked] = useState(true);
  const [clientsChecked, setClientsChecked] = useState(false);

  const handleCalendarClick = () => {
    setCalendarChecked(true);
    setClientsChecked(false);
  };

  const handleClientsClick = () => {
    setCalendarChecked(false);
    setClientsChecked(true);
  };

  return (
    <Router>
      <div className='blueBG vh-100 col-12 d-flex justify-content-center align-items-center'>
        {loggedIn ?
          <div className='cloudBG'>
            <nav className='d-flex justify-content-evenly align-items-center'>
              <Link to='/calendar' className='text-light' onClick={handleCalendarClick}>
                <input type="radio" className="" name="navOptions" id="option1" checked={calendarChecked} />
                <label className="text-light" htmlFor="option1">CALENDAR</label>
              </Link>
              <Link to='/clients' className='text-light' onClick={handleClientsClick}>
                <input type="radio" className="" name="navOptions" id="option2" checked={clientsChecked} />
                <label className="text-light" htmlFor="option2">CLIENTS</label>
              </Link>
            </nav>
            <Routes>
              <Route exact path='/' element={<CalendarDisplay />} />
              <Route exact path='/calendar' element={<CalendarDisplay />} />
              <Route exact path='/clients' element={<Clients />} />
            </Routes>
          </div>
          :
          <Login />
        }
      </div>
    </Router>
  );
}

export default App;
