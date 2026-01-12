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

// Import SMS notifier
const { sendDangerAlert: sendSMSAlert } = require('./sms_notifier');

// Connect to database with error handling
dbConn.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        console.error("Please check:");
        console.error("1. MySQL service is running");
        console.error("2. Database 'safedrive' exists");
        console.error("3. Password is correct");
        process.exit(1);
    }
    console.log("✅ Connected to MySQL database");
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

// Track users currently being notified to prevent simultaneous calls
const notificationInProgress = new Set();

// Helper function to send SMS notification
async function sendSMSNotification(userId, rawReading, alcoholLevel) {
    try {
        // Prevent simultaneous notifications for the same user
        if (notificationInProgress.has(userId)) {
            console.log(`⏳ Notification already in progress for user ${userId}. Skipping duplicate call.`);
            return;
        }
        
        // Mark this user as being processed
        notificationInProgress.add(userId);
        
        // Check cooldown - only send if 5+ minutes have passed since last notification
        const cooldownQuery = `
            SELECT last_notification_time, 
                   TIMESTAMPDIFF(MINUTE, last_notification_time, NOW()) as minutes_since_last 
            FROM notification_cooldowns 
            WHERE user_id = ${userId}
        `;
        
        dbConn.query(cooldownQuery, async (cooldownErr, cooldownResults) => {
            // Check if cooldown is active
            if (cooldownResults && cooldownResults.length > 0) {
                const minutesSinceLast = cooldownResults[0].minutes_since_last;
                
                if (minutesSinceLast < 5) {
                    console.log(`⏳ Notification cooldown active. Last sent ${minutesSinceLast} minute(s) ago. Need 5 minutes.`);
                    console.log(`⏭️ Skipping notification to prevent spam. Next notification allowed in ${5 - minutesSinceLast} minute(s).`);
                    notificationInProgress.delete(userId); // Release the lock
                    return; // Exit without sending notifications
                } else {
                    console.log(`✅ Cooldown expired (${minutesSinceLast} minutes). Proceeding with notification...`);
                }
            } else {
                console.log(`✅ First notification for user ${userId}. Proceeding...`);
            }
            
            // Get user details (for driver name in alert message)
            const userQuery = `SELECT fullName, email FROM users WHERE id = ${userId}`;
            
            dbConn.query(userQuery, async (err, userResults) => {
                if (err || !userResults || userResults.length === 0) {
                    console.error('❌ Error fetching user details for alert:', err);
                    return;
                }
                
                const user = userResults[0];
                
                // Get latest GPS location
                const gpsQuery = `SELECT latitude, longitude, timestamp 
                                 FROM gps_locations 
                                 WHERE user_id = ${userId} 
                                 ORDER BY timestamp DESC LIMIT 1`;
                
                dbConn.query(gpsQuery, async (gpsErr, gpsResults) => {
                    const gpsData = gpsResults && gpsResults.length > 0 ? gpsResults[0] : {};
                
                    const userData = {
                        fullName: user.fullName,
                        email: user.email
                    };
                    
                    const sensorData = {
                        raw_reading: rawReading,
                        alcohol_level: alcoholLevel,
                        timestamp: new Date(),
                        latitude: gpsData.latitude,
                        longitude: gpsData.longitude
                    };
                    
                    // Get emergency contacts from database
                    const contactsQuery = `SELECT contact_name, phone_number FROM emergency_contacts WHERE user_id = ${userId}`;
                    
                    dbConn.query(contactsQuery, async (contactErr, contactResults) => {
                        if (contactErr) {
                            console.error('❌ Error fetching emergency contacts:', contactErr);
                            return;
                        }
                        
                        if (!contactResults || contactResults.length === 0) {
                            console.log('⚠️ No emergency contacts found. Skipping notifications.');
                            console.log('💡 Add emergency contacts in the dashboard to receive alerts.');
                            return;
                        }
                        
                        // Extract phone numbers for notifications
                        const emergencyPhones = contactResults.map(c => c.phone_number);
                        
                        console.log(`📞 Found ${emergencyPhones.length} emergency contact(s) for user ${userId}`);
                        
                        // Send SMS alerts to emergency contacts
                        console.log(`📨 Attempting to send SMS alerts to ${emergencyPhones.length} contact(s)...`);
                        const smsResults = await sendSMSAlert(userData, sensorData, emergencyPhones);
                        
                        smsResults.forEach(result => {
                            if (result.success) {
                                console.log(`✅ SMS sent to ${result.phone} (ID: ${result.message_id}, Cost: ${result.cost} KES)`);
                            } else {
                                console.error(`❌ Failed SMS to ${result.phone}:`, result.error);
                            }
                        });
                        
                        // Update the cooldown timestamp after successfully sending notifications
                        updateNotificationCooldown(userId);
                        
                        // Release the lock after notifications are sent
                        notificationInProgress.delete(userId);
                    });
                });
            });
        });
    } catch (error) {
        console.error('❌ Error in sendSMSNotification:', error);
        notificationInProgress.delete(userId); // Release lock on error
    }
}

