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
        LocationName: '',
        LocationAddress: '',
        ImgURL: ''
    };

    const [addingService, setAddingService] = useState(false);
    const [editingService, setEditingService] = useState(false);
    const [displayServiceForm, setDisplayServiceForm] = useState(false);
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
        setDisplayServiceForm(false);
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

    const toggleServiceForm = (e) => {
        e.preventDefault();
        if (e.target.value === 'add') { setAddingService(true); setEditingService(false) };
        if (e.target.value === 'edit') { setEditingService(true); setAddingService(false) };
        if (displayServiceForm) { setServiceDetails(initialFormState) };
        setDisplayServiceForm(!displayServiceForm);
    }

    const toggleDeleteService = () => {
        setDeletingService(!deletingService);
    }

    const addNewApptType = async () => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (addingService) {
            addNewApptType();
        }
        if (editingService) {
            saveEdit();
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

    const form = () => {
        return (
            <form className={`col-9 d-flex flex-column align-items-center ${serviceDetails && 'fade-in'}`} onSubmit={(e) => handleSubmit(e)}>
                <div className="col-12 my-1">
                    <label>Name:</label>
                    <input type='text' className="col-12" name='Name' value={serviceDetails.Name} onChange={handleInputChange} required></input>
                </div>
                {serviceDetails.ImgURL && <img id='service-photo' className='col-6 my-1 rounded' src={serviceDetails.ImgURL} alt="servicePhoto" />}
                <label className="">Change Image:</label>
                <select name='ImgURL' className='col-12 text-center custom-btn my-1' value={serviceDetails.ImgURL} onChange={handleInputChange}>
                    <option value=''>None</option>
                    <option value='./src/assets/services1.jpg'>Yoga</option>
                    <option value='./src/assets/services2.jpg'>Stretch 1</option>
                    <option value='./src/assets/services3.jpg'>Stretch 2</option>
                    <option value='./src/assets/services7.jpg'>Stretch 3</option>
                    <option value='./src/assets/services4.jpg'>Balls</option>
                    <option value='./src/assets/services5.jpg'>Group</option>
                    <option value='./src/assets/services6.jpg'>Head Massage</option>
                    <option value='./src/assets/services8.jpg'>Equipment</option>

                </select>
                <select name='Private' className='col-12 text-center custom-btn my-1' value={serviceDetails.Private} onChange={handleInputChange}>
                    <option value={false}>Public</option>
                    <option value={true}>Private</option>
                </select>
                <div className='col-12 d-flex my-1'>
                    <label>Price: $</label>
                    <input className='col-2 text-center mx-1' type='number' name='Price' value={serviceDetails.Price} onChange={handleInputChange} required></input>
                </div>
                <div className='col-12 d-flex my-1'>
                    <label>Duration:</label>
                    <input className='col-2 text-center mx-1' type='number' name='Duration' value={serviceDetails.Duration} onChange={handleInputChange} required></input>
                    <label>min</label>
                </div>
                <div className="col-12 my-1">
                    <label className="col-12">Location Name (Optional):</label>
                    <input type='text' className="col-12" name='LocationName' value={serviceDetails.LocationName} onChange={handleInputChange}></input>
                </div>
                <div className="col-12 my-1">
                    <label className="col-12">Address (Optional):</label>
                    <input type='text' className="col-12" name='LocationAddress' value={serviceDetails.LocationAddress} onChange={handleInputChange}></input>
                </div>
                <div className="col-12 my-1">
                    <label className="col-12">Description:</label>
                    <textarea type='text' className="col-12" name='Description' value={serviceDetails.Description} onChange={handleInputChange} required></textarea>
                </div>
                <div className='col-12 text-center my-1'>
                    <button type="submit" className="custom-btn success-btn col-5 fs-5 m-1">Save</button>
                    <button type="button" className="custom-btn col-5 fs-5 m-1" onClick={clearStates}>Cancel</button>
                </div>
            </form>
        )
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
                        {displayServiceForm ? (
                            form()
                        ) : (
                            services.map((service, index) => {
                                return (
                                    <div className="d-flex flex-wrap justify-content-between border-darkgray rounded my-2 px-1 fs-4 col-8">
                                        <div className="service-button col-12 text-center" onClick={() => toggleDetails(service)}>{service.Name}</div>
                                        {serviceDetails.Id === service.Id && !displayServiceForm &&
                                            <div className={`my-1 col-12 d-flex flex-wrap justify-content-center ${serviceDetails && 'fade-in'}`}>
                                                <div className="col-12 text-center bg-purple text-white">{service.Private ? 'Private' : 'Public'}</div>
                                                <div className="col-12">Price: ${service.Price}</div>
                                                <div className="col-12">Duration: {service.Duration} min</div>
                                                {service.LocationName && <div className="col-12">Location:</div>}
                                                {service.LocationName && <div className="col-12">{service.LocationName}</div>}
                                                {service.LocationAddress && <div className="col-12">Address:</div>}
                                                {service.LocationAddress && <div className="col-12">{service.LocationAddress}</div>}
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
                                                        <button type="button" className="custom-btn col-5 fs-5 m-1" value='edit' onClick={toggleServiceForm}>Edit</button>
                                                        <button type="button" className="custom-btn danger-btn col-5 fs-5 m-1" onClick={toggleDeleteService}>Delete</button>
                                                    </div>
                                                )
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        )}
                    </div>
                    <div id="modal-footer" className="d-flex align-self-end justify-content-end mt-2">
                        <button type="button" className="custom-btn fs-5 m-1" value='add' onClick={toggleServiceForm}>Add Service</button>
                        <button type="button" className="custom-btn fs-5 m-1" data-bs-dismiss="modal" onClick={clearStates}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ServicesModal;
