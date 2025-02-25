CREATE OR REPLACE FUNCTION calculate_age()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the age value based on the retrieved date of birth
    NEW.age = floor((current_date - NEW.dateofbirth) / 365);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to execute the trigger function after an insert operation on the app_user table
CREATE TRIGGER update_age_after_insert
AFTER INSERT ON app_user
FOR EACH ROW
EXECUTE FUNCTION calculate_age();

-- Create a trigger to execute the trigger function after an update operation on the app_user table
CREATE TRIGGER update_age_after_update
AFTER UPDATE ON app_user
FOR EACH ROW
EXECUTE FUNCTION calculate_age();

update app_user set first_name = 'Nazmus' where id = 124; select * from app_user where id = 124;