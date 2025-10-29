// Test Data Generator for SafeDrive AI
// This script simulates hardware sending data to the server
// Run this to test the dashboard without physical hardware

const http = require('http');

const SERVER_URL = 'localhost';
const SERVER_PORT = 3000;
const USER_ID = 1;
const DEVICE_ID = 'SAFEDRIVE_TEST_001';

// Simulate sensor readings
function generateSensorData() {
    // Generate random BAC level (mostly safe, occasionally warning/danger)
    const random = Math.random();
    let bacLevel;
    
    if (random < 0.7) {
        // 70% safe readings (0.00 - 0.04)
        bacLevel = Math.random() * 0.04;
    } else if (random < 0.9) {
        // 20% warning readings (0.05 - 0.07)
        bacLevel = 0.05 + (Math.random() * 0.02);
    } else {
        // 10% danger readings (0.08 - 0.15)
        bacLevel = 0.08 + (Math.random() * 0.07);
    }
    
    return {
        device_id: DEVICE_ID,
        user_id: USER_ID,
        alcohol_level: parseFloat(bacLevel.toFixed(3))
    };
}

// Simulate GPS data
function generateGPSData() {
    // Simulate movement around a location (e.g., downtown area)
    const baseLat = 40.7128;
    const baseLng = -74.0060;
    
    return {
        device_id: DEVICE_ID,
        user_id: USER_ID,
        latitude: baseLat + (Math.random() - 0.5) * 0.01,
        longitude: baseLng + (Math.random() - 0.5) * 0.01
    };
}

// Simulate vehicle status
function generateVehicleStatus() {
    const states = ['IDLE', 'RUNNING', 'LOCKED'];
    const statuses = ['ON', 'OFF'];
    
    return {
        device_id: DEVICE_ID,
        user_id: USER_ID,
        vehicle_state: states[Math.floor(Math.random() * states.length)],
        engine_status: statuses[Math.floor(Math.random() * statuses.length)]
    };
}

// Send POST request
function sendData(endpoint, data) {
    const postData = JSON.stringify(data);
    
    const options = {
        hostname: SERVER_URL,
        port: SERVER_PORT,
        path: endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            console.log(`✓ ${endpoint}: ${responseData}`);
        });
    });
    
    req.on('error', (error) => {
        console.error(`✗ ${endpoint}: ${error.message}`);
    });
    
    req.write(postData);
    req.end();
}

// Main simulation loop
function runSimulation() {
    console.log('SafeDrive AI - Test Data Generator');
    console.log('==================================');
    console.log(`Sending data to http://${SERVER_URL}:${SERVER_PORT}`);
    console.log('Press Ctrl+C to stop\n');
    
    // Send sensor data every 2 seconds
    setInterval(() => {
        const sensorData = generateSensorData();
        console.log(`\n[${new Date().toLocaleTimeString()}] Sending sensor data: BAC ${sensorData.alcohol_level}%`);
        sendData('/api/sensor-data', sensorData);
    }, 2000);
    
    // Send GPS data every 5 seconds
    setInterval(() => {
        const gpsData = generateGPSData();
        console.log(`\n[${new Date().toLocaleTimeString()}] Sending GPS data: ${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)}`);
        sendData('/api/gps-data', gpsData);
    }, 5000);
    
    // Send vehicle status every 10 seconds
    setInterval(() => {
        const vehicleData = generateVehicleStatus();
        console.log(`\n[${new Date().toLocaleTimeString()}] Sending vehicle status: ${vehicleData.vehicle_state}, ${vehicleData.engine_status}`);
        sendData('/api/vehicle-status', vehicleData);
    }, 10000);
}

// Start simulation
console.log('Waiting 2 seconds before starting...\n');
setTimeout(runSimulation, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nSimulation stopped.');
    process.exit(0);
});
