# SafeDrive AI - Intelligent Intoxication Detection System

A comprehensive hardware and web-based solution for monitoring driver intoxication levels and preventing drunk driving through automated vehicle control and real-time monitoring.

## 🚀 Features

### Hardware System
- **Real-time Alcohol Detection** using MQ-3 sensor
- **GPS Tracking** for location monitoring
- **GSM Communication** for emergency alerts
- **LCD Display** for instant feedback
- **Automated Vehicle Control** via relay system
- **Visual & Audio Alerts** (LEDs and buzzer)

### Web Dashboard
- **Real-time Monitoring** - Live BAC readings updated every 5 seconds
- **24-Hour History Chart** - Visual representation of alcohol levels
- **GPS Location Tracking** - View vehicle location on map
- **Alert Management** - Active alerts and incident tracking
- **Vehicle Status** - Engine state, safety lock status
- **System Health** - Monitor all hardware components
- **User Authentication** - Secure login and registration
- **Emergency Contact Management**

## 📊 System Workflow

### 1. INITIALIZATION PHASE
- System startup and sensor calibration
- GPS module initialization
- GSM network registration
- Display system ready message

### 2. MONITORING PHASE (Every 2 seconds)
- Read MQ-3 alcohol sensor value
- Convert analog reading to BAC level
- Update LCD display with current reading
- Log data with timestamp

### 3. DECISION PHASE
- Compare alcohol level with legal threshold (0.08% BAC)
- Check current vehicle state (IDLE/RUNNING)
- Determine required action

### 4. CONTROL PHASE
IF alcohol_level > threshold:
- Prevent vehicle start (if IDLE)
- Initiate gradual stop sequence (if RUNNING)
- Activate emergency alerts

### 5. COMMUNICATION PHASE
- Get current GPS coordinates
- Format emergency SMS message
- Send alerts to emergency contacts
- Update web dashboard via API

### 6. SAFETY PHASE
- Activate visual/audio warnings
- Log incident with full details
- Maintain lockout until alcohol clears

## 🛠️ Hardware Requirements

### Microcontroller
- Arduino Uno/Mega **OR**
- ESP8266 (NodeMCU) **OR**
- ESP32 (for WiFi capability)

### Sensors & Modules
- **MQ-3 Alcohol Sensor** - Analog alcohol detection
- **GPS Module** (NEO-6M or similar) - Location tracking
- **GSM Module** (SIM800L/SIM900) - SMS and data communication
- **LCD Display** (16x2 or 20x4) - Visual feedback
- **Relay Module** (5V) - Vehicle ignition control
- **Buzzer** - Audio alerts
- **LEDs** (Green, Yellow, Red) - Status indicators

### Additional Components
- Breadboard or PCB
- Jumper wires
- Power supply (12V for vehicle, 5V for Arduino)
- SIM card (for GSM module)
- Resistors (220Ω for LEDs)

## 📦 Software Requirements

### Backend (Node.js)
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "ejs": "^3.1.10",
    "mysql": "^2.18.1",
    "bcrypt": "^6.0.0",
    "express-session": "^1.18.2"
  }
}
```

### Frontend
- Chart.js (for data visualization)
- Font Awesome (for icons)
- Responsive CSS

### Database
- MySQL 5.7 or higher

## 🔧 Installation

### 1. Database Setup

```bash
# Create database and tables
mysql -u root -p < database.sql
```

Or manually:
```sql
CREATE DATABASE safedrive;
USE safedrive;
-- Run all CREATE TABLE statements from database.sql
```

### 2. Server Configuration

```bash
# Install Node.js dependencies
npm install

# Update database credentials in server.js
# Line 6-10: Update host, user, password
```

### 3. Hardware Setup

1. **Connect Components:**
   - MQ-3 Sensor → A0
   - Relay → Pin 7
   - Buzzer → Pin 8
   - LEDs → Pins 9, 10, 11
   - GPS → Pins 3, 4 (RX, TX)
   - GSM → Pins 5, 6 (RX, TX)
   - LCD → Pins 12, 11, 5, 4, 3, 2

2. **Upload Code:**
   ```
   Open hardware_code.ino in Arduino IDE
   Update WiFi/Server settings (lines 28-31)
   Select correct board and port
   Upload to microcontroller
   ```

3. **Calibrate Sensor:**
   - Power on system in clean air
   - Wait 2-3 minutes for sensor warm-up
   - System will auto-calibrate

## 🚀 Usage

### Starting the Server

```bash
node server.js
```

Server will run on `http://localhost:3000`

### Accessing the Dashboard

1. Open browser to `http://localhost:3000`
2. Click "Sign Up" to create account
3. Login with credentials
4. View real-time dashboard

### Hardware Operation

