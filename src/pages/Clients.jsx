import React, { useEffect, useState } from "react";

function Clients() {

    const [clients, setClients] = useState([]);
    const [clientAppts, setClientAppts] = useState([]);

    const fetchClients = async () => {
        const response = await fetch('http://localhost:5062/api/clients');
        const data = await response.json();
        console.log(data);
        setClients(data);
    }

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div className="text-light d-flex flex-column align-items-center">
            <h1 className="fw-light my-2">Clients</h1>
            <div className="my-2 col-12 d-flex justify-content-evenly">
                {clients.map((clientInfo) => {
                    const client = clientInfo.Client
                    const clientAppts = clientInfo.Appointments
                    return (
                        <div key={client.Id} className="client-card col-5 pink-border d-flex flex-column align-items-center">
                            <h3>{client.Name}</h3>
                            <p>Email: {client.Email}</p>
                            <p>Number: {client.Phone}</p>
                            <h3 className="text-decoration-underline">Appointments</h3>
                            {clientAppts.map((appt) => (
                                <div key={appt.Id} className="client-appt pink-border d-flex justify-content-center align-items-center col-10 my-2">
                                    <p className="col-5 fs-5 m-1 text-center">{appt.Month}/{appt.Date}/{appt.Year}</p>
                                    <p className="col-5 fs-5 m-1 text-center">{appt.Time}</p>
                                </div>
                            ))}
                        </div>
                    )
                }
                )}
            </div>
        </div>
    );
}

export default Clients;