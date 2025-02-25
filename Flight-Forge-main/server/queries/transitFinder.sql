CREATE OR REPLACE FUNCTION IsStringInArray(
    v_array varchar(10)[],
    v_string varchar(10)
) RETURNS BOOLEAN AS $$
DECLARE
    v_found BOOLEAN := FALSE;
    v_element varchar(10);
BEGIN
    FOR v_element IN SELECT unnest(v_array) LOOP
        IF upper(v_string) = UPPER(v_element) THEN
            RETURN TRUE;
        END IF;
    END LOOP;

    RETURN FALSE;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION GetDayName(input_date DATE) RETURNS VARCHAR AS $$
DECLARE
    base_date DATE := '2024-01-01'; -- January 1, 2024, is Monday
    day_names VARCHAR[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days_diff INTEGER;
    day_index INTEGER;
    result_day VARCHAR(10);
BEGIN
    days_diff := input_date - base_date;
    day_index := (days_diff % 7 + 1) - 1;
    result_day := day_names[day_index + 1];
    
    RETURN result_day;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION IsAvailableChangeAirplane(
    v_start_route_id INTEGER,
    v_end_route_id INTEGER,
	seat_type varchar(10),
    v_start_airplane_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
	v_start_airplane_id INTEGER;
    v_end_airplane_id INTEGER;
    v_start_dayname VARCHAR(10);
    v_days VARCHAR(10)[];
	v_days2 VARCHAR(10)[];
    v_start_arrival_time TIME;
    v_end_departure_time TIME;
	start_airplane_com_seat int;
	start_airplane_bus_seat int;
	end_airplane_com_seat int;
	end_airplane_bus_seat int;
BEGIN
	SELECT AIRPLANE_ID INTO v_start_airplane_id
	FROM ROUTE
	WHERE ID = v_start_route_id;
	
	SELECT commercial_seat INTO start_airplane_com_seat
	FROM AIRPLANE
	WHERE ID = v_start_airplane_id;
	
	SELECT business_seat INTO start_airplane_bus_seat
	FROM AIRPLANE
	WHERE ID = v_start_airplane_id;
	
	SELECT AIRPLANE_ID INTO v_end_airplane_id
	FROM ROUTE
	WHERE ID = v_end_route_id;
	
	SELECT AIRPLANE_ID INTO v_end_airplane_id
	FROM ROUTE
	WHERE ID = v_end_route_id;
	
	SELECT BUSINESS_SEAT INTO end_airplane_bus_seat
	FROM AIRPLANE
	WHERE ID = v_start_airplane_id;

    v_start_dayname := GetDayName(v_start_airplane_date);
    -- RAISE NOTICE 'v_start_dayname: %', v_start_dayname;

    SELECT days INTO v_days
    FROM airplane
    WHERE Id = v_start_airplane_id;
	
	SELECT days INTO v_days2
    FROM airplane
    WHERE Id = v_end_airplane_id;
	
    -- RAISE NOTICE 'v_days: %', v_days;
	-- RAISE NOTICE 'v_days2: %', v_days2;
	-- RAISE NOTICE 'INN: %', v_start_dayname = ANY(v_days);

	IF IsStringInArray(v_days, v_start_dayname) THEN
		-- RAISE NOTICE 'yay1: %', v_days;
		
        SELECT arrival_time
        INTO v_start_arrival_time
        FROM route
        WHERE id = v_start_route_id;

        SELECT departure_time
        INTO v_end_departure_time
        FROM route
        WHERE id = v_end_route_id;
		
		-- RAISE NOTICE 'v_end_departure_time: %', v_end_departure_time;
		-- RAISE NOTICE 'v_start_arrival_time: %', v_start_arrival_time;
		
		IF upper(seat_type) = upper('commercial') then
			if start_airplane_com_seat = 0 and end_airplane_com_seat = 0 then
				return FALSE;
			END IF;
		else
			if start_airplane_bus_seat = 0 and end_airplane_bus_seat = 0 then
				return FALSE;
			END IF;
		END IF;

        -- Check if second airplane's any varchar data of array matches start_dayname
        IF 1=1 THEN
            -- Check if second airplane departure time is greater than the first one's arrival time
            IF v_end_departure_time > v_start_arrival_time and v_start_dayname = any(v_days2) THEN
				-- RAISE NOTICE 'yay2: %', v_days;
                RETURN TRUE;
            ELSE
                -- Increase v_start_dayname value by 1 to find the next day
                SELECT (CASE 
                            WHEN v_start_dayname = 'Sunday' THEN 'Monday'
                            WHEN v_start_dayname = 'Monday' THEN 'Tuesday'
                            WHEN v_start_dayname = 'Tuesday' THEN 'Wednesday'
                            WHEN v_start_dayname = 'Wednesday' THEN 'Thursday'
                            WHEN v_start_dayname = 'Thursday' THEN 'Friday'
                            WHEN v_start_dayname = 'Friday' THEN 'Saturday'
                            ELSE 'Sunday' 
                        END) INTO v_start_dayname;

                -- Check if the second airplane's days value also holds the new v_start_dayname value
                IF v_start_dayname = any(v_days2) THEN
					-- RAISE NOTICE 'yay3: %', v_days;
                    -- Check if the difference between arrival time of first airplane and departure time of second airplane is greater than or equal to 18 hours
                    IF (v_start_arrival_time - v_end_departure_time) >= INTERVAL '18 hours' THEN
						-- RAISE NOTICE 'yay3: %', v_days;
						-- RAISE NOTICE 'DONE\N';
                        RETURN TRUE;
                    ELSE
                        RETURN FALSE;
                    END IF;
                ELSE
                    RETURN FALSE;
                END IF;
            END IF;
        ELSE
            RETURN FALSE;
        END IF;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION IsAvailableChangeAirplaneNextDate(
    v_start_route_id INTEGER,
    v_end_route_id INTEGER,
	seat_type varchar(10),
    v_start_airplane_date DATE
) RETURNS DATE AS $$
DECLARE
	v_start_airplane_id INTEGER;
    v_end_airplane_id INTEGER;
    v_start_dayname VARCHAR(10);
    v_days VARCHAR(10)[];
	v_days2 VARCHAR(10)[];
    v_start_arrival_time TIME;
    v_end_departure_time TIME;
BEGIN
	SELECT AIRPLANE_ID INTO v_start_airplane_id
	FROM ROUTE
	WHERE ID = v_start_route_id;
	
	SELECT AIRPLANE_ID INTO v_end_airplane_id
	FROM ROUTE
	WHERE ID = v_end_route_id;

    v_start_dayname := GetDayName(v_start_airplane_date);
    -- RAISE NOTICE 'v_start_dayname: %', v_start_dayname;

    SELECT days INTO v_days
    FROM airplane
    WHERE Id = v_start_airplane_id;
	
	SELECT days INTO v_days2
    FROM airplane
    WHERE Id = v_end_airplane_id;
	
    -- RAISE NOTICE 'v_days: %', v_days;
	-- RAISE NOTICE 'v_days2: %', v_days2;
	-- RAISE NOTICE 'INN: %', v_start_dayname = ANY(v_days);

	IF IsStringInArray(v_days, v_start_dayname) THEN
		-- RAISE NOTICE 'yay1: %', v_days;
		
        SELECT arrival_time
        INTO v_start_arrival_time
        FROM route
        WHERE id = v_start_route_id;

        SELECT departure_time
        INTO v_end_departure_time
        FROM route
        WHERE id = v_end_route_id;
		
		-- RAISE NOTICE 'v_end_departure_time: %', v_end_departure_time;
		-- RAISE NOTICE 'v_start_arrival_time: %', v_start_arrival_time;

        -- Check if second airplane's any varchar data of array matches start_dayname
        IF 1=1 THEN
            -- Check if second airplane departure time is greater than the first one's arrival time
            IF v_end_departure_time > v_start_arrival_time and v_start_dayname = any(v_days2) THEN
				-- RAISE NOTICE 'yay2: %', v_days;
				RAISE NOTICE 'Date: %', v_start_airplane_date+1;
                RETURN v_start_airplane_date;
            ELSE
                -- Increase v_start_dayname value by 1 to find the next day
                SELECT (CASE 
                            WHEN v_start_dayname = 'Sunday' THEN 'Monday'
                            WHEN v_start_dayname = 'Monday' THEN 'Tuesday'
                            WHEN v_start_dayname = 'Tuesday' THEN 'Wednesday'
                            WHEN v_start_dayname = 'Wednesday' THEN 'Thursday'
                            WHEN v_start_dayname = 'Thursday' THEN 'Friday'
                            WHEN v_start_dayname = 'Friday' THEN 'Saturday'
                            ELSE 'Sunday' 
                        END) INTO v_start_dayname;

                -- Check if the second airplane's days value also holds the new v_start_dayname value
                IF v_start_dayname = any(v_days2) THEN
					-- RAISE NOTICE 'yay3: %', v_days;
                    -- Check if the difference between arrival time of first airplane and departure time of second airplane is greater than or equal to 18 hours
                    IF (v_start_arrival_time - v_end_departure_time) >= INTERVAL '18 hours' THEN
						-- RAISE NOTICE 'yay3: %', v_days;
						-- RAISE NOTICE 'DONE\N';
						RAISE NOTICE 'Date: %', v_start_airplane_date+1;
                        RETURN v_start_airplane_date+1;
                    ELSE
                        RETURN v_start_airplane_date;
                    END IF;
                ELSE
                    RETURN v_start_airplane_date;
                END IF;
            END IF;
        ELSE
            RETURN v_start_airplane_date;
        END IF;
    ELSE
        RETURN v_start_airplane_date;
    END IF;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION FirstRouteCheck(
	route_id int,
	targetdate Date
) RETURNS DATE AS $$
DECLARE
	start_time TIME;
	end_time TIME;
BEGIN
	select departure_time into start_time
	from route
	where id = route_id;
	select arrival_time into end_time
	from route
	where id = route_id;
	if start_time < end_time then
		return targetdate+1;
	else
		return targetdate;
	end if;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION FirstRouteCheckToAccept(
	airplane_id int,
	targetdate Date
) RETURNS BOOLEAN AS $$
DECLARE
	selecteddays VARCHAR(10)[];
BEGIN
	SELECT DAYS INTO selecteddays
	FROM AIRPLANE
	WHERE id = airplane_id;
	
	if IsStringInArray(selecteddays, GetDayName(targetdate)) then
		RETURN TRUE;
	ELSE
		RETURN FALSE;
	END IF;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION NVLFLOAT(
	X FLOAT,
	Y FLOAT
) RETURNS FLOAT AS $$
DECLARE
	selecteddays VARCHAR(10)[];
BEGIN
	If X IS NULL then
		RETURN Y;
	ELSE
		RETURN X;
	END IF;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION FindAirplaneTransitPaths(
    v_start_airport_id INTEGER,
    v_end_airport_id INTEGER,
    v_start_airplane_date DATE,
	seat_type VARCHAR(10)
) RETURNS TABLE (
    TRANSIT INT [],
	AIRPORTS VARCHAR(18)[],
	DATES DATE[],
	ROUTES INT[],
	AIRPLANESNAME VARCHAR(18)[],
	AIRPLANESID INT[]
) AS $$
BEGIN
    RETURN QUERY
	SELECT ARRAY[P1_START, P1_END, P2_END, P3_END, P4_END, P5_END] AS TRANSIT, ARRAY[(SELECT NAME FROM AIRPORT WHERE ID=P1_START),
																					(SELECT NAME FROM AIRPORT WHERE ID=P1_END),
																					(SELECT NAME FROM AIRPORT WHERE ID=P2_END),
																					(SELECT NAME FROM AIRPORT WHERE ID=P3_END),
																					(SELECT NAME FROM AIRPORT WHERE ID=P4_END),
																					(SELECT NAME FROM AIRPORT WHERE ID=P5_END)] AS AIRPORTS,
																				ARRAY[T1, T2, T3, T4, T5, T6] AS DATES,
																				ARRAY[RI1, RI2, RI3, RI4, RI5] AS ROUTES,
																				ARRAY[A1, A2, A3, A4, A5] AS AIRPLANESNAME,
																				ARRAY[AI1, AI2, AI3, AI4, AI5] AS AIRPLANESID
																					 FROM
    (SELECT
	 	R1.ID AS RI1,
	 	R2.ID AS RI2,
	 	R3.ID AS RI3,
	 	R4.ID AS RI4,
	 	R5.ID AS RI5,
	 (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R1.ID) AS AI1,
	 (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R2.ID) AS AI2,
	 (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R3.ID) AS AI3,
	 (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R4.ID) AS AI4,
	 (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R5.ID) AS AI5,
	 	(SELECT AIRPLANENAME FROM AIRPLANE WHERE ID = (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R1.ID)) AS A1,
	 	(SELECT AIRPLANENAME FROM AIRPLANE WHERE ID = (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R2.ID)) AS A2,
	 	(SELECT AIRPLANENAME FROM AIRPLANE WHERE ID = (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R3.ID)) AS A3,
	 	(SELECT AIRPLANENAME FROM AIRPLANE WHERE ID = (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R4.ID)) AS A4,
	 	(SELECT AIRPLANENAME FROM AIRPLANE WHERE ID = (SELECT AIRPLANE_ID FROM ROUTE WHERE ID = R5.ID)) AS A5,
        R1.START_AIRPORT_ID AS P1_START,
        R1.END_AIRPORT_ID AS P1_END,
        R2.END_AIRPORT_ID AS P2_END,
        R3.END_AIRPORT_ID AS P3_END,
        R4.END_AIRPORT_ID AS P4_END,
        R5.END_AIRPORT_ID AS P5_END,
	 	v_start_airplane_date AS T1,
	 	FirstRouteCheck(R1.ID, v_start_airplane_date) AS T2,
	 	IsAvailableChangeAirplaneNextDate(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date)) AS T3,
	 	IsAvailableChangeAirplaneNextDate(R2.ID, R3.ID, seat_type, IsAvailableChangeAirplaneNextDate(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date))) AS T4,
	 	IsAvailableChangeAirplaneNextDate(R3.ID, R4.ID, IsAvailableChangeAirplaneNextDate(R3.ID, R4.ID, seat_type, IsAvailableChangeAirplaneNextDate(R2.ID, R3.ID, seat_type, IsAvailableChangeAirplaneNextDate(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date))))) AS T5,
	 	FirstRouteCheck(R5.ID, IsAvailableChangeAirplaneNextDate(R3.ID, R4.ID, IsAvailableChangeAirplaneNextDate(R3.ID, R4.ID, seat_type, IsAvailableChangeAirplaneNextDate(R2.ID, R3.ID, seat_type, IsAvailableChangeAirplaneNextDate(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date)))))) AS T6
    FROM
        ROUTE R1
        LEFT OUTER JOIN ROUTE R2 ON IsAvailableChangeAirplane(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date))
        LEFT OUTER JOIN ROUTE R3 ON IsAvailableChangeAirplane(R2.ID, R3.ID, seat_type, IsAvailableChangeAirplaneNextDate(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date)))
        LEFT OUTER JOIN ROUTE R4 ON IsAvailableChangeAirplane(R3.ID, R4.ID, seat_type, IsAvailableChangeAirplaneNextDate(R2.ID, R3.ID, seat_type, IsAvailableChangeAirplaneNextDate(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date))))
        LEFT OUTER JOIN ROUTE R5 ON IsAvailableChangeAirplane(R4.ID, R5.ID, seat_type, IsAvailableChangeAirplaneNextDate(R3.ID, R4.ID, IsAvailableChangeAirplaneNextDate(R3.ID, R4.ID, seat_type, IsAvailableChangeAirplaneNextDate(R2.ID, R3.ID, seat_type, IsAvailableChangeAirplaneNextDate(R1.ID, R2.ID, seat_type, FirstRouteCheck(R1.ID, v_start_airplane_date))))))
    WHERE
        R1.START_AIRPORT_ID = v_start_airport_id
	 	AND
	 	FirstRouteCheckToAccept(v_start_airport_id, v_start_airplane_date)
        AND (
            R1.END_AIRPORT_ID = v_end_airport_id
            OR R2.END_AIRPORT_ID = v_end_airport_id
            OR R3.END_AIRPORT_ID = v_end_airport_id
            OR R4.END_AIRPORT_ID = v_end_airport_id
            OR R5.END_AIRPORT_ID = v_end_airport_id
        ));
END;
$$ LANGUAGE PLPGSQL;

SELECT *
FROM FindAirplaneTransitPaths(1, 4, '2024-02-23'::DATE, 'COMMERCIAL');