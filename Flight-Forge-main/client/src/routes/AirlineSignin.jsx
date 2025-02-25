import React, { useState } from 'react';
import './css/AirlineSignIn.css';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import RouteFinder from '../apis/RouteFinder';

const AirlineSignIn = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await RouteFinder.post('/airline/login', {
                id: userId,
                password: password
            });
            console.log(response.data);
            if (response.status === 200 && response.data.status === "success") {
                const token = response.data.data.token;
                console.log(response);
                localStorage.setItem('token', token);
                navigate("/airline/profile");
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
            console.error('Error signing in:', err);
        }
    };
    return (
        <div className="container2">
          <form className="wrapper" onSubmit={handleSignIn}>
            <h1>Airline Login</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
              <FaUser className="icon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>
            <div className="remember-forgot">
              <label>
                <input type="checkbox" />Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit">Login</button>
    
            <div className="register-link">
                <p>Don't have an account? <a href ="#" onClick={ () => navigate('/airline/signup')} >Register</a> </p>
                </div>
          </form>
        </div>
      );
};

export default AirlineSignIn;
