-- SafeDrive AI - Complete Sample Data Seeding
-- Run this after creating the database schema

USE safedrive;

-- Clear existing data (optional - uncomment if needed)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE system_logs;
-- TRUNCATE TABLE device_config;
-- TRUNCATE TABLE emergency_contacts;
-- TRUNCATE TABLE alerts;
-- TRUNCATE TABLE gps_locations;
-- TRUNCATE TABLE vehicle_status;
-- TRUNCATE TABLE sensor_readings;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. INSERT USERS
-- ============================================================
-- Password for all users: "password123"
-- Hashed with bcrypt salt rounds 10

INSERT INTO users (fullName, email, password, phone, created_at) VALUES
('Sandra Smith', 'sandra@safedrive.com', '$2b$10$rO5xQxCrjNrJk3vK5hF9JOZqRzNfQp0yYFqYqZnFX8FqPfqKzRQ8u', '+1234567890', '2025-10-01 08:00:00'),
('John Doe', 'john.doe@example.com', '$2b$10$rO5xQxCrjNrJk3vK5hF9JOZqRzNfQp0yYFqYqZnFX8FqPfqKzRQ8u', '+1234567891', '2025-10-05 10:30:00'),
('Jane Wilson', 'jane.wilson@example.com', '$2b$10$rO5xQxCrjNrJk3vK5hF9JOZqRzNfQp0yYFqYqZnFX8FqPfqKzRQ8u', '+1234567892', '2025-10-10 14:15:00'),
('Mike Johnson', 'mike.j@example.com', '$2b$10$rO5xQxCrjNrJk3vK5hF9JOZqRzNfQp0yYFqYqZnFX8FqPfqKzRQ8u', '+1234567893', '2025-10-15 09:45:00'),
('Test User', 'test@safedrive.com', '$2b$10$rO5xQxCrjNrJk3vK5hF9JOZqRzNfQp0yYFqYqZnFX8FqPfqKzRQ8u', '+1234567894', '2025-10-20 11:00:00');

-- ============================================================
-- 2. INSERT SENSOR READINGS (Past 48 hours for User 1)
-- ============================================================

-- Day 1 - Two days ago (normal readings)
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(1, 0.000, 'SAFE', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(1, 0.000, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 58 MINUTE)),
(1, 0.005, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 56 MINUTE)),
(1, 0.010, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 54 MINUTE)),
(1, 0.015, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 52 MINUTE)),
(1, 0.020, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 50 MINUTE)),
(1, 0.025, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 48 MINUTE)),
(1, 0.030, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 46 MINUTE)),
(1, 0.035, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 44 MINUTE)),
(1, 0.040, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 42 MINUTE)),
(1, 0.043, 'SAFE', DATE_SUB(NOW(), INTERVAL 47 HOUR + INTERVAL 40 MINUTE));

-- Day 1 Evening - Incident 1 (Warning zone)
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(1, 0.050, 'WARNING', DATE_SUB(NOW(), INTERVAL 36 HOUR)),
(1, 0.055, 'WARNING', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 58 MINUTE)),
(1, 0.058, 'WARNING', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 56 MINUTE)),
(1, 0.062, 'WARNING', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 54 MINUTE)),
(1, 0.067, 'WARNING', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 52 MINUTE)),
(1, 0.070, 'WARNING', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 50 MINUTE)),
(1, 0.075, 'WARNING', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 48 MINUTE)),
(1, 0.078, 'WARNING', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 46 MINUTE));

-- Day 1 Evening - Incident 1 (Danger zone - lockout triggered)
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(1, 0.082, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 44 MINUTE)),
(1, 0.088, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 42 MINUTE)),
(1, 0.095, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 40 MINUTE)),
(1, 0.102, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 38 MINUTE)),
(1, 0.110, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 36 MINUTE)),
(1, 0.115, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 34 MINUTE)),
(1, 0.118, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 32 MINUTE)),
(1, 0.120, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 30 MINUTE)),
(1, 0.118, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 28 MINUTE)),
(1, 0.115, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 26 MINUTE)),
(1, 0.110, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 24 MINUTE)),
(1, 0.105, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 22 MINUTE)),
(1, 0.098, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 20 MINUTE)),
(1, 0.092, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 18 MINUTE)),
(1, 0.088, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 16 MINUTE)),
(1, 0.082, 'DANGER', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 14 MINUTE));

