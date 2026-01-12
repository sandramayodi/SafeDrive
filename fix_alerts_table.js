// Script to fix alerts table structure
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
    
    // First, check if is_resolved column exists
    const checkColumn = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'safedrive' 
        AND TABLE_NAME = 'alerts' 
        AND COLUMN_NAME = 'is_resolved'
    `;
    
    dbConn.query(checkColumn, (err, result) => {
        if (err) {
            console.error("Error checking column:", err);
            dbConn.end();
            process.exit(1);
        }
        
        if (result.length === 0) {
            console.log("📝 Adding is_resolved column...");
            const addColumn = `
                ALTER TABLE alerts 
                ADD COLUMN is_resolved TINYINT(1) DEFAULT 0
            `;
            
            dbConn.query(addColumn, (err) => {
                if (err) {
                    console.error("❌ Error adding is_resolved column:", err);
                } else {
                    console.log("✅ Added is_resolved column");
                }
                
                // Now fix alert_type column size
                fixAlertTypeColumn();
            });
        } else {
            console.log("✅ is_resolved column already exists");
            fixAlertTypeColumn();
        }
    });
    
    function fixAlertTypeColumn() {
        console.log("📝 Updating alert_type column size...");
        
        const alterColumn = `
            ALTER TABLE alerts 
            MODIFY COLUMN alert_type VARCHAR(50) NOT NULL
        `;
        
        dbConn.query(alterColumn, (err) => {
            if (err) {
                console.error("❌ Error modifying alert_type column:", err);
            } else {
                console.log("✅ Updated alert_type column to VARCHAR(50)");
            }
            
            // Show table structure
            showTableStructure();
        });
    }
    
    function showTableStructure() {
        console.log("\n📊 Current alerts table structure:");
        
        const describeQuery = "DESCRIBE alerts";
        
        dbConn.query(describeQuery, (err, results) => {
            if (err) {
                console.error("Error describing table:", err);
            } else {
                console.table(results);
            }
            
            dbConn.end();
            console.log("\n✅ Done! Alerts table has been fixed.");
        });
    }
});
