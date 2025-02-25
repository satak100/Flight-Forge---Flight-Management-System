CREATE OR REPLACE FUNCTION delete_related_data() RETURNS TRIGGER AS $$
DECLARE
    user_ticket_row RECORD;
    ticket_id INT;
BEGIN
    FOR user_ticket_row IN SELECT * FROM user_ticket LOOP
        FOR ticket_id IN SELECT UNNEST(user_ticket_row.tickets) LOOP
            IF (SELECT route_id FROM ticket WHERE id = ticket_id) = OLD.id THEN
                DELETE FROM user_ticket WHERE id = user_ticket_row.id;
            END IF;
        END LOOP;
    END LOOP;

    DELETE FROM seat_info WHERE route_id = OLD.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER route_delete_trigger
AFTER DELETE ON route
FOR EACH ROW
EXECUTE FUNCTION delete_related_data();

DELETE FROM ROUTE WHERE ID = 7;