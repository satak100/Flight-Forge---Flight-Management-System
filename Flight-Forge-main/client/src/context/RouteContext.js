import React, { useState, createContext } from 'react';

export const RouteContext = createContext();

export const RouteContextProvider = (props) => {
    const [transitInfo, setTransitInfo] = useState([]);
    const [selectedTransit, setSelectedTransit] = useState(null);
    const [clicked, setclicked] = useState("");
    const [airplane, setAirplane] = useState([]);
    const [airplane_id, setAirplane_id] = useState(null);
    const [ reviews, setReviews ] = useState([]);

    const addRoute = (route) => {
        setTransitInfo([...transitInfo, route]);
    };

    return (
        <RouteContext.Provider value={{ transitInfo, setTransitInfo, selectedTransit, setSelectedTransit, clicked, setclicked, airplane, setAirplane, airplane_id, setAirplane_id, reviews, setReviews }}>
            {props.children}
        </RouteContext.Provider>
    );
};
