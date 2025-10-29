# SafeDrive AI - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Database (2 minutes)

1. **Make sure MySQL is running:**
   ```powershell
   # Check if MySQL is running
   Get-Service -Name MySQL*
   ```

2. **Create database and tables:**
   ```powershell
   # Navigate to project folder
   cd "C:\Users\Sandra\Desktop\PROJECT\Sandra"
   
   # Run database setup
   mysql -u root -p < database.sql
   ```
   Enter your MySQL password: `Mayodi@01`

3. **Insert sample data for testing:**
   ```powershell
   mysql -u root -p < sample_data.sql
   ```

### Step 2: Start the Server (1 minute)

```powershell
# Make sure you're in the project folder
cd "C:\Users\Sandra\Desktop\PROJECT\Sandra"

# Start the server
node server.js
```

You should see: `Server is running on http://localhost:3000`

### Step 3: Access the Dashboard (1 minute)

1. **Open your web browser** and go to:
   ```
   http://localhost:3000
   ```

2. **Login with test credentials:**
   - Email: `test@safedrive.com`
   - Password: `test123`

3. **View the dashboard** - You should see sample data from the past 24 hours!

### Step 4: Simulate Live Hardware (Optional - 1 minute)

Open a **NEW** PowerShell window:

```powershell
# Navigate to project folder
cd "C:\Users\Sandra\Desktop\PROJECT\Sandra"

# Run the simulator
node test_simulator.js
```

This will simulate your hardware sending live data every 2 seconds!
Watch your dashboard update in real-time! 🎉

---

## 🔧 What Your Web Dashboard Needs

Your SafeDrive AI web dashboard requires these components:

### 1. **Database Tables** ✅ (Created)
- `users` - User accounts and authentication
- `sensor_readings` - MQ-3 alcohol sensor data
- `vehicle_status` - Vehicle state (IDLE/RUNNING/LOCKED)
- `gps_locations` - GPS tracking data
- `alerts` - Emergency alerts and incidents
- `emergency_contacts` - Emergency contact information
- `device_config` - Hardware configuration
- `system_logs` - System event logging

### 2. **API Endpoints** ✅ (Implemented)

**For Hardware to Send Data:**
- `POST /api/sensor-data` - Receive alcohol readings
- `POST /api/gps-data` - Receive GPS coordinates
- `POST /api/vehicle-status` - Receive vehicle state

**For Dashboard to Display Data:**
- `GET /api/latest-data` - Get current readings
- `GET /api/sensor-history` - Get historical data for charts
- `POST /api/resolve-alert/:id` - Mark alerts as resolved

### 3. **Real-time Features** ✅ (Working)
- Live BAC readings (updates every 5 seconds)
- 24-hour history chart with Chart.js
- Active alerts monitoring
- GPS location tracking
- Vehicle status display
- System health indicators

### 4. **Hardware Integration Points** ✅ (Ready)

Your Arduino/ESP32 needs to send data in this format:

**Sensor Data:**
```json
{
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "alcohol_level": 0.045
}
```

