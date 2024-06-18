import React, { useState, useEffect } from "react";
import DropdownButton from "./DropdownButton";
import auth from "../utils/auth";

const CalendarModal = ({ appointments, date, month, year, refetch }) => {

    const token = auth.getToken();
    const dateDisplay = new Date(year, month - 1, date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = ['00', '15', '30', '45'];
    const statuses = ['Available', 'Requested', 'Booked', 'Completed'];

    const [apptDetails, setApptDetails] = useState(null);
    const [addingAppts, setAddingAppts] = useState(false);
    const [deletingAppt, setDeletingAppt] = useState(false);
    const [newHourDisplay, setnewHourDisplay] = useState(12);
    const [newMinute, setNewMinute] = useState('00');
    const [newMeridiem, setNewMeridiem] = useState('AM');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setApptDetails(appointments.length === 1 ? appointments[0] : null);
    }, [appointments]);

    const clearStates = () => {
        setnewHourDisplay(12);
        setNewMinute('00');
        setNewMeridiem('AM');
        setApptDetails(appointments.length === 1 ? appointments[0] : null);
        setAddingAppts(false);
        setDeletingAppt(false);
    }

    const toggleDetails = (appt) => {
        if (apptDetails === appt) {
            setApptDetails(null);
        } else {
            setApptDetails(appt);
        }
    }

    const toggleDeleting = () => {
        setDeletingAppt(!deletingAppt);
    }

    const addAppt = async () => {
        setLoading(true);
        setError('');
        // "DateTime": "2024-04-28 14:00:00"
        let newHour = newHourDisplay;
        if (newMeridiem === 'PM') {
            newHour += 12;
        }
        const newDateTime = `${year}-${month}-${date} ${newHour}:${newMinute}:00`;
        try {
            const response = await fetch(`http://localhost:5062/api/newAppts/`, {
                method: 'POST',
                body: JSON.stringify([{ DateTime: newDateTime }]),
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
    }

    const approveAppt = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/approveAppt/`, {
                method: 'PUT',
                body: JSON.stringify({ Id: apptDetails.Id }),
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
            setError('An error occurred while making request. Please try again later.');

        }
    }

    const denyAppt = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/denyAppt/`, {
                method: 'PUT',
                body: JSON.stringify({ Id: apptDetails.Id }),
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
            setError('An error occurred while making request. Please try again later.');

        }
    }

    const deleteAppt = async () => {
        setLoading(true);
        setDeletingAppt(false);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/deleteAppt/`, {
                method: 'DELETE',
                body: JSON.stringify({ Id: apptDetails.Id }),
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
            setError('An error occurred while making request. Please try again later.');
        }
    }

    return (
        <div className="modal fade" id="apptsModal" tabIndex="-1" aria-labelledby="apptsModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content d-flex justify-content-between">
                    <div id="modal-header" className="rounded-top p-1 text-center">
                        <h1 className="modal-title fs-3" id="apptsModalLabel">{dateDisplay}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clearStates}></button>
                    </div>
                    <div id="modal-body" className="mt-2 col-12 d-flex flex-column align-items-center flex-grow-1 text-darkgray">
                        {appointments.length === 0 && !addingAppts && <h2 className="fs-5">Add Appointments Below</h2>}
                        {loading && <div className="spinner-border" role="status"></div>}
                        {error && <div className="alert alert-danger">{error}</div>}
                        {addingAppts ?
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
                            :
                            appointments.map((appt, index) => {
                                let client
                                appt.Client && (client = appt.Client)
                                const status = statuses[appt.Status]
                                const time = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

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
                                                    <div className="my-2">
                                                        <h2 className="text-decoration-underline">Client Information</h2>
                                                        <p className="fs-5 m-0">{client.Name}</p>
                                                        <p className="fs-5 m-0">{client.Phone.includes('-') ? client.Phone : `${client.Phone.slice(0, 3)}-${client.Phone.slice(3, 6)}-${client.Phone.slice(6)}`}</p>
                                                        <p className="fs-5 m-0">{client.Email}</p>
                                                    </div>
                                                }
                                                {appt.Status === 1 &&
                                                    <div className="d-flex justify-content-evenly my-3">
                                                        <button type="button" className="custom-btn success-btn fs-5 col-3" onClick={approveAppt}>Approve</button>
                                                        <button type="button" className="custom-btn danger-btn fs-5 col-3" onClick={denyAppt}>Deny</button>
                                                    </div>
                                                }
                                                {deletingAppt ?
                                                    <div className="mt-2 fs-4 col-12 pink-border d-flex flex-column align-items-center">
                                                        <h2>Are you sure you want to delete this appointment?</h2>
                                                        <div className="d-flex justify-content-evenly col-12">
                                                            <button type="button" className="custom-btn danger-btn fs-5 my-2" data-bs-dismiss="modal" onClick={deleteAppt}>Confirm Delete</button>
                                                            <button type="button" className="custom-btn fs-5 my-2" onClick={toggleDeleting}>Cancel</button>
                                                        </div>
                                                    </div>
                                                    :
                                                    <button type="button" className="custom-btn danger-btn fs-5 mb-3" onClick={toggleDeleting}>Delete Appointment</button>
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            })}
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn fs-5 m-1" onClick={() => setAddingAppts(true)}>Add Time Slot</button>
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={clearStates}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;