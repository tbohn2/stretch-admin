import React, { useState, useEffect } from "react";
import DropdownButton from "./DropdownButton";
import auth from "../utils/auth";

const CalendarModal = ({ services, appointments, date, month, year, refetch }) => {

    const adminId = localStorage.getItem('admin_id');
    const token = auth.getToken();
    const dateDisplay = new Date(year, month - 1, date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = ['00', '15', '30', '45'];
    const statuses = ['Available', 'Requested', 'Booked', 'Completed'];
    const initialFormState = { Hour: 12, Minutes: '00', MeridiemAM: true, ApptTypeId: 0 };

    const [newApptDetails, setNewApptDetails] = useState(initialFormState);
    const [apptDetails, setApptDetails] = useState(null);
    const [addingAppts, setAddingAppts] = useState(false);
    const [deletingAppt, setDeletingAppt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setApptDetails(appointments.length === 1 ? appointments[0] : null);
    }, [appointments]);

    const clearStates = () => {
        setNewApptDetails(initialFormState);
        setApptDetails(appointments.length === 1 ? appointments[0] : null);
        setAddingAppts(false);
        setDeletingAppt(false);
    }

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        console.log(name, value);
        if (name === 'MeridiemAM') { value === 'AM' ? value = true : value = false }
        setNewApptDetails({
            ...newApptDetails,
            [name]: value
        });
    };

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
        let newHour = parseInt(newApptDetails.Hour);
        if (newApptDetails.MeridiemAM === false) {
            newHour += 12;
        }

        const newAppt = {
            AdminId: adminId,
            DateTime: `${year}-${month}-${date} ${newHour}:${newApptDetails.Minutes}:00`,
            // Server uses ApptType to determine status Available or Firm
            ApptTypeId: newApptDetails.ApptTypeId
        }

        try {
            const response = await fetch(`http://localhost:5062/api/newAppts/`, {
                method: 'POST',
                body: JSON.stringify([newAppt]),
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
                                    <select name="Hour" onChange={handleInputChange}>
                                        {hours.map((hour, index) => <option key={index} value={hour} selected={hour === 12 ? 'selected' : undefined}>{hour}</option>)}
                                    </select>
                                    <p>:</p>
                                    <select name="Minutes" onChange={handleInputChange}>
                                        {minutes.map((minute, index) => <option key={index} value={minute} selected={minute === '00' ? 'selected' : undefined}>{minute}</option>)}
                                    </select>
                                    <select name="MeridiemAM" onChange={handleInputChange}>
                                        <option value="AM" selected>AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                                <div className="d-flex col-12 justify-content-center align-items-center">
                                    <select name="ApptTypeId" onChange={handleInputChange}>
                                        {services.map((service, index) => <option key={index} value={service.Id}>{service.Name}</option>)}
                                    </select>
                                </div>
                                <div className="d-flex justify-content-evenly col-12">
                                    <button type="button" className="custom-btn success-btn fs-5 my-2" onClick={addAppt}>Confirm Time</button>
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
                                        <div className="appt-card col-12 pink-border px-1 mt-3 d-flex align-items-center" onClick={() => toggleDetails(appt)}>
                                            <h2 className="fs-5 my-1 col-3">{time}</h2>
                                            <h2 className="fs-5 my-1 col-6 text-center">{status}</h2>
                                            <h2 className="my-1 col-3"></h2>
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