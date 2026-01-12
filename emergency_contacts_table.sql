-- Create emergency_contacts table
-- This table stores emergency contacts for each user who will receive SMS alerts

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Index for faster queries
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add some initial contacts for Sandra (user_id = 8)
INSERT INTO emergency_contacts (user_id, name, phone_number, relationship) 
VALUES 
    (8, 'Emergency Contact 1', '+254726313305', 'Family'),
    (8, 'Emergency Contact 2', '+254704778344', 'Friend');
