import React from "react";

const NewApptsModal = ({ refetch }) => {

    return (
        <div className="modal fade" id="newApptsModal" tabIndex="-1" aria-labelledby="newApptsModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content d-flex justify-content-between text-light">
                    <div id="modal-header" className="d-flex justify-content-between m-2">
                        <h1 className="modal-title fs-3" id="newApptsModalLabel">Add Appointments</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clearStates}></button>
                    </div>
                    <div id="modal-body" className="col-12 d-flex flex-column align-items-center flex-grow-1">
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={clearStates}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default NewApptsModal;