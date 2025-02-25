CREATE OR REPLACE FUNCTION update_airlines()
RETURNS TRIGGER AS $$
BEGIN
    -- Append the new airplane ID to the airplane_id array column in the airlines table
    UPDATE airlines SET airplane_id = array_append(airplane_id, NEW.id) WHERE id = NEW.airline_id;

    -- Update the totalplane count based on the length of the airplane_id array
    UPDATE airlines SET totalplane = array_length((SELECT airplane_id FROM airlines WHERE id = NEW.airline_id), 1) WHERE id = NEW.airline_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to execute the trigger function after an insert operation on the airplane table
CREATE TRIGGER update_airlines_trigger
AFTER INSERT ON airplane
FOR EACH ROW
EXECUTE FUNCTION update_airlines();