import React, { useState, useEffect } from 'react';

function CalendarDisplay() {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const currentDate = new Date().getDate();
    const currentDay = new Date().getDay();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [displayMonth, setDisplayMonth] = useState(currentMonth);
    const [displayYear, setDisplayYear] = useState(currentYear);
    const [displayDates, setdisplayDates] = useState(new calendar.Calendar(6).monthdayscalendar(displayYear, displayMonth));

    useEffect(() => {
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
                <div id="calendar-header" class="d-flex justify-content-between align-items-center my-3">
                    <button id="prev" class="monthNavBtn" onClick={handlePrevClick}>Prev</button>
                    <h1 id="month-year" class="fw-light">{months[displayMonth - 1]} {displayYear}</h1>
                    <button id="next" class="monthNavBtn" onClick={handleNextClick}>Next</button>
                </div>
                <div id="calendar-body">
                    <div id="calendar-weekdays" class="d-flex justify-content-between">
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
                                <div class="d-flex">
                                    {week.map((date, index) => {
                                        let numberDisplay
                                        if (date === 0) { numberDisplay = '' }
                                        else { numberDisplay = date }
                                        return (
                                            <div className="date">{numberDisplay}</div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CalendarDisplay;