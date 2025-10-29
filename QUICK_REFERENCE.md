# 🚗 SafeDrive AI - Quick Reference Card

## 📋 Project Overview
**SafeDrive AI** is an intelligent intoxication detection system that monitors driver alcohol levels in real-time and prevents drunk driving through automated vehicle control.

---

## 🎯 System Phases (6 Phases)

| Phase | What It Does | Frequency |
|-------|--------------|-----------|
| **1. INITIALIZATION** | Calibrate sensors, connect GPS/GSM, show ready | Once at startup |
| **2. MONITORING** | Read MQ-3 sensor, update display, log data | Every 2 seconds |
| **3. DECISION** | Compare BAC to threshold, check vehicle state | Every reading |
| **4. CONTROL** | Lock/unlock vehicle, activate warnings | When needed |
| **5. COMMUNICATION** | Send GPS, SMS, update dashboard | Every reading |
| **6. SAFETY** | Sound alarm, log incident, maintain lockout | During danger |

---

## 🚦 BAC Thresholds

| BAC Level | Status | LED | Action |
|-----------|--------|-----|--------|
| **0.00 - 0.04%** | SAFE | 🟢 Green | Normal operation |
| **0.05 - 0.07%** | WARNING | 🟡 Yellow | Caution alert |
| **0.08% +** | DANGER | 🔴 Red | Vehicle locked, SMS sent |

**Legal Limit:** 0.08% BAC

---

## 🔌 Pin Connections (Arduino)

| Component | Connection | Pin |
|-----------|-----------|-----|
| MQ-3 Sensor | Analog Out | A0 |
| Relay (Vehicle) | Control | 7 |
| Buzzer | Signal | 8 |
| LED Green | Through 220Ω | 9 |
| LED Yellow | Through 220Ω | 10 |
| LED Red | Through 220Ω | 11 |
| GPS Module | RX → TX | 3 |
| GPS Module | TX → RX | 4 |
| GSM Module | RX → TX | 5 |
| GSM Module | TX → RX | 6 |
| LCD Display | Data Lines | 2-5, 11-12 |

---

## 🌐 API Endpoints

### Hardware → Server (POST)
```
/api/sensor-data     - Send BAC readings
/api/gps-data        - Send GPS coordinates
/api/vehicle-status  - Send vehicle state
```

### Dashboard ← Server (GET)
```
/api/latest-data     - Get current readings
/api/sensor-history  - Get 24h chart data
```

### Dashboard Actions (POST)
```
/api/resolve-alert/:id - Mark alert resolved
```

---

## 📊 Dashboard Features

✅ **Real-time BAC Monitoring** - Updates every 5s
✅ **24-Hour History Chart** - Line graph with trends
✅ **GPS Location Tracking** - Google Maps integration
✅ **Active Alerts** - Incident management
✅ **Vehicle Status** - IDLE/RUNNING/LOCKED
✅ **System Health** - All components status
✅ **Statistics** - Today's averages and peaks
✅ **Emergency Contacts** - SMS alert recipients

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `sensor_readings` | BAC history |
| `vehicle_status` | Vehicle state |
| `gps_locations` | GPS history |
| `alerts` | Incidents |
| `emergency_contacts` | SMS contacts |
| `device_config` | Hardware settings |
| `system_logs` | Event logs |

---

## 🚀 Quick Start Commands

### Setup Database
```powershell
mysql -u root -p < database.sql
mysql -u root -p < sample_data.sql
```

### Start Server
```powershell
node server.js
```

### Test with Simulator
```powershell
node test_simulator.js
```

### Access Dashboard
```
http://localhost:3000
Email: test@safedrive.com
Password: test123
```

---

## 🔧 Hardware JSON Format

### Sensor Data
```json
{
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "alcohol_level": 0.045
}
```

