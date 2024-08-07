import React, { useEffect, useState } from "react";
import CalendarModal from "../Components/CalendarModal";
import auth from "../utils/auth";
import '../styles/clients.css';

function Clients() {
    const token = auth.getToken()

    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]); // All clients
    const [displayedClients, setDisplayedClients] = useState([]); // Changes with search input
    const [displayedAppt, setDisplayedAppt] = useState({});
    const [displayDate, setDisplayDate] = useState(0);
    const [displayMonth, setDisplayMonth] = useState(0);
    const [displayYear, setDisplayYear] = useState(0);
    const [displayedService, setDisplayedService] = useState({});
    const [displayedPastAppts, setDisplayedPastAppts] = useState([]);
    const [displayClient, setDisplayClient] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const getServices = async () => {
        const services = await auth.getServices();
        if (typeof services === 'string') { setError(services); return; }
        setServices(services);
    }

    useEffect(() => {
        getServices();
    }, []);

    const getService = async (appt) => {
        const service = services.find(service => service.Id === appt.ApptTypeId);
        setDisplayedService(service);
    }

    const fetchClients = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5062/api/clients', {
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
            const response = await fetch(`http://localhost:5062/api/adjustBalance/`, {
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

    const setModalStates = (appt) => {
        setDisplayedAppt(appt);
        getService(appt);
        const date = new Date(appt.DateTime);
        setDisplayDate(date.getDate());
        setDisplayMonth(date.getMonth() + 1);
        setDisplayYear(date.getFullYear());
    }

    return (
        <div id='clients' className="py-2 text-light d-flex flex-column align-items-center">
            {loading && <div className="spinner-border fade-in" role="status"></div>}
            {error && <div className="alert alert-danger fade-in">{error}</div>}
            {successMessage && <div className="alert alert-success fade-in">{successMessage}</div>}
            {displayedClients.length === 0 && !loading && <div className="alert alert-info">No clients to display</div>}
            <input type="search" className="input fs-5" placeholder="Search" onChange={handleSearchChange} />
            <div className="my-2 col-12 d-flex flex-wrap justify-content-evenly">
                {displayedClients.map((clientInfo) => {
                    const client = clientInfo.Client
                    const clientAppts = clientInfo.Appointments
                    const phone = client.Phone.includes('-') ? client.Phone : `${client.Phone.slice(0, 3)}-${client.Phone.slice(3, 6)}-${client.Phone.slice(6)}`
                    const pastAppts = sortAppts(clientAppts.filter((appt) => appt.Status === 3))
                    const futureAppts = sortAppts(clientAppts.filter((appt) => appt.Status !== 3))
                    return (
                        <div key={client.Id} className="bg-white text-darkgray rounded fade-in p-1 my-2 col-10 col-md-5 d-flex flex-column align-items-center">
                            <div className="col-12 d-flex flex-column align-items-center border-bottom border-light">
                                <h3 className="m-0">{client.Name}</h3>
                                <p className="m-0">{client.Email}</p>
                                <p className="m-0">{phone}</p>
                                <h3 className="text-decoration-underline mx-1">Upcoming Appointments</h3>
                                {futureAppts.length === 0 && <p>No upcoming appointments</p>}
                                {futureAppts.map((appt) => {
                                    const time = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                                    const date = new Date(appt.DateTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                                    return (
                                        <div key={appt.Id} className="client-appt custom-btn pink-border d-flex justify-content-between align-items-center col-10 col-lg-8 px-3 my-2"
                                            onClick={() => { setModalStates(appt) }} data-bs-toggle="modal" data-bs-target="#apptsModal">
                                            <p className="fs-5 m-0 text-center">{date}</p>
                                            <p className="fs-5 m-0 text-center">{time}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <h3>Balance: ${client.Balance}</h3>
                            <div className="d-flex justify-content-evenly col-12 my-2">
                                <button className="custom-btn success-btn" onClick={() => payBalance(client.Id, client.Balance)}>Clear Balance</button>
                                <button className="custom-btn" onClick={() => togglePastAppts(pastAppts, client.Id)}>{displayClient === client.Id ? 'Hide' : 'See'} Past Appts</button>
                            </div>
                            {displayClient === client.Id &&
                                <div className="d-flex flex-column align-items-center col-12">
                                    <h3 className="text-decoration-underline">Past Appointments</h3>
                                    {displayedPastAppts.length === 0 && <p>No past appointments</p>}
                                    {displayedPastAppts.map((appt) => {
                                        const time = new Date(appt.DateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                                        const date = new Date(appt.DateTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                                        return (
                                            <div key={appt.Id} className="client-appt custom-btn pink-border d-flex justify-content-between align-items-center col-10 col-lg-8 px-3 my-2"
                                                onClick={() => setModalStates(appt)} data-bs-toggle='modal' data-bs-target='#apptsModal'>
                                                <p className="fs-5 m-0 text-center">{date}</p>
                                                <p className="fs-5 m-0 text-center">{time}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            }
                        </div>
                    )
                }
                )}
                <CalendarModal services={services} displayService={displayedService} setDisplayService={setDisplayedService} appts={[displayedAppt]} date={displayDate} month={displayMonth} year={displayYear} refetch={fetchClients} token={token} />
            </div>
        </div>
    );
}

export default Clients;