**GPS Data:**
```json
{
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Vehicle Status:**
```json
{
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "vehicle_state": "RUNNING",
  "engine_status": "ON"
}
```

---

## 📱 Dashboard Features

### Main Display
- **Real-time BAC Reading** - Large display with color-coded status
- **Status Bar** - Quick overview of all key metrics
- **Live Indicator** - Pulsing dot showing real-time monitoring

### Charts & Analytics
- **24-Hour Chart** - Line graph showing BAC trends
- **Today's Statistics** - Average, peak, and danger counts
- **Legal Limit Line** - Visual reference at 0.08% BAC

### Location Tracking
- **GPS Coordinates** - Current vehicle location
- **Google Maps Integration** - Click to view on map
- **Location History** - Track movement over time

### Alert Management
- **Active Alerts List** - All unresolved incidents
- **Alert Details** - BAC level, location, timestamp
- **One-Click Resolution** - Mark alerts as handled
- **Alert History** - Past incidents logged

### Vehicle Control
- **Current State** - IDLE/RUNNING/LOCKED
- **Engine Status** - ON/OFF
- **Safety Lock** - ENGAGED/DISENGAGED
- **Real-time Updates** - Instant status changes

### System Monitoring
- **Sensor Status** - MQ-3 sensor active/inactive
- **GPS Module** - Connected/disconnected
- **GSM Network** - Online/offline
- **Monitoring Interval** - Update frequency

---

## 🔌 Hardware Connection Guide

### For Arduino Uno/Mega:

```
MQ-3 Sensor → A0
Relay Module → Pin 7
Buzzer → Pin 8
LED Green → Pin 9
LED Yellow → Pin 10
LED Red → Pin 11
GPS RX → Pin 3
GPS TX → Pin 4
GSM RX → Pin 5
GSM TX → Pin 6
LCD RS → Pin 12
LCD E → Pin 11
LCD D4-D7 → Pins 5, 4, 3, 2
```

### For ESP8266/ESP32 (WiFi):

```
MQ-3 Sensor → A0 (ADC)
Relay Module → D7
Buzzer → D8
LED Green → D5
LED Yellow → D6
LED Red → D7
GPS RX → D1
GPS TX → D2
LCD via I2C → SDA, SCL
```

---

## 🧪 Testing Checklist

- [ ] MySQL database created and tables exist
- [ ] Sample data inserted successfully
- [ ] Server starts without errors
- [ ] Can login at http://localhost:3000
- [ ] Dashboard displays sample data
- [ ] Chart shows 24-hour history
- [ ] Test simulator sends data successfully
- [ ] Dashboard updates in real-time
- [ ] Alerts can be resolved
- [ ] GPS coordinates display correctly

---

## 🛠️ Troubleshooting

### "Cannot connect to database"
```powershell
# Check if MySQL is running
net start MySQL80

# Or restart it
net stop MySQL80
net start MySQL80
```

### "Port 3000 already in use"
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### "Module not found"
```powershell
# Reinstall dependencies
npm install
```

### Dashboard not updating
- Check browser console (F12) for errors
- Verify server is running
- Make sure simulator is sending data
- Try hard refresh (Ctrl+F5)

---

## 📊 What Each Phase Does

### **Phase 1: Initialization**
- Calibrates MQ-3 sensor (2-3 min warm-up)
- Connects to GPS satellites
- Registers with GSM network
- Initializes LCD display

### **Phase 2: Monitoring (Every 2 seconds)**
- Reads analog value from MQ-3
- Converts to BAC percentage
- Updates LCD with current reading
- Sends data to web dashboard

### **Phase 3: Decision**
- Compares BAC to 0.08% threshold
- Checks if BAC is in WARNING range (0.05-0.07%)
- Determines vehicle state
- Decides on required action

### **Phase 4: Control**
- **If BAC > 0.08%:**
  - Cuts vehicle ignition (relay OFF)
  - Activates red LED
  - Sounds alarm
  - Locks vehicle state
  
- **If BAC 0.05-0.07%:**
  - Activates yellow LED
  - Warning beep
  - Allows operation with caution

- **If BAC < 0.05%:**
  - Green LED on
  - Normal operation
  - Vehicle can start

### **Phase 5: Communication**
- Gets GPS coordinates
- Formats emergency message
- Sends SMS to contacts
- Posts data to web API
- Updates dashboard

### **Phase 6: Safety**
- Maintains alarm until BAC drops
- Logs all events to database
- Creates alerts in dashboard
- Prevents vehicle start
- Notifies emergency contacts

---

## 🎯 Next Steps

1. ✅ **Database is set up** - All tables created
2. ✅ **Server is ready** - API endpoints working
3. ✅ **Dashboard is functional** - Real-time display ready
4. ⏳ **Hardware setup** - Connect your Arduino/ESP32
5. ⏳ **Sensor calibration** - Upload hardware code and calibrate
6. ⏳ **Testing** - Test with actual alcohol samples
7. ⏳ **Deployment** - Install in vehicle

---

## 📞 Need Help?

1. Check the main README.md for detailed documentation
2. Review the hardware_code.ino for Arduino setup
3. Look at test_simulator.js to understand data format
4. Check server.js for API endpoint details

---

## 🎉 You're All Set!

Your SafeDrive AI web dashboard is now fully functional with:
- ✅ Real-time monitoring
- ✅ Historical data visualization
- ✅ GPS tracking
- ✅ Alert management
- ✅ Vehicle control status
- ✅ System health monitoring

Just connect your hardware and start monitoring! 🚗🛡️
