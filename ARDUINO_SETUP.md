# SafeDrive AI - Arduino MQ-3 Sensor Setup Guide

## 📦 What You Need

### Hardware:
1. **Arduino Uno/Nano/Mega** (any compatible board)
2. **MQ-3 Alcohol Sensor Module**
3. **LEDs:** Green, Yellow, Red (with 220Ω resistors)
4. **Buzzer** (5V active buzzer)
5. **Breadboard and jumper wires**
6. **USB cable** (to connect Arduino to computer)

### Software:
1. **Arduino IDE** (Download from arduino.cc)
2. **Node.js** (Already installed ✅)
3. **Serial Port package** (Already installed ✅)

---

## 🔌 Hardware Connections

### MQ-3 Alcohol Sensor:
```
MQ-3 VCC  → Arduino 5V
MQ-3 GND  → Arduino GND
MQ-3 AOUT → Arduino A0 (Analog Pin)
```

### LED Indicators:
```
Green LED:
  Anode (+) → 220Ω Resistor → Arduino Pin 9
  Cathode (-) → GND

Yellow LED:
  Anode (+) → 220Ω Resistor → Arduino Pin 10
  Cathode (-) → GND

Red LED:
  Anode (+) → 220Ω Resistor → Arduino Pin 11
  Cathode (-) → GND
```

### Buzzer:
```
Buzzer (+) → Arduino Pin 8
Buzzer (-) → GND
```

---

## ⚙️ Arduino Setup (Step by Step)

### Step 1: Upload Arduino Code

1. **Open Arduino IDE**

2. **Open the sketch:**
   - File → Open
   - Navigate to: `C:\Users\Sandra\Desktop\PROJECT\Sandra\`
   - Open: `arduino_sensor_reader.ino`

3. **Select your Arduino board:**
   - Tools → Board → Arduino Uno (or your board model)

4. **Select the COM port:**
   - Tools → Port → Select your Arduino's port (e.g., COM3, COM4)
   - If unsure, disconnect Arduino and reconnect to see which port appears

5. **Upload the code:**
   - Click the Upload button (→ arrow icon)
   - Wait for "Done uploading" message

6. **View Serial Monitor (Optional):**
   - Tools → Serial Monitor
   - Set baud rate to: **9600**
   - You should see JSON data from the sensor

---

## 🚀 Running the System

### Step 1: Find Your Arduino COM Port

**Windows:**
1. Open Device Manager (Win + X → Device Manager)
2. Expand "Ports (COM & LPT)"
3. Look for "Arduino Uno (COM#)" - note the COM number
4. Example: COM3, COM4, etc.

### Step 2: Update COM Port in Code

Open `arduino_reader.js` and update this line:
```javascript
const ARDUINO_PORT = 'COM3';  // Change to your Arduino's port
```

### Step 3: Start the SafeDrive Server

```powershell
# Make sure MySQL is running first
# Then start the server
node server.js
```

You should see:
```
Server is running on http://localhost:3000
✅ Connected to MySQL database
```

### Step 4: Start the Arduino Reader

**Open a NEW terminal** and run:
```powershell
node arduino_reader.js
```

You should see:
```
SafeDrive AI - Arduino Serial Reader
=====================================

📡 Available Serial Ports:
1. COM3 - Arduino

✅ Connected to Arduino on COM3
⏳ Waiting for sensor data...

🔥 WARMING_UP: Sensor warming up (30 seconds)...
⚙️ CALIBRATING: Calibrating sensor...
✅ CALIBRATED
   Baseline reading: 245.3
🚀 READY: System ready - monitoring started

[04:30:15] 🟢 BAC: 0.000% | Status: SAFE
   ✓ Data sent to server successfully
