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

# Function to generate and execute SQL statements
def generate_airline_data():
    for _ in range(1000):
        # Generate fake data
        airline_name = fake.company()[:30]
        total_planes = random.randint(10, 20)
        revenue = round(random.uniform(1000000, 10000000), 2)  # Round revenue to 2 decimal places

        # Generate and execute SQL statement
        sql = f"INSERT INTO airlines (name, totalplane, revenue) VALUES ('{airline_name}', {0}, {0});"
        cursor.execute(sql)

# Execute the function
generate_airline_data()

# Commit the changes and close the connection
conn.commit()
conn.close()