// Arduino Serial Reader for SafeDrive AI
// This Node.js script reads data from Arduino via Serial Port
// and sends it to the SafeDrive server

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');

// Configuration
const ARDUINO_PORT = 'COM11';  // ✅ Your Arduino is connected here!
const ARDUINO_BAUDRATE = 115200;  // ✅ Updated to match Arduino (was 9600)
const SERVER_URL = 'localhost';
const SERVER_PORT = 3000;
const USER_ID = 8;  // Your user ID

console.log('SafeDrive AI - Arduino Serial Reader');
console.log('=====================================\n');

// List available ports
SerialPort.list().then((ports) => {
    console.log('📡 Available Serial Ports:');
    ports.forEach((port, index) => {
        console.log(`${index + 1}. ${port.path} - ${port.manufacturer || 'Unknown'}`);
    });
    console.log('\nUpdate ARDUINO_PORT in this file if needed.\n');
}).catch(err => {
    console.error('Error listing ports:', err.message);
});

// Create serial port connection
const port = new SerialPort({
    path: ARDUINO_PORT,
    baudRate: ARDUINO_BAUDRATE,
    autoOpen: false
});

// Create parser to read line by line
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Open the port
port.open((err) => {
    if (err) {
        console.error('❌ Failed to open serial port:', ARDUINO_PORT);
        console.error('Error:', err.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check if Arduino is connected');
        console.log('2. Verify COM port in Device Manager (Windows)');
        console.log('3. Close Arduino IDE Serial Monitor if open');
        console.log('4. Update ARDUINO_PORT variable in this script');
        process.exit(1);
    }
    
    console.log('✅ Connected to Arduino on', ARDUINO_PORT);
    console.log('⏳ Waiting for sensor data...\n');
});

// Parse and handle incoming data
parser.on('data', (line) => {
    try {
        // Try to parse as JSON first
        const data = JSON.parse(line);
        
        // Handle different message types
        if (data.status) {
            handleStatusMessage(data);
        }
        
        // If it has alcohol_level, send to server
        if (data.alcohol_level !== undefined) {
            handleSensorReading(data);
        }
        
    } catch (e) {
        // Not JSON - parse plain text format
        // Format: "Level: DANGER | Pin 13: LOW | Pin 12: HIGH | LED: RED | Alcohol value: 273 | Limit: 0"
        if (line.includes('Level:') && line.includes('Alcohol value:')) {
            parsePlainTextData(line);
        } else {
            console.log('📝', line);
        }
    }
});

// Parse plain text Arduino output
function parsePlainTextData(line) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Extract values using regex
    const levelMatch = line.match(/Level:\s*(\w+)/);
    const pin13Match = line.match(/Pin 13:\s*(\w+)/);
    const pin12Match = line.match(/Pin 12:\s*(\w+)/);
    const valueMatch = line.match(/Alcohol value:\s*(\d+)/);
    const limitMatch = line.match(/Limit:\s*(\d+)/);
    
    if (levelMatch && valueMatch) {
        const status = levelMatch[1];  // SAFE, WARNING, DANGER
        const rawValue = parseInt(valueMatch[1]);  // 252-274
        const pin13 = pin13Match ? pin13Match[1] : 'UNKNOWN';
        const pin12 = pin12Match ? pin12Match[1] : 'UNKNOWN';
        const limit = limitMatch ? parseInt(limitMatch[1]) : 0;
        
        // Determine vehicle state
        let vehicleState = 'RUNNING';
        if (status === 'DANGER') {
            vehicleState = 'LOCKED';  // Engine blocked
        }
        
        // Status emoji
        const statusEmoji = {
            'SAFE': '🟢',
            'WARNING': '🟡',
            'DANGER': '🔴'
        };
        const emoji = statusEmoji[status] || '⚪';
        
        // Vehicle display
        let vehicleDisplay = vehicleState === 'LOCKED' 
            ? '🔒 VEHICLE LOCKED/OFF - ENGINE BLOCKED'
            : '🚗 VEHICLE RUNNING';
        
        // Console output
        console.log(`[${timestamp}] ${emoji} Raw Value: ${rawValue} | Status: ${status} | ${vehicleDisplay}`);
        console.log(`   Pin 13: ${pin13} | Pin 12: ${pin12}`);
        
        // Convert to BAC percentage for database compatibility
        const bacPercentage = (rawValue / 1023 * 0.15).toFixed(3);
        
        // Create data object to send to server
        const sensorData = {
            alcohol_level: parseFloat(bacPercentage),
            raw_reading: rawValue,
            status: status,
            vehicle_state: vehicleState,
            relay_pin_12: pin12 === 'HIGH' ? 1 : 0,
            relay_pin_13: pin13 === 'HIGH' ? 1 : 0,
            digital_limit: limit,
            device_id: 'ARDUINO_001'
        };
        
        // Send to server
        sendToServer(sensorData);
    }
}

