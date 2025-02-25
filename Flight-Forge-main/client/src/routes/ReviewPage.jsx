import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RouteFinder from '../apis/RouteFinder';
import { useEffect } from 'react';

const ReviewForm = () => {
    const [reviewMessage, setReviewMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const route_id = localStorage.getItem('route_id');
    let [airplane_name, setAirplane_name] = useState('AIRBUS');

    useEffect(() => {
      const fetchUserTickets = async () => {
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
            let response = await RouteFinder.post('/airplaneName', {
              route_id: route_id,
              token: localStorage.getItem('token'),
              id: 0
            });
            setAirplane_name(response.data.name);
          } catch (error) {
            console.log('Error fetching airplane name:', error);
          }
          console.log(airplane_name);
      };

      fetchUserTickets();
  }, []);

  const handleSignOut = () => {
      localStorage.removeItem('token');
      navigate('/');
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(route_id);
        try {
            const response = await RouteFinder.post(`/user/review`, {
                id: 0,
                route_id: route_id,
                token: localStorage.getItem('token'),
                message: reviewMessage,
                rating: rating
            });
            alert('Review submitted successfully!');
            localStorage.removeItem('route_id');
            navigate('/userticket');
        } catch (error) {
            console.error('Error submitting review:', error);
            setError('Failed to submit review. Please try again.');
        }
    };

    return (
        <div className="container mt-3" style={{fontFamily: '-moz-initial'}}>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                        <h1 className="card-title text-center" style={{ color: 'green', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)', fontWeight: 'bold' }}>{airplane_name}</h1>
                            <h5 className="card-title text-center">Write Your Review</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="reviewMessage" className="form-label">Review Message</label>
                                    <textarea
                                        className="form-control"
                                        id="reviewMessage"
                                        rows="3"
                                        value={reviewMessage}
                                        onChange={(e) => setReviewMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="rating" className="form-label">Rating (out of 5)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="rating"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={rating}
                                        onChange={(e) => {
                                          if(e.target.value <= 5) setRating(parseFloat(e.target.value));
                                          else
                                          {
                                            setRating(5);
                                            alert("Rating cannot be more than 5");
                                          }
                                        }}
                                        required
                                    />
                                </div>
                                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                                <div className="text-center">
                                <button type="submit" className="btn btn-primary">Submit</button>
                                <button
                                  type="submit"
                                  className="btn btn-danger"
                                  style={{ marginLeft: '10px' }}
                                  onClick={e => {
                                    localStorage.removeItem('route_id');
                                    navigate('/userticket');
                                  }}
                                >
                                  Cancel
                                </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewForm;
