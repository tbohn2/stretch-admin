import React, { useState, useEffect } from "react";
import auth from "../utils/auth";

const CalendarModal = ({ services, displayService, setDisplayService, appts, date, month, year, refetch }) => {

    const privateServices = services.filter(service => service.Private === true);
    const publicServices = services.filter(service => service.Private === false);
    const adminId = localStorage.getItem('admin_id');
    const token = auth.getToken();
    const dateDisplay = new Date(year, month - 1, date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = ['00', '15', '30', '45'];
    const statuses = ['Available', 'Requested', 'Booked', 'Completed', 'Public'];
    const initialFormState = { Hour: 12, Minutes: '00', MeridiemAM: true, ApptTypeId: null, Status: 0 };

    const [appointments, setAppointments] = useState([]);
    const [newApptDetails, setNewApptDetails] = useState(initialFormState);
    const [apptDetails, setApptDetails] = useState(null);
    const [addingAppts, setAddingAppts] = useState(false);
    const [editingAppt, setEditingAppt] = useState(false);
    const [deletingAppt, setDeletingAppt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setAppointments(appts);
        setApptDetails(appts.length === 1 ? appts[0] : null);
    }, [appts]);

    const clearStates = () => {
        setNewApptDetails(initialFormState);
        setApptDetails(appointments.length === 1 ? appointments[0] : null);
        setDisplayService(null);
        setAddingAppts(false);
        setEditingAppt(false);
        setDeletingAppt(false);
        setLoading(false);
        setError('');
    }

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'MeridiemAM') { value === 'AM' ? value = true : value = false }
        if (name !== "Minutes") {
            if (name === 'Status') {
                let apptTypeId = null;
                if (value === '4') { apptTypeId = publicServices[0].Id }
                setNewApptDetails({
                    ...newApptDetails,
                    [name]: parseInt(value),
                    ApptTypeId: apptTypeId
                })
                return;
            }
            value = parseInt(value)
        }

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

    const toggleEditing = () => {
        if (editingAppt) {
            setNewApptDetails(initialFormState);
        } else {
            setNewApptDetails({
                Hour: new Date(apptDetails.DateTime).getHours() % 12 || 12,
                Minutes: new Date(apptDetails.DateTime).getMinutes(),
                MeridiemAM: new Date(apptDetails.DateTime).getHours() < 12,
                ApptTypeId: apptDetails.ApptTypeId,
                Status: apptDetails.Status
            });
        }
        setEditingAppt(!editingAppt);
    }

    const toggleDeleting = () => {
        setDeletingAppt(!deletingAppt);
    }

    const addAppt = async () => {
        setLoading(true);
        setError('');
        // "DateTime": "2024-04-28 14:00:00"

        let newHour = newApptDetails.MeridiemAM === false && newApptDetails.Hour !== 12 ? newApptDetails.Hour + 12 : newApptDetails.Hour;
        newHour = newHour === 12 && newApptDetails.MeridiemAM === true ? '00' : newHour;

        const newAppt = {
            AdminId: adminId,
            DateTime: `${year}-${month}-${date} ${newHour}:${newApptDetails.Minutes}:00`,
            // Server uses ApptType to determine status Available or Public
            ApptTypeId: newApptDetails.ApptTypeId,
            Status: newApptDetails.Status
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

    const editAppt = async () => {
        setLoading(true);
        setError('');
        // "DateTime": "2024-04-28 14:00:00"
        let newHour = newApptDetails.Hour;
        if (newApptDetails.MeridiemAM === false) {
            newHour += 12;
        }
        try {
            const response = await fetch(`http://localhost:5062/api/editAppt/`, {
                method: 'PUT',
                body: JSON.stringify({
                    Id: apptDetails.Id,
                    DateTime: `${year}-${month}-${date} ${newHour}:${newApptDetails.Minutes}:00`,
                    ApptTypeId: newApptDetails.ApptTypeId
                }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const appt = await response.json();
                setLoading(false);
                clearStates();
                refetch();
                setAppointments([appt]);
                setApptDetails(appt);
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

    const completeAppt = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/completeAppt/`, {
                method: 'PUT',
                body: JSON.stringify({ Id: apptDetails.Id, ApptType: { Price: displayService.Price }, ClientId: apptDetails.ClientId }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setLoading(false);
            }
            if (!response.ok) {
                setLoading(false);
                setError('Failed to complete appointment')
            }
            refetch();
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

    const timeSelector = () => {
        return (
            <div className="d-flex flex-column col-12 justify-content-center align-items-center my-2">
                <div className="d-flex col-12 justify-content-center align-items-center">
                    <select name="Hour" className="custom-btn mx-1" onChange={handleInputChange}>
                        {hours.map((hour, index) => <option key={index} value={hour} selected={hour === newApptDetails.Hour ? 'selected' : undefined}>{hour}</option>)}
                    </select>
                    <p className="d-flex align-items-center my-0">:</p>
                    <select name="Minutes" className="custom-btn mx-1" onChange={handleInputChange}>
                        {minutes.map((minute, index) => <option key={index} value={minute} selected={minute === newApptDetails.Minutes ? 'selected' : undefined}>{minute}</option>)}
                    </select>
                    <select name="MeridiemAM" className="custom-btn" onChange={handleInputChange}>
                        <option value="AM" selected={newApptDetails.MeridiemAM}>AM</option>
                        <option value="PM" selected={!newApptDetails.MeridiemAM}>PM</option>
                    </select>
                </div>
                {addingAppts &&
                    <select name="Status" className="custom-btn mt-2" onChange={handleInputChange}>
                        <option value='4' selected={newApptDetails.Status === 4}>Public</option>
                        <option value='0' selected={newApptDetails.Status !== 4}>Private</option>
                    </select>
                }
                {newApptDetails.Status !== 0 ? // Service not Available
                    newApptDetails.Status !== 4 ? // Service not Public (has Status 1, 2, or 3)
                        <select name="ApptTypeId" className="custom-btn mt-2" onChange={handleInputChange}>
                            {privateServices.map((service, index) => <option key={index} value={service.Id} selected={service.Id === newApptDetails.ApptTypeId}>{service.Name}</option>)}
                        </select>
                        : // Service is Public
                        <select name="ApptTypeId" className="custom-btn mt-2" onChange={handleInputChange}>
                            {publicServices.map((service, index) => <option key={index} value={service.Id} selected={service.Id === newApptDetails.ApptTypeId}>{service.Name}</option>)}
                        </select>
                    : null
                }
            </div>
        )
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
                            <div className="mt-2 fs-4 col-11 d-flex flex-wrap align-items-center">
                                <h3 className="col-12 text-center">Add Available Time</h3>
                                {timeSelector()}
                                <div className="d-flex justify-content-evenly col-12 my-2">
                                    <button type="button" className="custom-btn success-btn fs-5" onClick={addAppt}>Confirm Time</button>
                                    <button type="button" className="custom-btn danger-btn fs-5" onClick={clearStates}>Cancel</button>
                                </div>
                            </div>
                            :
                            appointments.map((appt, index) => {
                                let client
                                appt.Client && (client = appt.Client)
                                let display = ''
                                if (appt.Status === 2 || appt.Status === 4) {
                                    const apptType = services.find(service => service.Id === appt.ApptTypeId)
                                    display = apptType.Name
                                } else {
                                    display = statuses[appt.Status]
                                }
                                const time = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                                return (
                                    <div key={appt.Id} id={appt.Id} className="d-flex flex-column align-items-center col-11">
                                        <div className="appt-card col-12 px-1 mt-3 d-flex flex-wrap align-items-center">
                                            <div className="appt-card-header col-12 d-flex px-1" onClick={() => toggleDetails(appt)}>
                                                <h2 className="fs-5 my-1 col-3">{time}</h2>
                                                <h2 className="fs-5 my-1 col-6 text-center">{display}</h2>
                                                <h2 className="my-1 col-3"></h2>
                                            </div>
                                            {apptDetails === appt &&
                                                <div className={`appt-details pt-2 col-12 text-center ${apptDetails && 'fade-in'}`}>
                                                    <h2 className="fs-5">Status: {statuses[appt.Status]}</h2>
                                                    {displayService &&
                                                        <div>
                                                            <h2 className="fs-5">{displayService.Name}</h2>
                                                            <h2 className="fs-5">Price: ${displayService.Price}</h2>
                                                        </div>
                                                    }
                                                    {editingAppt ? (
                                                        <div className="mt-2 fs-5 col-12 d-flex flex-column align-items-center">
                                                            {timeSelector()}
                                                        </div>
                                                    ) : (
                                                        <h2 className="fs-5">Time: {time}</h2>
                                                    )}
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
                                                    {deletingAppt || editingAppt ?
                                                        deletingAppt ?
                                                            <div className="mt-2 fs-4 col-12 pink-border d-flex flex-column align-items-center">
                                                                <h3>Are you sure you want to delete this appointment?</h3>
                                                                <div className="d-flex justify-content-evenly col-12">
                                                                    <button type="button" className="custom-btn danger-btn fs-5 my-2" data-bs-dismiss="modal" onClick={deleteAppt}>Confirm Delete</button>
                                                                    <button type="button" className="custom-btn fs-5 my-2" onClick={toggleDeleting}>Cancel</button>
                                                                </div>
                                                            </div>
                                                            : // Editing Appt
                                                            <div className="d-flex justify-content-evenly col-12">
                                                                <button type="button" className="custom-btn success-btn fs-5 my-2" onClick={editAppt}>Save</button>
                                                                <button type="button" className="custom-btn fs-5 my-2" onClick={toggleEditing}>Cancel</button>
                                                            </div>
                                                        :
                                                        <div className="d-flex flex-wrap justify-content-evenly mt-3 col-12">
                                                            <button type="button" className="custom-btn success-btn col-12 col-md-4 fs-5 mb-3" onClick={completeAppt}>Set Complete</button>
                                                            <button type="button" className="custom-btn col-12 col-md-3 fs-5 mb-3" onClick={toggleEditing}>Edit</button>
                                                            <button type="button" className="custom-btn danger-btn col-12 col-md-4 fs-5 mb-3" onClick={toggleDeleting}>Delete</button>
                                                        </div>
                                                    }
                                                </div>
                                            }
                                        </div>
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