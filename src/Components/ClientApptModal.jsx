import React, { useState } from "react";

const ClientApptModal = ({ appt, clearAppt, refetch, setLoading, setError, setSuccessMessage }) => {

    const token = auth.getToken();

    const [deletingAppt, setDeletingAppt] = useState(false);

    const date = new Date(appt.DateTime).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const time = new Date(appt.DateTime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });

    const completeAppt = async () => {
        // The price must be included under ApptType of Appointment
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/completeAppt/`, {
                method: 'PUT',
                body: JSON.stringify({ Id: appt.Id, Price: appt.ApptType.Price, ClientId: appt.ClientId }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setSuccessMessage('Appointment Completed')
                setTimeout(() => {
                    setSuccessMessage('');
                }, 2000);
            }
            if (!response.ok) {
                setError('Failed to complete appointment')

            }
            refetch();
        }
        catch (error) {
            console.error(error);
            setError('An error occurred while making request. Please try again later.');
        }
    }

    const toggleDeleting = () => {
        setDeletingAppt(!deletingAppt);
    }

    const deleteAppt = async () => {
        setLoading(true);
        setDeletingAppt(false);
        setError('');
        try {
            const response = await fetch(`http://localhost:5062/api/deleteAppt/`, {
                method: 'DELETE',
                body: JSON.stringify({ Id: appt.Id }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setSuccessMessage('Appointment Deleted')
                setTimeout(() => {
                    setSuccessMessage('');
                }, 2000);
            }
            if (!response.ok) { setError('Failed to delete appointment') }
            refetch();
        }
        catch (error) {
            console.error(error);
            setError('An error occurred while making request. Please try again later.');

        }
    }

    return (
        <div className="modal fade" id="clientApptModal" tabIndex="-1" aria-labelledby="clientApptModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content d-flex justify-content-between text-light">
                    <div id="modal-header" className="d-flex justify-content-between m-2">
                        <h1 className="modal-title fs-3" id="clientApptModalLabel">{date}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { clearAppt; setDeletingAppt(false) }}></button>
                    </div>
                    <div id="modal-body" className="col-12 d-flex flex-column align-items-center flex-grow-1">
                        <p className="fs-3 m-0">{appt.Type}</p>
                        <p className="fs-3 m-0">Time: {time}</p>
                        <p className="fs-3 m-0">Duration: {appt.Duration} min</p>
                        <p className="fs-3 m-0">Price: ${appt.Price}</p>
                    </div>
                    {deletingAppt ?
                        <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                            <button type="button" className="custom-btn danger-btn fs-5 m-1" data-bs-dismiss="modal" onClick={deleteAppt}>Confirm Delete?</button>
                            <button type="button" className="custom-btn fs-5 m-1" onClick={toggleDeleting}>Cancel</button>
                            <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={() => { clearAppt; setDeletingAppt(false) }}>Close</button>
                        </div>
                        :
                        <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                            <button type="button" className="custom-btn success-btn fs-5 m-1" data-bs-dismiss="modal" onClick={completeAppt}>Set Complete</button>
                            <button type="button" className="custom-btn danger-btn fs-5 m-1" onClick={toggleDeleting}>Delete</button>
                            <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={() => { clearAppt; setDeletingAppt(false) }}>Close</button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default ClientApptModal;