-- Drop the trigger
DROP TRIGGER IF EXISTS update_transaction_trigger ON ticket;

-- Drop the function
DROP FUNCTION IF EXISTS update_transaction();
