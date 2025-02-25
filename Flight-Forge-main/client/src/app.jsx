import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import { RouteContextProvider } from './context/RouteContext';
import ReviewPage from './routes/ReviewPage';
import SignInPage from './routes/SignInPage';
import CreateAccount from './routes/CreateAccount';
import { Helmet } from 'react-helmet';
import UserProfile from './routes/UserProfile';
import BookTicket from './routes/BookTicket';
import icon from './assets/tlogo.png'; 
import UserTickets from './routes/userTicket';
import AirlineSignin from './routes/AirlineSignin';
import AirlineProfile from './routes/AirlineProfile';
import AirlineAirplane from './routes/AirlineAirplane';
import AirlineCreateAccount from './routes/AirlineCreateAccount';
import AirlineAddAirplane from './routes/AirlineAddAirplane';
import ReviewForm from './routes/ReviewPage';

const App = () => {
    return (
        <RouteContextProvider>
            <div>
                <Router>
                    {/* Set the website's title and favicon */}
                    <Helmet>
                        <title>FlightForge</title>
                        <link rel="icon" type="image/png" href={icon} />
                    </Helmet>
                    
                    {/* Define routes */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/userreview" element={<ReviewPage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/CreateAccount" element={<CreateAccount />} />
                        <Route path="/userprofile" element={<UserProfile />} />
                        <Route path="/bookticket" element={<BookTicket />} />
                        <Route path="/userticket" element={<UserTickets />} />
                        <Route path="/airline/signin" element={<AirlineSignin />} />
                        <Route path="/airline/signup" element={<AirlineCreateAccount />} />
                        <Route path="/airline/profile" element={<AirlineProfile />} />
                        <Route path="/airline/airplane" element={<AirlineAirplane />} />
                        <Route path="/airline/addairplane" element={<AirlineAddAirplane />} />
                        <Route path="/review" element={<ReviewForm />} />
                    </Routes>
                </Router>
            </div>
        </RouteContextProvider>
    );
};

export default App;
