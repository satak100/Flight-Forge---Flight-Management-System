import React, { useContext, useState, useEffect } from 'react';
import { RouteContext } from '../context/RouteContext';
import RouteFinder from '../apis/RouteFinder';
import { Link } from 'react-router-dom';
import { FaSort } from 'react-icons/fa'; // Import FaSort icon

const RouteList = () => {
    const { transitInfo, setSelectedTransit, setTransitInfo, clicked, setclicked } = useContext(RouteContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5); // Default to 10 entries per page

    const [departureTimes, setDepartureTimes] = useState([]);
    const [arrivalTimes, setArrivalTimes] = useState([]);
    const [expandedTransit, setExpandedTransit] = useState(null);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [selectedLuggage, setSelectedLuggage] = useState(null);

    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const departurePromises = transitInfo.map(async (transit) => {
                    const response = await RouteFinder.post('/route/departuretime', { route_id: transit.route[0] });
                    return response.data.time;
                });

                const arrivalPromises = transitInfo.map(async (transit) => {
                    const response = await RouteFinder.post('/route/arrivaltime', { route_id: transit.route[transit.route.length - 1] });
                    return response.data.time;
                });

                const departureTimes = await Promise.all(departurePromises);
                const arrivalTimes = await Promise.all(arrivalPromises);

                setDepartureTimes(departureTimes);
                setArrivalTimes(arrivalTimes);
            } catch (error) {
                console.error('Error fetching times:', error);
            }
        };

        fetchTimes();
    }, [transitInfo]);

    // Calculate the index of the last entry on the current page
    const indexOfLastEntry = currentPage * entriesPerPage;

    // Calculate the index of the first entry on the current page
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

    // Get the current entries to display on the page
    const currentEntries = transitInfo.slice(indexOfFirstEntry, indexOfLastEntry);

    const toggleExpand = (index) => {
        setExpandedTransit(expandedTransit === index ? null : index);
    };

    const handleBuyTicket = (transit) => {
        console.log('Selected transit:', transit);
        setSelectedTransit(transit);
    };

    const renderExpandedDetails = (transit) => {
        return (
            <table className="table">
                <thead>
                <tr>
                    <th style={{ fontFamily: '-moz-initial', fontSize: '18px' }}>Airplane Name</th>
                    <th style={{ fontFamily: '-moz-initial', fontSize: '18px' }}>Airport From</th>
                    <th style={{ fontFamily: '-moz-initial', fontSize: '18px' }}>Airport To</th>
                    <th style={{ fontFamily: '-moz-initial', fontSize: '18px' }}>Rating</th>
                </tr>
                </thead>
                <tbody>
                    {transit.airplanename.map((airplane, i) => (
                        <tr key={i}>
                            <td style={{ fontFamily:'-moz-initial' }}>{airplane}</td>
                            <td style={{ fontFamily:'-moz-initial' }}>{transit.airport[i]}</td>
                            <td style={{ fontFamily:'-moz-initial' }}>{transit.airport[i + 1]}</td>
                            <td style={{ fontFamily:'-moz-initial' }}>{renderRatingStars(transit.rating[i])}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderRatingStars = (rating) => {
        const starCount = Math.round(rating);
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < starCount) {
                stars.push(
                    <span key={i} style={{ color: 'gold', fontSize: '1.8em', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        &#9733;
                    </span>
                );
            } else {
                stars.push(
                    <span key={i} style={{ color: 'gold', fontSize: '1.8em', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        &#9734;
                    </span>
                );
            }
        }
        return stars;
    };    

    // When sorting is applied, update the URL parameters
    const sortTransit = (type) => {
        let sortedTransit = [...transitInfo];
        switch (type) {
            case 'cost':
                sortedTransit.sort((a, b) => a.cost - b.cost);
                break;
            case 'luggage':
                sortedTransit.sort((a, b) => a.luggage - b.luggage);
                break;
            case 'transit':
                sortedTransit.sort((a, b) => a.route.length - b.route.length);
                break;
            case 'duration':
                sortedTransit.sort((a, b) => new Date(b.date[b.date.length - 1]) - new Date(a.date[0]));
                break;
            default:
                break;
        }
        setTransitInfo(sortedTransit);

        // Update URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('sort', type);
        window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    };

    // Parse URL parameters to retrieve sorting criteria on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort');
        if (sortParam) {
            sortTransit(sortParam);
        }
    }, []);

    return (
        <div>
            {transitInfo.length > 0 ? (
                <div className="container">
                    <div style={{padding:'1%'}}></div>
                    <div className="sort-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                        <button className="sort-button" onClick={() => setSortDropdownOpen(!sortDropdownOpen)} style={{ backgroundColor: 'red', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', fontFamily:'-moz-initial'  }}>
                            <FaSort style={{ marginRight: '5px' }} /> Sort
                        </button>
                        {sortDropdownOpen && (
                            <div className="dropdown-content" style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', fontFamily:'-moz-initial' , backgroundColor: 'white', borderRadius: '5px', position: 'absolute', top: '40px', right: '0', zIndex: '1' }}>
                                <button onClick={() => { sortTransit('cost'); setSortDropdownOpen(false); }} style={{ display: 'block', fontFamily:'-moz-initial' , width: '100%', padding: '10px', textAlign: 'left', border: 'none', backgroundColor: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>Cost</button>
                                <button onClick={() => { sortTransit('luggage'); setSortDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'left', border: 'none', backgroundColor: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>Luggage</button>
                                <button onClick={() => { sortTransit('duration'); setSortDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'left', border: 'none', backgroundColor: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>Duration</button>
                                <button onClick={() => { sortTransit('transit'); setSortDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'left', border: 'none', backgroundColor: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>Transit</button>
                            </div>
                        )}
                    </div>
                    <div style={{padding:'1%'}}></div>
                    <div className="pagination" style={{ 
                        textAlign: 'center', 
                        marginTop: '20px', 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <button style={{  fontFamily:'-moz-initial' , marginRight: '10px', backgroundColor: 'red', color: 'white' }} onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                        <span style={{ fontFamily:'-moz-initial' , marginRight: '10px' }}>Page {currentPage} of {Math.ceil(transitInfo.length / entriesPerPage)}</span>
                        <button style={{ fontFamily:'-moz-initial' , marginRight: '10px', backgroundColor: 'red', color: 'white' }} onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(transitInfo.length / entriesPerPage)}>Next</button>
                        <select style={{fontFamily:'-moz-initial', fontSize:'1.2rem' }} value={entriesPerPage} onChange={(e) => {
                            setEntriesPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                        }}>
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>

                    {currentEntries.map((transit, index) => (
                        <div key={index} className="card my-3 center" style={{ 
                            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', 
                            width: '75%',
                            margin: 'auto' /* Add this line */
                        }}>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col">
                                        <p className="text-left font-weight-bold" style={{ fontFamily:'-moz-initial' }}>{transit.airport[0]}</p>
                                        <p className="text-left font-weight-bold" style={{ fontFamily:'-moz-initial' }}>{departureTimes[index]}</p>
                                        <p className="text-left font-weight-bold" style={{ fontFamily:'-moz-initial' }}>{transit.date[0]}</p>
                                    </div>
                                    <div className="col text-right">
                                        <p className="text-right font-weight-bold" style={{ fontFamily:'-moz-initial' }}>{transit.airport[transit.airport.length - 1]}</p>
                                        <p className="text-right font-weight-bold" style={{ fontFamily:'-moz-initial' }}>{arrivalTimes[index]}</p>
                                        <p className="text-right font-weight-bold" style={{ fontFamily:'-moz-initial' }}>{transit.date[transit.airport.length - 1]}</p>
                                    </div>
                                </div>
                                <hr style={{ borderColor: 'red', borderWidth: '2px' }} />
                                <p className="text-center font-weight-bold" style={{ fontFamily:'-moz-initial' }}>{transit.route.length}</p>
                                <p className="text-left font-weight-bold" style={{ fontFamily:'-moz-initial' }}>Seat Left : {transit.seatsLeft}</p>
                                <p className="text-left font-weight-bold" style={{ fontFamily:'-moz-initial' }}>Total Distance : {transit.distance}</p>
                                <p className="text-left font-weight-bold" style={{ fontFamily:'-moz-initial' }}>Maximum Luggage : {transit.luggage}</p>
                                <Link
                                    to="/bookticket"
                                    className={transit.seatsLeft === 0 ? 'btn btn-secondary float-right' : 'btn btn-danger float-right'}
                                    disabled={transit.seatsLeft === 0}
                                    onClick={() => handleBuyTicket(transit)}
                                >
                                    Book Now
                                </Link>
                                <p className="text-left mt-3">
                                    <span className="font-weight-bold" style={{ fontFamily:'-moz-initial' , fontSize: '1.5rem' }}>Total Cost(per person): ${transit.cost}</span>
                                </p>
                                <a href='#'
                                    onClick={() => toggleExpand(index)}
                                    style={{ color: 'red', fontStyle: 'italic', textDecoration: 'underline' }}
                                >
                                    Expand
                                </a>
                                <div style={{ paddingBottom: '30px' }}></div>
                                {expandedTransit === index && (
                                    <div>
                                        {renderExpandedDetails(transit)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ paddingTop: '30px' }}><h3 style={{ textAlign: 'center', fontFamily: 'cursive' }}>{clicked}</h3></div>
            )}
            <div style={{padding:'5%'}}></div>
        </div>
    );
};

export default RouteList;
