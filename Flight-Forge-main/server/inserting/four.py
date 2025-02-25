import psycopg2
from faker import Faker
import random

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

# Function to generate and execute SQL statements for airports
def generate_airport_data():
    for _ in range(1000):
        # Generate fake data for each airport
        airport_name = fake.company()[:14]
        city = fake.city()[:12]
        country = fake.country()[:12]
        latitude = round(random.uniform(-90, 90), 6)
        longitude = round(random.uniform(-180, 180), 6)

        airport_name = airport_name.replace("'", "''")
        city = city.replace("'", "''")
        country = country.replace("'", "''")

        # Generate and execute SQL statement for each airport
        sql = f"""
            INSERT INTO airport (
                name, address, latitude, longitude
            )
            VALUES (
                '{airport_name}', ROW('{city}'::VARCHAR, '{country}'::VARCHAR, '{123456}'::VARCHAR), {latitude}, {longitude}
            );
        """
        cursor.execute(sql)

# Execute the function
generate_airport_data()

# Commit the changes and close the connection
conn.commit()
conn.close()