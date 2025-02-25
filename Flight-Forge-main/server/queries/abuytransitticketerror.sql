CREATE OR REPLACE FUNCTION after_delete_ticket()
RETURNS TRIGGER AS $$
DECLARE
    route_idd INT;
    journey_date DATE;
BEGIN
    SELECT route_id, journeydate INTO route_idd, journey_date FROM ticket WHERE id = OLD.id;

    IF OLD.seat_type = 'commercial' THEN
        UPDATE seat_info
        SET seatleft_commercial = seatleft_commercial + 1
        WHERE route_idd = route_id AND journeydate = journey_date;
    ELSE
        UPDATE seat_info
        SET seatleft_business = seatleft_business + 1
        WHERE route_idd = route_id AND journeydate = journey_date;
    END IF;

    UPDATE airlines
    SET revenue = revenue - OLD.amount
    WHERE id = (SELECT airline_id FROM airplane WHERE id = (SELECT airplane_id FROM route WHERE id = route_idd));

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_delete_ticket_trigger
BEFORE DELETE ON ticket
FOR EACH ROW
EXECUTE FUNCTION after_delete_ticket();