import { useState, useEffect } from 'react';
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
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setMobile(true);
    }
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        setMobile(true);
      } else {
        setMobile(false);
      }
    });
  }, []);

  const handleCalendarClick = () => {
    setCalendarChecked(true);
    setClientsChecked(false);
  };

  const handleClientsClick = () => {
    setCalendarChecked(false);
    setClientsChecked(true);
  };

  const handleLogout = () => {
    auth.logout();
    setLoggedIn(false);
  }

  return (
    <Router basename='/stretch-admin'>
      <div className='BG col-12 min-vh-100'>
        {loggedIn ?
          <div className='col-12'>
            <header className='mb-5 d-flex justify-content-end'>
              <nav className='col-4 d-flex justify-content-evenly align-items-center'>
                <Link to='/calendar' onClick={handleCalendarClick}>
                  <input type="radio" className="" name="navOptions" id="option1" checked={calendarChecked} />
                  <label htmlFor="option1">calendar</label>
                </Link>
                <Link to='/clients' onClick={handleClientsClick}>
                  <input type="radio" className="" name="navOptions" id="option2" checked={clientsChecked} />
                  <label htmlFor="option2">clients</label>
                </Link>
                <button className='logout-btn' onClick={() => handleLogout()}>logout</button>
              </nav>
            </header>
            <Routes>
              <Route exact path='/' element={<CalendarDisplay mobile={mobile} />} />
              <Route exact path='/calendar' element={<CalendarDisplay mobile={mobile} />} />
              <Route exact path='/clients' element={<Clients />} />
            </Routes>
          </div>
          :
          <Login setLoggedIn={setLoggedIn} />
        }
      </div>
    </Router>
  );
}

export default App;
