import React from "react";

const ClientApptModal = ({ appt, token, clearAppt, refetch, setLoading, setError, setSuccessMessage }) => {

    const timeAndDate = new Date(appt.DateTime).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const completeAppt = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`https://tbohn2-001-site1.ctempurl.com/api/completeAppt/`, {
                method: 'PUT',
                body: JSON.stringify({ Id: appt.Id, Price: appt.Price, ClientId: appt.ClientId }),
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

    const deleteAppt = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`https://tbohn2-001-site1.ctempurl.com/api/deleteAppt/`, {
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
                        <h1 className="modal-title fs-3" id="clientApptModalLabel">{timeAndDate}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clearAppt}></button>
                    </div>
                    <div id="modal-body" className="col-12 d-flex flex-column align-items-center flex-grow-1">
                        <p className="fs-3">{appt.Duration} min {appt.Type}  ${appt.Price}</p>
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn success-btn fs-5 m-1" data-bs-dismiss="modal" onClick={completeAppt}>Set Complete</button>
                        <button type="button" className="custom-btn danger-btn fs-5 m-1" data-bs-dismiss="modal" onClick={deleteAppt}>Cancel Appointment</button>
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={clearAppt}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientApptModal;