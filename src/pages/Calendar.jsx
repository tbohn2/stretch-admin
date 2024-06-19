import { Calendar } from 'node-calendar';
import React, { useState, useEffect } from 'react';
import CalendarModal from '../Components/CalendarModal';
import NewApptsModal from '../Components/NewApptsModal';
import ServicesModal from '../Components/ServiceModal';
import auth from '../utils/auth';

function CalendarDisplay({ mobile }) {
    const token = auth.getToken();
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const currentDate = new Date().getDate();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [services, setServices] = useState([]);
    const [displayDate, setDisplayDate] = useState(currentDate);
    const [displayMonth, setDisplayMonth] = useState(currentMonth);
    const [displayYear, setDisplayYear] = useState(currentYear);
    const [displayDates, setdisplayDates] = useState(new calendar.Calendar(6).monthdayscalendar(displayYear, displayMonth));
    const [appointments, setAppointments] = useState([]);
    const [dayAppts, setDayAppts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getServices = async () => {
        try {
            const cachedServices = localStorage.getItem('services');
            if (cachedServices) {
                setServices(JSON.parse(cachedServices));
                return;
            }

            const response = await fetch(`http://localhost:5062/api/allServices`, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const services = await response.json();
                localStorage.setItem('services', JSON.stringify(services));
                setServices(services);
            } else {
                setError('Server request failed to retrieve services. Please try again later.');
                console.error('Server request failed');
            }
        } catch (error) {
            setError('Server request failed to retrieve services. Please try again later.');
            console.error(error);
        }
    };

    useEffect(() => {
        getServices();
    }, []);

    async function getAppointments() {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/allAppts/${displayMonth}/${displayYear}`, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
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
        <div className='my-3 col-12 d-flex justify-content-center fade-in'>
            <div id="calendar" className="bg-gray rounded p-5 col-11 col-md-10 col-xl-9 d-flex flex-column align-items-center">
                <div id="calendar-header" className="col-12 bg-white d-flex align-items-center">
                    <button id="prev" className="monthNavBtn custom-btn" onClick={handlePrevClick}>&#8592;</button>
                    <button id="next" className="monthNavBtn custom-btn" onClick={handleNextClick}>&#8594;</button>
                    <h1 id="month" className="fw-light">{months[displayMonth - 1]} {displayYear}</h1>
                    {loading && <div className="spinner-border" role="status"></div>}
                    {error && <div className="alert alert-danger mx-2 my-0 p-2">{error}</div>}
                </div>
                <div id="calendar-body" className='col-12 bg-white'>
                    <div id="calendar-weekdays" className="d-flex justify-content-between col-12">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div id="calendar-dates" className="d-flex flex-column col-12">
                        {displayDates.map((week, index) => {
                            return (
                                <div className="d-flex col-12 fade-in">
                                    {week.map((date, index) => {
                                        const apptsForDay = appointments.filter(appt => new Date(appt.DateTime).getDate() === date)
                                            .sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
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
                                                            const apptName = appt.apptType ? appt.apptType.Name : 'Available';
                                                            const apptTime = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                                                            return (
                                                                <div id={appt.Id} data-bs-toggle='modal' data-bs-target='#apptsModal' className='appt-time' onClick={() => { setDayAppts([appt]); setDisplayDate(date) }}>
                                                                    {apptTime} {apptName}
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
                <div className='col-12 mt-3 d-flex justify-content-evenly'>
                    <button id="newApptBtn" className="custom-btn fs-4" data-bs-toggle="modal" data-bs-target="#newApptsModal">Add to Schedule</button>
                    <button id="newApptBtn" className="custom-btn fs-4" data-bs-toggle="modal" data-bs-target="#servicesModal">Edit Services</button>
                </div>
            </div>
            <CalendarModal services={services} appointments={dayAppts} date={displayDate} month={displayMonth} year={displayYear} refetch={getAppointments} token={token} />
            <NewApptsModal refetch={getAppointments} months={months} currentDate={currentDate} currentMonth={currentMonth} currentYear={currentYear} setLoading={setLoading} setError={setError} token={token} />
            <ServicesModal services={services} getServices={getServices} />
        </div>
    );
}

export default CalendarDisplay;