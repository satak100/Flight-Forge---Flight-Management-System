import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RouteFinder from '../apis/RouteFinder';

const UserTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage, setTicketsPerPage] = useState(5);
    const [isUpcoming, setIsUpcoming] = useState(true);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [currentTickets, setCurrentTickets] = useState([]);

    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                const response = await RouteFinder.post('/user/authenticate', {
                    token: localStorage.getItem('token')
                });
                console.log(response.status);
                if (response.status !== 200) {
                    navigate('/');
                }
            } catch (error) {
                navigate('/');
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User ID or password not found.');
                    return;
                }

                const response = await RouteFinder.post('/user/tickets', { token: token });
                if (response.status === 200) {
                    setTickets(response.data.data.ticketinfo);
                    console.log(response.data.data.ticketinfo);
                } else {
                    setError('Failed to fetch user tickets.');
                }
            } catch (error) {
                setError('Failed to fetch user tickets. Please try again.');
            }
        };

        fetchUserTickets();
    }, [navigate]);

    useEffect(() => {
        setFilteredTickets(tickets.filter(transit => 
            isUpcoming ? 
            new Date(transit[0]?.journeydate) >= new Date() :
            new Date(transit[0]?.journeydate) < new Date()
        ));
    }, [tickets, isUpcoming]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * ticketsPerPage;
        const endIndex = startIndex + ticketsPerPage;
        setCurrentTickets(filteredTickets.slice(startIndex, endIndex));
    }, [currentPage, filteredTickets, ticketsPerPage]);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleReview = async (routeId) => {
        localStorage.setItem('route_id', routeId);
        navigate(`/review`);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(filteredTickets.length / ticketsPerPage); i++) {
            pageNumbers.push(i);
        }

        return pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <a onClick={() => handlePageChange(number)} className="page-link">
                    {number}
                </a>
            </li>
        ));
    };

    const formatDate = (dateString) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
        const date = new Date(dateString);
        const dayOfWeek = days[date.getDay()];
        const dayOfMonth = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
      
        return `${dayOfWeek}, ${dayOfMonth} ${month}, ${year}`;
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    setCurrentTickets([]);
    };

    const handleReturnTicket = async (ticket) => {
        const confirmReturn = window.confirm('Are you sure you want to return this ticket? 75% amount will be refunded.');
        if (confirmReturn) {
            try {
                const response = await RouteFinder.post('/user/returnticket', {
                    id: 0,
                    iid: ticket.ticket_id,
                    token: localStorage.getItem('token')
                });
                if (response.status === 200) {
                    alert('Ticket returned successfully.');
                    window.location.reload();
                } else {
                    alert('Failed to return ticket. Please try again.');
                }
            } catch (error) {
                console.error('Error returning ticket:', error);
                alert('Failed to return ticket. Please try again.');
            }
        } else {
            alert('Ticket return canceled by user.');
        }
    };

    const renderTicketTables = () => {
        return (
            <div>
                {currentTickets.map((transit, index) => (
                    <div key={index} className="card shadow mb-4 mx-auto" style={{ width: '75%', fontFamily: '-moz-initial'}}>
                        <div className="card-body">
                            <h5 className="card-title">User Info</h5>
                            <table className="table table-striped">
                                <tbody>
                                    <tr>
                                        <td>Fullname:</td>
                                        <td>{transit[0]?.fullname}</td>
                                    </tr>
                                    <tr>
                                        <td>Email:</td>
                                        <td>{transit[0]?.email}</td>
                                    </tr>
                                    <tr>
                                        <td>Date of Birth:</td>
                                        <td>{transit[0]?.dateofbirth?.split('T')[0]?.trim()}</td>
                                    </tr>
                                    <tr>
                                        <td>Country:</td>
                                        <td>{transit[0]?.country}</td>
                                    </tr>
                                    <tr>
                                        <td>City:</td>
                                        <td>{transit[0]?.city}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            {new Date(transit[0]?.journeydate) - new Date() > 1000 * 60 * 60 * 24 * 10 ? (
                                                <button className="btn btn-primary" onClick={() => handleReturnTicket(transit[0])}>Return Ticket</button>
                                            ) : (
                                                <button className="btn btn-secondary" disabled>Return Ticket</button>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <h5 className="card-title">Tickets</h5>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Journey Date</th>
                                        <th>Seat No</th>
                                        <th>Amount</th>
                                        <th>Passport Number</th>
                                        <th>Buy Date</th>
                                        <th>Transaction ID</th>
                                        <th>Review</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transit.map(ticket => (
                                        <tr key={ticket.ticket_id}>
                                            <td>{ticket?.journeydate?.split('T')[0]?.trim()} , {ticket?.journeydate?.split('T')[1]?.split('.')[0]?.trim()}</td>
                                            <td>{ticket?.seatno}</td>
                                            <td>{ticket?.amount}</td>
                                            <td>{ticket?.passportnumber}</td>
                                            <td>{ticket?.buydate?.split('T')[0]?.trim()} , {ticket?.buydate?.split('T')[1]?.split('.')[0]?.trim()}</td>
                                            <td>{ticket?.transactionid}</td>
                                            <td>
                                                {new Date() - new Date(ticket?.journeydate) > 1000 * 60 * 60 * 24 ? (
                                                    <button className="btn btn-primary" onClick={() => handleReview(ticket?.route_id)}>Give a review</button>
                                                ) : (
                                                    <button className="btn btn-secondary" disabled>Take Our Flight First</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <Link style={{
                color: 'white', 
                backgroundColor: '#800000', 
                padding: '15px 20px', 
                borderRadius: '5px',
                cursor: 'pointer',
                textDecoration: 'none', 
                fontSize: '16px', 
                transition: 'background-color 0.3s',
                position: 'absolute',
                top: '3%',
                right: '3%',
                marginTop: '10px',
            }} to="/">Go to Home</Link>
            <button style={{
                color: 'white', 
                backgroundColor: '#800000', 
                padding: '15px 20px', 
                borderRadius: '5px',
                cursor: 'pointer',
                textDecoration: 'none', 
                fontSize: '16px', 
                transition: 'background-color 0.3s',
                position: 'absolute',
                top: '3%',
                right: '14%',
                marginTop: '10px',
            }} onClick={handleSignOut}>Sign Out</button>

            <div className="container mt-4" style={{width: '21%', padding: '3%'}}>
                <div className="card text-center p-3 shadow-lg bg-light">
                    <select onChange={e => setTicketsPerPage(parseInt(e.target.value))} className="form-select form-select-lg">
                        <option value="5">5 Tickets Per Page</option>
                        <option value="10">10 Tickets Per Page</option>
                        <option value="100">100 Tickets Per Page</option>
                    </select>
                </div>
            </div>
            <div className="text-right">
                <button onClick={() => {
                    setIsUpcoming(true);
                    setCurrentTickets([]);
                    setCurrentPage(1);
                }} className={`btn ${isUpcoming ? 'btn-primary' : 'btn-secondary'} mr-2`}>Upcoming</button>
                <button onClick={() => {
                    setIsUpcoming(false);
                    setCurrentTickets([]);
                    setCurrentPage(1);
                }} className={`btn ${isUpcoming ? 'btn-secondary' : 'btn-primary'}`}>Ticket Archive</button>
            </div>
            {tickets.length > 0 ? (
                <div>
                    <div className="text-center">
                        <nav aria-label="Page navigation example">
                            <ul className="pagination justify-content-center">
                                {renderPageNumbers()}
                            </ul>
                        </nav>
                    </div>
                    {renderTicketTables()}
                </div>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', textShadow: '2px 2px 4px #000' }}>No tickets found.</p>
                </div>
            )}
        </div>
    );
};

export default UserTicket;
