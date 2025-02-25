import psycopg2
from faker import Faker
import random
from datetime import datetime, timedelta

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    database="FlightForge",
    user="postgres",
    password="abtikas"
)

# Create a cursor
cursor = conn.cursor()

# Use Faker to generate fake data
fake = Faker()

# Function to generate and execute SQL statements for transactions
def generate_transaction_data():
    # Retrieve existing app_user IDs from the database
    cursor.execute("SELECT id FROM app_user;")
    app_user_ids = [row[0] for row in cursor.fetchall()]

    for _ in range(1000):
        # Randomly select an app_user for the transaction
        user_id = random.choice(app_user_ids)

        # Generate fake data for each transaction
        transaction_datetime = fake.date_time_this_year()
        amount = round(random.uniform(10, 1000), 2)

        # Generate and execute SQL statement for each transaction
        sql = f"""
            INSERT INTO transaction (
                user_id, datetime, amount
            )
            VALUES (
                {user_id}, '{transaction_datetime}', {amount}
            );
        """
        cursor.execute(sql)

# Execute the function
generate_transaction_data()

# Commit the changes and close the connection
conn.commit()
conn.close()