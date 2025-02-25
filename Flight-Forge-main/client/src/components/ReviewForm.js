import React, { useState } from 'react';
import RouteFinder from '../apis/RouteFinder';

const ReviewForm = () => {

    const [airplane_id, setAirplane_id] = useState([]);
    const [message, setMessage] = useState([]);
    const [rating, setRating] = useState([]);

    const reviewSubmit = async (e) => {
        try {
            const response = await RouteFinder.post("/1/review",{
                    user_id: 1,
                    airplane_id,
                    message,
                    rating
            });
            console.log(response);
        } catch (err) {
            console.log("nai");
        }
    }

  return (
    <div className='mb-4'>
      <form action="">
        <div className='form-column'>
          <div className='col mb-3'>
            <input value={airplane_id} onChange={e => setAirplane_id(e.target.value)} type="text" className="form-control" placeholder="Airport ID"/>
          </div>
          <div className='col mb-3'>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="form-control" rows="4" placeholder="Message"></textarea>
          </div>
          <div className='col mb-3'>
            <input value={rating} onChange={e => setRating(e.target.value)}className="form-control" placeholder="Rating (out of 5.0)"/>
          </div>
          <button onClick={reviewSubmit} className='btn btn-primary'>Submit</button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;