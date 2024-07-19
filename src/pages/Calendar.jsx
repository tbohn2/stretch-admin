import { Calendar } from 'node-calendar';
import React, { useState, useEffect } from 'react';
import CalendarModal from '../Components/CalendarModal';
import NewApptsModal from '../Components/NewApptsModal';
import ServicesModal from '../Components/ServiceModal';
import auth from '../utils/auth';
import '../styles/calendar.css';

function CalendarDisplay({ mobile }) {
    const token = auth.getToken();
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const statuses = ['Available', 'Requested', 'Booked', 'Completed', 'Firm'];
    const currentDate = new Date().getDate();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [services, setServices] = useState([]);
    const [displayService, setDisplayService] = useState({});
    const [displayDate, setDisplayDate] = useState('');
    const [calendarMonth, setCalendarMonth] = useState(currentMonth);
    const [calendarYear, setCalendarYear] = useState(currentYear);
    const [calendarDates, setCalendarDates] = useState(new calendar.Calendar(6).monthdayscalendar(calendarYear, calendarMonth));
    const [appointments, setAppointments] = useState({});
    const [dayAppts, setDayAppts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getServices = async () => {
        const services = await auth.getServices();
        if (typeof services === 'string') { setError(services); return; }
        setServices(services);
    }

    useEffect(() => {
        getServices();
    }, []);

    async function getAppointments() {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/allAppts/${calendarMonth}/${calendarYear}`, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            setLoading(false);
            if (response.ok) {
                let apptsByDate = {};
                data.forEach(appt => {
                    const date = new Date(appt.DateTime).getDate();

                    if (!apptsByDate[date]) {
                        apptsByDate[date] = [];
                    }
                    apptsByDate[date].push(appt);
                });
                setAppointments(apptsByDate);
            }
            if (!response.ok) { setError(data) }
        } catch (error) {
            console.error(error);
            setLoading(false);
            setError('An error occurred while making request. Please try again later.');
        }
    }

    useEffect(() => {
        getAppointments();
        setCalendarDates(new calendar.Calendar(6).monthdayscalendar(calendarYear, calendarMonth));
    }, [calendarMonth, calendarYear]);


    const handlePrevClick = () => {
        if (calendarMonth === 1) {
            const prevYear = calendarYear - 1;
            setCalendarMonth(12);
            setCalendarYear(prevYear);
        }
        else {
            const prevMonth = calendarMonth - 1;
            setCalendarMonth(prevMonth);
        }
    }

    const handleNextClick = () => {
        if (calendarMonth === 12) {
            const nextYear = calendarYear + 1;
            setCalendarMonth(1);
            setCalendarYear(nextYear);
        }
        else {
            const nextMonth = calendarMonth + 1;
            setCalendarMonth(nextMonth);
        }
    }


    return (
        <div className='my-3 col-12 d-flex justify-content-center fade-in'>
            <div id="calendar" className="bg-gray rounded col-11 d-flex flex-column align-items-center">
                <div id="calendar-header" className={`col-12 bg-white d-flex align-items-center ${mobile && 'flex-column-reverse'}`}>
                    <div>
                        <button id="prev" className="monthNavBtn mx-1 py-0 custom-btn" onClick={handlePrevClick}>&#8592;</button>
                        <button id="next" className="monthNavBtn mx-1 py-0 custom-btn" onClick={handleNextClick}>&#8594;</button>
                    </div>
                    <h1 id="month" className="fw-light ms-2">{months[calendarMonth - 1]} {calendarYear}</h1>
                    {loading && <div className="spinner-border" role="status"></div>}
                    {error && <div className="alert alert-danger mx-2 my-0 p-2">{error}</div>}
                </div>
                <div id="calendar-body" className='col-12 bg-white'>
                    <div id="calendar-weekdays" className="d-flex justify-content-between col-12 ">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div id="calendar-dates" className="d-flex flex-column col-12">
                        {calendarDates.map((week, index) => {
                            return (
                                <div className="d-flex col-12 fade-in">
                                    {week.map((date, index) => {
                                        // Sort on server side
                                        const apptsForDay = appointments[date] || [];
                                        let numberDisplay

                                        if (date === 0) { numberDisplay = '' }
                                        else { numberDisplay = date }

                                        return (
                                            <div className="px-1 d-flex flex-column align-items-center date" data-bs-toggle={mobile ? "modal" : ""} data-bs-target={mobile ? "#apptsModal" : ""}
                                                {...(mobile && {
                                                    onClick: () => {
                                                        setDayAppts(apptsForDay);
                                                        setDisplayDate(date);
                                                    },
                                                })}>
                                                <div className='date-display'
                                                    data-bs-toggle={mobile ? "" : "modal"} data-bs-target={mobile ? "" : "#apptsModal"}
                                                    {...(!mobile && {
                                                        onClick: () => {
                                                            setDayAppts([]);
                                                            setDisplayDate(date);
                                                        },
                                                    })}>{numberDisplay}</div>
                                                <div className={`col-12 ${mobile ? 'd-flex justify-content-center flex-wrap' : 'appts-container'}`}>
                                                    {apptsForDay.length > 0 &&
                                                        mobile ?
                                                        apptsForDay.map((appt, index) => {
                                                            return (
                                                                <div className='appt-dot'>.</div>
                                                            )
                                                        })
                                                        :
                                                        apptsForDay.map((appt, index) => {
                                                            let display = ''
                                                            const apptType = services.find(service => service.Id === appt.ApptTypeId)
                                                            if (appt.Status === 2 || appt.Status === 4) {
                                                                display = apptType.Name
                                                            } else {
                                                                display = statuses[appt.Status]
                                                            }
                                                            const apptTime = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                                                            return (
                                                                <div id={appt.Id} data-bs-toggle='modal' data-bs-target='#apptsModal' className='appt-time' onClick={() => { setDayAppts([appt]); setDisplayDate(date); setDisplayService(apptType) }}>
                                                                    {apptTime} {display}
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={`col-12 mt-3 d-flex align-items-center justify-content-evenly ${mobile && 'flex-column'}`}>
                    <button id="newApptBtn" className={`custom-btn fs-4 my-2 ${mobile && 'col-12'}`} data-bs-toggle="modal" data-bs-target="#newApptsModal">Add to Schedule</button>
                    <button id="servicesBtn" className={`custom-btn fs-4 my-2 ${mobile && 'col-12'}`} data-bs-toggle="modal" data-bs-target="#servicesModal">Edit Services</button>
                </div>
            </div>
            <CalendarModal services={services} displayService={displayService} setDisplayService={setDisplayService} appts={dayAppts} date={displayDate} month={calendarMonth} year={calendarYear} refetch={getAppointments} token={token} />
            <NewApptsModal refetch={getAppointments} services={services} months={months} currentDate={currentDate} currentMonth={currentMonth} currentYear={currentYear} setLoading={setLoading} setError={setError} token={token} />
            <ServicesModal services={services} getServices={getServices} />
        </div>
    );
}

export default CalendarDisplay;