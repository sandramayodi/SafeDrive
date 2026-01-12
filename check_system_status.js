// Check SafeDrive System Status
const mysql = require("mysql");

const dbConn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mayodi@01",
    database: "safedrive"
});

dbConn.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    }
    console.log("✅ Connected to database\n");
    
    // Check sensor readings
    dbConn.query("SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 5", (err, sensors) => {
        if (err) {
            console.error("Error checking sensor readings:", err);
        } else {
            console.log("📊 Recent Sensor Readings:");
            console.log(sensors.length > 0 ? sensors : "No sensor readings found");
            console.log("");
        }
        
        // Check GPS locations
        dbConn.query("SELECT * FROM gps_locations ORDER BY timestamp DESC LIMIT 5", (err, gps) => {
            if (err) {
                console.error("Error checking GPS:", err);
            } else {
                console.log("📍 Recent GPS Locations:");
                console.log(gps.length > 0 ? gps : "No GPS data found");
                console.log("");
            }
            
            // Check alerts
            dbConn.query("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 5", (err, alerts) => {
                if (err) {
                    console.error("Error checking alerts:", err);
                } else {
                    console.log("🚨 Recent Alerts:");
                    console.log(alerts.length > 0 ? alerts : "No alerts found");
                    console.log("");
                }
                
                // Check emergency contacts
                dbConn.query("SELECT * FROM emergency_contacts", (err, contacts) => {
                    if (err) {
                        console.error("Error checking contacts:", err);
                    } else {
                        console.log("📞 Emergency Contacts:");
                        console.log(contacts.length > 0 ? contacts : "No emergency contacts found");
                        console.log("");
                    }
                    
                    // Check notification cooldowns
                    dbConn.query("SELECT *, TIMESTAMPDIFF(MINUTE, last_notification_time, NOW()) as minutes_ago FROM notification_cooldowns", (err, cooldowns) => {
                        if (err) {
                            console.error("Error checking cooldowns:", err);
                        } else {
                            console.log("⏱️  Notification Cooldowns:");
                            console.log(cooldowns.length > 0 ? cooldowns : "No cooldown records");
                            console.log("");
                        }
                        
                        dbConn.end();
                    });
                });
            });
        });
    });
});