-- Day 1 Late Evening - Recovery
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(1, 0.075, 'WARNING', DATE_SUB(NOW(), INTERVAL 32 HOUR)),
(1, 0.068, 'WARNING', DATE_SUB(NOW(), INTERVAL 31 HOUR)),
(1, 0.062, 'WARNING', DATE_SUB(NOW(), INTERVAL 30 HOUR)),
(1, 0.055, 'WARNING', DATE_SUB(NOW(), INTERVAL 29 HOUR)),
(1, 0.048, 'SAFE', DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(1, 0.042, 'SAFE', DATE_SUB(NOW(), INTERVAL 27 HOUR)),
(1, 0.035, 'SAFE', DATE_SUB(NOW(), INTERVAL 26 HOUR)),
(1, 0.028, 'SAFE', DATE_SUB(NOW(), INTERVAL 25 HOUR)),
(1, 0.020, 'SAFE', DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Day 2 - Yesterday (mostly safe with one warning episode)
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(1, 0.000, 'SAFE', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(1, 0.000, 'SAFE', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(1, 0.005, 'SAFE', DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(1, 0.010, 'SAFE', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(1, 0.015, 'SAFE', DATE_SUB(NOW(), INTERVAL 19 HOUR)),
(1, 0.020, 'SAFE', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(1, 0.025, 'SAFE', DATE_SUB(NOW(), INTERVAL 17 HOUR)),
(1, 0.030, 'SAFE', DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(1, 0.035, 'SAFE', DATE_SUB(NOW(), INTERVAL 15 HOUR)),
(1, 0.040, 'SAFE', DATE_SUB(NOW(), INTERVAL 14 HOUR)),
(1, 0.043, 'SAFE', DATE_SUB(NOW(), INTERVAL 13 HOUR));

-- Day 2 Evening - Minor warning episode
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(1, 0.050, 'WARNING', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 0.055, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 58 MINUTE)),
(1, 0.060, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 56 MINUTE)),
(1, 0.065, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 54 MINUTE)),
(1, 0.070, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 52 MINUTE)),
(1, 0.072, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 50 MINUTE)),
(1, 0.075, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 48 MINUTE)),
(1, 0.076, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 46 MINUTE)),
(1, 0.078, 'WARNING', DATE_SUB(NOW(), INTERVAL 11 HOUR + INTERVAL 44 MINUTE));

-- Day 2 - Recovery from warning
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(1, 0.070, 'WARNING', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(1, 0.062, 'WARNING', DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(1, 0.055, 'WARNING', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(1, 0.048, 'SAFE', DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(1, 0.040, 'SAFE', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(1, 0.032, 'SAFE', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(1, 0.025, 'SAFE', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1, 0.018, 'SAFE', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(1, 0.012, 'SAFE', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 0.008, 'SAFE', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 0.005, 'SAFE', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 0.002, 'SAFE', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(1, 0.000, 'SAFE', NOW());

-- Additional readings for other users
INSERT INTO sensor_readings (user_id, alcohol_level, status, timestamp) VALUES
(2, 0.015, 'SAFE', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 0.020, 'SAFE', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 0.018, 'SAFE', NOW()),
(3, 0.000, 'SAFE', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 0.005, 'SAFE', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 0.000, 'SAFE', NOW()),
(4, 0.085, 'DANGER', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4, 0.070, 'WARNING', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(4, 0.045, 'SAFE', NOW());

-- ============================================================
-- 3. INSERT VEHICLE STATUS
-- ============================================================

INSERT INTO vehicle_status (user_id, vehicle_state, engine_status, last_updated) VALUES
(1, 'IDLE', 'OFF', NOW()),
(2, 'RUNNING', 'ON', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(3, 'IDLE', 'OFF', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 'LOCKED', 'OFF', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(5, 'IDLE', 'OFF', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================
-- 4. INSERT GPS LOCATIONS (Simulating movement)
-- ============================================================

-- User 1 - Moving through downtown area
INSERT INTO gps_locations (user_id, latitude, longitude, address, timestamp) VALUES
(1, 40.7128, -74.0060, 'New York, NY', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 40.7138, -74.0070, 'Manhattan, NY', DATE_SUB(NOW(), INTERVAL 1 HOUR + INTERVAL 50 MINUTE)),
(1, 40.7148, -74.0080, 'Times Square, NY', DATE_SUB(NOW(), INTERVAL 1 HOUR + INTERVAL 40 MINUTE)),
(1, 40.7158, -74.0090, 'Central Park South, NY', DATE_SUB(NOW(), INTERVAL 1 HOUR + INTERVAL 30 MINUTE)),
(1, 40.7168, -74.0100, 'Upper West Side, NY', DATE_SUB(NOW(), INTERVAL 1 HOUR + INTERVAL 20 MINUTE)),
(1, 40.7178, -74.0110, 'Lincoln Center, NY', DATE_SUB(NOW(), INTERVAL 1 HOUR + INTERVAL 10 MINUTE)),
(1, 40.7188, -74.0120, 'Columbus Circle, NY', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 40.7198, -74.0130, 'Hell\'s Kitchen, NY', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(1, 40.7208, -74.0140, 'Hudson Yards, NY', DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(1, 40.7218, -74.0150, 'Chelsea, NY', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 40.7228, -74.0160, 'Midtown West, NY', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(1, 40.7238, -74.0170, 'Theatre District, NY', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(1, 40.7248, -74.0180, 'Bryant Park, NY', NOW());

-- User 2 - Los Angeles area
INSERT INTO gps_locations (user_id, latitude, longitude, address, timestamp) VALUES
(2, 34.0522, -118.2437, 'Downtown LA, CA', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 34.0532, -118.2447, 'Arts District, LA', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 34.0542, -118.2457, 'Little Tokyo, LA', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 34.0552, -118.2467, 'Chinatown, LA', NOW());

-- User 3 - Chicago area
INSERT INTO gps_locations (user_id, latitude, longitude, address, timestamp) VALUES
(3, 41.8781, -87.6298, 'The Loop, Chicago', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 41.8791, -87.6308, 'Millennium Park, Chicago', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 41.8801, -87.6318, 'Navy Pier, Chicago', NOW());

-- User 4 - San Francisco area
INSERT INTO gps_locations (user_id, latitude, longitude, address, timestamp) VALUES
(4, 37.7749, -122.4194, 'Downtown SF, CA', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(4, 37.7759, -122.4204, 'Union Square, SF', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4, 37.7769, -122.4214, 'Financial District, SF', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(4, 37.7779, -122.4224, 'Embarcadero, SF', NOW());

-- ============================================================
-- 5. INSERT ALERTS
-- ============================================================

-- User 1 - Past incidents (some resolved, some pending)
INSERT INTO alerts (user_id, alert_type, alcohol_level, latitude, longitude, message, sms_sent, resolved, timestamp, resolved_at) VALUES
(1, 'HIGH_ALCOHOL', 0.120, 40.7128, -74.0060, 'Dangerous alcohol level detected! BAC: 0.120%. Vehicle locked. Emergency contacts notified.', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 35 HOUR), DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(1, 'EMERGENCY_STOP', 0.115, 40.7138, -74.0070, 'Emergency stop initiated due to high alcohol level while driving.', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(1, 'LOCKOUT', 0.110, 40.7148, -74.0080, 'Vehicle lockout engaged. BAC above legal limit.', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(1, 'HIGH_ALCOHOL', 0.078, 40.7228, -74.0160, 'Warning: BAC approaching legal limit. Exercise caution.', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(1, 'HIGH_ALCOHOL', 0.082, 40.7248, -74.0180, 'ALERT: BAC exceeded legal limit. Vehicle starting prevented.', TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL);

-- User 2 - Recent warning
INSERT INTO alerts (user_id, alert_type, alcohol_level, latitude, longitude, message, sms_sent, resolved, timestamp, resolved_at) VALUES
(2, 'HIGH_ALCOHOL', 0.055, 34.0522, -118.2437, 'Warning level detected. Monitor your condition.', FALSE, TRUE, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- User 4 - Active danger alert
INSERT INTO alerts (user_id, alert_type, alcohol_level, latitude, longitude, message, sms_sent, resolved, timestamp, resolved_at) VALUES
(4, 'HIGH_ALCOHOL', 0.085, 37.7749, -122.4194, 'Dangerous alcohol level detected! Vehicle access denied.', TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 5 HOUR), NULL),
(4, 'LOCKOUT', 0.090, 37.7759, -122.4204, 'Vehicle lockout active. BAC: 0.090%', TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 5 HOUR + INTERVAL 10 MINUTE), NULL),
(4, 'SYSTEM_ERROR', NULL, 37.7769, -122.4214, 'Sensor calibration warning. Please check MQ-3 sensor.', FALSE, FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR), NULL);

-- ============================================================
-- 6. INSERT EMERGENCY CONTACTS
-- ============================================================

INSERT INTO emergency_contacts (user_id, contact_name, phone_number, relationship, is_primary, created_at) VALUES
(1, 'Emily Smith', '+1234567895', 'Spouse', TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 'Robert Smith', '+1234567896', 'Parent', FALSE, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 'Sarah Johnson', '+1234567897', 'Friend', FALSE, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 'Jennifer Doe', '+1234567898', 'Sibling', TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 'Michael Doe', '+1234567899', 'Parent', FALSE, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(3, 'David Wilson', '+1234567900', 'Spouse', TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(3, 'Lisa Wilson', '+1234567901', 'Sibling', FALSE, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 'Amanda Johnson', '+1234567902', 'Partner', TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'Tom Johnson', '+1234567903', 'Friend', FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 'Emergency Services', '+1911', 'Emergency', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ============================================================
-- 7. INSERT DEVICE CONFIGURATION
-- ============================================================

INSERT INTO device_config (user_id, device_id, threshold_bac, monitoring_interval, auto_lockout, emergency_sms, last_calibration, is_active, created_at) VALUES
(1, 'SAFEDRIVE_001', 0.08, 2, TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 'SAFEDRIVE_002', 0.08, 2, TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(3, 'SAFEDRIVE_003', 0.08, 2, TRUE, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 'SAFEDRIVE_004', 0.08, 2, TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(5, 'SAFEDRIVE_TEST_001', 0.08, 2, TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY), FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ============================================================
-- 8. INSERT SYSTEM LOGS
-- ============================================================

INSERT INTO system_logs (user_id, log_type, message, details, timestamp) VALUES
(1, 'INFO', 'System initialized successfully', '{"device_id": "SAFEDRIVE_001", "firmware": "v1.0.0"}', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(1, 'INFO', 'Sensor calibration completed', '{"sensor": "MQ-3", "baseline": 0.000}', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(1, 'INFO', 'GPS module connected', '{"satellites": 8, "accuracy": "3m"}', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(1, 'INFO', 'GSM network registered', '{"network": "AT&T", "signal": "95%"}', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(1, 'WARNING', 'High BAC level detected', '{"bac": 0.082, "threshold": 0.08}', DATE_SUB(NOW(), INTERVAL 35 HOUR)),
(1, 'CRITICAL', 'Emergency lockout activated', '{"bac": 0.120, "vehicle_state": "LOCKED"}', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 30 MINUTE)),
(1, 'INFO', 'Emergency SMS sent', '{"recipients": 3, "status": "delivered"}', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 28 MINUTE)),
(1, 'WARNING', 'Vehicle start attempt during lockout', '{"bac": 0.110, "action": "prevented"}', DATE_SUB(NOW(), INTERVAL 35 HOUR + INTERVAL 20 MINUTE)),
(1, 'INFO', 'BAC level returned to safe range', '{"bac": 0.048, "lockout_released": true}', DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(1, 'INFO', 'Normal monitoring resumed', '{"vehicle_state": "IDLE"}', DATE_SUB(NOW(), INTERVAL 28 HOUR)),
(1, 'WARNING', 'Warning BAC level detected', '{"bac": 0.078, "status": "WARNING"}', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 'INFO', 'GPS location updated', '{"lat": 40.7248, "lng": -74.0180}', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'INFO', 'Sensor reading transmitted', '{"bac": 0.000, "status": "SAFE"}', NOW()),
(2, 'INFO', 'System initialized successfully', '{"device_id": "SAFEDRIVE_002"}', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(2, 'INFO', 'Normal operation', '{"bac": 0.018, "status": "SAFE"}', NOW()),
(3, 'INFO', 'System initialized successfully', '{"device_id": "SAFEDRIVE_003"}', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(3, 'INFO', 'Routine sensor reading', '{"bac": 0.000, "status": "SAFE"}', NOW()),
(4, 'CRITICAL', 'High alcohol level - lockout engaged', '{"bac": 0.085, "vehicle_state": "LOCKED"}', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4, 'WARNING', 'Vehicle still in lockout state', '{"bac": 0.070, "remaining_time": "estimated 2 hours"}', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(4, 'ERROR', 'Sensor calibration warning', '{"sensor": "MQ-3", "action": "recalibration_recommended"}', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 'INFO', 'Test device activated', '{"device_id": "SAFEDRIVE_TEST_001", "mode": "testing"}', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

SELECT '✓ Data seeding completed successfully!' AS Status;
SELECT '' AS '';
SELECT 'Summary of inserted data:' AS Info;
SELECT '' AS '';

SELECT 'Users' AS Table_Name, COUNT(*) AS Record_Count FROM users
UNION ALL
SELECT 'Sensor Readings', COUNT(*) FROM sensor_readings
UNION ALL
SELECT 'Vehicle Status', COUNT(*) FROM vehicle_status
UNION ALL
SELECT 'GPS Locations', COUNT(*) FROM gps_locations
UNION ALL
SELECT 'Alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'Emergency Contacts', COUNT(*) FROM emergency_contacts
UNION ALL
SELECT 'Device Config', COUNT(*) FROM device_config
UNION ALL
SELECT 'System Logs', COUNT(*) FROM system_logs;

SELECT '' AS '';
SELECT 'Test Login Credentials:' AS Info;
SELECT 'Email: sandra@safedrive.com | Password: password123' AS User1;
SELECT 'Email: john.doe@example.com | Password: password123' AS User2;
SELECT 'Email: test@safedrive.com | Password: password123' AS User3;
