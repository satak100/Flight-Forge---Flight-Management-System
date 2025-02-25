import React, { useState } from 'react';
import './css/AirlineCreateAccount.css'
import { useNavigate, Link } from 'react-router-dom';
import RouteFinder from '../apis/RouteFinder';

const AirlineCreateAccount = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            const response = await RouteFinder.post('/airline/signup', {
                Name: name
            });
            
            if (response.status === 200) {
                const token = response.data.data.token;
                localStorage.setItem('token', token);
                navigate("/airline/profile");
            }
            else console.log(response);

        } catch (err) {
            setError('Failed to create account. Please try again.');
            console.error('Error creating account:', err);
        }
    };

    return (
        <div className="container">
            <form className="wrapper" onSubmit={handleCreateAccount}>
                <h1>Create Account</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Airline Name"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
              
                <button type="submit" className="btn btn-danger btn-block">
                    Create Account
                </button>
                
                <div className="register-link">
                <p>Already have an account? <a href ="#" onClick={ () => navigate('/airline/signin')} >Sign In</a> </p>
                </div>
            </form>
        </div>
    );
};

export default AirlineCreateAccount;
