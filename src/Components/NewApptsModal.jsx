import React, { useState, useEffect } from "react";
import auth from "../utils/auth";

const NewApptsModal = ({ refetch, services, months, currentDate, currentMonth, currentYear, setLoading, setError }) => {

    const token = auth.getToken();
    const publicServices = services.filter(service => service.Private === false);
    const initialService = publicServices.length > 0 ? publicServices[0] : null;
    const initialServiceId = initialService ? initialService.Id : 0;

    const days = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = ['00', '15', '30', '45'];
    const getYears = () => {
        let years = [];
        for (let i = currentYear; i < (currentYear + 10); i++) {
            years.push(i);
        }
        return years;
    }
    const years = getYears();

    const [dates, setDates] = useState([]);
    const [newHourDisplay, setnewHourDisplay] = useState('12');
    const [newMinute, setNewMinute] = useState('00');
    const [newMeridiem, setNewMeridiem] = useState('AM');
    const [startDate, setStartDate] = useState(currentDate);
    const [startMonth, setStartMonth] = useState(months[currentMonth - 1]);
    const [startYear, setStartYear] = useState(currentYear);
    const [endDate, setEndDate] = useState(currentDate);
    const [endMonth, setEndMonth] = useState(months[currentMonth - 1]);
    const [endYear, setEndYear] = useState(currentYear);
    const [newApptStatus, setNewApptStatus] = useState(0);
    const [newApptTypeId, setNewApptTypeId] = useState(0);
    const [checkedDays, setCheckedDays] = useState([]);

    useEffect(() => {
        const daysInMonth = new Date(startYear, months.indexOf(startMonth) + 1, 0).getDate();
        let dates = [];
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(i);
        }
        setDates(dates);
    }, [startMonth, startYear]);

    useEffect(() => {
        if (newApptStatus === 4) {
            setNewApptTypeId(initialServiceId);
        }
    }, [newApptStatus]);

    const clearStates = () => {
        setnewHourDisplay('12');
        setNewMinute('00');
        setStartDate(currentDate);
        setStartMonth(months[currentMonth - 1]);
        setStartYear(currentYear);
        setEndDate(currentDate);
        setEndMonth(months[currentMonth - 1]);
        setEndYear(currentYear);
        setNewApptStatus(0);
        setNewApptTypeId(0);
        setCheckedDays([]);
    };

    const handleCheckedDay = (e) => {
        const day = e.target.id;
        if (e.target.checked) {
            setCheckedDays([...checkedDays, day]);
        }
        if (!e.target.checked) {
            const newCheckedDays = checkedDays.filter(checkedDay => checkedDay !== day);
            setCheckedDays(newCheckedDays);
        }
    };

    const createAppts = async () => {
        setLoading(true);
        setError('');
        // "DateTime": "2024-04-28 14:00:00"
        const selectedDays = checkedDays;
        let hour = newMeridiem === 'PM' && newHourDisplay !== '12' ? parseInt(newHourDisplay) + 12 : parseInt(newHourDisplay);
        hour = hour === 12 && newMeridiem === 'AM' ? '00' : hour;
        const minute = parseInt(newMinute);
        const startDateTime = new Date(startYear, months.indexOf(startMonth), startDate, hour, minute);
        const endDateTime = new Date(endYear, months.indexOf(endMonth), endDate, hour, minute);

        const createApptArray = () => {
            const appts = [];
            selectedDays.forEach(day => {
                let date = startDateTime;
                while (date <= endDateTime) {
                    if (date.getDay() === days.indexOf(day) + 1) {
                        const newAppt = {
                            DateTime: `${date.toISOString().slice(0, 10)}T${hour}:${newMinute}:00`,
                            ApptTypeId: newApptStatus === 0 ? null : newApptTypeId,
                            Status: newApptStatus
                        }
                        appts.push(newAppt);
                    }
                    date = new Date(date.getTime() + 24 * 60 * 60 * 1000); // increases date by 1 day
                }
            });
            return appts;
        }
        const apptsToAdd = createApptArray();

        try {
            const response = await fetch(`http://localhost:5062/api/newAppts/`, {
                method: 'POST',
                body: JSON.stringify(apptsToAdd),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setLoading(false);
                clearStates();
                refetch();
            }
            if (!response.ok) {
                setLoading(false);
                const error = await response.json();
                setError(error);
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
            setError('An error occurred while making request. Please try again later.');
        }
    };

    return (
        <div className="modal fade" id="newApptsModal" tabIndex="-1" aria-labelledby="newApptsModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content d-flex justify-content-between text-darkgray">
                    <div id="modal-header" className="rounded-top p-1 text-center">
                        <h1 className="modal-title fs-3" id="newApptsModalLabel">Add Appointments</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clearStates}></button>
                    </div>
                    <div id="modal-body" className="col-12 fs-3 d-flex flex-column align-items-center flex-grow-1">
                        <select name="Status" className="custom-btn mt-2" onChange={(e) => setNewApptStatus(parseInt(e.target.value))}>
                            <option value='0' selected={newApptStatus == 0}>Private</option>
                            <option value='4' selected={newApptStatus == 4}>Public</option>
                        </select>
                        {newApptStatus === 4 &&
                            <select name="ApptTypeId" className="custom-btn mt-2" onChange={(e) => setNewApptTypeId(parseInt(e.target.value))}>
                                {publicServices.map((service, index) => <option key={index} value={service.Id} selected={service.Id === newApptTypeId}>{service.Name}</option>)}
                            </select>
                        }
                        <h2 className="my-2">Every</h2>
                        <div className="d-flex justify-content-evenly col-12">
                            {days.map(day => {
                                return (
                                    <div key={day}>
                                        <input type="checkbox" className="day-checkbox" id={day} checked={checkedDays.includes(day)} onChange={handleCheckedDay} />
                                        <label className="d-flex justify-content-center align-items-center" htmlFor={day}>{day}</label>
                                    </div>
                                )
                            })}
                        </div>
                        <h2 className="my-2">At</h2>
                        <div className="d-flex col-12 justify-content-center align-items-center">
                            <select className='custom-btn mx-1' value={newHourDisplay} onChange={(e) => setnewHourDisplay(e.target.value)}>
                                {hours.map((hour, index) => <option key={index} value={hour}>{hour}</option>)}
                            </select>
                            <p className="d-flex align-items-center my-0">:</p>
                            <select className="custom-btn mx-1" value={newMinute} onChange={(e) => setNewMinute(e.target.value)}>
                                {minutes.map((minute, index) => <option key={index} value={minute}>{minute}</option>)}
                            </select>
                            <select className="custom-btn" onChange={(e) => setNewMeridiem(e.target.value)}>
                                <option value="AM" selected>AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                        <h2 className="my-2">From</h2>
                        <div className="d-flex col-12 justify-content-center align-items-center">
                            <select className="custom-btn mx-1" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                                {months.map((month, index) => <option key={index} value={month} >{month}</option>)}
                            </select>
                            <select className="custom-btn mx-1" value={startDate} onChange={(e) => setStartDate(parseInt(e.target.value))}>
                                {dates.map((date, index) => <option key={index} value={date}>{date}</option>)}
                            </select>
                            <p>,</p>
                            <select className="custom-btn mx-1" value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value))}>
                                {years.map((year, index) => <option key={index} value={year}>{year}</option>)}
                            </select>
                        </div>
                        <h2 className="my-2">To</h2>
                        <div className="d-flex col-12 justify-content-center align-items-center">
                            <select className="custom-btn mx-1" value={endMonth} onChange={(e) => setEndMonth(e.target.value)}>
                                {months.map((month, index) => <option key={index} value={month}>{month}</option>)}
                            </select>
                            <select className="custom-btn mx-1" value={endDate} onChange={(e) => setEndDate(parseInt(e.target.value))}>
                                {dates.map((date, index) => <option key={index} value={date}>{date}</option>)}
                            </select>
                            <p>,</p>
                            <select className="custom-btn mx-1" value={endYear} onChange={(e) => setEndYear(parseInt(e.target.value))}>
                                {years.map((year, index) => <option key={index} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn success-btn fs-5 m-1" onClick={createAppts}>Create Appointments</button>
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={clearStates}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default NewApptsModal;