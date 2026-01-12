const mysql = require('mysql');

const dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mayodi@01',
    database: 'safedrive'
});

dbConn.connect((err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }
    
    // Show table structure
    dbConn.query('DESCRIBE emergency_contacts', (err, results) => {
        if (err) {
            console.error('❌ Error describing table:', err);
        } else {
            console.log('\n📋 Table structure:');
            console.table(results);
        }
        
        // Show existing data
        dbConn.query('SELECT * FROM emergency_contacts', (err, contacts) => {
            if (err) {
                console.error('❌ Error fetching contacts:', err);
            } else {
                console.log('\n📞 Existing data:');
                console.table(contacts);
            }
            
            dbConn.end();
        });
    });
});
