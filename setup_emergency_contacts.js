const mysql = require('mysql');

const dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mayodi@01',
    database: 'safedrive',
    multipleStatements: true
});

dbConn.connect((err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database');
    
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS emergency_contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            relationship VARCHAR(50) DEFAULT 'Other',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    dbConn.query(createTableQuery, (err) => {
        if (err) {
            console.error('❌ Error creating table:', err);
            dbConn.end();
            process.exit(1);
        }
        console.log('✅ Table emergency_contacts created successfully');
        
        // Insert initial contacts for Sandra (user_id = 8)
        const insertQuery = `
            INSERT INTO emergency_contacts (user_id, name, phone_number, relationship) 
            VALUES 
                (8, 'Emergency Contact 1', '+254726313305', 'Family'),
                (8, 'Emergency Contact 2', '+254704778344', 'Friend')
        `;
        
        dbConn.query(insertQuery, (err, result) => {
            if (err) {
                console.error('❌ Error inserting initial contacts:', err);
            } else {
                console.log('✅ Added', result.affectedRows, 'initial contacts for Sandra');
            }
            
            // Verify the data
            dbConn.query('SELECT * FROM emergency_contacts WHERE user_id = 8', (err, contacts) => {
                if (err) {
                    console.error('❌ Error fetching contacts:', err);
                } else {
                    console.log('\n📞 Emergency Contacts:');
                    contacts.forEach(contact => {
                        console.log(`   - ${contact.name} (${contact.phone_number}) - ${contact.relationship}`);
                    });
                }
                
                dbConn.end();
                console.log('\n✅ Setup complete!');
            });
        });
    });
});
