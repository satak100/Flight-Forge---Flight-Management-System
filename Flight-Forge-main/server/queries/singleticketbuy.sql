CREATE OR REPLACE FUNCTION "public"."buyticket"("rid" int4, "uid" int4, "transaction_id" varchar, "journey_date" date, "seattype" varchar, "nonuser" int4)
  RETURNS "pg_catalog"."int4" AS $BODY$
DECLARE
    dynamiccost INT;
    seat_no INT;
    passport_number INT;
    seat_left INT;
    tid INT;
BEGIN

    SELECT DYNAMICCOST(rid, journey_date, seattype) INTO dynamiccost;

    IF seattype = 'commercial' THEN
        SELECT seatleft_commercial INTO seat_left FROM seat_info WHERE route_id = rid AND journeydate = journey_date;
        IF seat_left = 0 THEN
            RETURN 0;
        END IF;
        SELECT (SELECT commercial_seat FROM AIRPLANE WHERE id = (SELECT airplane_id FROM route WHERE id = rid)) - seat_left INTO seat_no;
    ELSE
        SELECT seatleft_business INTO seat_left FROM seat_info WHERE route_id = rid AND journeydate = journey_date;
        IF seat_left = 0 THEN
            RETURN 0;
        END IF;
        SELECT (SELECT business_seat FROM AIRPLANE WHERE id = (SELECT airplane_id FROM route WHERE id = rid)) - seat_left + 1 INTO seat_no;
    END IF;

    INSERT INTO ticket (journeydate, seat_type, seatno, amount, passportnumber, user_id, route_id, buydate, transactionid, boughtfor)
    VALUES (
        journey_date,
        seattype,
        seat_no,
        dynamiccost,
        (SELECT passportnumber FROM app_user WHERE id = uid),
        uid,
        rid,
        CURRENT_DATE,
        transaction_id,
		nonuser
    )
    RETURNING id INTO tid;

    RETURN tid;
END;



CREATE OR REPLACE FUNCTION afterbuyticket()
RETURNS TRIGGER AS $$
BEGIN

    UPDATE airlines
    SET revenue = revenue + NEW.amount
    WHERE id = (select airline_id from airplane where id = (SELECT airplane_id FROM route WHERE id = NEW.route_id));
	
    IF NEW.seat_type = 'commercial' THEN
        UPDATE seat_info
        SET seatleft_commercial = seatleft_commercial - 1
        WHERE route_id = NEW.route_id AND journeydate = NEW.journeydate;
    ELSE
        UPDATE seat_info
        SET seatleft_business = seatleft_business - 1
        WHERE route_id = NEW.route_id AND journeydate = NEW.journeydate;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE or replace TRIGGER after_buy_ticket
AFTER INSERT ON ticket
FOR EACH ROW
EXECUTE FUNCTION afterbuyticket();

SELECT BUYTICKET(19, 1, 'ABCDE12345', '2024-02-24'::DATE, 'commercial', 3);