// Handle status messages
function handleStatusMessage(data) {
    const statusEmoji = {
        'INITIALIZING': '🔄',
        'WARMING_UP': '🔥',
        'CALIBRATING': '⚙️',
        'CALIBRATED': '✅',
        'READY': '🚀',
        'RESET': '🔄'
    };
    
    const emoji = statusEmoji[data.status] || 'ℹ️';
    console.log(`${emoji} ${data.status}: ${data.message || ''}`);
    
    if (data.baseline) {
        console.log(`   Baseline reading: ${data.baseline}`);
    }
}

// Handle sensor readings
function handleSensorReading(data) {
    const timestamp = new Date().toLocaleTimeString();
    const statusColor = {
        'SAFE': '🟢',
        'WARNING': '🟡',
        'DANGER': '🔴'
    };
    
    const vehicleEmoji = {
        'IDLE': '🅿️',
        'RUNNING': '🚗',
        'LOCKED': '🔒'
    };
    
    const emoji = statusColor[data.status] || '⚪';
    const carEmoji = vehicleEmoji[data.vehicle_state] || '🚙';
    
    // Show vehicle state prominently
    let vehicleDisplay = `${carEmoji} ${data.vehicle_state}`;
    if (data.vehicle_state === 'LOCKED') {
        vehicleDisplay = `🔒 VEHICLE LOCKED/OFF - ENGINE BLOCKED`;
    } else if (data.vehicle_state === 'RUNNING') {
        vehicleDisplay = `🚗 VEHICLE RUNNING`;
    }
    
    console.log(`[${timestamp}] ${emoji} BAC: ${data.alcohol_level.toFixed(3)}% | Status: ${data.status} | ${vehicleDisplay}`);
    
    if (data.relay_pin_13 !== undefined) {
        console.log(`   Pin 13: ${data.relay_pin_13 ? 'HIGH' : 'LOW'} | Pin 12: ${data.relay_pin_12 ? 'HIGH' : 'LOW'}`);
    }
    
    // Send to server
    sendToServer(data);
}

// Send data to SafeDrive server
function sendToServer(sensorData) {
    // Send sensor reading
    const sensorPostData = JSON.stringify({
        device_id: sensorData.device_id || 'ARDUINO_001',
        user_id: USER_ID,
        alcohol_level: parseFloat(sensorData.alcohol_level.toFixed(3)),
        raw_reading: sensorData.raw_reading || 0
    });
    
    sendRequest('/api/sensor-data', sensorPostData, 'Sensor data');
    
    // Send vehicle status if available
    if (sensorData.vehicle_state) {
        // Determine engine status based on Pin 13
        const engineStatus = (sensorData.relay_pin_13 === 1) ? 'ON' : 'OFF';
        
        const vehiclePostData = JSON.stringify({
            device_id: sensorData.device_id || 'ARDUINO_001',
            user_id: USER_ID,
            vehicle_state: sensorData.vehicle_state,
            engine_status: engineStatus
        });
        
        sendRequest('/api/vehicle-status', vehiclePostData, 'Vehicle status');
    }
}

// Helper function to send HTTP request
function sendRequest(path, postData, dataType) {
    const options = {
        hostname: SERVER_URL,
        port: SERVER_PORT,
        path: path,
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
            if (res.statusCode === 200) {
                console.log(`   ✓ ${dataType} sent successfully`);
            } else {
                console.log(`   ✗ ${dataType} error: ${res.statusCode}`);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log(`   ✗ Failed to send ${dataType.toLowerCase()}:`, error.message);
    });
    
    req.write(postData);
    req.end();
}

// Handle port errors
port.on('error', (err) => {
    console.error('❌ Serial port error:', err.message);
});

// Handle disconnection
port.on('close', () => {
    console.log('\n⚠️  Serial port closed');
    console.log('Arduino disconnected or port closed');
    process.exit(0);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down...');
    port.close(() => {
        console.log('✅ Serial port closed');
        process.exit(0);
    });
});

console.log('\n💡 Commands you can send to Arduino:');
console.log('   STATUS     - Get current reading');
console.log('   CALIBRATE  - Recalibrate sensor');
console.log('   RESET      - Reset Arduino\n');
console.log('Press Ctrl+C to stop\n');
