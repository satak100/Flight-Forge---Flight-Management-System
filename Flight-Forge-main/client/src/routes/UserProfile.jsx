import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import RouteFinder from '../apis/RouteFinder';
import defaultprofileimage from '../assets/tlogo.png';
import backgroundImage from '../assets/cover.png';

const UserProfile = () => {
    const [formData, setFormData] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        mobileNo: '',
        country: '',
        city: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    let [profilePhoto, setProfilePhoto] = useState(defaultprofileimage);
    const [updateprofile, setUpdateProfile] = useState(false);
    const [ updatePassword, setUpdatePassword] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            setProfilePhoto(defaultprofileimage);
            try {
                const response = await RouteFinder.post('/user/authenticate', {
                    token: localStorage.getItem('token')
                });
                console.log(response.status);
                if (response.status === 200) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                    navigate('/');
                }
            } catch (error) {
                setIsLoggedIn(false);
                navigate('/');
            }
        };

        fetchUserData();
        fetchProfileData();
    }, [navigate]);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('User ID or password not found.');
                return;
            }

            const response = await RouteFinder.post('/user/profiledata', {
                id: 0,
                token: token
            });
            if(response.data.data.user.profilephoto.length > 0){
                //setProfilePhoto(response.data.data.user.profilephoto);
                console.log(profilePhoto);
            }
            else
            {
                console.log("not baaaaaal");
            }
            setUserData(response.data.data.user);
        } catch (error) {
            localStorage.removeItem('token');
            navigate('/signin');
            setError('Failed to fetch user data. Please try again.');
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.reload(); // Reload the current page
        console.log("Signing out...");
    };

    const handleTicket = () => {
        navigate('/userticket');
    };

    const handleprofileupdate = async (e) => {
        e.preventDefault();

        try {
            // Prepare the data to be sent to the backend
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobileNo: formData.mobileNo,
                country: formData.country,
                city: formData.city,
                token: localStorage.getItem('token'),
                id: 0
            };
            console.log(userData);
            const response = await RouteFinder.post('/user/profileupdate', userData);
            window.location.reload()
        } catch (error) {
            navigate('/signin');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        try {
            if(formData.confirmPassword !== formData.newPassword)
            {
                alert("Password and Confirm Password does not match");
                return;
            }
            // Prepare the data to be sent to the backend
            const userData = {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
                token: localStorage.getItem('token'),
                id: 0
            };
            const response = await RouteFinder.post('/user/passwordupdate', userData);
            localStorage.setItem('token', response.data.token);
        } catch (error) {
            navigate('/signin');
        }
    };

    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();

        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    return (
        <div className="container-fluid" style={{
            backgroundImage: `url(${backgroundImage})`, // Use the imported background image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            paddingTop: '10px',
            fontFamily: '-moz-initial'
        }}>
            <div className="container mt-4">
                <div className="d-flex justify-content-end align-items-center mb-4">
                    <div className="mr-auto">
                        <img src={profilePhoto} alt="Profile" style={{ width: '150px', height: '150px', borderRadius: '50%', marginRight: '10px' }} />
                        <h1 style={{ paddingTop: '30px', color: 'green', fontWeight: 'bold', fontFamily: 'cursive' }}>ID: {userData ? userData.id : ''}</h1>
                    </div>
                    <div className="button-group">
                        <Link style={{
              color: 'white', 
              backgroundColor: '#800000', 
              padding: '15px 20px', // Adjust padding here
              marginRight: '10px', 
              borderRadius: '5px',
              cursor: 'pointer',
              textDecoration: 'none', 
              fontSize: '16px', 
              transition: 'background-color 0.3s',
            }} to="/">Go to Home</Link>
                        <button style={{
              color: 'white', 
              backgroundColor: '#800000', 
              padding: '15px 20px', // Adjust padding here
              marginRight: '10px', 
              borderRadius: '5px',
              cursor: 'pointer',
              textDecoration: 'none', 
              fontSize: '16px', 
              transition: 'background-color 0.3s',
            }} onClick={handleSignOut}>Sign Out</button>
            <button style={{
              color: 'white', 
              backgroundColor: '#800000', 
              padding: '15px 20px', // Adjust padding here
              marginRight: '10px', 
              borderRadius: '5px',
              cursor: 'pointer',
              textDecoration: 'none', 
              fontSize: '16px', 
              transition: 'background-color 0.3s',
            }} onClick={handleTicket}>Tickets</button>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-md-9">
                        <button className='btn btn-danger' style={{marginBottom: '10px', marginRight: '10px'}} onClick={e => {
                            setUpdateProfile(!updateprofile);
                            if(updateprofile)
                            {
                                setUpdatePassword(false);
                            }
                        }}>update profile</button>
                        <button className='btn btn-danger' style={{marginBottom: '10px', marginRight: '10px'}} onClick={e => {
                            setUpdatePassword(!updatePassword);
                            if(updatePassword)
                            {
                                setUpdateProfile(false);
                            }
                        }}>update password</button>
                        {updatePassword ? (
    <div>
        <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
                <label>Old Password:</label>
                <input type="password" className="form-control" name="oldPassword" value={formData.oldPassword} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>New Password:</label>
                <input type="password" className="form-control" name="newPassword" value={formData.newPassword} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Confirm Password:</label>
                <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
            <button className="btn btn-secondary" onClick={() => setUpdatePassword(false)}>Cancel</button>
        </form>
    </div>
) : (
    <p></p>
)}
                        {updateprofile ? (
    <div className="container">
        <form ostyle={{ marginTop: '20px' }}>
            <div className="form-group">
                <label>First Name:</label>
                <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Last Name:</label>
                <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Mobile Number:</label>
                <input type="text" className="form-control" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Country:</label>
                <input type="text" className="form-control" name="country" value={formData.country} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>City:</label>
                <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="btn-group" role="group" aria-label="Profile Update Buttons" style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-success" onClick={e => handleprofileupdate(e)} style={{marginRight: '10px', marginBottom: '30px'}}>Submit</button>
                <button type="button" className="btn btn-danger" onClick={() => setUpdateProfile(false)} style={{marginRight: '10px', marginBottom: '30px'}}>Cancel</button>
            </div>
        </form>
    </div>
) : (
    <p></p>
)}
                        {userData ? (
                            <div>
                                <div className="user-info-group shadow p-3 mb-5 bg-white rounded">
                                    <h4 style={{ marginBottom: '20px', fontSize: '24px', textAlign: 'center', fontFamily: 'cursive' }}>User Info</h4>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <th>First Name</th>
                                                <td>{userData.first_name}</td>
                                            </tr>
                                            <tr>
                                                <th>Last Name</th>
                                                <td>{userData.last_name}</td>
                                            </tr>
                                            <tr>
                                                <th>Date of Birth</th>
                                                <td>{userData.dateofbirth.split('T')[0]}</td>
                                            </tr>
                                            <tr>
                                                <th>Age</th>
                                                <td>{calculateAge(userData.dateofbirth)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="contact-group shadow p-3 mb-5 bg-white rounded">
                                    <h4 style={{ marginBottom: '20px', fontSize: '24px', textAlign: 'center', fontFamily: 'cursive' }}>Contact</h4>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <th>Mobile Number</th>
                                                <td>{userData.mobileno.join(', ')}</td>
                                            </tr>
                                            <tr>
                                                <th>Gmail Account</th>
                                                <td>{userData.email}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="address-group shadow p-3 mb-5 bg-white rounded">
                                    <h4 style={{ marginBottom: '20px', fontSize: '24px', textAlign: 'center', fontFamily: 'cursive' }}>Address</h4>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <th>City</th>
                                                <td>{userData.city}</td>
                                            </tr>
                                            <tr>
                                                <th>Country</th>
                                                <td>{userData.country}</td>
                                            </tr>
                                            <tr>
                                                <th>Zipcode</th>
                                                <td>{userData.zipcode}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <p>{error || 'Loading...'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
