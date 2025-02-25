// Header.jsx
import React, { useEffect, useState  } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/tlogo.png'; // Import your logo image file
import RouteFinder from '../apis/RouteFinder';

const Header = ({handleSignOut }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await RouteFinder.post('/user/authenticate', {
          token: localStorage.getItem('token')
        });
        console.log(response.status);
        if(response.status == 200)
        {
          setIsLoggedIn(true);
        }
        else setIsLoggedIn(false);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    fetchAirports();
  }, []);

  return (
    <div style={{ 
      backgroundColor: 'none', 
      padding: '10px', 
      borderBottom: 'none', // Remove the border
      marginTop: 'none', // Add top margin
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: 'none', // Remove shadow effect
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logoImage} alt="Logo" style={{ width: '230px', marginRight: '10px' }} /> {/* Adjust width here */}
      </div>
      <h1 style={{ color: 'black', fontFamily:'-moz-initial', fontWeight: 'bold', fontSize: '64px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', margin: '0', textAlign: 'center' }}>Fly Higher With Us</h1>
      <div style={{ display: 'flex' }}>
        {!isLoggedIn ? (
          <Link 
            to="/signin" 
            style={{
              fontFamily:'-moz-initial',
              color: 'white', 
              backgroundColor: '#800000', 
              padding: '15px 20px', // Adjust padding here
              marginRight: '10px', 
              borderRadius: '5px',
              cursor: 'pointer',
              textDecoration: 'none', 
              fontSize: '16px', 
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#600000'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#800000'}
          >
            Sign In
          </Link>
        ) : (
          <>
            <Link 
              to="/userprofile" 
              style={{
                fontFamily:'-moz-initial',
                color: 'white', 
                backgroundColor: '#800000', 
                padding: '15px 20px', // Adjust padding here
                marginRight: '10px', 
                borderRadius: '5px', 
                cursor: 'pointer',
                textDecoration: 'none', 
                fontSize: '16px', 
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#600000'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#800000'}
            >
              Profile
            </Link>
            <span 
              onClick={handleSignOut} 
              style={{
                fontFamily:'-moz-initial',
                color: 'white', 
                backgroundColor: '#800000', 
                padding: '15px 20px', // Adjust padding here
                marginRight: '10px', 
                borderRadius: '5px', 
                cursor: 'pointer',
                textDecoration: 'none', 
                fontSize: '16px', 
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#600000'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#800000'}
            >
              Sign Out
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
