import React, { useEffect, useState } from "react";
import ClientApptModal from "../Components/ClientApptModal";
import auth from "../utils/auth";

function Clients() {
    const token = auth.getToken()
    const [clients, setClients] = useState([]);
    const [displayedClients, setDisplayedClients] = useState([]);
    const [displayedAppt, setDisplayedAppt] = useState({});
    const [displayedPastAppts, setDisplayedPastAppts] = useState([]);
    const [displayClient, setDisplayClient] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchClients = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('https://tbohn2-001-site1.ctempurl.com/api/clients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) { setClients(data); setDisplayedClients(data) }
            if (!response.ok) { setError(data) }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            setError('An error occurred while making request. Please try again later.');
        }
    }

    const payBalance = async (clientId, price) => {
        try {
            const response = await fetch(`https://tbohn2-001-site1.ctempurl.com/api/adjustBalance/`, {
                method: 'PUT',
                body: JSON.stringify({ ClientId: clientId, Price: price }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setSuccessMessage('Balance cleared')
                setTimeout(() => {
                    setSuccessMessage('');
                }, 2000);
            }
            if (!response.ok) { setError('Failed to clear balance') }
            fetchClients();
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchClients();
    }, []);

    const sortAppts = (appts) => {
        return appts.sort((a, b) => {
            // Compare years
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            // Compare months
            if (a.month !== b.month) {
                return a.month - b.month;
            }
            // Compare dates
            return a.date - b.date;
        });
    }

    const togglePastAppts = (pastAppts, clientId) => {
        if (clientId === displayClient) {
            setDisplayedPastAppts([]);
            setDisplayClient(0);
        }
        else {
            setDisplayedPastAppts(pastAppts);
            setDisplayClient(clientId);
        }
    }

    const handleSearchChange = (e) => {
        const search = e.target.value;
        if (search === '') {
            setDisplayedClients(clients);
            return;
        }
        const filteredClients = clients.filter((client) => {
            return client.Client.Name.toLowerCase().includes(search.toLowerCase()) || client.Client.Email.toLowerCase().includes(search.toLowerCase()) || client.Client.Phone.includes(search);
        });
        setDisplayedClients(filteredClients);
    }

    return (
        <div id='clients' className="pb-2 text-light d-flex flex-column align-items-center">
            <h1 className="fw-light my-2">Clients</h1>
            {loading && <div className="spinner-border fade-in" role="status"></div>}
            {error && <div className="alert alert-danger fade-in">{error}</div>}
            {successMessage && <div className="alert alert-success fade-in">{successMessage}</div>}
            {displayedClients.length === 0 && !loading && <div className="alert alert-info">No clients to display</div>}
            <input type="text" placeholder="Search" onChange={handleSearchChange} />
            <div className="my-2 col-12 d-flex flex-wrap justify-content-evenly">
                {displayedClients.map((clientInfo) => {
                    const client = clientInfo.Client
                    const clientAppts = clientInfo.Appointments
                    const pastAppts = sortAppts(clientAppts.filter((appt) => appt.Status === 3))
                    const futureAppts = sortAppts(clientAppts.filter((appt) => appt.Status !== 3))
                    return (
                        <div key={client.Id} className="client-card fade-in my-2 py-2 col-10 col-md-5 pink-border d-flex flex-column align-items-center">
                            <div className="flex-grow-1 d-flex flex-column align-items-center">
                                <h3>{client.Name}</h3>
                                <p>Email: {client.Email}</p>
                                <p>Number: {client.Phone}</p>
                                <h3 className="text-decoration-underline">Upcoming Appointments</h3>
                                {futureAppts.map((appt) => {
                                    const time = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                    const date = new Date(appt.DateTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                                    return (
                                        <div key={appt.Id} className="client-appt custom-btn pink-border d-flex justify-content-center align-items-center col-10 my-2"
                                            onClick={() => setDisplayedAppt(appt)} data-bs-toggle="modal" data-bs-target="#clientApptModal">
                                            <p className="col-5 fs-5 m-1 text-center">{date}</p>
                                            <p className="col-5 fs-5 m-1 text-center">{time}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <h3>Balance: ${client.Balance}</h3>
                            <div className="d-flex justify-content-evenly col-12">
                                <button className="custom-btn success-btn" onClick={() => payBalance(client.Id, client.Balance)}>Clear Balance</button>
                                <button className="custom-btn" onClick={() => togglePastAppts(pastAppts, client.Id)}>See Past Appts</button>
                            </div>
                            {displayedPastAppts.length > 0 && displayClient === client.Id &&
                                <div className="d-flex flex-column align-items-center col-10">
                                    <h3 className="text-decoration-underline">Past Appointments</h3>
                                    {displayedPastAppts.map((appt) => {
                                        const time = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                        const date = new Date(appt.DateTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                                        return (
                                            <div key={appt.Id} className="client-appt custom-btn pink-border d-flex justify-content-center align-items-center col-10 my-2"
                                                onClick={() => setDisplayedAppt(appt)} data-bs-toggle="modal" data-bs-target="#clientApptModal">
                                                <p className="col-5 fs-5 m-1 text-center">{date}</p>
                                                <p className="col-5 fs-5 m-1 text-center">{time}</p>
                                                <p className="col-2 fs-5 m-1 text-center">${appt.Price}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            }
                        </div>
                    )
                }
                )}
                <ClientApptModal appt={displayedAppt} token={token} clearAppt={() => setDisplayedAppt({})} refetch={fetchClients} />
            </div>
        </div>
    );
}

export default Clients;