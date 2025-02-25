import psycopg2
from faker import Faker
from datetime import date
import random
import hashlib

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

# Function to generate and execute SQL statements for app_users
def generate_app_user_data():
    for _ in range(100):
        # Generate fake data for each app_user
        first_name = fake.first_name()[:30]
        last_name = fake.last_name()[:30]
        date_of_birth = fake.date_of_birth(minimum_age=18, maximum_age=80)
        mobile_numbers = [fake.phone_number()[:14] for _ in range(random.randint(1, 3))]
        age = fake.random_int(min=18, max=80)
        password = fake.password()[:10]
        city = fake.city()[:10]
        country = fake.country()[:10]
        zipcode = fake.zipcode()
        email = fake.email()[:23]
        passport_number = fake.random_int(min=100000000, max=999999999)

        # Generate and execute SQL statement for eACH_USER
        first_name = first_name.replace("'", "''")
        last_name = last_name.replace("'", "''")
        city = city.replace("'", "''")
        country = country.replace("'", "''")
        email = email.replace("'", "''")
        sql = f"""
            INSERT INTO app_user (
                first_name, last_name, dateofbirth, mobileno,
                age, password, city, country, zipcode, email,
                passportnumber
            )
            VALUES (
                '{first_name}', '{last_name}', '{date_of_birth}',
                ARRAY{mobile_numbers}, {age}, '{hashlib.sha256(password.encode()).hexdigest()}', '{city}',
                '{country}', {zipcode}, '{email}', {passport_number}
            );
        """
        print(first_name, last_name, date_of_birth, mobile_numbers, age, password, city, country, zipcode, email, passport_number)
        cursor.execute(sql)
        

# Execute the function
generate_app_user_data()

# Commit the changes and close the connection
conn.commit()
conn.close()