```

---

## 📊 What Happens Now

### Arduino Side:
1. **30-second warm-up** - MQ-3 sensors need to heat up
2. **Auto-calibration** - Takes baseline reading in clean air
3. **Continuous monitoring** - Reads sensor every 2 seconds
4. **LED indicators:**
   - 🟢 Green = SAFE (BAC < 0.05%)
   - 🟡 Yellow = WARNING (BAC 0.05-0.07%)
   - 🔴 Red = DANGER (BAC ≥ 0.08%)
5. **Buzzer alerts** when BAC exceeds limits

### Node.js Side:
1. **Reads serial data** from Arduino
2. **Parses JSON** sensor readings
3. **Sends to server** via POST /api/sensor-data
4. **Updates dashboard** in real-time

### Dashboard Side:
1. **Displays live BAC** from your actual sensor
2. **Updates every 2 seconds**
3. **Shows charts** with real sensor data
4. **Triggers alerts** when BAC exceeds 0.08%

---

## 🧪 Testing Your Sensor

### 1. Clean Air Test (Baseline)
- Sensor should read ~0.000% BAC
- Green LED should be ON
- No buzzer sound

### 2. Alcohol Test
**⚠️ SAFETY WARNING: Do NOT drink and drive! This is for testing only!**

**Safe test methods:**
- Use rubbing alcohol on a cotton ball
- Hold near (not touching) sensor for a few seconds
- BAC reading should increase
- Yellow/Red LED should activate
- Buzzer should sound

### 3. Expected Readings:
- **Fresh air:** 0.000 - 0.020%
- **Alcohol vapor nearby:** 0.050 - 0.150%
- **Direct exposure:** Higher values

---

## 🎛️ Sensor Calibration

The MQ-3 sensor needs calibration for accurate readings.

### Current Formula:
```
BAC = ((Reading - Baseline) / (Max - Baseline)) × 0.15
```

### To Adjust:
Edit `arduino_sensor_reader.ino`:

```cpp
// Line 18-20: Adjust these values
const float SENSOR_BASELINE = 200.0;  // Your baseline in clean air
const float SENSOR_MAX = 800.0;       // Your max reading with alcohol
const float BAC_CALIBRATION = 0.15;   // Maximum BAC to scale to
```

**How to find your values:**
1. Run Arduino with Serial Monitor open
2. Note `raw_reading` value in clean air (Baseline)
3. Hold alcohol near sensor, note maximum `raw_reading` (Max)
4. Update values in code
5. Re-upload to Arduino

---

## 🐛 Troubleshooting

### Issue: "Failed to open serial port"
**Solution:**
- Check Arduino is connected via USB
- Verify COM port number in Device Manager
- Close Arduino IDE Serial Monitor
- Update `ARDUINO_PORT` in `arduino_reader.js`

### Issue: "Port access denied"
**Solution:**
- Close Arduino IDE Serial Monitor
- Only one program can access serial port at a time
- Restart `arduino_reader.js`

### Issue: Sensor always reads 0.000%
**Solution:**
- Wait 30 seconds for warm-up period
- Check MQ-3 connections (VCC, GND, AOUT)
- Verify sensor is receiving 5V power
- Sensor may be faulty - test with multimeter

### Issue: Readings fluctuate wildly
**Solution:**
- Sensor still warming up (wait 2-3 minutes)
- Check for loose connections
- Keep sensor away from fans/drafts
- Normal slight variation is expected

### Issue: Data not appearing on dashboard
**Solution:**
- Check server is running (`node server.js`)
- Verify MySQL is running
- Check USER_ID in `arduino_reader.js` matches your login
- Look for "✓ Data sent to server successfully" message

---

## 📝 View Real-Time Data

### Terminal Output:
```
[04:30:15] 🟢 BAC: 0.000% | Status: SAFE
   ✓ Data sent to server successfully

[04:30:17] 🟡 BAC: 0.062% | Status: WARNING
   ✓ Data sent to server successfully

[04:30:19] 🔴 BAC: 0.095% | Status: DANGER
   ✓ Data sent to server successfully
```

### Dashboard:
1. Open: `http://localhost:3000`
2. Login as Sandra Mayodi
3. Watch live BAC reading update
4. See chart fill with real sensor data
5. Alerts appear when BAC > 0.08%

---

## 🎯 System Architecture

```
┌─────────────┐      USB       ┌──────────────────┐
│   Arduino   │────Serial────▶│ arduino_reader.js │
│   + MQ-3    │    (JSON)      │   (Node.js)       │
│   Sensor    │                └──────────────────┘
└─────────────┘                         │
                                        │ HTTP POST
                                        ▼
                                ┌──────────────────┐
                                │   server.js      │
                                │   (Express)      │
                                └──────────────────┘
                                        │
                                        ▼
                                ┌──────────────────┐
                                │   MySQL DB       │
                                │   (safedrive)    │
                                └──────────────────┘
                                        │
                                        ▼
                                ┌──────────────────┐
                                │   Dashboard      │
                                │   (Web Browser)  │
                                └──────────────────┘
```

---

## 🔄 Complete Startup Sequence

1. **Connect Arduino** via USB
2. **Start MySQL** service
3. **Start server:** `node server.js`
4. **Start Arduino reader:** `node arduino_reader.js`
5. **Open dashboard:** `http://localhost:3000`
6. **Login** as Sandra Mayodi
7. **Watch live sensor data!** 🎉

---

## 📊 Data Flow

```
MQ-3 Sensor
   ↓ (Analog)
Arduino A0 Pin
   ↓ (Read & Convert)
BAC Calculation
   ↓ (JSON via Serial)
arduino_reader.js
   ↓ (HTTP POST)
Server /api/sensor-data
   ↓ (SQL INSERT)
MySQL Database
   ↓ (SQL SELECT)
Dashboard Page
   ↓ (JavaScript)
Real-time Display
```

---

## 🎓 Next Steps

- ✅ Arduino reading sensor values
- ✅ Sending data to server
- ✅ Dashboard displaying real-time data
- 🔜 Add GPS module for location tracking
- 🔜 Add GSM module for SMS alerts
- 🔜 Add relay for vehicle control
- 🔜 Add LCD display for local feedback

---

## 📞 Need Help?

**Check these in order:**
1. Is Arduino connected? (Check Device Manager)
2. Is code uploaded? (Arduino IDE shows "Done uploading")
3. Is serial port correct? (Update ARDUINO_PORT)
4. Is MySQL running? (Check Services)
5. Is server running? (Check terminal for "Server is running")
6. Are LEDs wired correctly? (Check polarity)
7. Is sensor getting 5V? (Measure with multimeter)

---

**You're now ready to read real alcohol sensor values!** 🚀🍷📊
