import psycopg2
import random
from faker import Faker

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

# Function to generate and execute SQL statements for routes
def generate_route_data():
    # Retrieve existing airports and airplanes from the database
    cursor.execute("SELECT id FROM airport;")
    airport_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT id FROM airplane;")
    airplane_ids = [row[0] for row in cursor.fetchall()]

    for _ in range(1000):
        # Randomly select start and end airports from the existing ones
        start_airport_id = random.choice(airport_ids)
        end_airport_id = random.choice(airport_ids)

        # Ensure start and end airports are different
        while start_airport_id == end_airport_id:
            end_airport_id = random.choice(airport_ids)

        # Randomly select an airplane for the route
        airplane_id = random.choice(airplane_ids)

        # Generate fake data for each route
        distance_km = round(random.uniform(100, 2000), 2)

        # Ensure arrival_time and departure_time are distinct
        arrival_time = fake.time_object()
        departure_time = fake.time_object()
        while arrival_time == departure_time:
            departure_time = fake.time_object()

        # Generate and execute SQL statement for each route
        sql = f"""
            INSERT INTO route (
                start_airport_id, end_airport_id, distance_km,
                airplane_id, arrival_time, departure_time
            )
            VALUES (
                {start_airport_id}, {end_airport_id}, {distance_km},
                {airplane_id}, '{arrival_time}', '{departure_time}'
            );
        """
        cursor.execute(sql)

# Execute the function
generate_route_data()

# Commit the changes and close the connection
conn.commit()
conn.close()