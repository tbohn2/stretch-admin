import React, { useState } from "react";
import auth from "../utils/auth";

const Login = ({ setLoggedIn }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [username, setusername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (e) => {
        setusername(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`http://localhost:5062/api/login/`, {
                method: 'POST',
                body: JSON.stringify({ Username: username, Password: password }),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setLoading(false);
            if (response.ok && data.token && data.id) {
                auth.login(data)
                setLoggedIn(true);
            }
            if (!response.ok) { setError(data) }
        } catch (error) {
            setLoading(false);
            setError("An error occurred while making request. Please try again later.");
            console.error(error);
        }
    }

    return (
        <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center col-10 col-xl-6 text-darkgray p-3 fs-4 bg-white rounded">
            <h1>Login</h1>
            {error && <div className="fs-4 alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="col-12 d-flex flex-column align-items-center">
                <label htmlFor="username" className="form-label col-12">Username</label>
                <input type="text" id="username" className="input col-12" aria-describedby="usernameHelp" onChange={handleUsernameChange} required />
                <label htmlFor="password" className="form-label col-12">Password</label>
                <input type="password" id="password" className="input col-12 mb-3" onChange={handlePasswordChange} required />
                {loading ?
                    <div className="spinner-border" role="status"></div>
                    :
                    <button type="submit" className="custom-btn col-6">Login</button>
                }
            </form>
        </div>
    );
}

export default Login;