1. **System Powers On**
   - LCD shows "SafeDrive AI"
   - Calibration starts automatically
   - Green LED indicates SAFE status

2. **Normal Operation**
   - System reads BAC every 2 seconds
   - LCD displays current level
   - Data sent to server automatically

3. **Alert Triggered**
   - BAC exceeds 0.08%
   - Red LED activates
   - Buzzer sounds alarm
   - Vehicle locked (relay cuts ignition)
   - Emergency SMS sent
   - Alert logged in dashboard

## 📡 API Endpoints

### Hardware → Server

```javascript
// Send sensor reading
POST /api/sensor-data
Body: {
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "alcohol_level": 0.05
}

// Send GPS location
POST /api/gps-data
Body: {
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060
}

// Update vehicle status
POST /api/vehicle-status
Body: {
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "vehicle_state": "RUNNING",
  "engine_status": "ON"
}
```

### Dashboard ← Server

```javascript
// Get latest readings
GET /api/latest-data

// Get sensor history
GET /api/sensor-history?hours=24

// Resolve alert
POST /api/resolve-alert/:id
```

## 🔐 Security Features

- **Password Hashing** - bcrypt encryption
- **Session Management** - Express sessions
- **Protected Routes** - Authentication middleware
- **SQL Injection Prevention** - Parameterized queries
- **Vehicle Lockout** - Physical safety mechanism

## 🎨 Dashboard Features

### Real-time Monitoring
- Live BAC reading (updates every 5 seconds)
- Color-coded status indicators
- Animated live indicator

### Historical Data
- 24-hour chart with Chart.js
- Shows trends and patterns
- Legal limit reference line

### GPS Tracking
- Current vehicle location
- Google Maps integration
- Location history

### Alert Management
- Active alerts list
- One-click resolution
- Alert history tracking

### Statistics
- Total readings today
- Average BAC level
- Peak level recorded
- Danger event count

## 🛡️ Safety Thresholds

| BAC Level | Status | Action |
|-----------|--------|--------|
| 0.00 - 0.04% | SAFE | Normal operation, green LED |
| 0.05 - 0.07% | WARNING | Caution, yellow LED, buzzer beep |
| 0.08% + | DANGER | Vehicle locked, red LED, alarm, SMS alert |

## 📱 Emergency Contacts

Configure in `hardware_code.ino`:
```cpp
const String EMERGENCY_CONTACT_1 = "+1234567890";
const String EMERGENCY_CONTACT_2 = "+0987654321";
```

## 🔄 System States

1. **IDLE** - Vehicle off, monitoring active
2. **RUNNING** - Vehicle on, continuous monitoring
3. **LOCKED** - High BAC detected, ignition disabled

## 📈 Future Enhancements

- [ ] Mobile app (iOS/Android)
- [ ] Breath pattern analysis
- [ ] Machine learning for prediction
- [ ] Multi-user support per vehicle
- [ ] Cloud backup and sync
- [ ] Facial recognition
- [ ] Voice alerts
- [ ] Integration with vehicle OBD-II

## 🐛 Troubleshooting

### Hardware Issues

**Sensor not responding:**
- Check wiring connections
- Ensure 5V power supply
- Wait for warm-up period (2-3 min)

**GPS not acquiring lock:**
- Ensure clear sky view
- Check antenna connection
- Wait 1-2 minutes outdoors

**GSM not connecting:**
- Check SIM card insertion
- Verify network coverage
- Ensure sufficient credit/data

### Software Issues

**Database connection failed:**
- Check MySQL service is running
- Verify credentials in server.js
- Ensure database exists

**Dashboard not updating:**
- Check browser console for errors
- Verify API endpoints are responding
- Check network connectivity

## 📝 License

This project is for educational purposes. Ensure compliance with local laws and regulations regarding vehicle modifications and monitoring devices.

## 👨‍💻 Development

### Project Structure
```
SafeDrive/
├── server.js              # Main server file
├── package.json           # Dependencies
├── database.sql           # Database schema
├── hardware_code.ino      # Arduino/ESP code
├── README.md              # Documentation
├── public/                # Static files
│   ├── index.css
│   ├── log.css
│   └── main.js
└── views/                 # EJS templates
    ├── index.ejs
    ├── login.ejs
    ├── register.ejs
    └── dashboard.ejs
```

## 🙏 Credits

- MQ-3 sensor calibration based on manufacturer specifications
- Chart.js for data visualization
- Express.js framework
- TinyGPS++ library for GPS parsing

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API endpoint responses
3. Check hardware connections
4. Verify sensor calibration

---

**⚠️ DISCLAIMER:** This system is a prototype for educational purposes. Always follow local DUI laws and never rely solely on automated systems for safety decisions. Professional breathalyzers should be used for legal evidence.
