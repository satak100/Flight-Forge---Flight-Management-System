// Home.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import SearchRoute from '../components/SearchRoute';
import RouteList from '../components/RouteList';
import backgroundImage from '../assets/cover.png';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.location.reload();
    };

    return (
        <div style={{
            // backgroundImage: `url(${backgroundImage})`, // Use the imported background image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh', // Ensures the background covers the entire viewport height
            paddingTop: '10px', // Adjust the top padding as needed
            display: 'flex', // Use flexbox
            flexDirection: 'column' // Column direction for flexbox
        }}>
            <Header isLoggedIn={isLoggedIn} handleSignOut={handleSignOut} />
            <SearchRoute/>
            <div style={{paddingLeft: '14%', width: '86%', fontFamily:'-moz-initial', fontSize:'1.4rem', color: 'red'}}>
                <marquee behavior="scroll" direction="left">!!! Notice: Users can return tickets up to 10 days before the scheduled departure date. In case of a return, a 25% deduction will be applied to the refunded amount.</marquee>
            </div>
            <RouteList/>
            
            {/* Ash-colored box at the bottom */}
            <div style={{
                backgroundColor: '#F5F5F5', // Ash color background
                padding: '5%', // Add padding for content
                marginTop: 'auto' // Move the box to the bottom
            }}>
                <div className="row">
                    <div className="col">
                        <h5>Website Information</h5>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non feugiat sapien. Proin id fermentum sem. Duis in bibendum quam, et euismod velit.</p>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col">
                        <p>
                            <Link to="/airline/signin" className="text-primary" style={{marginRight: '10px', marginBottom: '30px'}} >An airline company?</Link>
                            <p>or</p>
                            <Link to="/airline/signin" className="text-primary" >Admin?</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
