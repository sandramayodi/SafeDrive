// Quick database verification script
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
    
    // Check users
    dbConn.query("SELECT id, fullName, email FROM users LIMIT 3", (err, users) => {
        if (err) {
            console.error("❌ Error fetching users:", err.message);
        } else {
            console.log("👥 USERS (" + users.length + " found):");
            users.forEach(u => console.log(`   - ID: ${u.id}, Name: ${u.fullName}, Email: ${u.email}`));
        }
        console.log("");
        
        // Check sensor readings for user 1
        dbConn.query(
            "SELECT user_id, alcohol_level, status, timestamp FROM sensor_readings WHERE user_id = 1 ORDER BY timestamp DESC LIMIT 5", 
            (err, readings) => {
                if (err) {
                    console.error("❌ Error fetching readings:", err.message);
                } else {
                    console.log("📊 SENSOR READINGS for User 1 (" + readings.length + " found):");
                    if (readings.length === 0) {
                        console.log("   ⚠️  NO DATA FOUND! Run seed_data.sql to insert sample data.");
                    } else {
                        readings.forEach(r => console.log(`   - BAC: ${r.alcohol_level}%, Status: ${r.status}, Time: ${r.timestamp}`));
                    }
                }
                console.log("");
                
                // Check alerts
                dbConn.query(
                    "SELECT user_id, alert_type, resolved FROM alerts WHERE user_id = 1 ORDER BY timestamp DESC LIMIT 3", 
                    (err, alerts) => {
                        if (err) {
                            console.error("❌ Error fetching alerts:", err.message);
                        } else {
                            console.log("🚨 ALERTS for User 1 (" + alerts.length + " found):");
                            if (alerts.length === 0) {
                                console.log("   ℹ️  No alerts (this is normal if no incidents yet)");
                            } else {
                                alerts.forEach(a => console.log(`   - Type: ${a.alert_type}, Resolved: ${a.resolved}`));
                            }
                        }
                        console.log("");
                        
                        // Check vehicle status
                        dbConn.query(
                            "SELECT user_id, vehicle_state, engine_status FROM vehicle_status WHERE user_id = 1", 
                            (err, vehicle) => {
                                if (err) {
                                    console.error("❌ Error fetching vehicle status:", err.message);
                                } else {
                                    console.log("🚗 VEHICLE STATUS for User 1:");
                                    if (vehicle.length === 0) {
                                        console.log("   ⚠️  NO DATA FOUND! Run seed_data.sql to insert sample data.");
                                    } else {
                                        console.log(`   - State: ${vehicle[0].vehicle_state}, Engine: ${vehicle[0].engine_status}`);
                                    }
                                }
                                console.log("");
                                console.log("═══════════════════════════════════════");
                                
                                dbConn.query(
                                    "SELECT COUNT(*) as count FROM sensor_readings WHERE user_id = 1", 
                                    (err, result) => {
                                        const count = result[0].count;
                                        if (count === 0) {
                                            console.log("⚠️  WARNING: No sensor data found!");
                                            console.log("\n📝 TO FIX: Run this command:");
                                            console.log("   Get-Content seed_data.sql | node load_data.js");
                                            console.log("   OR manually load seed_data.sql in MySQL Workbench");
                                        } else {
                                            console.log(`✅ Database has ${count} sensor readings for User 1`);
                                            console.log("✅ Your database is ready!");
                                        }
                                        console.log("═══════════════════════════════════════");
                                        dbConn.end();
                                        process.exit(0);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});
