import { Calendar } from 'node-calendar';
import React, { useState, useEffect } from 'react';
import CalendarModal from '../Components/CalendarModal';

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

    async function getAppointments() {
        try {
            const response = await fetch(`http://localhost:5062/api/apptsInMonth/${displayMonth}/${displayYear}`);
            const data = await response.json();
            console.log(data);
            setAppointments(data);
        } catch (error) {
            console.error(error);
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
        <div className='text-light d-flex flex-column align-items-center'>
            <div className=''>
                <div id="calendar-header" className="d-flex justify-content-between align-items-center my-3">
                    <button id="prev" className="monthNavBtn custom-btn" onClick={handlePrevClick}>Prev</button>
                    <h1 id="month-year" className="fw-light">{months[displayMonth - 1]} {displayYear}</h1>
                    <button id="next" className="monthNavBtn custom-btn" onClick={handleNextClick}>Next</button>
                </div>
                <div id="calendar-body">
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
                                        const apptsForDay = appointments.filter(appt => appt.Date === date);

                                        let numberDisplay
                                        let today = false
                                        let available = false
                                        let pastDate = false
                                        if (date === 0) { numberDisplay = '' }
                                        else { numberDisplay = date }
                                        if (date === currentDate && displayMonth === currentMonth && displayYear === currentYear) {
                                            today = true
                                        }
                                        if (apptsForDay.length != 0) {
                                            available = true
                                        }
                                        if (date < currentDate && displayMonth === currentMonth && displayYear === currentYear || displayMonth < currentMonth && displayYear === currentYear || displayYear < currentYear) {
                                            pastDate = true
                                        }
                                        return (
                                            <div className={`px-1 date ${pastDate && 'pastDate'} ${today && 'currentDay'} ${!available && 'noAppts'}`} data-bs-toggle="modal" data-bs-target="#apptsModal"
                                                onClick={() => { setDayAppts(apptsForDay); setDisplayDate(date) }}>{numberDisplay}</div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <CalendarModal appointments={dayAppts} date={displayDate} month={displayMonth} year={displayYear} refetch={getAppointments} />
        </div>
    );
}

export default CalendarDisplay;