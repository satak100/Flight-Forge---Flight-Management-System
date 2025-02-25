require("dotenv").config();
const cors = require('cors');
const morgan = require("morgan");
const express = require("express");
const port = process.env.PORT;
const db = require("./db");
const crypto = require('crypto');
const jwtGenerator = require("./utils/jwtGenerator");
const authorize = require("./middleware/authorize");
const jwt = require('jsonwebtoken');
const { start } = require("repl");
const { constants } = require("buffer");
const multer = require('multer');
const path = require('path');

const air_scaling = 1000000;

function sha256(inputString) {
  const hash = crypto.createHash('sha256');
  hash.update(inputString, 'utf-8');
  return hash.digest('hex');
}

const app = express();

app.use(cors());
app.use(express.json());

/*app.use(morgan("dev"));

app.use((req, res, next) => {
    console.log("middle");
    next();
})*/

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'D:/CP/Projects/Flight-Forge/client/src/assets'); // Destination folder where files will be stored
    },
    filename: function(req, file, cb) {
        // Define filename to avoid conflicts
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Adjust the file size limit here (10 MB in this example)
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('profilePhoto');

// Check file type
function checkFileType(file, cb) {
    // Allowed filetypes
    const filetypes = /jpeg|jpg|png/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

//passwor checker
async function comparePassword(userId, providedPassword) {

    try {
        // Fetch the password from the USER table based on the user ID
        const result = await db.query('SELECT password FROM "USER" WHERE id = $1', [userId]);
    
        if (result.rows.length === 0) {
          // User not found
          return false;
        }
    
        const storedPassword = result.rows[0].password;
    
        // Compare the stored password with the provided password
        const passwordsMatch = storedPassword === providedPassword;
    
        return passwordsMatch;
      } catch (error) {
        console.log('Error in comparePassword:');
    }
}



// Routes requiring authentication
app.post("/api/v1/user/authenticate", async (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(201).json("Authorization Denied");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        res.status(200).json("Authorized");
    } catch (err) {
        return res.status(201).json("Not Authorized");
    }
});


            // ######### USER ######### //
            // ######### USER ######### //
            // ######### USER ######### //
//signup
app.post('/api/v1/user/signup', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(400).json({ error: 'Error uploading file.' });
        }

        try {
            let mobileno = [];
            mobileno.push(req.body.mobileno);
            const { first_name, last_name, dateofbirth, password, city, country, zipcode, email, passportnumber } = req.body;
            // password = sha256(password); // Uncomment if password hashing is required
            let enc = sha256(password);
            const profilePhotoPath = req.file ? req.file.path : null;

            // Insert user data into the database
            const results = await db.query(
                `INSERT INTO app_user (first_name, last_name, dateofbirth, mobileno, password, city, country, zipcode, age, email, passportnumber, profilephoto)
                VALUES ($1, $2, $3, ($4), $5, $6, $7, $8, CalculateAge($3), $9, $10, $11)
                RETURNING *`,
                [ first_name, last_name, dateofbirth, mobileno, enc, city, country, zipcode, email, passportnumber, profilePhotoPath ]
            );

            if (results.rows.length != 0) {
                const jwtToken = jwtGenerator(results.rows[0].id);
                res.status(200).json({
                    status: "success",
                    data: {
                        token: jwtToken
                    }
                });
            } else {
                res.status(201).json({
                    status: "failed",
                    data: {
                        flightforge: "wrong data format",
                    }
                });
            }
        } catch (error) {
            console.error('Error signing up user:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
});

//login
app.post("/api/v1/user/login", async (req, res) => {
    try
    {
        //console.log(req.body);
        const results = await db.query("select password from APP_USER where id = $1", [req.body.id]);
        //console.log(results.rows);
        if(results.rows.length == 0)
        {
            res.status(201).json({
                status: "failed",
                data: {
                    flightforge : "wrong user id",
                }
            });
        }
        if(results.rows[0].password == sha256(req.body.password))
        {
            console.log("logged in");
            console.log("transfered id : " + req.body.id);
            const jwtToken = jwtGenerator(req.body.id);
            console.log(jwtToken);
            res.status(200).json({
                status: "success",
                results: results.rows.length,
                data: {
                    token: jwtToken
                }
            });
        }
        else
        {
            res.status(201).json({
                status: "failed",
                data: {
                    flightforge : "wrong password",
                }
            });
        }
    } catch (err){
        //console.log(err);
    }
});
//get user data
app.post("/api/v1/user/profiledata", authorize, async (req, res) => {
    try {
        //console.log(req.body);
        const { id } = req.body; // Extract parameters from query string

        if (!id) {
            return res.status(400).json({ error: 'User ID or password not provided.' });
        }

        const results = await db.query("SELECT * FROM APP_USER WHERE id = $1", [id]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found or incorrect credentials.' });
        }
        results.rows[0].dateofbirth = new Date(results.rows[0].dateofbirth);
        results.rows[0].dateofbirth.setDate(results.rows[0].dateofbirth.getDate() + 1);
        console.log(results.rows[0]);

        res.status(200).json({
            status: "success",
            data: {
                user: results.rows[0] // Assuming you expect only one user based on ID
            }
        });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
//get user ticket
app.post("/api/v1/user/tickets", authorize, async (req, res) => {
    try {
        let Ti = [], Tin = [];
        let ticketinfo, x;
        const { id } = req.body; // Extract parameters from query string

        if (!id) {
            return res.status(400).json({ error: 'User ID or password not provided.' });
        }

        let results = await db.query("SELECT * FROM user_ticket WHERE user_id = $1", [id]);
        let results1;
        for(let i=0;i<results.rows.length;i++)
        {
            x = results.rows[i].tickets;
            for(let j=0;j<x.length;j++)
            {
                results1 = await db.query("SELECT T.id as ticket_id, T.*, NU.* FROM ticket T join non_user NU on(T.boughtfor = NU.id) WHERE T.id = $1", [x[j]]);
                results1.rows[0].ticket_id = results.rows[i].id;
                Tin.push(results1.rows[0]);
            }
            for (let j = 0; j < Tin.length; j++) {
                // Convert journeydate to a JavaScript Date object
                Tin[j].journeydate = new Date(Tin[j].journeydate);
                // Increment journeydate by 1 day
                Tin[j].journeydate.setDate(Tin[j].journeydate.getDate() + 1);
            
                // Convert buydate to a JavaScript Date object
                Tin[j].buydate = new Date(Tin[j].buydate);
                // Increment buydate by 1 day
                Tin[j].buydate.setDate(Tin[j].buydate.getDate() + 1);
            
                // Convert dateofbirth to a JavaScript Date object
                Tin[j].dateofbirth = new Date(Tin[j].dateofbirth);
                // Increment dateofbirth by 1 day
                Tin[j].dateofbirth.setDate(Tin[j].dateofbirth.getDate() + 1);
            }
            Ti.push(Tin);
            Tin = [];
        }
        
        console.log(Ti);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found or incorrect credentials.' });
        }

        

        res.status(200).json({
            status: "success",
            data: {
                ticketinfo: Ti
            }
        });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
//user buys ticket
app.post("/api/v1/user/buyticket", async (req, res) => {
    try
    {
        //console.log(req.body);
        const route_id = [];
        const date = [];
        const { master_user, seat_type, transaction_id, name, email, passportnumber, country, city, dateofbirth } = req.body;
        for(let i = 0; i < req.body.route_id.length; i++)
        {
            route_id.push(req.body.route_id[i]);
        }
        for(let i = 0; i < req.body.date.length; i++)
        {
            date.push(req.body.date[i]);
        }

        console.log(route_id);
        console.log(date);
        console.log(master_user, seat_type, transaction_id, name, email, passportnumber, country, city, dateofbirth);

        let results = await db.query('select id from non_user where $1=fullname and $2=email', [name, email]);
        if(results.rows.length == 0) results = await db.query('insert into non_user (id, fullname, email, passportnumber, country, city, dateofbirth, master_user) values (1, $1, $2, $3, $4, $5, ($6::DATE), $7) returning id', [name, email, passportnumber, country, city, dateofbirth, master_user]);
        let non_user = results.rows[0].id;
        let tickets = [];
        console.log(route_id);
        try {
            for(let i = 0; i < route_id.length; i++)
            {
                console.log('hello -> ', route_id[i], master_user, transaction_id, date[i], seat_type, non_user);
                results = await db.query("SELECT BUYTICKET($1, $2, $3, $4::DATE, $5, $6)", [route_id[i], master_user, transaction_id, date[i], seat_type, non_user]);
                tickets.push(results.rows[0].buyticket);
                console.log(results.rows);
            }   
        } catch (error) {
            console.log('Error buying ticket:');
            for(let i = 0; i < tickets.length; i++)
            {
                results = await db.query("DELETE FROM ticket WHERE id = $1", [tickets[i]]);
            }
        }

        results = await db.query('insert into user_ticket (tickets, user_id) values (($1), $2) returning *', [tickets, master_user]);

        res.status(200).json({
            status: "success"
        });
    } catch (err){
        res.status(201).json({
            status: "failed"
        });
    }
});
//ticket return
app.post("/api/v1/user/returnticket", authorize, async (req, res) => {
    try
    {
        const { iid } = req.body;
        await db.query("DELETE FROM user_ticket WHERE id = $1", [iid]);
        res.status(200).json({
            status: "success"
        });
    } catch (err){
        res.status(201).json({
            status: "failed"
        });
    }
});
app.post('/api/v1/user/profileupdate', authorize, async (req, res) => {
    try {
        console.log(req.body);
        const m = [];
        m.push(req.body.mobileNo);
        const { id, firstName, lastName, country, city } = req.body;

        // Update user profile information in the database
        const query = `
            UPDATE app_user 
            SET 
                first_name = $1,
                last_name = $2,
                mobileno = $3,
                country = $4,
                city = $5
            WHERE 
                id = $6
        `;

        console.log(m);

        const values = [firstName, lastName, m, country, city, id];
        await db.query(query, values);

        res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Failed to update user profile' });
    }
});
//update password
app.post('/api/v1/user/passwordupdate', authorize, async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword, token } = req.body;
        const userId = req.body.id;
        console.log(req.body.id);
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New password and confirm password do not match" });
        }
        const user = await db.query('SELECT * FROM app_user WHERE id = $1', [userId]);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordMatch = sha256(oldPassword) === user.rows[0].password;
        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Old password is incorrect" });
        }

        // Hash the new password before updating it in the database
        const hashedPassword = sha256(newPassword);

        // Update the user's password in the database
        await db.query('UPDATE app_user SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        // Send a success response
        return res.status(200).json({ message: "Password updated successfully", token: jwtGenerator(userId) });
    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
//update



            // ######### ADMIN ######### //
            // ######### ADMIN ######### //
            // ######### ADMIN ######### //
//login
//signup



            // ######### Airplane_Company ######### //
            // ######### Airplane_Company ######### //
            // ######### Airplane_Company ######### //
//login -> SATAK
app.post("/api/v1/airline/login", async (req, res) => {
    try
    {
        //console.log(req.body);
        const results = await db.query("select name from AIRLINES where id = $1", [req.body.id]); //changed
        //console.log(results.rows);
        if(results.rows.length == 0)
        {
            res.status(201).json({
                status: "failed",
                data: {
                    flightforge : "wrong user id",
                }
            });
        }
        if(results.rows[0].name == (req.body.password)) //changed
        {
            console.log("logged in");
            console.log("transfered id : " + req.body.id);
            const jwtToken = jwtGenerator(req.body.id*air_scaling);
            console.log(jwtToken);
            res.status(200).json({
                status: "success",
                results: results.rows.length,
                data: {
                    token: jwtToken
                }
            });
        }
        else
        {
            res.status(201).json({
                status: "failed",
                data: {
                    flightforge : "wrong password",
                }
            });
        }
    } catch (err){
        //console.log(err);
    }
});


//signup //checcheckingk needed
app.post('/api/v1/airline/signup', authorize, async (req, res) => {
    try
    {
        //console.log(req.body.mobileno[1]);
        const results = await db.query("insert into airlines (name, totalplane, revenue) values ($1, 0, 0) returning *", 
                    req.body.Name);
        console.log(results.rows);
        if (results.rows.length == 0) res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                flightforge : results.rows,
            }
        });
        else res.status(201).json({
            status: "failed",
                data: {
                    flightforge : "wrong data format",
                }
        });
    } catch (err){
        console.log("baaal" + err);
    }
});
//airline getting info
app.post("/api/v1/airline/info", authorize, async (req, res) => {
    try
    {
        req.body.id = req.body.id / air_scaling;
        //console.log(req.body);
        const results = await db.query("select * from airlines where id = $1", [req.body.id]);
        let T = [];
        let mes = [];
        console.log(results.rows[0].airplane_id);
        let x = results.rows[0].airplane_id;
        for(let i = 0; i < x.length; i++)
        {
            let results1 = await db.query("select * from airplane where id = $1", [x[i]]);
            T.push(results1.rows[0]);
            let results2 = await db.query("select (select first_name || ' ' || last_name as fullname from app_user where id = user_id), message from review where airplane_id = $1", [x[i]]);
            mes.push(results2.rows);
        }
        results1 = await db.query("select * from get_total_amount_by_date($1)", [req.body.id]);
        let y = 0;
        for (let i = 0; i < results1.rows.length; i++) {
            results1.rows[i].date = new Date(results1.rows[i].date);
            results1.rows[i].date.setDate(results1.rows[i].date.getDate() + 1);
            if(results1.rows[i].total_amount == null) results1.rows[i].total_amount = 0;
            y += results1.rows[i].total_amount;
            results1.rows[i].total_amount = y;
        }
        //console.log(results1.rows);
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                root : results.rows[0],
                airplane : T,
                revenue : results1.rows,
                review: mes
            }
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});
//airline getting airplane info
app.post("/api/v1/airline/airplaneinfo", async (req, res) => {
    try {
        console.log(req.body.id);
        let results2 = await db.query("select (select (first_name || ' ' || last_name) as fullname from app_user where id = user_id), message from review where airplane_id = $1", req.body.id);
        console.log(results2.rows);
        res.status(200).json({
            status: "success",
            review: results2.rows
        });
    } catch (error) {
        res.status(201).json({
            status: "failure"
        });
    }
});

app.post('/api/v1/getroutes', async (req, res) => {
    try {
        const response = await db.query("select id, (select name as start_name from airport where id = start_airport_id), (select name as end_name from airport where id = end_airport_id), distance_km, airplane_id, arrival_time, departure_time from route where airplane_id = $1", [req.body.id]);
        res.status(200).json({
            status: "success",
            routes: response.rows
        });
    } catch (error) {
        res.status(201).json({
            status: "failure"
        });
    }
});
//delete routes
app.post('/api/v1/deleteroute', async (req, res) => {
    try {
      const { id } = req.body;
      await db.query('DELETE FROM ROUTE WHERE ID = $1', [id]);
  
      res.json({ status: 'success' });
    } catch (error) {
      console.error('Error deleting route:',);
    }
  });
//add route
app.post('/api/v1/airline/addroute', async (req, res) => {
    try {
        console.log(req.body);
        const { start_airport_id, end_airport_id, distance_km, airplane_id, arrival_time, departure_time } = req.body;

        const results = await db.query("insert into route (start_airport_id, end_airport_id, distance_km, airplane_id, arrival_time, departure_time) values ($1, $2, $3, $4, $5, $6) returning *",
        [start_airport_id, end_airport_id, distance_km, airplane_id, arrival_time, departure_time]);
        res.status(200).json({
            status: "success",
            info: results.rows[0]
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});
//update route
//add route
app.post('/api/v1/airline/updateroute', async (req, res) => {
    try {
        console.log(req.body);
        const { route_id, start_airport_id, end_airport_id, distance_km, airplane_id, arrival_time, departure_time } = req.body;

        const results = await db.query("UPDATE route SET start_airport_id = $1, end_airport_id = $2, distance_km = $3, airplane_id = $4, arrival_time = $5, departure_time = $6 WHERE id = $7 RETURNING *",
        [start_airport_id, end_airport_id, distance_km, airplane_id, arrival_time, departure_time, route_id]);
        res.status(200).json({
            status: "success",
            info: results.rows[0]
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});
//update airplane
app.post('/api/v1/airline/updateairplane', async (req, res) => {
    try {
        console.log(req.body);
        let days = [];
        for(let i=0;i<req.body.days.length;i++)
        {
            days.push(req.body.days[i]);
        }
        console.log(days);
        const {airplane_id, airline_id, airplanename, business_seat, commercial_seat, cost_per_km_business, cost_per_km_commercial, day_rate, seat_rate, luggage_business, luggage_commercial} = req.body;
        
        console.log(airline_id, airplanename, business_seat, commercial_seat, cost_per_km_business, cost_per_km_commercial, day_rate, seat_rate, luggage_business, luggage_commercial, days, airplane_id);

        const results = await db.query(`
            UPDATE airplane
            SET airline_id = $1,
                airplanename = $2,
                business_seat = $3,
                commercial_seat = $4,
                cost_per_km_business = $5,
                cost_per_km_commercial = $6,
                day_rate = $7,
                seat_rate = $8,
                luggage_business = $9,
	            luggage_commercial = $12,
                days = ($10)
            WHERE id = $11
            RETURNING *`,
            [airline_id, airplanename, business_seat, commercial_seat, cost_per_km_business, cost_per_km_commercial, day_rate, seat_rate, luggage_business, days, airplane_id, luggage_commercial]);

        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                FlightForge: results.rows,
            }
        });
    } catch (err) {
        console.error("Error updating airplane:");
        res.status(500).json({ status: "error", message: "Failed to update airplane." });
    }
});



            // ######### Search ######### //
            // ######### Search ######### //
            // ######### Search ######### //
//search {from, to, date}
app.post("/api/v1/searchRoute/locationn", async (req, res) => {
    try
    {
        console.log(req.body);
        const results = await db.query("SELECT P1, P2, P3, P4, ARRAY_REMOVE(ARRAY[P1_START, P1_END, P2_END, P3_END, P4_END, P5_END], NULL) AS id_array FROM ( SELECT R1.ID AS P1, R1.START_AIRPORT_ID AS P1_START, R1.END_AIRPORT_ID AS P1_END, R2.ID AS P2, R2.END_AIRPORT_ID AS P2_END, R3.ID AS P3, R3.END_AIRPORT_ID AS P3_END, R4.ID AS P4, R4.END_AIRPORT_ID AS P4_END, R5.ID AS P5, R5.END_AIRPORT_ID AS P5_END FROM ROUTE R1 LEFT OUTER JOIN ROUTE R2 ON ( R1.START_AIRPORT_ID= ( SELECT ID FROM AIRPORT WHERE LOWER(NAME) = LOWER($1) ) AND R1.END_AIRPORT_ID=R2.START_AIRPORT_ID AND R2.DEPARTURE_TIME > R1.ARRIVAL_TIME ) LEFT OUTER JOIN ROUTE R3 ON ( R2.END_AIRPORT_ID=R3.START_AIRPORT_ID AND R3.DEPARTURE_TIME > R2.ARRIVAL_TIME ) LEFT OUTER JOIN ROUTE R4 ON ( R3.END_AIRPORT_ID=R4.START_AIRPORT_ID AND R4.DEPARTURE_TIME > R3.ARRIVAL_TIME ) LEFT OUTER JOIN ROUTE R5 ON ( R4.END_AIRPORT_ID=R5.START_AIRPORT_ID AND R5.DEPARTURE_TIME > R4.ARRIVAL_TIME ) ) WHERE ( ( (P1_END) = (SELECT ID FROM AIRPORT WHERE LOWER(NAME) = LOWER($2)) OR (P2_END) = (SELECT ID FROM AIRPORT WHERE LOWER(NAME) = LOWER($2)) OR (P3_END) = (SELECT ID FROM AIRPORT WHERE LOWER(NAME) = LOWER($2)) OR (P4_END) = (SELECT ID FROM AIRPORT WHERE LOWER(NAME) = LOWER($2)) OR (P5_END) = (SELECT ID FROM AIRPORT WHERE LOWER(NAME) = LOWER($2)) ) )", [req.body.start_airport_name, req.body.end_airport_name]);
        console.log(results.rows);
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                Airport : results.rows,
            }
        });
    }
    catch (err)
    {
        console.log("khida lagse");
    }
});

//Buy Ticket



app.post("/api/v1/airport/findbyname", async (req, res) => {
    try
    {
        const results = await db.query("SELECT id FROM AIRPORT WHERE upper(NAME) = upper($1)", [req.body.name]);
        res.status(200).json({
            status: "success",
            id : results.rows[0].id
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});

app.post("/api/v1/route/departuretime", async (req, res) => {
    try
    {
        const results = await db.query("SELECT departure_time FROM ROUTE WHERE id = $1", [req.body.route_id]);
        res.status(200).json({
            status: "success",
            time : results.rows[0].departure_time
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});

app.post("/api/v1/route/arrivaltime", async (req, res) => {
    try
    {
        const results = await db.query("SELECT arrival_time FROM ROUTE WHERE id = $1", [req.body.route_id]);
        res.status(200).json({
            status: "success",
            time : results.rows[0].arrival_time
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});

app.get("/api/v1/airports", async (req, res) => {
    try
    {
        const results = await db.query(
        "SELECT * FROM "+
        " AIRPORT"
        );
        //console.log(results.rows);
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                Airport : results.rows,
            }
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});

//get airplane name
app.post("/api/v1/airplaneName", authorize, async (req, res) => {
    try {
        let results = await db.query("SELECT airplanename FROM airplane WHERE id = (SELECT airplane_id FROM route WHERE id = $1)", [req.body.route_id]);
        res.status(200).json({
            status: "success",
            name : results.rows[0].airplanename
        });
    } catch (error) {
        res.status(201).json({
            status: "failure"
        });
    }
});

//get all restaurants
app.post("/api/v1/transit", async (req, res) => {
    try{
        //console.log(req.body);
        let results = await db.query("SELECT * FROM FindAirplaneTransitPaths($1, $2, $3::DATE, upper($4))", [req.body.start_airport_id, req.body.end_airport_id, req.body.date, req.body.seat_type]);
        for (let i = 0; i < results.rows.length; i++) {
            for (let j = 0; j < results.rows[i].dates.length; j++) {
                const originalDate = new Date(results.rows[i].dates[j]);
                originalDate.setDate(originalDate.getDate() + 1);
                results.rows[i].dates[j] = originalDate.toISOString();
            }
        }
        console.log(results.rows[0]);
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                Transit : results.rows,
            }
        });
    }
    catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});

app.post("/api/v1/route/seats", async (req, res ) => {
    try
    {
        let results;
        let x, y;
        x = await db.query("SELECT id FROM SEAT_INFO WHERE route_id = $1 and journeydate = $2", [req.body.route_id, req.body.date]);
        if(!x.rows.length)
        {
            await db.query("INSERT INTO SEAT_INFO (route_id, journeydate, airplane_id, seatleft_business, seatleft_commercial, cost_business, cost_commercial) "+
            "values ($1, $2::DATE, (select airplane_id from route where id = $1), (select business_seat from airplane "+
            "where id = (select airplane_id from route where id = $1)), (select commercial_seat from airplane where id = (select airplane_id from route where id = $1)), "+
            "((select distance_km from route where id = $1)* (select cost_per_km_business from airplane where id = (select airplane_id from route where id = $1))), "+
            "((select distance_km from route where id = $1)* (select cost_per_km_commercial from airplane where id = (select airplane_id from route where id = $1))) )", [req.body.route_id, req.body.date]);
        }
        if (req.body.seat_type == "commercial")
        {
            results = await db.query("SELECT seatleft_commercial FROM SEAT_INFO WHERE route_id = $1 and journeydate = $2", [req.body.route_id, req.body.date]);
            x = results.rows[0].seatleft_commercial;
            if(x == null) x = 0;
            results = await db.query("select luggage_commercial from airplane where id = (select airplane_id from route where id = $1)", [req.body.route_id]);
            y = results.rows[0].luggage_commercial;
            if(y == null) y = 10;
        }
        else
        {
            results = await db.query("SELECT seatleft_business FROM SEAT_INFO WHERE route_id = $1 and journeydate = $2", [req.body.route_id, req.body.date]);
            x = results.rows[0].seatleft_business;
            if(x == null) x = 0;
            results = await db.query("select luggage_business from airplane where id = (select airplane_id from route where id = $1)", [req.body.route_id]);
            y = results.rows[0].luggage_business;
            if(y == null) y = 10;
        }
        res.status(200).json({
            status: "success",
            seat : x,
            luggage : y
        });
    }
    catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});

app.post("/api/v1/route/distanceandcost", async (req, res ) => {
    try
    {
        let results;
        let distance = 0.0, cost = 0;
        results = await db.query("SELECT distance_km FROM route WHERE id = $1", [req.body.route_id]);
        distance = (results.rows[0].distance_km);
        results = await db.query("SELECT DYNAMICCOST($1, $2::DATE, $3)", [req.body.route_id, req.body.date, req.body.seat_type]);
        cost = results.rows[0].dynamiccost;
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            distance : distance,
            cost: cost
        });
    }
    catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});
//add airplane
app.post('/api/v1/airline/addairplane', authorize, async (req, res) => {
    try {
        //console.log(req.body);
        const { airplanename, business_seat, commercial_seat, cost_per_km_business, cost_per_km_commercial, day_rate, seat_rate, luggage_business, luggage_commercial, days } = req.body;

        // Assuming air_scaling is defined somewhere
        req.body.id = req.body.id / air_scaling;
        //console.log(req.body.id, airplanename, days, business_seat, commercial_seat, cost_per_km_business, cost_per_km_commercial, day_rate, seat_rate, luggage_business, luggage_commercial);

        const results = await db.query("INSERT INTO airplane (airline_id, airplanename, days, business_seat, commercial_seat, cost_per_km_business, cost_per_km_commercial, day_rate, seat_rate, luggage_business, luggage_commercial) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
            [req.body.id, airplanename, days, business_seat, commercial_seat, cost_per_km_business, cost_per_km_commercial, day_rate, seat_rate, luggage_business, luggage_commercial]);

        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                FlightForge: results.rows
            }
        });
    } catch (err) {
        console.error("Error adding airplane:", err.message);
        res.status(500).json({ status: "error", message: "Failed to add airplane" });
    }
});

//get airplane's rating
app.post("/api/v1/airplanerating", async (req, res) => {
    try
    {
        let results = await db.query("SELECT rating FROM airplane WHERE id = $1", [req.body.airplane_id]);
        res.status(200).json({
            status: "success",
            rating : results.rows[0].rating
        });
    } catch (err){
        res.status(201).json({
            status: "failure"
        });
    }
});

// add user review
app.post("/api/v1/user/review", authorize, async (req, res) => {
    try
    {
        console.log(req.body);
        let aid;
        let results = await db.query("SELECT airplane_id FROM route WHERE id = $1", [req.body.route_id]);
        aid = results.rows[0].airplane_id;
        //console.log(req.body);
        results = await db.query("INSERT INTO Review (user_id, airplane_id, message, rating, Date) values ($1, $2, $3, $4, CURRENT_TIMESTAMP) returning *", [req.body.id, aid, req.body.message, req.body.rating]);
        //console.log(req.params.user_id);
        //console.log(results.rows);
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                FlightForge : results.rows,
            }
        });
    } catch (err){
        console.log("baaal");
    }
});

app.listen(port, () => {
    console.log(`Server is up, on port ${port}`);
});