import React, { useState } from 'react';
import auth from '../utils/auth';

const ServicesModal = ({ services, getServices }) => {
    const token = auth.getToken();
    const adminId = localStorage.getItem('admin_id');

    const initialFormState = {
        AdminId: adminId,
        Id: 0,
        Name: '',
        Price: 0,
        Duration: 0,
        Description: '',
        Private: false,
        Location: '',
        ImgURL: './assets/defaultService.jpg'
    };

    const [addingService, setAddingService] = useState(false);
    const [editingService, setEditingService] = useState(false);
    const [deletingService, setDeletingService] = useState(false);
    const [serviceDetails, setServiceDetails] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'Private') value === 'true' ? value = true : value = false;
        setServiceDetails({
            ...serviceDetails,
            [name]: value
        });
    };

    const clearStates = () => {
        setServiceDetails(initialFormState);
        setAddingService(false);
        setEditingService(false);
        setDeletingService(false);
        setLoading(false);
        setError('');
    }

    const toggleDetails = (service) => {
        if (serviceDetails.Id === service.Id) {
            setServiceDetails({});
        } else {
            setServiceDetails(service);
        }
    }

    const toggleAddService = () => {
        setServiceDetails(initialFormState);
        setAddingService(!addingService);
    }

    const toggleEditService = () => {
        setEditingService(!editingService);
    }

    const toggleDeleteService = () => {
        setDeletingService(!deletingService);
    }

    const addNewApptType = async (e) => {
        e.preventDefault();
        setError('');
        setAddingService(false);
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5062/api/newApptType/`, {
                method: 'POST',
                body: JSON.stringify(serviceDetails),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                clearStates();
                localStorage.removeItem('services');
                getServices();
            }
            if (!response.ok) {
                setLoading(false);
                setError('Server request failed');
                console.error('Server request failed');
            }
        } catch (error) {
            setLoading(false);
            setError('Server request failed');
            console.error(error);
        }
    }

    const saveEdit = async () => {
        setError('');
        setEditingService(false);
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5062/api/editApptType/`, {
                method: 'PUT',
                body: JSON.stringify(serviceDetails),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setLoading(false);
                localStorage.removeItem('services');
                getServices();
            }
            if (!response.ok) {
                setLoading(false);
                setError('Server request failed');
                console.error('Server request failed');
            }
        } catch (error) {
            setLoading(false);
            setError('Server request failed');
            console.error(error);
        }
    }

    const deleteService = async () => {
        setError('');
        setDeletingService(false);
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5062/api/deleteApptType/`, {
                method: 'DELETE',
                body: JSON.stringify(serviceDetails),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setLoading(false);
                localStorage.removeItem('services');
                getServices();
            }
            if (!response.ok) {
                setLoading(false);
                setError('Server request failed');
                console.error('Server request failed');
            }
        } catch (error) {
            setLoading(false);
            setError('Server request failed');
            console.error(error);
        }
    }

    return (
        <div className="modal fade" id="servicesModal" tabIndex="-1" aria-labelledby="servicesModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content d-flex justify-content-between">
                    <div id="modal-header" className="rounded-top p-1 text-center">
                        <h1 className="modal-title fs-3" id="servicesModalLabel">Services</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clearStates}></button>
                    </div>
                    <div id="modal-body" className="mt-2 col-12 d-flex flex-column align-items-center flex-grow-1 text-darkgray">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {loading && <div className="spinner-border" role="status"></div>}
                        {addingService ? (
                            <form className={`col-9 d-flex flex-wrap ${serviceDetails && 'fade-in'}`} onSubmit={(e) => addNewApptType(e)}>
                                <select name='Private' className='col-12 text-center' value={serviceDetails.Private} onChange={handleInputChange}>
                                    <option value={false}>Public</option>
                                    <option value={true}>Private</option>
                                </select>
                                <div>
                                    <label className="col-12">Name:</label>
                                    <input type='text' className="col-12" name='Name' value={serviceDetails.Name} onChange={handleInputChange} required></input>
                                </div>
                                <div className='col-12 d-flex'>
                                    <label>Price: $</label>
                                    <input className='col-2' type='number' name='Price' value={serviceDetails.Price} onChange={handleInputChange} required></input>
                                </div>
                                <div className='col-12 d-flex'>
                                    <label>Duration:</label>
                                    <input className='col-2' type='number' name='Duration' value={serviceDetails.Duration} onChange={handleInputChange} required></input>
                                </div>
                                <div>
                                    <label className="col-12">Location:</label>
                                    <input type='text' className="col-12" name='Location' value={serviceDetails.Location} onChange={handleInputChange}></input>
                                </div>
                                <div>
                                    <label className="col-12">Description:</label>
                                    <textarea type='text' className="col-12" name='Description' value={serviceDetails.Description} onChange={handleInputChange} required></textarea>
                                </div>
                                <div className='col-12 text-center'>
                                    <button type="submit" className="custom-btn success-btn col-5 fs-5 m-1">Save</button>
                                    <button type="button" className="custom-btn col-5 fs-5 m-1" onClick={toggleAddService}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            services.map((service, index) => {
                                return (
                                    <div className="d-flex flex-wrap justify-content-between border my-2 px-1 fs-4 col-8">
                                        <div className="service-button col-12 text-center " onClick={() => toggleDetails(service)}>{service.Name}</div>
                                        {serviceDetails.Id === service.Id && !editingService &&
                                            <div className={`col-12 d-flex flex-wrap justify-content-center ${serviceDetails && 'fade-in'}`}>
                                                <div className="col-12">{service.Private ? 'Private' : 'Firm'}</div>
                                                <div className="col-12">Price: ${service.Price}</div>
                                                <div className="col-12">Duration: {service.Duration} min</div>
                                                <div className="col-12">Location:</div>
                                                <div className="col-12">{service.Location ? service.Location : 'No location specified'}</div>
                                                <div className="col-12">Description:</div>
                                                <div className="col-12">{service.Description}</div>
                                                {deletingService ? (
                                                    <div className='col-12 fw-bold text-center'>
                                                        <p>Are you sure you want to delete this service?</p>
                                                        <button type="button" className="custom-btn danger-btn col-5 fs-5 m-1" onClick={deleteService}>Yes</button>
                                                        <button type="button" className="custom-btn col-5 fs-5 m-1" onClick={toggleDeleteService}>Cancel</button>
                                                    </div>

                                                ) : (
                                                    <div className='col-12 text-center'>
                                                        <button type="button" className="custom-btn col-5 fs-5 m-1" onClick={toggleEditService}>Edit</button>
                                                        <button type="button" className="custom-btn danger-btn col-5 fs-5 m-1" onClick={toggleDeleteService}>Delete</button>
                                                    </div>
                                                )
                                                }
                                            </div>
                                        }
                                        {serviceDetails.Id === service.Id && editingService &&
                                            <div className={`col-12 d-flex flex-wrap ${serviceDetails && 'fade-in'}`}>
                                                <div className="col-12">{service.Private ? 'Private' : 'Firm'}</div>
                                                <div className='col-12 d-flex'>
                                                    <label>Price: $</label>
                                                    <input className='col-2' type='number' name='Price' value={serviceDetails.Price} onChange={handleInputChange}></input>
                                                </div>
                                                <div className='col-12 d-flex'>
                                                    <label>Duration:</label>
                                                    <input className='col-2' type='number' name='Duration' value={serviceDetails.Duration} onChange={handleInputChange}></input>
                                                </div>
                                                <div>
                                                    <label className="col-12">Location:</label>
                                                    <input type='text' className="col-12" name='Location' value={serviceDetails.Location} onChange={handleInputChange}></input>
                                                </div>
                                                <div>
                                                    <label className="col-12">Description:</label>
                                                    <textarea type='text' className="col-12" name='Description' value={serviceDetails.Description} onChange={handleInputChange}></textarea>
                                                </div>
                                                <div className='col-12 text-center'>
                                                    <button type="button" className="custom-btn success-btn col-5 fs-5 m-1" onClick={saveEdit}>Save</button>
                                                    <button type="button" className="custom-btn col-5 fs-5 m-1" onClick={toggleEditService}>Cancel</button>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        )}
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn fs-5 m-1" onClick={toggleAddService}>Add Service</button>
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={clearStates}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ServicesModal;
