CREATE OR REPLACE FUNCTION update_airplane_routes()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the airplane table to append the new route_id
    UPDATE airplane
    SET route_id = array_append(route_id, NEW.id)
    WHERE airplane.id = NEW.airplane_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_airplane_routes_trigger
AFTER INSERT ON route
FOR EACH ROW
EXECUTE FUNCTION update_airplane_routes();

CREATE OR REPLACE FUNCTION remove_route_from_airplane()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove the route_id from the airplane table
    UPDATE airplane
    SET route_id = array_remove(route_id, OLD.id)
    WHERE OLD.airplane_id = airplane.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER remove_route_trigger
AFTER UPDATE OF airplane_id ON route
FOR EACH ROW
EXECUTE FUNCTION remove_route_from_airplane();
