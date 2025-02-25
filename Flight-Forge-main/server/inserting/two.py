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

# Function to generate and execute SQL statements for airplanes
def generate_airplane_data():
    # Retrieve existing airlines from the database
    cursor.execute("SELECT id, name, totalplane FROM airlines;")
    airlines = cursor.fetchall()

    for airline in airlines:
        airline_id, airline_name, total_planes = airline

        for _ in range(10):
            # Generate fake data for each airplane
            airplane_rating = round(random.uniform(3.0, 5.0), 2)
            day_rate = round(random.uniform(0.1, 2), 2)
            seat_rate = round(random.uniform(0.1, 3), 2)
            days_of_week = random.sample(["mon", "tue", "wed", "thu", "fri", "sat", "sun"], k=3)
            airplanename = fake.word()[:18]
            business_seat = random.randint(10, 20)
            commercial_seat = random.randint(100, 200)
            cost_per_km_business = round(random.uniform(0.5, 1.5), 2)
            cost_per_km_commercial = round(random.uniform(0.1, 0.5), 2)
            luggage_business = random.randint(50, 100)
            luggage_commercial = random.randint(20, 50)

            # Generate and execute SQL statement for each airplane
            sql = f"""
                INSERT INTO airplane (
                    rating, day_rate, seat_rate, days, airline_id,
                    airplanename, business_seat, commercial_seat,
                    cost_per_km_business, cost_per_km_commercial,
                    luggage_business, luggage_commercial
                )
                VALUES (
                    {airplane_rating}, {day_rate}, {seat_rate},
                    ARRAY{days_of_week}, {airline_id},
                    '{airplanename}', {business_seat}, {commercial_seat},
                    {cost_per_km_business}, {cost_per_km_commercial},
                    {luggage_business}, {luggage_commercial}
                );
            """
            cursor.execute(sql)

# Execute the function
generate_airplane_data()

# Commit the changes and close the connection
conn.commit()
conn.close()