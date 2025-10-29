-- Insert sample data for testing the dashboard

USE safedrive;

-- Insert test user (password: test123)
INSERT INTO users (fullName, email, password, phone) VALUES 
('Test User', 'test@safedrive.com', '$2b$10$rO5xQxCrjNrJk3vK5hF9JOZqRzNfQp0yYFqYqZnFX8FqPfqKzRQ8u', '+1234567890');

-- Get the user ID (should be 1 if this is the first user)
SET @user_id = LAST_INSERT_ID();

-- Insert sample sensor readings for the past 24 hours
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(@user_id, 0.000, 'SAFE', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(@user_id, 0.010, 'SAFE', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(@user_id, 0.015, 'SAFE', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(@user_id, 0.020, 'SAFE', DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(@user_id, 0.025, 'SAFE', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(@user_id, 0.030, 'SAFE', DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(@user_id, 0.035, 'SAFE', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(@user_id, 0.040, 'SAFE', DATE_SUB(NOW(), INTERVAL 17 HOUR)),
(@user_id, 0.050, 'WARNING', DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(@user_id, 0.055, 'WARNING', DATE_SUB(NOW(), INTERVAL 15 HOUR)),
(@user_id, 0.060, 'WARNING', DATE_SUB(NOW(), INTERVAL 14 HOUR)),
(@user_id, 0.070, 'WARNING', DATE_SUB(NOW(), INTERVAL 13 HOUR)),
(@user_id, 0.080, 'DANGER', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@user_id, 0.095, 'DANGER', DATE_SUB(NOW(), INTERVAL 11 HOUR)),
(@user_id, 0.110, 'DANGER', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(@user_id, 0.090, 'DANGER', DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(@user_id, 0.070, 'WARNING', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(@user_id, 0.050, 'WARNING', DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(@user_id, 0.030, 'SAFE', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(@user_id, 0.020, 'SAFE', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(@user_id, 0.015, 'SAFE', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(@user_id, 0.010, 'SAFE', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(@user_id, 0.005, 'SAFE', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(@user_id, 0.000, 'SAFE', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@user_id, 0.000, 'SAFE', NOW());

-- Insert vehicle status
INSERT INTO vehicle_status (user_id, vehicle_state, engine_status) VALUES
(@user_id, 'IDLE', 'OFF');

-- Insert GPS locations
INSERT INTO gps_locations (user_id, latitude, longitude, timestamp) VALUES
(@user_id, 40.7128, -74.0060, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@user_id, 40.7138, -74.0070, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(@user_id, 40.7148, -74.0080, NOW());

-- Insert sample alerts (2 resolved, 1 active)
INSERT INTO alerts (user_id, alert_type, alcohol_level, latitude, longitude, message, sms_sent, resolved, timestamp, resolved_at) VALUES
(@user_id, 'HIGH_ALCOHOL', 0.110, 40.7128, -74.0060, 'Dangerous alcohol level detected!', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(@user_id, 'HIGH_ALCOHOL', 0.095, 40.7135, -74.0065, 'Dangerous alcohol level detected!', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 11 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(@user_id, 'HIGH_ALCOHOL', 0.080, 40.7140, -74.0070, 'Dangerous alcohol level detected!', TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR), NULL);

-- Insert emergency contacts
INSERT INTO emergency_contacts (user_id, contact_name, phone_number, relationship, is_primary) VALUES
(@user_id, 'John Doe', '+1234567890', 'Family', TRUE),
(@user_id, 'Jane Smith', '+0987654321', 'Friend', FALSE);

-- Insert device configuration
INSERT INTO device_config (user_id, device_id, threshold_bac, monitoring_interval, last_calibration) VALUES
(@user_id, 'SAFEDRIVE_001', 0.08, 2, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert system logs
INSERT INTO system_logs (user_id, log_type, message, timestamp) VALUES
(@user_id, 'INFO', 'System initialized successfully', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(@user_id, 'WARNING', 'High BAC level detected: 0.080%', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@user_id, 'CRITICAL', 'Emergency lockout activated', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@user_id, 'INFO', 'Emergency SMS sent', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@user_id, 'INFO', 'BAC level returned to safe range', DATE_SUB(NOW(), INTERVAL 6 HOUR));

SELECT 'Sample data inserted successfully!' as Status;
SELECT 'Test User Email: test@safedrive.com' as Info;
SELECT 'Test User Password: test123' as Info;
