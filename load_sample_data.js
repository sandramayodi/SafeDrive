// Load sample data for existing users
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
    
    // Get first user
    dbConn.query("SELECT id, fullName FROM users ORDER BY id LIMIT 1", (err, users) => {
        if (err || users.length === 0) {
            console.error("❌ No users found in database!");
            dbConn.end();
            process.exit(1);
        }
        
        const userId = users[0].id;
        const userName = users[0].fullName;
        console.log(`📝 Inserting sample data for: ${userName} (ID: ${userId})\n`);
        
        // Insert sensor readings (past 24 hours)
        const sensorData = [];
        
        // Safe readings
        for (let i = 24; i >= 13; i--) {
            const bac = (Math.random() * 0.04).toFixed(3);
            sensorData.push([userId, bac, 'SAFE', `DATE_SUB(NOW(), INTERVAL ${i} HOUR)`]);
        }
        
        // Warning episode 12 hours ago
        const warningLevels = [0.050, 0.055, 0.060, 0.065, 0.070, 0.075, 0.078];
        warningLevels.forEach((bac, idx) => {
            sensorData.push([userId, bac, 'WARNING', `DATE_SUB(NOW(), INTERVAL ${12 - idx * 0.1} HOUR)`]);
        });
        
        // Danger episode 11 hours ago
        const dangerLevels = [0.082, 0.088, 0.095, 0.102, 0.110, 0.108, 0.100, 0.092, 0.085];
        dangerLevels.forEach((bac, idx) => {
            sensorData.push([userId, bac, 'DANGER', `DATE_SUB(NOW(), INTERVAL ${11 - idx * 0.1} HOUR)`]);
        });
        
        // Recovery
        const recoveryLevels = [0.075, 0.065, 0.055, 0.045, 0.035, 0.025, 0.015, 0.010, 0.005, 0.000];
        recoveryLevels.forEach((bac, idx) => {
            sensorData.push([userId, bac, bac >= 0.05 ? 'WARNING' : 'SAFE', `DATE_SUB(NOW(), INTERVAL ${10 - idx} HOUR)`]);
        });
        
        // Recent safe readings
        for (let i = 0; i < 10; i++) {
            const bac = (Math.random() * 0.02).toFixed(3);
            sensorData.push([userId, bac, 'SAFE', `DATE_SUB(NOW(), INTERVAL ${i * 6} MINUTE)`]);
        }
        
        const sensorQuery = `INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES ?`;
        const sensorValues = sensorData.map(row => [row[0], row[1], row[2], new Date(Date.now() - eval(row[3].replace('DATE_SUB(NOW(), INTERVAL ', '').replace(')', '').replace('HOUR', '* 3600000').replace('MINUTE', '* 60000')))]);
        
        dbConn.query(sensorQuery, [sensorValues], (err) => {
            if (err) {
                console.error("❌ Error inserting sensor data:", err.message);
            } else {
                console.log(`✅ Inserted ${sensorValues.length} sensor readings`);
            }
            
            // Insert vehicle status
            const vehicleQuery = `INSERT INTO vehicle_status (user_id, vehicle_state, engine_status) VALUES (?, 'IDLE', 'OFF')`;
            dbConn.query(vehicleQuery, [userId], (err) => {
                if (err) console.error("❌ Error inserting vehicle status:", err.message);
                else console.log("✅ Inserted vehicle status");
                
                // Insert GPS locations
                const gpsData = [
                    [userId, 40.7128, -74.0060, 'New York, NY', new Date(Date.now() - 2 * 3600000)],
                    [userId, 40.7148, -74.0080, 'Times Square, NY', new Date(Date.now() - 1 * 3600000)],
                    [userId, 40.7168, -74.0100, 'Central Park, NY', new Date(Date.now() - 30 * 60000)],
                    [userId, 40.7188, -74.0120, 'Upper West Side, NY', new Date()]
                ];
                
                const gpsQuery = `INSERT INTO gps_locations (user_id, latitude, longitude, address, timestamp) VALUES ?`;
                dbConn.query(gpsQuery, [gpsData], (err) => {
                    if (err) console.error("❌ Error inserting GPS data:", err.message);
                    else console.log("✅ Inserted GPS locations");
                    
                    // Insert alerts
                    const alertsData = [
                        [userId, 'HIGH_ALCOHOL', 0.110, 40.7128, -74.0060, 'Dangerous alcohol level detected!', 1, 1, new Date(Date.now() - 11 * 3600000), new Date(Date.now() - 10 * 3600000)],
                        [userId, 'HIGH_ALCOHOL', 0.082, 40.7188, -74.0120, 'BAC exceeded legal limit.', 1, 0, new Date(Date.now() - 30 * 60000), null]
                    ];
                    
                    const alertQuery = `INSERT INTO alerts (user_id, alert_type, alcohol_level, latitude, longitude, message, sms_sent, resolved, timestamp, resolved_at) VALUES ?`;
                    dbConn.query(alertQuery, [alertsData], (err) => {
                        if (err) console.error("❌ Error inserting alerts:", err.message);
                        else console.log("✅ Inserted alerts");
                        
                        // Insert emergency contacts
                        const contactsData = [
                            [userId, 'Emergency Contact 1', '+1234567890', 'Family', 1],
                            [userId, 'Emergency Contact 2', '+0987654321', 'Friend', 0]
                        ];
                        
                        const contactQuery = `INSERT INTO emergency_contacts (user_id, contact_name, phone_number, relationship, is_primary) VALUES ?`;
                        dbConn.query(contactQuery, [contactsData], (err) => {
                            if (err) console.error("❌ Error inserting contacts:", err.message);
                            else console.log("✅ Inserted emergency contacts");
                            
                            // Insert device config
                            const deviceQuery = `INSERT INTO device_config (user_id, device_id, threshold_bac, monitoring_interval, auto_lockout, emergency_sms, last_calibration, is_active) 
                                                VALUES (?, 'SAFEDRIVE_001', 0.08, 2, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 1)`;
                            dbConn.query(deviceQuery, [userId], (err) => {
                                if (err) console.error("❌ Error inserting device config:", err.message);
                                else console.log("✅ Inserted device configuration");
                                
                                console.log("\n✅ Sample data loaded successfully!");
                                console.log(`\n📱 Login with: ${users[0].fullName}`);
                                console.log("   Then access dashboard to see the data!\n");
                                
                                dbConn.end();
                                process.exit(0);
                            });
                        });
                    });
                });
            });
        });
    });
});