// Helper function to update notification cooldown
function updateNotificationCooldown(userId) {
    const updateQuery = `
        INSERT INTO notification_cooldowns (user_id, last_notification_time) 
        VALUES (${userId}, NOW())
        ON DUPLICATE KEY UPDATE 
            last_notification_time = NOW(),
            notification_count = notification_count + 1
    `;
    
    dbConn.query(updateQuery, (err, result) => {
        if (err) {
            console.error('❌ Error updating notification cooldown:', err);
        } else {
            console.log(`✅ Notification cooldown updated for user ${userId}. Next notification allowed in 5 minutes.`);
        }
    });
}

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
        SELECT alcohol_level, raw_reading, status, timestamp 
        FROM sensor_readings 
        WHERE user_id = ${userId} 
        ORDER BY timestamp DESC 
        LIMIT 1
    `;
    
    // Get vehicle status with Arduino connection check
    const vehicleStatusQuery = `
        SELECT 
            CASE 
                WHEN TIMESTAMPDIFF(SECOND, sr.timestamp, NOW()) <= 10 
                THEN vs.vehicle_state
                ELSE 'OFF'
            END as vehicle_state,
            CASE 
                WHEN TIMESTAMPDIFF(SECOND, sr.timestamp, NOW()) <= 10 
                THEN vs.engine_status
                ELSE 'OFF'
            END as engine_status,
            vs.last_updated,
            CASE 
                WHEN TIMESTAMPDIFF(SECOND, sr.timestamp, NOW()) <= 10 THEN 'CONNECTED'
                ELSE 'DISCONNECTED'
            END as arduino_status
        FROM vehicle_status vs
        LEFT JOIN (
            SELECT user_id, MAX(timestamp) as timestamp
            FROM sensor_readings
            GROUP BY user_id
        ) sr ON vs.user_id = sr.user_id
        WHERE vs.user_id = ${userId} 
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
            AVG(raw_reading) as avg_raw,
            MAX(raw_reading) as max_raw,
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
    const { device_id, alcohol_level, user_id, raw_reading } = req.body;
    
    if (!device_id || alcohol_level === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Determine status based on raw reading value (MQ-3 sensor)
    const rawValue = raw_reading || 0;
    let status = 'SAFE';
    
    // Using raw sensor values for thresholds
    // SAFE: < 180, WARNING: 180-249, DANGER: >= 250
    if (rawValue >= 250) {
        status = 'DANGER';
    } else if (rawValue >= 180) {
        status = 'WARNING';
    }
    
    const insertQuery = `
        INSERT INTO sensor_readings (user_id, alcohol_level, raw_reading, status, timestamp) 
        VALUES (${user_id || 1}, ${alcohol_level}, ${rawValue}, '${status}', NOW())
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
                'Dangerous alcohol level detected! Raw sensor value: ${rawValue}', NOW())
            `;
            dbConn.query(alertQuery, (alertErr) => {
                if (alertErr) {
                    console.error("Error creating DANGER alert:", alertErr);
                } else {
                    console.log("🚨 DANGER alert created for raw value:", rawValue);
                    
                    // Send SMS notification
                    sendSMSNotification(user_id || 1, rawValue, alcohol_level);
                }
            });
        } else if (status === 'WARNING') {
            const alertQuery = `
                INSERT INTO alerts (user_id, alert_type, alcohol_level, message, timestamp) 
                VALUES (${user_id || 1}, 'WARNING_LEVEL', ${alcohol_level}, 
                'Warning: Elevated alcohol level detected. Raw sensor value: ${rawValue}', NOW())
            `;
            dbConn.query(alertQuery, (alertErr) => {
                if (alertErr) {
                    console.error("Error creating WARNING alert:", alertErr);
                } else {
                    console.log("⚠️ WARNING alert created for raw value:", rawValue);
                }
            });
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
    
    console.log("📡 /api/latest-data called for user:", userId);
    
    // Get latest reading
    const readingQuery = `
        SELECT alcohol_level, raw_reading, status, timestamp
        FROM sensor_readings 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
    `;
    
    // Get vehicle status with Arduino connection check
    const vehicleQuery = `
        SELECT 
            CASE 
                WHEN TIMESTAMPDIFF(SECOND, (SELECT MAX(timestamp) FROM sensor_readings WHERE user_id = ?), NOW()) <= 10 
                THEN vs.vehicle_state
                ELSE 'OFF'
            END as vehicle_state,
            CASE 
                WHEN TIMESTAMPDIFF(SECOND, (SELECT MAX(timestamp) FROM sensor_readings WHERE user_id = ?), NOW()) <= 10 
                THEN vs.engine_status
                ELSE 'OFF'
            END as engine_status,
            vs.last_updated,
            CASE 
                WHEN TIMESTAMPDIFF(SECOND, (SELECT MAX(timestamp) FROM sensor_readings WHERE user_id = ?), NOW()) <= 10 THEN 'CONNECTED'
                ELSE 'DISCONNECTED'
            END as arduino_status
        FROM vehicle_status vs
        WHERE vs.user_id = ? 
        ORDER BY vs.last_updated DESC 
        LIMIT 1
    `;
    
    // Get GPS location
    const gpsQuery = `
        SELECT latitude, longitude, timestamp
        FROM gps_locations 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
    `;
    
    // Get active alerts
    const alertsQuery = `
        SELECT * FROM alerts 
        WHERE user_id = ? AND resolved = 0 
        ORDER BY timestamp DESC
    `;
    
    // Get today's stats
    const statsQuery = `
        SELECT 
            COUNT(*) as total_readings,
            AVG(raw_reading) as avg_raw,
            MAX(raw_reading) as max_raw,
            SUM(CASE WHEN status = 'DANGER' THEN 1 ELSE 0 END) as danger_count
        FROM sensor_readings 
        WHERE user_id = ? AND DATE(timestamp) = CURDATE()
    `;
    
    Promise.all([
        new Promise((resolve) => {
            dbConn.query(readingQuery, [userId], (err, data) => {
                if (err) {
                    console.error("❌ Reading query error:", err.message);
                    return resolve(null);
                }
                console.log("✅ Reading data:", data[0]);
                resolve(data[0]);
            });
        }),
        new Promise((resolve) => {
            dbConn.query(vehicleQuery, [userId, userId, userId, userId], (err, data) => {
                if (err) {
                    console.error("❌ Vehicle query error:", err.message);
                    return resolve(null);
                }
                console.log("✅ Vehicle data:", data[0]);
                resolve(data[0]);
            });
        }),
        new Promise((resolve) => {
            dbConn.query(gpsQuery, [userId], (err, data) => {
                if (err) {
                    console.error("❌ GPS query error:", err.message);
                    return resolve(null);
                }
                console.log("✅ GPS data:", data[0]);
                resolve(data[0]);
            });
        }),
        new Promise((resolve) => {
            dbConn.query(alertsQuery, [userId], (err, data) => {
                if (err) {
                    console.error("❌ Alerts query error:", err.message);
                    return resolve([]);
                }
                console.log("✅ Alerts data:", data.length, "active alerts");
                resolve(data);
            });
        }),
        new Promise((resolve) => {
            dbConn.query(statsQuery, [userId], (err, data) => {
                if (err) {
                    console.error("❌ Stats query error:", err.message);
                    return resolve({});
                }
                console.log("✅ Stats data:", data[0]);
                resolve(data[0]);
            });
        })
    ]).then(([reading, vehicle, gps, alerts, stats]) => {
        console.log("📤 Sending response:", { reading, vehicle, gps, alerts: alerts.length, stats });
        res.json({
            latest_reading: reading ? JSON.stringify(reading) : null,
            vehicle_status: vehicle ? JSON.stringify(vehicle) : null,
            gps_location: gps ? JSON.stringify(gps) : null,
            alerts: JSON.stringify(alerts),
            stats: JSON.stringify(stats)
        });
    }).catch(err => {
        console.error("❌ Latest-data API error:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    });
});

// Get historical sensor data for charts
app.get("/api/sensor-history", (req, res) => {
    const userId = req.session.user?.id || 1;
    const hours = req.query.hours || 24;
    
    const query = `
        SELECT alcohol_level, raw_reading, status, timestamp 
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

// Emergency Contacts API Endpoints
// GET - Fetch user's emergency contacts
app.get("/api/emergency-contacts", (req, res) => {
    const userId = req.session.user?.id || 1;
    
    const query = `
        SELECT id, contact_name as name, phone_number, relationship, created_at 
        FROM emergency_contacts 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
    `;
    
    dbConn.query(query, (err, contacts) => {
        if (err) {
            console.error("Error fetching emergency contacts:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, contacts: contacts || [] });
    });
});

// POST - Add new emergency contact
app.post("/api/emergency-contacts", express.json(), (req, res) => {
    const userId = req.session.user?.id || 1;
    const { name, phone_number, relationship } = req.body;
    
    console.log('📝 Received request to add contact:', req.body);
    
    if (!name || !phone_number) {
        return res.status(400).json({ error: "Name and phone number are required" });
    }
    
    // Format phone number to ensure it starts with +254
    let formattedPhone = phone_number.trim();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '+254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('254')) {
        formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+254' + formattedPhone;
    }
    
    // Escape special characters to prevent SQL injection
    const escapedName = name.replace(/'/g, "''");
    const escapedRelationship = (relationship || 'Other').replace(/'/g, "''");
    
    const query = `
        INSERT INTO emergency_contacts (user_id, contact_name, phone_number, relationship) 
        VALUES (${userId}, '${escapedName}', '${formattedPhone}', '${escapedRelationship}')
    `;
    
    console.log('📝 Adding emergency contact:', { name: escapedName, phone: formattedPhone, relationship: escapedRelationship });
    
    dbConn.query(query, (err, result) => {
        if (err) {
            console.error("❌ Error adding emergency contact:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        console.log('✅ Emergency contact added successfully. ID:', result.insertId);
        res.json({ 
            success: true, 
            contactId: result.insertId,
            message: "Contact added successfully" 
        });
    });
});

// DELETE - Remove emergency contact
app.delete("/api/emergency-contacts/:id", (req, res) => {
    const userId = req.session.user?.id || 1;
    const contactId = req.params.id;
    
    const query = `
        DELETE FROM emergency_contacts 
        WHERE id = ${contactId} AND user_id = ${userId}
    `;
    
    dbConn.query(query, (err, result) => {
        if (err) {
            console.error("Error deleting emergency contact:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Contact not found" });
        }
        
        res.json({ success: true, message: "Contact deleted successfully" });
    });
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// Start server


app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});