import React, { useState } from "react";

const CalendarModal = ({ appointments, date, month, year }) => {

    return (
        <div class="modal fade" id="apptsModal" tabindex="-1" aria-labelledby="apptsModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content text-light">
                    <div id="modal-header" class="d-flex justify-content-between m-2">
                        <h1 class="modal-title fs-3" id="apptsModalLabel"> {month}/{date}/{year}</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div id="modal-body" class="col-12 d-flex flex-column align-items-center">
                        {appointments.length === 0 && <h2 class="fs-5">No Appointments</h2>}
                        {appointments.map((appt, index) => {
                            return (
                                <div class="pink-border px-1 my-2 d-flex justify-content-between align-items-center col-11">
                                    <h2 class="fs-5 col-4">{appt.Time}</h2>
                                    <h2 class="fs-5 col-6">{appt.Type}</h2>
                                </div>
                            )
                        })}
                    </div>
                    <div id="modal-footer" class="d-flex justify-content-end">
                        <button type="button" class="custom-btn m-1">Add Appointment</button>
                        <button type="button" class="custom-btn m-1" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;