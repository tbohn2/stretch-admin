import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Calendar from './pages/Calendar'
import Clients from './pages/Clients'
import './App.css'

function App() {
  const [calendarChecked, setCalendarChecked] = useState(true)
  const [clientsChecked, setClientsChecked] = useState(false)

  useEffect(() => {
    if (window.location.pathname === '/calendar') {
      setCalendarChecked(true)
      setClientsChecked(false)
    } else if (window.location.pathname === '/clients') {
      setCalendarChecked(false)
      setClientsChecked(true)
    }
  })

  return (
    <Router>
      <div className='blueBG vh-100 col-12 d-flex justify-content-center align-items-center'>
        <div className='cloudBG'>
          <nav className='d-flex justify-content-evenly align-items-center'>
            <Link to='/calendar' className='text-light' onClick={setCalendarChecked}>
              <input type="radio" class="" name="navOptions" id="option1" checked={calendarChecked} ></input>
              <label class="text-light" for="option1">CALENDAR</label>
            </Link>
            <Link to='/clients' className='text-light' onClick={setClientsChecked}>
              <input type="radio" class="" name="navOptions" id="option2" checked={clientsChecked}></input>
              <label class="text-light" for="option2">CLIENTS</label>
            </Link>
          </nav>
          <Routes>
            <Route exact path='/' element={<Calendar />} />
            <Route exact path='/calendar' element={<Calendar />} />
            <Route exact path='/clients' element={<Clients />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
