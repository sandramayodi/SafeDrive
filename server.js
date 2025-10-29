const express = require("express");
const path = require("path");
const app = express();
const mysql = require("mysql");
const dbConn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mayodi@01",
    database: "safedrive"
});
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const session = require("express-session");

//middleware
app.use(express.static(path.join(__dirname, "public"))); //static files will be served from the 'public' directory
app.use(express.urlencoded({ extended: true })); //body parser to decrypt incoming data to req.body
app.use(
    session({
        secret: "mayodi@01Sandra",
        resave: false,
        saveUninitialized: true
    })
);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// authorization middleware
const protectedRoutes = [
  "/dashboard",
];
app.use((req, res, next) => {
  if (protectedRoutes.includes(req.path)) {
    // check if user is logged in
    if (req.session && req.session.user) {
      console.log(req.session.user);

      res.locals.user = req.session.user;
      next();
    } else {
      res.redirect("/login?message=unauthorized");
    }
  } else {
    next();
  }
});

//route to landing page
app.get("/", (req, res) => {
    res.render("index");
});

//registration and login page
app.get("/login", (req, res) => {
  const message = req.query.message;
  if (message === "exists") {
    res.locals.message = "Email already exists. Please login.";
  } else if (message === "success") {
    res.locals.message = "Registration successful. Please login.";
  } else if (message === "invalid") {
    res.locals.message = "Invalid email or password. Try again";
  } else if (message === "unauthorized") {
    res.locals.message = "Your are unauthorized to access that page.";
  }
  res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {   
    const { fullName, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const insertUserStatement = `INSERT INTO users (fullName, email, password) VALUES ("${fullName}", "${email}", "${hashedPassword}")`;
    const checkUserExistsStatement = `SELECT * FROM users WHERE email = "${email}"`;

    dbConn.query(checkUserExistsStatement, (err, data) => {
        if (err) return res.status(500).send("Server error");
        if (data.length > 0) {
            return res.redirect("/login?message=exists");
        } else {
            dbConn.query(insertUserStatement, (insertError) => {
                if (insertError) {  
                    res
                    .status(500)
                    .send("Error while registering user. If it persists contact admin");
                } else {
                    res.redirect("/login?message=success");
                }
            });
        }
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const checkEmailStatement = `SELECT id, fullName, email, password FROM users WHERE email = "${email}"`;

    dbConn.query(checkEmailStatement, (err, results) => {
        if (err) {
            return res.status(500).send("Server error");
        }

        if (results.length === 0) {
            // No user found
            return res.redirect("/login?message=invalid");
        }

        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            // Password doesn’t match
            return res.redirect("/login?message=invalid");
        }

        // Store user in session
        req.session.user = user;
        res.redirect("/dashboard");
    });
});

// Dashboard route with real-time data
app.get("/dashboard", (req, res) => {
    const userId = req.session.user.id;
    
    console.log("Dashboard accessed by user ID:", userId);
    
    // Get latest sensor reading
    const latestReadingQuery = `
        SELECT alcohol_level, status, timestamp 
        FROM sensor_readings 
        WHERE user_id = ${userId} 
        ORDER BY timestamp DESC 
        LIMIT 1
    `;
    
    // Get vehicle status
    const vehicleStatusQuery = `
        SELECT vehicle_state, engine_status, last_updated 
        FROM vehicle_status 
        WHERE user_id = ${userId} 
        LIMIT 1
    `;
    
    // Get latest GPS location
    const gpsQuery = `
        SELECT latitude, longitude, address, timestamp 
        FROM gps_locations 
        WHERE user_id = ${userId} 
        ORDER BY timestamp DESC 
        LIMIT 1
    `;
    
    // Get recent alerts
    const alertsQuery = `
        SELECT * FROM alerts 
        WHERE user_id = ${userId} AND resolved = FALSE 
        ORDER BY timestamp DESC 
        LIMIT 5
    `;
    
    // Get today's statistics
    const statsQuery = `
        SELECT 
            COUNT(*) as total_readings,
            AVG(alcohol_level) as avg_level,
            MAX(alcohol_level) as max_level,
            SUM(CASE WHEN status = 'DANGER' THEN 1 ELSE 0 END) as danger_count
        FROM sensor_readings 
        WHERE user_id = ${userId} AND DATE(timestamp) = CURDATE()
    `;
    
    // Execute all queries
    Promise.all([
        new Promise((resolve) => dbConn.query(latestReadingQuery, (err, data) => {
            if (err) console.error("Latest reading error:", err);
            resolve(err ? [] : data);
        })),
        new Promise((resolve) => dbConn.query(vehicleStatusQuery, (err, data) => {
            if (err) console.error("Vehicle status error:", err);
            resolve(err ? [] : data);
        })),
        new Promise((resolve) => dbConn.query(gpsQuery, (err, data) => {
            if (err) console.error("GPS error:", err);
            resolve(err ? [] : data);
        })),
        new Promise((resolve) => dbConn.query(alertsQuery, (err, data) => {
            if (err) console.error("Alerts error:", err);
            resolve(err ? [] : data);
        })),
        new Promise((resolve) => dbConn.query(statsQuery, (err, data) => {
            if (err) console.error("Stats error:", err);
            resolve(err ? [] : data);
        }))
    ]).then(([readings, vehicle, gps, alerts, stats]) => {
        console.log("Dashboard data loaded:");
        console.log("- Readings:", readings.length);
        console.log("- Vehicle:", vehicle.length);
        console.log("- GPS:", gps.length);
        console.log("- Alerts:", alerts.length);
        console.log("- Stats:", stats.length);
        
        res.render("dashboard", { 
            user: req.session.user,
            latestReading: readings[0] || null,
            vehicleStatus: vehicle[0] || null,
            gpsLocation: gps[0] || null,
            alerts: alerts || [],
            stats: stats[0] || {}
        });
    });
});

// API endpoint for hardware to send sensor data
app.post("/api/sensor-data", express.json(), (req, res) => {
    const { device_id, alcohol_level, user_id } = req.body;
    
    if (!device_id || alcohol_level === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Determine status based on alcohol level
    let status = 'SAFE';
    if (alcohol_level >= 0.08) {
        status = 'DANGER';
    } else if (alcohol_level >= 0.05) {
        status = 'WARNING';
    }
    
    const insertQuery = `
        INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) 
        VALUES (${user_id || 1}, ${alcohol_level}, '${status}', NOW())
    `;
    
    dbConn.query(insertQuery, (err) => {
        if (err) {
            console.error("Error inserting sensor data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        // If dangerous level, create alert
        if (status === 'DANGER') {
            const alertQuery = `
                INSERT INTO alerts (user_id, alert_type, alcohol_level, message, timestamp) 
                VALUES (${user_id || 1}, 'HIGH_ALCOHOL', ${alcohol_level}, 
                'Dangerous alcohol level detected!', NOW())
            `;
            dbConn.query(alertQuery);
        }
        
        res.json({ success: true, status: status });
    });
});

// API endpoint for GPS data
app.post("/api/gps-data", express.json(), (req, res) => {
    const { device_id, latitude, longitude, user_id } = req.body;
    
    if (!device_id || !latitude || !longitude) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const insertQuery = `
        INSERT INTO gps_locations (user_id, latitude, longitude, timestamp) 
        VALUES (${user_id || 1}, ${latitude}, ${longitude}, NOW())
    `;
    
    dbConn.query(insertQuery, (err) => {
        if (err) {
            console.error("Error inserting GPS data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true });
    });
});

// API endpoint for vehicle status
app.post("/api/vehicle-status", express.json(), (req, res) => {
    const { device_id, vehicle_state, engine_status, user_id } = req.body;
    
    if (!device_id || !vehicle_state || !engine_status) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const upsertQuery = `
        INSERT INTO vehicle_status (user_id, vehicle_state, engine_status, last_updated) 
        VALUES (${user_id || 1}, '${vehicle_state}', '${engine_status}', NOW())
        ON DUPLICATE KEY UPDATE 
        vehicle_state = '${vehicle_state}', 
        engine_status = '${engine_status}', 
        last_updated = NOW()
    `;
    
    dbConn.query(upsertQuery, (err) => {
        if (err) {
            console.error("Error updating vehicle status:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true });
    });
});

// API endpoint to get latest readings (for real-time updates)
app.get("/api/latest-data", (req, res) => {
    const userId = req.session.user?.id || 1;
    
    const query = `
        SELECT 
            (SELECT JSON_OBJECT(
                'alcohol_level', alcohol_level, 
                'status', status, 
                'timestamp', timestamp
            ) FROM sensor_readings WHERE user_id = ${userId} ORDER BY timestamp DESC LIMIT 1) as latest_reading,
            (SELECT JSON_OBJECT(
                'vehicle_state', vehicle_state, 
                'engine_status', engine_status
            ) FROM vehicle_status WHERE user_id = ${userId} LIMIT 1) as vehicle_status,
            (SELECT JSON_OBJECT(
                'latitude', latitude, 
                'longitude', longitude
            ) FROM gps_locations WHERE user_id = ${userId} ORDER BY timestamp DESC LIMIT 1) as gps_location
    `;
    
    dbConn.query(query, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(data[0] || {});
    });
});

// Get historical sensor data for charts
app.get("/api/sensor-history", (req, res) => {
    const userId = req.session.user?.id || 1;
    const hours = req.query.hours || 24;
    
    const query = `
        SELECT alcohol_level, status, timestamp 
        FROM sensor_readings 
        WHERE user_id = ${userId} 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
        ORDER BY timestamp ASC
    `;
    
    dbConn.query(query, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(data || []);
    });
});

// Resolve alert endpoint
app.post("/api/resolve-alert/:id", (req, res) => {
    const alertId = req.params.id;
    const userId = req.session.user?.id || 1;
    
    const query = `
        UPDATE alerts 
        SET resolved = TRUE, resolved_at = NOW() 
        WHERE id = ${alertId} AND user_id = ${userId}
    `;
    
    dbConn.query(query, (err) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true });
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});


app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});