-- Quick verification query to check if data exists

USE safedrive;

SELECT 'Checking database data...' AS Status;
SELECT '' AS '';

-- Check users
SELECT 'USERS TABLE' AS Check_Name;
SELECT id, fullName, email, phone FROM users LIMIT 5;
SELECT '' AS '';

-- Check sensor readings for user 1
SELECT 'SENSOR READINGS (User 1 - Last 5)' AS Check_Name;
SELECT user_id, alcohol_level, status, timestamp 
FROM sensor_readings 
WHERE user_id = 1 
ORDER BY timestamp DESC 
LIMIT 5;
SELECT '' AS '';

-- Check vehicle status
SELECT 'VEHICLE STATUS' AS Check_Name;
SELECT user_id, vehicle_state, engine_status, last_updated 
FROM vehicle_status 
LIMIT 5;
SELECT '' AS '';

-- Check GPS locations
SELECT 'GPS LOCATIONS (User 1 - Last 3)' AS Check_Name;
SELECT user_id, latitude, longitude, timestamp 
FROM gps_locations 
WHERE user_id = 1 
ORDER BY timestamp DESC 
LIMIT 3;
SELECT '' AS '';

-- Check alerts
SELECT 'ALERTS (User 1)' AS Check_Name;
SELECT user_id, alert_type, alcohol_level, resolved, timestamp 
FROM alerts 
WHERE user_id = 1 
ORDER BY timestamp DESC 
LIMIT 3;
SELECT '' AS '';

-- Check today's stats for user 1
SELECT 'TODAY STATS (User 1)' AS Check_Name;
SELECT 
    COUNT(*) as total_readings,
    AVG(alcohol_level) as avg_level,
    MAX(alcohol_level) as max_level,
    SUM(CASE WHEN status = 'DANGER' THEN 1 ELSE 0 END) as danger_count
FROM sensor_readings 
WHERE user_id = 1 AND DATE(timestamp) = CURDATE();
