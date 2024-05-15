import React, { useState, useEffect } from "react";
import DropdownButton from "./DropdownButton";
import auth from "../utils/auth";

const NewApptsModal = ({ refetch, months, currentDate, currentMonth, currentYear, setLoading, setError }) => {

    const token = auth.getToken();

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
    const [startDate, setstartDate] = useState(currentDate);
    const [startMonth, setstartMonth] = useState(months[currentMonth - 1]);
    const [startYear, setstartYear] = useState(currentYear);
    const [endDate, setendDate] = useState(currentDate);
    const [endMonth, setendMonth] = useState(months[currentMonth - 1]);
    const [endYear, setendYear] = useState(currentYear);

    useEffect(() => {
        const daysInMonth = new Date(startYear, months.indexOf(startMonth) + 1, 0).getDate();
        let dates = [];
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(i);
        }
        setDates(dates);
    }, [startMonth, startYear]);

    const clearStates = () => {
        setnewHourDisplay('12');
        setNewMinute('00');
        setstartDate(currentDate);
        setstartMonth(months[currentMonth - 1]);
        setstartYear(currentYear);
        setendDate(currentDate);
        setendMonth(months[currentMonth - 1]);
        setendYear(currentYear);
    };

    const createAppts = async () => {
        setLoading(true);
        setError('');
        // "DateTime": "2024-04-28 14:00:00"
        const selectedDays = days.filter(day => document.getElementById(day).checked);
        const hour = newMeridiem === 'PM' ? parseInt(newHourDisplay) + 12 : parseInt(newHourDisplay);
        const minute = parseInt(newMinute);
        const startDateTime = new Date(startYear, months.indexOf(startMonth), startDate, hour, minute);
        const endDateTime = new Date(endYear, months.indexOf(endMonth), endDate, hour, minute);
        console.log(startDateTime);
        const createApptArray = () => {
            const appts = [];
            selectedDays.forEach(day => {
                let date = startDateTime;
                while (date <= endDateTime) {
                    if (date.getDay() === days.indexOf(day) + 1) {
                        const newDateTime = {
                            DateTime: `${date.toISOString().slice(0, 10)}T${hour}:${newMinute}:00`
                        }
                        appts.push(newDateTime);
                    }
                    date = new Date(date.getTime() + 24 * 60 * 60 * 1000); // increases date by 1 day
                }
            });
            return appts;
        }
        const apptsToAdd = createApptArray();
        try {
            const response = await fetch(`https://tbohn2-001-site1.ctempurl.com/api/newAppts/`, {
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
                <div className="modal-content d-flex justify-content-between text-light">
                    <div id="modal-header" className="d-flex justify-content-between m-2">
                        <h1 className="modal-title fs-3" id="newApptsModalLabel">Add Appointments</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clearStates}></button>
                    </div>
                    <div id="modal-body" className="col-12 d-flex flex-column align-items-center flex-grow-1">
                        <h2 className="my-2">Every</h2>
                        <div className="d-flex justify-content-evenly col-12">
                            {days.map(day => {
                                return (
                                    <div key={day}>
                                        <input type="checkbox" id={day} />
                                        <label className="d-flex justify-content-center align-items-center" htmlFor={day}>{day}</label>
                                    </div>
                                )
                            })}
                        </div>
                        <h2 className="my-2">At</h2>
                        <div className="d-flex fs-3 col-12 justify-content-center align-items-center">
                            <DropdownButton options={hours} newValue={newHourDisplay} setNewValue={setnewHourDisplay} />
                            <p>:</p>
                            <DropdownButton options={minutes} newValue={newMinute} setNewValue={setNewMinute} />
                            <DropdownButton options={["AM", "PM"]} newValue={newMeridiem} setNewValue={setNewMeridiem} />
                        </div>
                        <h2 className="my-2">From</h2>
                        <div className="d-flex fs-3 col-12 justify-content-center align-items-center">
                            <DropdownButton options={months} newValue={startMonth} setNewValue={setstartMonth} />
                            <DropdownButton options={dates} newValue={startDate} setNewValue={setstartDate} />
                            <p>,</p>
                            <DropdownButton options={years} newValue={startYear} setNewValue={setstartYear} />
                        </div>
                        <h2 className="my-2">To</h2>
                        <div className="d-flex fs-3 col-12 justify-content-center align-items-center">
                            <DropdownButton options={months} newValue={endMonth} setNewValue={setendMonth} />
                            <DropdownButton options={dates} newValue={endDate} setNewValue={setendDate} />
                            <p>,</p>
                            <DropdownButton options={years} newValue={endYear} setNewValue={setendYear} />
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