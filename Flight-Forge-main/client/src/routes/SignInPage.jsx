import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import RouteFinder from '../apis/RouteFinder';

const SignInPage = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await RouteFinder.post('/user/login', {
                id: userId,
                password: password
            });
            console.log(response.data);
            if (response.status === 200 && response.data.status === "success") {
                const token = response.data.data.token;
                console.log(response);
                localStorage.setItem('token', token);
                navigate("/");
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
            console.error('Error signing in:', err);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            Sign In
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSignIn}>
                                <div className="form-group">
                                    <label htmlFor="userId">User ID:</label>
                                    <input type="text" id="userId" className="form-control border-danger" value={userId} onChange={(e) => setUserId(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password:</label>
                                    <input type="password" id="password" className="form-control border-danger" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-outline-danger btn-block">Sign In</button>
                            </form>
                        </div>
                        <div className="card-footer">
                            <button onClick={() => navigate('/CreateAccount')} className="btn btn-block">Create New Account</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