### GPS Data
```json
{
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Vehicle Status
```json
{
  "device_id": "SAFEDRIVE_001",
  "user_id": 1,
  "vehicle_state": "RUNNING",
  "engine_status": "ON"
}
```

---

## 📦 Required Components

### Microcontroller
- Arduino Uno/Mega OR ESP8266/ESP32

### Sensors
- MQ-3 Alcohol Sensor
- NEO-6M GPS Module
- SIM800L/SIM900 GSM Module

### Display & Control
- 16x2 LCD Display
- 5V Relay Module
- Active Buzzer
- LEDs (Red, Yellow, Green)

### Power
- 5V/3A Power Supply (for GSM)
- 12V Vehicle Power
- DC-DC Buck Converter

---

## ⚡ Power Requirements

| Component | Voltage | Current |
|-----------|---------|---------|
| Arduino | 5V | 50mA |
| MQ-3 Sensor | 5V | 150mA |
| GPS Module | 3.3-5V | 50mA |
| **GSM Module** | 5V | **2A (peak)** |
| LCD Display | 5V | 20mA |
| Relay | 5V | 70mA |
| LEDs (each) | 5V | 20mA |
| Buzzer | 5V | 30mA |

**Total:** ~2.5A (GSM during transmission is the main consumer)

---

## 🛡️ Safety Features

✅ **Automatic Vehicle Lockout** - Prevents starting when BAC > 0.08%
✅ **Emergency SMS Alerts** - Sends location to contacts
✅ **Visual Warnings** - Color-coded LEDs
✅ **Audio Alerts** - Buzzer alarms
✅ **Real-time Logging** - All events recorded
✅ **GPS Tracking** - Location history maintained
✅ **Web Dashboard** - Remote monitoring

---

## 📱 Emergency SMS Format
```
ALERT! High alcohol level detected in SafeDrive vehicle.
BAC: 0.095%
Location: https://maps.google.com/?q=40.7128,-74.0060
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| GPS no fix | Wait 2-3 min outdoors, check antenna |
| GSM not connecting | Check SIM card, verify 2A power supply |
| Sensor reads zero | Wait for 2-3 min warm-up period |
| LCD blank | Adjust contrast pot, check connections |
| Dashboard not updating | Check API endpoints, restart server |
| No database connection | Verify MySQL running, check credentials |

---

## 📂 Project Files

| File | Purpose |
|------|---------|
| `server.js` | Main Node.js server |
| `database.sql` | Database schema |
| `sample_data.sql` | Test data |
| `hardware_code.ino` | Arduino code |
| `test_simulator.js` | Hardware simulator |
| `views/dashboard.ejs` | Dashboard UI |
| `README.md` | Full documentation |
| `SETUP_GUIDE.md` | Setup instructions |
| `WIRING_GUIDE.md` | Hardware connections |

---

## 📞 Important Notes

⚠️ **Legal:** Check local laws for vehicle modifications
⚠️ **Safety:** Professional installation recommended
⚠️ **Testing:** Always test in controlled environment
⚠️ **Backup:** Never rely solely on this system
⚠️ **Professional:** Use certified breathalyzers for legal evidence

---

## 🎓 Educational Purpose

This project is designed for:
- Learning embedded systems
- Understanding sensor integration
- Practicing web development
- Exploring IoT applications
- Studying safety systems

**NOT for production vehicle use without proper certification!**

---

## 📈 System Flow

```
Sensor Reading → Decision Logic → Vehicle Control → Communication → Dashboard
      ↓              ↓                  ↓                ↓              ↓
   MQ-3 BAC    Compare 0.08%    Relay ON/OFF      GPS + SMS      Real-time UI
```

---

## 🔄 Update Intervals

- **Sensor Reading:** Every 2 seconds
- **Dashboard Update:** Every 5 seconds
- **GPS Location:** Every 5 seconds
- **Chart Refresh:** Every 60 seconds
- **Vehicle Status:** Every 10 seconds

---

## ✨ Key Features Summary

1. ✅ **Real-time Monitoring** - 2-second intervals
2. ✅ **Automated Control** - Vehicle lockout
3. ✅ **GPS Tracking** - Location history
4. ✅ **Emergency Alerts** - SMS notifications
5. ✅ **Web Dashboard** - Remote monitoring
6. ✅ **Data Logging** - Complete history
7. ✅ **Visual Feedback** - LCD + LEDs
8. ✅ **Audio Warnings** - Buzzer alerts

---

## 📊 Success Metrics

Your system is working correctly when:
- ✅ MQ-3 sensor reads BAC accurately
- ✅ GPS acquires satellite lock
- ✅ GSM sends SMS successfully
- ✅ Dashboard updates in real-time
- ✅ Vehicle locks at BAC > 0.08%
- ✅ Alerts are logged correctly
- ✅ Charts display historical data

---

**Print this card for quick reference during development!** 📄
