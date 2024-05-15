import { Calendar } from 'node-calendar';
import React, { useState, useEffect } from 'react';
import CalendarModal from '../Components/CalendarModal';
import NewApptsModal from '../Components/NewApptsModal';

function CalendarDisplay() {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const currentDate = new Date().getDate();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [displayDate, setDisplayDate] = useState(currentDate);
    const [displayMonth, setDisplayMonth] = useState(currentMonth);
    const [displayYear, setDisplayYear] = useState(currentYear);
    const [displayDates, setdisplayDates] = useState(new calendar.Calendar(6).monthdayscalendar(displayYear, displayMonth));
    const [appointments, setAppointments] = useState([]);
    const [dayAppts, setDayAppts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function getAppointments() {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`https://tbohn2-001-site1.ctempurl.com/api/apptsInMonth/${displayMonth}/${displayYear}`);
            const data = await response.json();
            setLoading(false);
            if (response.ok) { setAppointments(data) }
            if (!response.ok) { setError(data) }
        } catch (error) {
            console.error(error);
            setLoading(false);
            setError('An error occurred while making request. Please try again later.');
        }
    }

    useEffect(() => {
        getAppointments();
        setdisplayDates(new calendar.Calendar(6).monthdayscalendar(displayYear, displayMonth));
    }, [displayMonth, displayYear]);


    const handlePrevClick = () => {
        if (displayMonth === 1) {
            const prevYear = displayYear - 1;
            setDisplayMonth(12);
            setDisplayYear(prevYear);
        }
        else {
            const prevMonth = displayMonth - 1;
            setDisplayMonth(prevMonth);
        }
    }

    const handleNextClick = () => {
        if (displayMonth === 12) {
            const nextYear = displayYear + 1;
            setDisplayMonth(1);
            setDisplayYear(nextYear);
        }
        else {
            const nextMonth = displayMonth + 1;
            setDisplayMonth(nextMonth);
        }
    }


    return (
        <div className='col-12 my-3 text-light d-flex flex-column align-items-center'>
            <div id="calendar" className="col-11 col-md-8 d-flex flex-column align-items-center">
                <div id="calendar-header" className="col-12 d-flex justify-content-between align-items-center my-3">
                    <button id="prev" className="monthNavBtn custom-btn" onClick={handlePrevClick}>Prev</button>
                    <h1 id="month-year" className="fw-light">{months[displayMonth - 1]} {displayYear}</h1>
                    <button id="next" className="monthNavBtn custom-btn" onClick={handleNextClick}>Next</button>
                </div>
                {loading && <div className="spinner-border" role="status"></div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <div id="calendar-body" className='col-12'>
                    <div id="calendar-weekdays" className="d-flex justify-content-between">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div id="calendar-dates" className="d-flex flex-column border">
                        {displayDates.map((week, index) => {
                            return (
                                <div className="d-flex">
                                    {week.map((date, index) => {
                                        const apptsForDay = appointments.filter(appt => new Date(appt.DateTime).getDate() === date)
                                            .sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
                                        let numberDisplay
                                        let pastDate = false
                                        if (date === 0) { numberDisplay = '' }
                                        else { numberDisplay = date }
                                        if (date < currentDate && displayMonth === currentMonth && displayYear === currentYear || displayMonth < currentMonth && displayYear === currentYear || displayYear < currentYear) {
                                            pastDate = true
                                        }
                                        return (
                                            <div className={`px-1 d-flex flex-column align-items-center date ${pastDate && 'pastDate'}`} data-bs-toggle="modal" data-bs-target="#apptsModal"
                                                onClick={() => { setDayAppts(apptsForDay); setDisplayDate(date) }}>
                                                <div className='date-display'>{numberDisplay}</div>
                                                {apptsForDay.length > 0 &&
                                                    <div className='d-flex justify-content-center align-items-center number-of-appts'>
                                                        {apptsForDay.length}
                                                    </div>
                                                }
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <button id="newApptBtn" className="custom-btn" data-bs-toggle="modal" data-bs-target="#newApptsModal">Add to Schedule</button>
            </div>
            <CalendarModal appointments={dayAppts} date={displayDate} month={displayMonth} year={displayYear} refetch={getAppointments} />
            <NewApptsModal refetch={getAppointments} />
        </div>
    );
}

export default CalendarDisplay;