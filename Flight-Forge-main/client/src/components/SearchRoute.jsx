import React, { useState, useContext, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RouteContext } from '../context/RouteContext';
import RouteFinder from '../apis/RouteFinder';

class TransitInfo {
  constructor(transit, date, airport, route, airplaneid, airplanename, seatsLeft, distance, cost, luggage, seat_type, costlist, rating) {
      this.transit = transit;
      this.date = date;
      this.airport = airport;
      this.route = route;
      this.airplaneid = airplaneid;
      this.airplanename = airplanename;
      this.seatsLeft = seatsLeft;
      this.distance = distance;
      this.cost = cost;
      this.luggage = luggage;
      this.seat_type = seat_type;
      this.costlist = costlist;
      this.rating = rating;
  }
}

const SearchRoute = () => {
  const [startAirport, setStartAirport] = useState('');
  const [endAirport, setEndAirport] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [travelerCount, setTravelerCount] = useState(1);
  const [ticketClass, setTicketClass] = useState('commercial'); // Default ticket class
  const { transitInfo, setSelectedTransit, setTransitInfo, clicked, setclicked } = useContext(RouteContext);
  const [airports, setAirports] = useState([]);
  const [startSuggestedAirports, setStartSuggestedAirports] = useState([]);
  const [endSuggestedAirports, setEndSuggestedAirports] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const startSelectRef = useRef(null);
  const endSelectRef = useRef(null);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await RouteFinder.get('/airports');
        setAirports(response.data.data.Airport);
      } catch (error) {
        console.error('Error fetching airports:', error);
      }
    };

    fetchAirports();
  }, []);

  const handleInputChange = (inputValue, setAirport, setShowSuggestions, setSuggestedAirports) => {
    setAirport(inputValue);

    // Filter airports based on the city name input value
    const filteredAirports = airports.filter((airport) =>
      airport.address.toLowerCase().includes(inputValue.toLowerCase())
    );
    setSuggestedAirports(filteredAirports);
    setShowSuggestions(true);
  };

  const handleAirportSelection = (e, setAirport, setShowSuggestions) => {
    const selectedAirport = e.target.value;
    setAirport(selectedAirport);
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const handleStartAirportChange = (e) => {
    handleInputChange(e.target.value, setStartAirport, setShowStartSuggestions, setStartSuggestedAirports);
  };

  const handleEndAirportChange = (e) => {
    handleInputChange(e.target.value, setEndAirport, setShowEndSuggestions, setEndSuggestedAirports);
  };

  const handleStartAirportSelection = (e) => {
    handleAirportSelection(e, setStartAirport, setShowStartSuggestions);
  };

  const handleEndAirportSelection = (e) => {
    handleAirportSelection(e, setEndAirport, setShowEndSuggestions);
  };

  const handleClearStartAirport = () => {
    setStartAirport('');
  };

  const handleClearEndAirport = () => {
    setEndAirport('');
  };

  const handleClickOutside = (e) => {
    if (startSelectRef.current && !startSelectRef.current.contains(e.target)) {
      setShowStartSuggestions(false);
    }
    if (endSelectRef.current && !endSelectRef.current.contains(e.target)) {
      setShowEndSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
        if(!startAirport || !endAirport)
        {
            const Ti = [];
            setTransitInfo(Ti);
            setclicked("Select Airports First");
            return;
        }

        if(startAirport == endAirport)
        {
            const Ti = [];
            setTransitInfo(Ti);
            setclicked("Start and End Airport can't be same");
            return;
        }

        let response1 = await RouteFinder.post('/airport/findbyname', {
            name: startAirport
        });
        let start_airport_id = response1.data.id;
        response1 = await RouteFinder.post('/airport/findbyname', {
            name: endAirport
        });
        let end_airport_id = response1.data.id;

        const day = selectedDate.getDate();
        const month = selectedDate.getMonth() + 1; // Month starts from 0, so add 1
        const year = selectedDate.getFullYear();

        // Create the formatted date string in the format day/month/year
        const formattedDate = `${year}-${month}-${day}`;
        //console.log(formattedDate);
        //console.log("checking -> ", start_airport_id, end_airport_id, formattedDate, ticketClass);
        const response = await RouteFinder.post('/transit', {
            start_airport_id: start_airport_id,
            end_airport_id: end_airport_id,
            date: formattedDate,
            seat_type: ticketClass
        });

        // Get the transit data
        const transitData = response.data.data.Transit;
        // Initialize arrays to store modified data
        const modifiedDates = [];
        const modifiedAirports = [];
        const modifiedTransit = [];
        const modifiedRoutes = [];
        const modifiedAirplanesid = [];
        const modifiedAirplanesname = [];

        // Loop through each transit to find end_airport_id and cut the arrays
        transitData.forEach(transit => {
            const transitArray = transit.transit;
            const endAirportIndex = transitArray.indexOf(end_airport_id);
            let sta = true;
            for (let i = 0; i < endAirportIndex; i++) {
                for (let j = i + 1; j < endAirportIndex; j++) {
                    if (transitArray[i] == transitArray[j]) {
                        sta = false;
                    }
                }
            }
            // Check if end_airport_id is found in the transit array and all elements are unique
            if (sta && endAirportIndex !== -1) {
                // Cut the transit array from start to end_airport_id
                const trimmedTransit = transitArray.slice(0, endAirportIndex + 1);
                // Push the trimmed transit array to modifiedTransit
                modifiedTransit.push(trimmedTransit);

                // Save the start and end indices
                const startIndex = 0;
                const endIndex = endAirportIndex + 1;

                // Cut the dates, airports, routes, and airplanes arrays according to the indices
                modifiedDates.push(transit.dates.slice(startIndex, endIndex).map(date => {
                    // Convert each date to year-month-day format
                    const formattedDate = new Date(date).toISOString().split('T')[0];
                    return formattedDate;
                }));
                modifiedAirports.push(transit.airports.slice(startIndex, endIndex));
                modifiedRoutes.push(transit.routes.slice(startIndex, endIndex));
                modifiedAirplanesid.push(transit.airplanesid.slice(startIndex, endIndex));
                modifiedAirplanesname.push(transit.airplanesname.slice(startIndex, endIndex));
            }
        });

        // Trim the remaining elements after the end airport
        modifiedTransit.forEach((transit, index) => {
            const endAirportIndex = transit.indexOf(end_airport_id);
            if (endAirportIndex !== -1) {
                // Cut the transit array from end_airport_id to the end
                modifiedTransit[index] = transit.slice(0, endAirportIndex + 1);
                // Cut the dates, airports, routes, and airplanes arrays accordingly
                modifiedDates[index] = modifiedDates[index].slice(0, endAirportIndex + 1);
                modifiedAirports[index] = modifiedAirports[index].slice(0, endAirportIndex + 1);
                modifiedRoutes[index] = modifiedRoutes[index].slice(0, endAirportIndex);
                modifiedAirplanesid[index] = modifiedAirplanesid[index].slice(0, endAirportIndex);
                modifiedAirplanesname[index] = modifiedAirplanesname[index].slice(0, endAirportIndex);
            }
        });

        console.log('hello -> ', modifiedRoutes[0]);

        let seats_left = [], seat=0;
        let totaldistance = [], dist = 0.0;
        let totalcost = [], cost = 0;
        let luggae_hold = [], luggage = 0;
        let costlist = [], ticketcost = [];
        let ratinglist = [], rating = [];

        for(let i=0;i<modifiedTransit.length;i++){
            seat = 1000000;
            dist = 0;
            cost = 0;
            luggage = 1000;
            for(let j=0;j<modifiedRoutes[i].length;j++){
                let response3 = await RouteFinder.post('/airplanerating', {airplane_id: modifiedAirplanesid[i][j]});
                rating.push(response3.data.rating);
                //console.log(response3.data);
              //console.log(modifiedRoutes[i][j], modifiedDates[i][j], ticketClass);
                response3 = await RouteFinder.post('/route/seats', {
                    route_id: modifiedRoutes[i][j],
                    date: modifiedDates[i][j],
                    seat_type: ticketClass
                });
                if(response3.data.seat < seat){
                    seat = response3.data.seat;
                    //console.log(response3.data);
                }
                if(response3.data.luggage < luggage){
                  luggage = response3.data.luggage;
                }

                response3 = await RouteFinder.post('/route/distanceandcost', {
                    route_id: modifiedRoutes[i][j],
                    date: modifiedDates[i][j],
                    seat_type: ticketClass
                });
               // console.log(response3.data);
                if(response3.data.results)
                {
                  if(!response3.data.cost) response3.data.cost = 0;
                  ticketcost.push(response3.data.cost);
                  cost = cost + response3.data.cost;
                  dist = dist + response3.data.distance;
                }
            }
            ratinglist.push(rating);
            rating = [];
            costlist.push(ticketcost);
            ticketcost = [];
            if(seat == 1000000) seats_left.push(0);
            else seats_left.push(seat);
            if(luggage == 1000) luggae_hold.push(0);
            else luggae_hold.push(luggage);
            if(!dist) dist = 0.0;
            totaldistance.push(dist);
            if(!cost) cost = 0;
            totalcost.push(cost);
        }

        // console.log(totalcost);
        // console.log(totaldistance);
        // console.log(seats_left);

        // console.log(modifiedTransit);
        // console.log(modifiedDates);
        // console.log(modifiedAirports);
        // console.log(modifiedRoutes);
        // console.log(modifiedAirplanesid);
        // console.log(modifiedAirplanesname);

        const Ti = [];

        let x = 30;
        if(modifiedTransit.length <= 10) x = modifiedTransit.length;

        for(let i=0;i<x;i++){
            if(i==0) console.log('checked -> ', seats_left[i], travelerCount);
            if(seats_left[i] >= travelerCount) Ti.push(new TransitInfo(modifiedTransit[i], modifiedDates[i], modifiedAirports[i], modifiedRoutes[i], modifiedAirplanesid[i], modifiedAirplanesname[i], seats_left[i], totaldistance[i], totalcost[i], luggae_hold[i], ticketClass, costlist[i], ratinglist[i]));
        }

        console.log(Ti);

        setTransitInfo(Ti);
        
        if(!Ti.length) setclicked("No Transit Found");
        else setclicked("");

        //create a new datat type to store from each of the arrays

    } catch (err) {
        console.error(err);
    }
};

  return (
    <div className="mb-4" style={{ 
      backgroundColor: 'white', 
      padding: '30px', 
      borderRadius: '10px', 
      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
      margin: '20px auto',
      width: '63%'
    }}>
      <form>
        <div className="form-row mb-3" style={{ fontFamily:'-moz-initial' }}>
          <div className="col" ref={startSelectRef}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={startAirport}
                onChange={handleStartAirportChange}
                className="form-control"
                placeholder="From"
                style={{ fontSize: '1.2rem' }} // Adjust height here
              />
              {startAirport && (
                <span
                  className="clear-icon"
                  onClick={handleClearStartAirport}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                  }}
                >
                  &#10005;
                </span>
              )}
            </div>
            {showStartSuggestions && startSuggestedAirports.length > 0 && (
              <select
                className="form-control"
                style={{ 
                  fontSize: '1rem', 
                  marginTop: '5px', 
                  position: 'absolute', 
                  zIndex: '1', 
                  fontFamily: 'Calibri Light',
                  display: 'block', // Ensure the dropdown is block-level
                }}
                size={5} // Set the visible number of options
                onChange={(e) => {
                  handleStartAirportSelection(e);
                  setStartSuggestedAirports([]);
                }}
                onBlur={() => setShowStartSuggestions(false)} // Close the dropdown on blur
              >
                {startSuggestedAirports.map((airport) => {
                  // Split the address string by comma and get the first part (city)
                  const city = (airport.address.split(',')[0].trim()).split('(')[1].trim();
                  const country = (airport.address.split(',')[1].trim());

                  return (
                    <option 
                      key={airport.id} 
                      value={airport.name}
                      style={{
                        padding: '5px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #ccc',
                        borderTop: '1px solid #ccc',
                        backgroundColor: 'white', // Set default background color
                      }}
                    >
                      <span 
                        style={{
                          display: 'block',
                          padding: '5px',
                          cursor: 'pointer',
                          backgroundColor: '#f2f2f2'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'} // Change background color on hover
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f2f2f2'} // Reset background color on hover out
                      >
                        {airport.name}, {city}, {country}
                      </span>
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          <div className="col" ref={endSelectRef}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={endAirport}
                onChange={handleEndAirportChange}
                className="form-control"
                placeholder="To (city name)"
                style={{ fontSize: '1.2rem' }} // Adjust height here
              />
              {endAirport && (
                <span
                  className="clear-icon"
                  onClick={handleClearEndAirport}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                  }}
                >
                  &#10005;
                </span>
              )}
            </div>
            {showEndSuggestions && endSuggestedAirports.length > 0 && (
              <select
                className="form-control"
                style={{ 
                  fontSize: '1rem', 
                  marginTop: '5px', 
                  position: 'absolute', 
                  zIndex: '1', 
                  fontFamily: 'Calibri Light',
                  display: 'block', // Ensure the dropdown is block-level
                }}
                size={5} // Set the visible number of options
                onChange={(e) => {
                  handleEndAirportSelection(e);
                  setEndSuggestedAirports([]); // Clear suggestions after selection
                }}
                onBlur={() => setShowEndSuggestions(false)} // Close the dropdown on blur
              >
                {endSuggestedAirports.map((airport) => {
                  // Split the address string by comma and get the first part (city)
                  const city = (airport.address.split(',')[0].trim()).split('(')[1].trim();

                  return (
                    <option 
                      key={airport.id} 
                      value={airport.name}
                      style={{
                        padding: '5px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #ccc',
                        borderTop: '1px solid #ccc',
                        backgroundColor: 'white',
                        fontFamily:'-moz-initial' 
                      }}
                    >
                      <span 
                        style={{
                          display: 'block',
                          padding: '5px',
                          cursor: 'pointer',
                          backgroundColor: '#f2f2f2',
                          fontFamily:'-moz-initial' 
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'} // Change background color on hover
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f2f2f2'} // Reset background color on hover out
                      >
                        {airport.name}, {city}
                      </span>
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>
        <div className="form-row mb-3" style={{ display: 'flex', alignItems: 'center',  fontFamily:'-moz-initial' }}>
          <div className="col" style={{ flex: '1' }}>
            <select
              value={ticketClass}
              onChange={(e) => setTicketClass(e.target.value)}
              className="form-control"
              style={{ fontSize: '1rem' }} // Adjust font size if needed
            >
              <option value="commercial">Commercial</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        <div className="form-row mb-3" style={{ fontFamily:'-moz-initial' }}>
          <div className="col">
          <div className="input-group">
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()} // Sets the minimum date to today
                dateFormat="dd/MM/yyyy"
                className="form-control"
                placeholderText="Select Date"
                style={{ fontSize: '1.2rem' }}
            />
            <div className="input-group-append">
                <span className="input-group-text">
                    <i className="fa fa-calendar"></i>
                </span>
            </div>
        </div>
          </div>
          <div className="col">
            <input
              type="number"
              value={travelerCount}
              onChange={(e) => 
              {
                if(e.target.value < 1) setTravelerCount(1);
                else if(e.target.value > 30) setTravelerCount(10);
                else setTravelerCount(e.target.value);
              }}
              className="form-control"
              placeholder="Traveler Count"
              style={{ fontSize: '1.2rem' }}
            />
          </div>
        </div>
        <div className="form-row d-flex justify-content-center">
        <button 
          onClick={handleSearch} 
          className="btn btn-primary" 
          style={{
            fontFamily:'-moz-initial',
            backgroundColor: '#800000', 
            borderColor: '#800000', 
            fontSize: '1.4rem',
            width: '18%', // Increase the width
            transition: 'all 0.3s ease', // Add transition effect for all properties
            '&:active': {
              backgroundColor: '#660000', // Change background color on click
              transform: 'scale(3)'
            }
        }}>
  Search
</button>


        </div>
      </form>
    </div>
  );
};

export default SearchRoute;
