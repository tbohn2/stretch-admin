import React, { useState } from "react";
import DropdownButton from "./DropdownButton";
import auth from "../utils/auth";

const CalendarModal = ({ appointments, date, month, year, refetch }) => {

    const token = auth.getToken();
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = ['00', '15', '30', '45'];
    const statuses = ['Available', 'Requested', 'Booked', 'Completed'];

    const [apptDetails, setApptDetails] = useState(null);
    const [addingAppts, setAddingAppts] = useState(false);
    const [newHourDisplay, setnewHourDisplay] = useState(12);
    const [newMinute, setNewMinute] = useState('00');
    const [newMeridiem, setNewMeridiem] = useState('AM');

    const clearStates = () => {
        setnewHourDisplay(12);
        setNewMinute('00');
        setNewMeridiem('AM');
        setApptDetails(null);
        setAddingAppts(false);
    }

    const toggleDetails = (appt) => {
        if (apptDetails === appt) {
            setApptDetails(null);
        } else {
            setApptDetails(appt);
        }
    }

    const addAppt = async () => {
        // "DateTime": "2024-04-28 14:00:00"
        let newHour = newHourDisplay;
        if (newMeridiem === 'PM') {
            newHour += 12;
        }
        const newDateTime = `${year}-${month}-${date} ${newHour}:${newMinute}:00`;
        console.log(newDateTime);
        try {
            const response = await fetch(`http://localhost:5062/api/newAppts/`, {
                method: 'POST',
                body: JSON.stringify([{ DateTime: newDateTime }]),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            console.log(response.status);
            clearStates();
            refetch();
        }
        catch (error) {
            console.error(error);
        }
    }

    const approveAppt = async () => {
        console.log(JSON.stringify({ Id: apptDetails.Id }));
        try {
            const response = await fetch(`http://localhost:5062/api/approveAppt/`, {
                method: 'PUT',
                body: JSON.stringify({ Id: apptDetails.Id }),
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response.status);
            refetch();
        }
        catch (error) {
            console.error(error);
        }
    }

    const denyAppt = async () => {
        try {
            const response = await fetch(`http://localhost:5062/api/denyAppt/`, {
                method: 'PUT',
                body: JSON.stringify({ Id: apptDetails.Id }),
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response.status);
            refetch();
        }
        catch (error) {
            console.error(error);
        }
    }

    const deleteAppt = async () => {
        try {
            const response = await fetch(`http://localhost:5062/api/deleteAppt/`, {
                method: 'DELETE',
                body: JSON.stringify({ Id: apptDetails.Id }),
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response.status);
            refetch();
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="modal fade" id="apptsModal" tabIndex="-1" aria-labelledby="apptsModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content d-flex justify-content-between text-light">
                    <div id="modal-header" className="d-flex justify-content-between m-2">
                        <h1 className="modal-title fs-3" id="apptsModalLabel"> {month}/{date}/{year}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clearStates}></button>
                    </div>
                    <div id="modal-body" className="col-12 d-flex flex-column align-items-center flex-grow-1">
                        {appointments.length === 0 && <h2 className="fs-5">No Appointments</h2>}
                        {appointments.sort((a, b) => new Date(a) - new Date(b))
                            .map((appt, index) => {
                                let client
                                appt.Client && (client = appt.Client)
                                const status = statuses[appt.Status]
                                const time = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                console.log(status);

                                return (
                                    <div key={appt.Id} id={appt.Id} className="d-flex flex-column align-items-center col-11">
                                        <div className="appt-card col-12 pink-border px-1 mt-3 d-flex justify-content-between align-items-center" onClick={() => toggleDetails(appt)}>
                                            <h2 className="fs-5 my-1 col-4">{time}</h2>
                                            <h2 className="fs-5 my-1 col-6">{appt.Type || 'Still Available'}</h2>
                                            <h2 className="fs-5 my-1 col-2">
                                                {appt.Status === 0 && 'A'}
                                                {appt.Status === 1 && 'R'}
                                                {appt.Status === 2 && 'B'}
                                                {appt.Status === 3 && 'C'}
                                            </h2>
                                        </div>
                                        {apptDetails === appt &&
                                            <div className={`appt-details pt-2 col-12 text-center ${apptDetails && 'fade-in'}`}>
                                                <h2 className="fs-5">Status: {status}</h2>
                                                <h2 className="fs-5">Time: {time}</h2>
                                                {client &&
                                                    <div>
                                                        <p className="fs-5">Client Information</p>
                                                        <p className="fs-5">Name: {client.Name}</p>
                                                        <p className="fs-5">Phone: {client.Phone}</p>
                                                        <p className="fs-5">Email: {client.Email}</p>
                                                    </div>
                                                }
                                                {appt.Status === 1 &&
                                                    <div className="d-flex justify-content-evenly my-3">
                                                        <button type="button" className="custom-btn success-btn fs-5 col-3" onClick={approveAppt}>Approve</button>
                                                        <button type="button" className="custom-btn danger-btn fs-5 col-3" onClick={denyAppt}>Deny</button>
                                                    </div>
                                                }
                                                <button type="button" className="custom-btn danger-btn fs-5 mb-3" data-bs-dismiss="modal" onClick={deleteAppt}>Delete Appointment</button>
                                            </div>
                                        }
                                    </div>
                                )
                            })}
                        {addingAppts &&
                            <div className="mt-2 fs-4 col-11 pink-border d-flex flex-column align-items-center">
                                <h2>Add Available Time</h2>
                                <div className="d-flex col-12 justify-content-center align-items-center">
                                    <DropdownButton options={hours} newValue={newHourDisplay} setNewValue={setnewHourDisplay} />
                                    <p>:</p>
                                    <DropdownButton options={minutes} newValue={newMinute} setNewValue={setNewMinute} />
                                    <DropdownButton options={["AM", "PM"]} newValue={newMeridiem} setNewValue={setNewMeridiem} />
                                </div>
                                <div className="d-flex justify-content-evenly col-12">
                                    <button type="button" className="custom-btn success-btn fs-5 my-2" data-bs-dismiss="modal" onClick={addAppt}>Confirm Time</button>
                                    <button type="button" className="custom-btn danger-btn fs-5 my-2" onClick={clearStates}>Cancel</button>
                                </div>
                            </div>
                        }
                        <button type="button" className="custom-btn fs-5 mt-3" onClick={() => setAddingAppts(true)}>Add Time Slot</button>
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={clearStates}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;