import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RouteFinder from '../apis/RouteFinder';

const CreateAccount = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [passportnumber, setPassportnumber] = useState('');
    const [error, setError] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null); // State for profile photo
    const navigate = useNavigate();

    const handleGeneratePassword = () => {
        const generatedPass = Math.random().toString(36).slice(-8);
        setPassword(generatedPass);
        setConfirmPassword(generatedPass);
        setGeneratedPassword(generatedPass);
    };

    const handleFileChange = (e) => {
        setProfilePhoto(e.target.files[0]); // Capture the selected file
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('profilePhoto', profilePhoto); // Make sure profilePhoto contains the file object
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('dateofbirth', dateOfBirth);
        formData.append('mobileno', mobileNo);
        formData.append('password', password);
        formData.append('city', city);
        formData.append('country', country);
        formData.append('zipcode', parseInt(zipcode));
        formData.append('email', email);
        formData.append('passportnumber', parseInt(passportnumber));
    
        try {
            console.log('Creating account...');
            const response = await RouteFinder.post('/user/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
    
            console.log(response);
    
            if (response.status === 200) {
                const token = response.data.data.token;
                localStorage.setItem('token', token);
                navigate("/userprofile");
            } else {
                // Handle other status codes
                const data = await response.json();
                if (data && data.error) {
                    setError(data.error);
                } else {
                    setError('Failed to create account. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error creating account:', error);
            setError('Failed to create account. Please try again.');
        }
    };
    
    const getCurrentDate = () => {
        const today = new Date();
        let month = String(today.getMonth() + 1);
        let day = String(today.getDate());
        const year = String(today.getFullYear());
    
        // Add leading zero if month or day is less than 10
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
    
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-danger text-white">
                            Create Account
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleCreateAccount}>
                            <div className="form-group">
                                    <label>First Name:</label>
                                    <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name:</label>
                                    <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                </div>
                                <div className="form-group">
    <label>Date of Birth:</label>
    <input type="date" className="form-control" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={getCurrentDate()} required />
</div>
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input type="text" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Mobile No:</label>
                                    <input type="text" className="form-control" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Password:</label>
                                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password:</label>
                                    <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    {confirmPassword && password !== confirmPassword && <p className="text-danger">Passwords do not match.</p>}
                                    {confirmPassword && password === confirmPassword && <p className="text-success">Passwords match.</p>}
                                </div>
                                <div className="form-group">
                                    <label>City:</label>
                                    <input type="text" className="form-control" value={city} onChange={(e) => setCity(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Country:</label>
                                    <input type="text" className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Zipcode:</label>
                                    <input  className="form-control" value={zipcode} onChange={(e) => {
                                        //if(e.target.value > 0) setZipcode(e.target.value);
                                        //else setZipcode(1206);
                                        setZipcode(e.target.value);
                                    }} required />
                                    <label>Passport:</label>
                                    <input className="form-control" value={passportnumber} onChange={(e) => {
                                        setPassportnumber(e.target.value);
                                    }} />
                                </div>
                                {/* Other form inputs */}
                                <div className="form-group">
                                    <label>Profile Photo:</label>
                                    <input type="file" className="form-control-file" onChange={handleFileChange} />
                                </div>
                                <button type="button" className="btn btn-success mb-3" onClick={handleGeneratePassword}>Generate Password</button>
                                <p>Generated Password: {generatedPassword}</p>
                                <button type="submit" className="btn btn-danger btn-block">Create Account</button>
                            </form>
                            <Link to="/signin" className="btn btn-link mt-3">Already have an account? Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;
