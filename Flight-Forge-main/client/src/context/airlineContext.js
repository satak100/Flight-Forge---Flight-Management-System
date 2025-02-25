import React, { useState, createContext, useContext } from 'react';

export const AirlineContext = createContext();

export const AirlineContextProvider = (props) => {
    const [airplane, setAirplane] = useState([]);
    const [airplane_id, setAirplane_id] = useState(null);

    return (
        <AirlineContext.Provider value={{ airplane, setAirplane, airplane_id, setAirplane_id }}>
            {props.children}
        </AirlineContext.Provider>
    );
};
