CREATE OR REPLACE FUNCTION delete_ticket_from_array()
RETURNS TRIGGER AS $$
DECLARE
    ticket_id INT;
BEGIN
    FOREACH ticket_id IN ARRAY OLD.tickets
    LOOP
        DELETE FROM ticket WHERE id = ticket_id;
    END LOOP;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_ticket_from_array_trigger
BEFORE DELETE ON user_ticket
FOR EACH ROW
EXECUTE FUNCTION delete_ticket_from_array();