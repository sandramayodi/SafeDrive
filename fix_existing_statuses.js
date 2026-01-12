// Script to fix existing sensor_readings statuses based on new thresholds
// Run this once after changing thresholds

const mysql = require('mysql');

const dbConn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mayodi@01",
    database: "safedrive"
});

dbConn.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
    console.log("✅ Connected to database");
    
    // Update statuses based on raw_reading values
    // SAFE: < 180, WARNING: 180-249, DANGER: >= 250
    const updateQuery = `
        UPDATE sensor_readings 
        SET status = CASE 
            WHEN raw_reading >= 250 THEN 'DANGER'
            WHEN raw_reading >= 180 THEN 'WARNING'
            ELSE 'SAFE'
        END
        WHERE 1=1
    `;
    
    console.log("🔄 Updating all sensor_readings statuses...");
    
    dbConn.query(updateQuery, (err, result) => {
        if (err) {
            console.error("❌ Error updating statuses:", err);
            dbConn.end();
            process.exit(1);
        }
        
        console.log(`✅ Updated ${result.changedRows} records`);
        console.log(`   Total rows affected: ${result.affectedRows}`);
        
        // Now get summary
        const summaryQuery = `
            SELECT 
                status,
                COUNT(*) as count,
                MIN(raw_reading) as min_value,
                MAX(raw_reading) as max_value
            FROM sensor_readings
            GROUP BY status
            ORDER BY FIELD(status, 'SAFE', 'WARNING', 'DANGER')
        `;
        
        dbConn.query(summaryQuery, (err, results) => {
            if (err) {
                console.error("Error getting summary:", err);
            } else {
                console.log("\n📊 Status distribution:");
                results.forEach(row => {
                    console.log(`   ${row.status}: ${row.count} records (range: ${row.min_value}-${row.max_value})`);
                });
            }
            
            dbConn.end();
            console.log("\n✅ Done! Database statuses have been corrected.");
        });
    });
});
