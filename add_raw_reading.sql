-- Add raw_reading column to sensor_readings table
USE safedrive;

ALTER TABLE sensor_readings 
ADD COLUMN raw_reading INT DEFAULT NULL AFTER alcohol_level;

-- Update description
COMMENT ON COLUMN sensor_readings.raw_reading IS 'Raw analog sensor value (0-1023)';
