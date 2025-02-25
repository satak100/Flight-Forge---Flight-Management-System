import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import RouteFinder from '../apis/RouteFinder';
import { useNavigate } from 'react-router-dom';
import { RouteContext } from '../context/RouteContext';

const AirlineProfile = () => {
    const [airlineInfo, setAirlineInfo] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { airplane, setAirplane, airplane_id, setAirplane_id, review, setReview } = useContext(RouteContext);

    useEffect(() => {
        fetchAirlineInfo();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
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
        };

        fetchData();
    }, []);

    const fetchAirlineInfo = async () => {
        try {
            const response = await RouteFinder.post('/airline/info', {
                id: 0,
                token: localStorage.getItem('token')
            });
            console.log(response.data);
            if (response.status === 200) {
                setAirlineInfo(response.data.data);
            } else {
                setError('Failed to fetch airline information1.');
                navigate('/');
            }
        } catch (error) {
            setError('Failed to fetch airline information2.');
            navigate('/');
        }
    };

    // Custom line graph implementation
    const renderLineGraph = () => {
        if (!airlineInfo) {
            return null;
        }
    
        const maxX = airlineInfo.revenue.length;
        const maxY = Math.max(...airlineInfo.revenue.map(item => item.total_amount));
        const height = 300; // Height remains constant
        const margin = 40;
    
        // Calculate the width of the SVG based on the width of the container div
        const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 0;
        const width = containerWidth > 500 ? 500 : containerWidth; // Set a maximum width of 500px
    
        const xScale = (index) => {
            if (maxX === 2) {
                return 0;
            }
            return (width - 2 * margin) * index / maxX + margin;
        };
    
        const yScale = (value) => {
            return height - margin - (height - 2 * margin) * value / maxY;
        };
    
        return (
            <div style={{ width: '100%', overflowX: 'auto', boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)' }} ref={containerRef}>
                <svg width={width} height={height} style={{ background: '#FFF', width: '100%', paddingLeft: '30px', fontFamily: '-moz-initial', fontWeight: 'bold', filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2))' }}>
                    {/* Draw axes */}
                    <line x1={margin} y1={height - margin} x2={width - margin} y2={height - margin} stroke="black" />
                    <line x1={margin} y1={margin} x2={margin} y2={height - margin} stroke="black" />
                    {/* Draw red markers */}
                    {airlineInfo.revenue.map((item, index) => (
                        <circle
                            key={index}
                            cx={xScale(index)}
                            cy={yScale(item.total_amount)}
                            r={5} // Adjust radius as needed
                            fill="red"
                        />
                    ))}
                    {/* Add x labels */}
                    <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="23">Date</text>
                    {/* Y label */}
                    {/* Text on the Y-axis label will not be rotated */}
                    <text x={20} y={height / 2} textAnchor="middle" fontSize="23" transform={`rotate(-90, 20, ${height / 2})`}>Revenue</text>
                </svg>
            </div>
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

    const handleAddRoute = (plane) => {
        setAirplane(plane);
        setAirplane_id(airlineInfo.root.id);
        navigate('/airline/add-route');
    };

    const handleAirplane = (plane, x) => {
        console.log('x', x);
        //setReview(x);
        setAirplane(plane);
        setAirplane_id(airlineInfo.root.id);
        console.log(plane);
        console.log(airplane_id);
        navigate('/airline/airplane');
    };

    return (
        <div className="container mt-5">
            <button className='btn btn-danger' onClick={e => navigate('/')}>Go to Home</button>
            {error && <p>{error}</p>}
            {airlineInfo && (
                <div className="d-flex justify-content-center">
                    <div className="bg-light p-4" style={{ width: '75%' }}>
                        <h1 className="mb-4" style={{ color: 'green', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', textAlign: 'center' }}>{airlineInfo.root.name}</h1>
                        <Link to="/airline/addairplane" className="btn btn-primary mb-3">Add Airplane</Link>
                        {/* Render the custom line graph */}
                        <div style={{padding: '10px', width: '100%' }}>{renderLineGraph()}</div>
                        {/* Airline Info Table */}
                        <h3 className="mb-3">Airline Information</h3>
                        <table className="table table-striped table-hover">
                            <tbody>
                                <tr>
                                    <td>ID</td>
                                    <td>{airlineInfo.root.id}</td>
                                </tr>
                                <tr>
                                    <td>Total Planes</td>
                                    <td>{airlineInfo.root.totalplane}</td>
                                </tr>
                                <tr>
                                    <td>Total Planes</td>
                                    <td>{airlineInfo.root.revenue}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {airlineInfo && (
                <div className="d-flex justify-content-center mt-5">
                    <div className="bg-light p-4" style={{ width: '50%' }}>
                        <h3 className="mb-3">Airplane List</h3>
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Star</th>
                                </tr>
                            </thead>
                            <tbody>
                                {airlineInfo.airplane.map((plane, index) => (
                                    <tr key={index}>
                                        <td><button className='btn btn-warning btn-pill' onClick={e => {
                                            handleAirplane(plane, airlineInfo.review[index]);
                                            console.log(airlineInfo.review[index]);
                                        }}>{plane.airplanename}</button></td>
                                        <td>{renderRatingStars(plane.rating)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AirlineProfile;
