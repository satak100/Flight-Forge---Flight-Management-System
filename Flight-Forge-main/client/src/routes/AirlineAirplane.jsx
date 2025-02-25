import React, { useState, useContext, useEffect } from 'react';
import { RouteContext } from '../context/RouteContext';
import { Link } from 'react-router-dom';
import RouteFinder from '../apis/RouteFinder';
import { useNavigate } from 'react-router-dom';

const AirlineAirplane = () => {
  const { airplane, airplane_id, review, setReview } = useContext(RouteContext);
  const [editMode, setEditMode] = useState(false);
  const [editMode2, setEditMode2] = useState(false);
  const [addroute, setAddRoute] = useState(false);
  const [editedAirplane, setEditedAirplane] = useState({ ...airplane });
  const [selectedDays, setSelectedDays] = useState([...airplane.days]); // Initialize with existing airplane days
  const [selectedDay, setSelectedDay] = useState('');
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [editedRoute, setEditedRoute] = useState({});
  const [airports, setAirports] = useState([]);
  const [start_airplane_id, setStartAirplane_id] = useState(0);
  const [end_airplane_id, setEndAirplane_id] = useState(0);

  // Function to handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAirplane({ ...editedAirplane, [name]: value });
  };

  useEffect(() => {
    console.log('done? -> ', review);
    const fetchData = async () => {
      try {
        const response = await RouteFinder.post('/user/authenticate', {
            token: localStorage.getItem('token')
        });
        console.log(response.status);
        if (response.status === 200) {
        } else {
            navigate('/');
        }
      } catch (error) {
          navigate('/');
      }

      try {
        const response1 = await RouteFinder.get("/airports");
        console.log(response1.data.data.Airport);
        setAirports(response1.data.data.Airport);
      } catch (error) {
        console.log('error fetching airport');
      }

      try {
        console.log(airplane.id);
        const response = await RouteFinder.post("/getroutes", { id: airplane.id });
        if(response.data.routes == null) console.log("baaal");
        setRoutes(response.data.routes);
        console.log(response);
      } catch (error) {
        console.error('Error fetching routes:');
      }
      try {
        console.log('here', airplane.id);
        const response = await RouteFinder.post("/airline/airplaneinfo", { id: airplane.id });
        console.log(response);
      } catch (error) {
        console.log('error fetching airplane info');
      }
    };

    fetchData();
  }, [airplane.id]);

  const handleDelete = (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        const response = RouteFinder.post("/deleteroute", { id: routeId });
        setRoutes(routes.filter(route => route.id !== routeId));
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
  };

  function formatTime(time) {
    if (!time) return ''; // Return empty string if time is not provided
  
    // Split the time string into hours and minutes
    const [hours, minutes] = time.split(':');
  
    // Format the time string in HH:MM format
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const handleAirportChange = (e, type) => {
    const { value } = e.target;
  
    // Update editedRoute based on the type of airport being changed
    if (type === 'start') {
      setEditedRoute({ ...editedRoute, startAirport: value});
    } else {
      setEditedRoute({ ...editedRoute, endAirport: value});
    }
    console.log(editedRoute.startAirport, editedRoute.endAirport);
  };

  const handleEdit = (routeId) => {
    // Find the route to edit by routeId
    const routeToEdit = routes.find((route) => route.id === routeId);
    console.log(routeToEdit, routeId);

    // Populate the form fields with the route's current values
    setEditedRoute({
      id: routeToEdit.id,
      startAirport: routeToEdit.start_name,
      endAirport: routeToEdit.end_name,
      distance: routeToEdit.distance_km,
      arrivalTime: routeToEdit.arrival_time,
      departureTime: routeToEdit.departure_time,
    });

    // Set edit mode to true to display the form
    setEditMode2(true);
  };
  
  const renderEditForm = () => {
    return (
      <div>
        {addroute && (<h3>Add Route</h3>)}
        {!addroute && (<h3>Edit Route</h3>)}
        <form>
        <div className="form-group">
  <label>Start Airport:</label>
  <input
    type="text"
    className="form-control"
    name="startAirport"
    value={editedRoute.startAirport}
    onChange={(e) => {
      setEditedRoute({ ...editedRoute, startAirport: e.target.value });
    }}
    list="startAirports"
  />
  <datalist id="startAirports">
    {airports.map((airport, index) => (
      <option key={index} value={`${airport.name}, ${(airport.address.split(',')[0].trim()).split('(')[1].trim()}, ${(airport.address.split(',')[1].trim())}`} />
    ))}
  </datalist>
</div>
        <div className="form-group">
  <label>End Airport:</label>
  <input
    type="text"
    className="form-control"
    name="endAirport"
    value={editedRoute.endAirport}
    onChange={(e) => {
      setEditedRoute({ ...editedRoute, endAirport: e.target.value });
    }}
    list="endAirports"
  />
  <datalist id="endAirports">
    {airports.map((airport, index) => (
      <option key={index} value={`${airport.name}, ${(airport.address.split(',')[0].trim()).split('(')[1].trim()}, ${(airport.address.split(',')[1].trim())}`} />
    ))}
  </datalist>
</div>
          <div className="form-group">
            <label>Distance (km):</label>
            <input
              type="number"
              className="form-control"
              name="distance"
              value={editedRoute.distance}
              onChange={(e) => setEditedRoute({ ...editedRoute, distance: e.target.value })}
            />
          </div>
          <div className="form-group">
  <label>Arrival Time:</label>
  <div className="input-group">
    <input
      type="time"
      className="form-control"
      name="arrivalTime"
      value={formatTime(editedRoute.arrivalTime)}
      onChange={(e) => {
        setEditedRoute({ ...editedRoute, arrivalTime: e.target.value });
        console.log(editedRoute);
      }}
    />
    <div className="input-group-append">
      <span className="input-group-text">GMT</span>
    </div>
  </div>
</div>
<div className="form-group">
  <label>Departure Time:</label>
  <div className="input-group">
    <input
      type="time"
      className="form-control"
      name="departureTime"
      value={formatTime(editedRoute.departureTime)}
      onChange={(e) => {
        setEditedRoute({ ...editedRoute, departureTime: e.target.value });
      }}
    />
    <div className="input-group-append">
      <span className="input-group-text">GMT</span>
    </div>
  </div>
</div>
          <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }} onClick={e => {
            e.preventDefault();
            if(addroute) handleSubmitRoute();
            else handleSubmitRoute1(editedRoute.id);
            addroute ? setAddRoute(!addroute) : setEditMode2(!editMode2);
            //window.location.reload();
          }}>Save Changes</button>
          <button type="button" className="btn btn-secondary" onClick={() => {
            addroute ? setAddRoute(!addroute) : setEditMode2(!editMode2);
          }}>Cancel</button>
        </form>
      </div>
    );
  };

  const handleSubmitRoute = async () => {
    try {
        console.log(editedRoute);
        let res1 = await RouteFinder.post("/airport/findbyname", {name: editedRoute.startAirport.split(',')[0].trim()});
        console.log(editedRoute.startAirport.split(',')[0].trim(), res1.data.id);
        let res2 = await RouteFinder.post("/airport/findbyname", {name: editedRoute.endAirport.split(',')[0].trim()});
        console.log(editedRoute.endAirport.split(',')[0].trim(), res2.data.id);
        const resposne = await RouteFinder.post("/airline/addroute", {
          airplane_id: airplane.id,
          start_airport_id: res1.data.id,
          end_airport_id: res2.data.id,
          distance_km: editedRoute.distance,
          arrival_time: editedRoute.arrivalTime,
          departure_time: editedRoute.departureTime,
        });
        console.log(resposne);
      } catch (error) {
        console.error('Error updating route:', error);
      }
  };

  const handleSubmitRoute1 = async (routeId) => {
    try {
        console.log(editedRoute);
        let res1 = await RouteFinder.post("/airport/findbyname", {name: editedRoute.startAirport.split(',')[0].trim()});
        console.log(editedRoute.startAirport.split(',')[0].trim(), res1.data.id);
        let res2 = await RouteFinder.post("/airport/findbyname", {name: editedRoute.endAirport.split(',')[0].trim()});
        console.log(editedRoute.endAirport.split(',')[0].trim(), res2.data.id);
        const resposne = await RouteFinder.post("/airline/updateroute", {
          airplane_id: airplane.id,
          start_airport_id: res1.data.id,
          end_airport_id: res2.data.id,
          distance_km: editedRoute.distance,
          arrival_time: editedRoute.arrivalTime,
          departure_time: editedRoute.departureTime,
          route_id: routeId
        });
        console.log(resposne);
      } catch (error) {
        console.error('Error updating route:', error);
      }
  };

  const renderEditRouteForm = () => {
    return (
      <div>
        <h3>Edit Route</h3>
        <form onSubmit={handleSubmitRoute}>
          {/* Form fields for editing route details */}
        </form>
      </div>
    );
  };

  const renderInputFields = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID:</label>
          <input type="text" className="form-control" name="id" value={editedAirplane.id} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Rating:</label>
          <input type="text" className="form-control" name="rating" value={editedAirplane.rating} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Day Rate:</label>
          <input type="text" className="form-control" name="day_rate" value={editedAirplane.day_rate} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Seat Rate:</label>
          <input type="text" className="form-control" name="seat_rate" value={editedAirplane.seat_rate} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Luggage (Commercial):</label>
          <input type="text" className="form-control" name="luggage_commercial" value={editedAirplane.luggage} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Luggage (Business):</label>
          <input type="text" className="form-control" name="luggage_business" value={editedAirplane.luggage} onChange={handleInputChange} required/>
        </div>
        {/* Add other input fields for airplane details */}
        <div className="form-group">
          <label>Days:</label>
          <div className="input-group">
            <select className="custom-select" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
              <option value="">Select Day</option>
              {daysOfWeek.map(day => (
                !selectedDays.includes(day) && <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <div className="input-group-append">
              <button className="btn btn-primary" type="button" onClick={() => {
                if (selectedDay) {
                  setSelectedDays([...selectedDays, selectedDay]);
                  setSelectedDay('');
                }
              }}>Add</button>
            </div>
          </div>
          <div>
          {selectedDays.map((day, index) => (
            <span key={index} className="badge badge-danger m-1">
              {day} 
              <button type="button" className="btn-close btn-close-lg" aria-label="Close" onClick={() => {
                setSelectedDays(selectedDays.filter(d => d !== day))
              }}></button>
            </span>
          ))}
          </div>
        </div>
        <div className="form-group">
          <label>Airline ID:</label>
          <input type="text" className="form-control" name="airline_id" value={editedAirplane.airline_id} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Commercial Seat:</label>
          <input type="text" className="form-control" name="business_seat" value={editedAirplane.business_seat} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Business Seat:</label>
          <input type="text" className="form-control" name="commercial_seat" value={editedAirplane.commercial_seat} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Cost per KM Business:</label>
          <input type="text" className="form-control" name="cost_per_km_business" value={editedAirplane.cost_per_km_business} onChange={handleInputChange} required/>
        </div>
        <div className="form-group">
          <label>Cost per KM Commercial:</label>
          <input type="text" className="form-control" name="cost_per_km_commercial" value={editedAirplane.cost_per_km_commercial} onChange={handleInputChange} required/>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    );
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log(editedAirplane);
      const response = await RouteFinder.post("/airline/updateairplane", {
        airline_id: airplane_id,
        airplanename: editedAirplane.airplanename,
        business_seat: editedAirplane.business_seat,
        commercial_seat: editedAirplane.commercial_seat,
        cost_per_km_business: editedAirplane.cost_per_km_business,
        cost_per_km_commercial: editedAirplane.cost_per_km_commercial,
        day_rate: editedAirplane.day_rate,
        seat_rate: editedAirplane.seat_rate,
        luggage_business: editedAirplane.luggage_business,
        luggage_commercial: editedAirplane.luggage_commercial,
        days: editedAirplane.days,
        airplane_id: editedAirplane.id
      });
      setEditMode(false);
      navigate("/airline/profile");
    } catch (error) {
      console.log('error');
    }
  };

  const renderDays = (daysOfWeek) => {
    // List of days
    //const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
      <div className="d-flex flex-wrap">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="p-2 m-1 bg-light">{day}</div>
        ))}
      </div>
    );
  };

  // Function to add a selected day to the airplane's days
  const addSelectedDay = () => {
    if (selectedDay && !editedAirplane.days.includes(selectedDay)) {
      setEditedAirplane({ ...editedAirplane, days: [...editedAirplane.days, selectedDay] });
    }
    setSelectedDay('');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h1 className="text-center mb-4">{airplane.airplanename}</h1>
            <table className="table">
  <tbody>
    <tr>
      <td>ID</td>
      <td>{airplane.id}</td>
    </tr>
    <tr>
      <td>Rating</td>
      <td>{airplane.rating}</td>
    </tr>
    <tr>
      <td>Day Rate</td>
      <td>{airplane.day_rate}</td>
    </tr>
    <tr>
      <td>Seat Rate</td>
      <td>{airplane.seat_rate}</td>
    </tr>
    <tr>
      <td>Days</td>
      <td>{renderDays(airplane.days)}</td>
    </tr>
    <tr>
      <td>Airline ID</td>
      <td>{airplane.airline_id}</td>
    </tr>
    <tr>
      <td>Commercial Seat</td>
      <td>{airplane.business_seat}</td>
    </tr>
    <tr>
      <td>Business Seat</td>
      <td>{airplane.commercial_seat}</td>
    </tr>
    <tr>
      <td>Cost per KM Business</td>
      <td>{airplane.cost_per_km_business}</td>
    </tr>
    <tr>
      <td>Cost per KM Commercial</td>
      <td>{airplane.cost_per_km_commercial}</td>
    </tr>
    <tr>
      <td>Maximum Luggage Allowance - Business</td>
      <td>{airplane.luggage_business || 0}</td>
    </tr>
    <tr>
      <td>Maximum Luggage Allowance - Commercial</td>
      <td>{airplane.luggage_commercial || 0}</td>
    </tr>
  </tbody>
</table>
            <table className="table">
              <tbody>
                {/* Display airplane details here */}
              </tbody>
            </table>
            {/* Toggle edit mode button */}
            <div className="text-center mb-3">
              <Link to="/airline/profile" className="btn btn-primary">Go to Airline Profile</Link>
            </div>
          </div>
          <button className="btn btn-primary mr-2" style={{ margin: '30px' }} onClick={() => {
            setEditMode(!editMode)
          }}>
            {editMode ? 'Cancel' : 'Edit'}
          </button>
          <button className="btn btn-danger mr-2" style={{ margin: '30px' }} onClick={() => {
            setAddRoute(!addroute)
          }}>Add Available Route</button>
          {addroute && (
            <div className="card shadow p-4">
              {addroute && renderEditForm()}
            </div>
          )}
          {editMode && (
            <div className="card shadow p-4">
              {editMode && renderInputFields()}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 card shadow p-4">
        <h2>Routes Information</h2>
        <div style={{padding: '10px'}}></div>
        <table className="table table-hover table-bordered">
  <thead className="thead-light">
    <tr>
      <th>ID</th>
      <th>Start Airport</th>
      <th>End Airport</th>
      <th>Distance (km)</th>
      <th>Arrival Time</th>
      <th>Departure Time</th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {routes.map(route => (
      <tr key={route.id}>
        <td>{route.id}</td>
        <td>{route.start_name}</td>
        <td>{route.end_name}</td>
        <td>{route.distance_km}</td>
        <td>{route.arrival_time}</td>
        <td>{route.departure_time}</td>
        <td>
          <button className="btn btn-primary" onClick={() => handleEdit(route.id)}>Edit</button>
        </td>
        <td>
          <button className="btn btn-danger" onClick={() => handleDelete(route.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        {editMode2 && (
            <div className="card shadow p-4">
              {editMode2 && renderEditForm()}
            </div>
          )}
      </div>
      <div style={{marginBottom: '50px'}}></div>
    </div>
  );  
}

export default AirlineAirplane;
