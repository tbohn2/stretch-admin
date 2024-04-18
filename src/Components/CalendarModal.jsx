import React, { useState } from "react";

const CalendarModal = ({ appointments, date, month, year }) => {

    const [apptDetails, setApptDetails] = useState(null);

    const toggleDetails = (appt) => {
        if (apptDetails === appt) {
            setApptDetails(null);
        } else {
            setApptDetails(appt);
        }
    }

    return (
        <div className="modal fade" id="apptsModal" tabindex="-1" aria-labelledby="apptsModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content d-flex justify-content-between text-light">
                    <div id="modal-header" className="d-flex justify-content-between m-2">
                        <h1 className="modal-title fs-3" id="apptsModalLabel"> {month}/{date}/{year}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setApptDetails(null)}></button>
                    </div>
                    <div id="modal-body" className="col-12 d-flex flex-column align-items-center flex-grow-1">
                        {appointments.length === 0 && <h2 className="fs-5">No Appointments</h2>}
                        {appointments.map((appt, index) => {
                            let client
                            let status = 'Available'
                            appt.Client && (client = appt.Client)
                            appt.Requested && (status = 'Requested')
                            appt.Booked && (status = 'Booked')
                            return (
                                <div key={index} className="d-flex flex-column align-items-center col-11">
                                    <div className="appt-card col-12 pink-border px-1 mt-3 d-flex justify-content-between align-items-center" onClick={() => toggleDetails(appt)}>
                                        <h2 className="fs-5 my-1 col-4">{appt.Time}</h2>
                                        <h2 className="fs-5 my-1 col-6">{appt.Type}</h2>
                                        <h2 className="fs-5 my-1 col-2">
                                            {appt.Booked && 'B'}
                                            {!appt.Requested && 'A'}
                                            {appt.Requested && 'R'}
                                        </h2>
                                    </div>
                                    {apptDetails === appt &&
                                        <div className={`appt-details pt-2 col-12 text-center ${apptDetails && 'fade-in'}`}>
                                            <h2 className="fs-5">Status: {status}</h2>
                                            <h2 className="fs-5">Time: {apptDetails.Time}</h2>
                                            {client &&
                                                <div>
                                                    <h2 className="fs-5">Client Information</h2>
                                                    <h2 className="fs-5">Name: {client.Name}</h2>
                                                    <h2 className="fs-5">Phone: {client.Phone}</h2>
                                                    <h2 className="fs-5">Email: {client.Email}</h2>
                                                </div>
                                            }
                                            {status === 'Requested' &&
                                                <div className="d-flex justify-content-evenly my-3">
                                                    <button type="button" className="custom-btn approve-btn fs-5 col-3">Approve</button>
                                                    <button type="button" className="custom-btn deny-btn fs-5 col-3">Deny</button>
                                                </div>
                                            }
                                            <button type="button" className="custom-btn deny-btn fs-5 mb-3">Delete Appointment</button>
                                        </div>
                                    }
                                </div>
                            )
                        })}
                        <button type="button" className="custom-btn fs-5 mt-3">Add New Time Slot</button>
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={() => setApptDetails(null)}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;