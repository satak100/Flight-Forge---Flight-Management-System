import React, { useContext, useState } from 'react';
import RouteFinder from '../apis/RouteFinder';
import { useNavigate } from 'react-router-dom';

const AirlineAddAirplane = () => {
  const navigate = useNavigate();
  const [editedAirplane, setEditedAirplane] = useState({
    id: '',
    rating: '',
    day_rate: '',
    seat_rate: '',
    luggage_commercial: '',
    luggage_business: '',
    airline_id: '',
    business_seat: '',
    commercial_seat: '',
    cost_per_km_business: '',
    cost_per_km_commercial: ''
  });
  
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAirplane({ ...editedAirplane, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('edited -> ', editedAirplane);
      const response = await RouteFinder.post('/airline/addairplane', {
        airplanename: editedAirplane.airplanename,
        rating: editedAirplane.rating,
        day_rate: editedAirplane.day_rate,
        seat_rate: editedAirplane.seat_rate,
        luggage_commercial: editedAirplane.luggage_commercial,
        luggage_business: editedAirplane.luggage_business,
        id: 0,
        token: localStorage.getItem('token'),
        business_seat: editedAirplane.business_seat,
        commercial_seat: editedAirplane.commercial_seat,
        cost_per_km_business: editedAirplane.cost_per_km_business,
        cost_per_km_commercial: editedAirplane.cost_per_km_commercial,
        days: selectedDays
      });
      if(response.data.status === 'success') {
        alert('Airplane added successfully');
        navigate('/airline/profile');
      }
    } catch (error) {
      navigate('/');
      console.log('error')
    }
    console.log(editedAirplane);
  };

  return (
    <div className="container mt-5">
      <button className='btn btn-danger' onClick={e => navigate('/airline/profile')}>Airline</button>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="mb-4 text-center">Add Airplane</h2>
              <form onSubmit={handleSubmit}>
              <div className="form-group">
  <label>Airplane Name:</label>
  <input type="text" className="form-control" name="airplanename" value={editedAirplane.airplanename} onChange={handleInputChange} required />
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
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AirlineAddAirplane;
