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
            const response = await fetch(`https://tbohn2-001-site1.ctempurl.com/api/login/`, {
                method: 'POST',
                body: JSON.stringify({ Username: username, Password: password }),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setLoading(false);
            if (response.ok && data.token) {
                auth.login(data.token)
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
        <div className="d-flex flex-column align-items-center col-10 col-md-6 text-light fs-3">
            <h1>Login</h1>
            {error && <div className="fs-4 alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="col-12 d-flex flex-column align-items-center">
                <div className="mb-3 col-12">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="username" className="form-control" id="username" aria-describedby="usernameHelp" onChange={handleUsernameChange} required />
                </div>
                <div className="mb-3 col-12">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" onChange={handlePasswordChange} required />
                </div>
                {loading ?
                    <div class="spinner-border" role="status"></div>
                    :
                    <button type="submit" className="custom-btn col-6">Login</button>
                }
            </form>
        </div>
    );
}

export default Login;