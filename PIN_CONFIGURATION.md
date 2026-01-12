# 🔧 Updated Arduino Pin Configuration

## ✅ Integration Complete!

I've merged your original code with the SafeDrive AI system. Here's the complete pin layout:

---

## 📌 Pin Assignments

### Sensor Inputs:
| Pin | Component | Function |
|-----|-----------|----------|
| **A0** | MQ-3 AOUT | Analog alcohol sensor reading |
| **8** | MQ-3 DOUT | Digital threshold detection |
| **7** | Ignition | Vehicle ignition detection (ACC wire) |

### Vehicle Control (Your Original):
| Pin | Component | Function | SAFE State | DANGER State |
|-----|-----------|----------|------------|--------------|
| **13** | Relay/Immobilizer | Engine control | HIGH | LOW |
| **12** | Relay/Indicator | Warning system | LOW | HIGH |

### Visual/Audio Indicators:
| Pin | Component | Function |
|-----|-----------|----------|
| **9** | Green LED | Safe indicator (BAC < 0.05%) |
| **10** | Yellow LED | Warning indicator (BAC 0.05-0.07%) |
| **11** | Red LED | Danger indicator (BAC ≥ 0.08%) |
| **6** | Buzzer | Audio alert (moved from pin 8) |

---

## 🎯 Control Logic (From Your Original Code)

### When Alcohol Level is **SAFE** (< 300):
```
Pin 13: HIGH  ← Immobilizer INACTIVE (engine can start)
Pin 12: LOW   ← Normal operation
```

### When Alcohol Level is **DANGER** (≥ 300):
```
Pin 13: LOW   ← Immobilizer ACTIVE (engine blocked)
Pin 12: HIGH  ← Warning system activated
```

---

## 🔌 Complete Wiring Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ARDUINO UNO                             │
│                                                              │
│  A0  ←─── MQ-3 AOUT (Analog alcohol reading)               │
│  D8  ←─── MQ-3 DOUT (Digital threshold)                    │
│  D7  ←─── Ignition Detection (ACC wire via relay)          │
│                                                              │
│  D13 ───→ RELAY 1 (Engine Immobilizer)                     │
│           HIGH = Engine can start                            │
│           LOW = Engine blocked                               │
│                                                              │
│  D12 ───→ RELAY 2 (Warning/Indicator)                      │
│           HIGH = Warning active                              │
│           LOW = Normal operation                             │
│                                                              │
│  D11 ───→ Red LED (+ 220Ω resistor) → GND                  │
│  D10 ───→ Yellow LED (+ 220Ω resistor) → GND               │
│  D9  ───→ Green LED (+ 220Ω resistor) → GND                │
│  D6  ───→ Buzzer (+) → GND                                  │
│                                                              │
│  5V  ───→ MQ-3 VCC                                          │
│  GND ───→ MQ-3 GND, All LED cathodes, Buzzer (-)           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚗 Vehicle Integration

### Pin 13 & 12 Connection (Your Original Control):

**Option 1: Direct Relay Control**
```
Pin 13 → Relay Module 1 → Engine Starter Circuit
Pin 12 → Relay Module 2 → Warning Horn/Light
```

**Option 2: Through Immobilizer Interface**
```
Pin 13 → Vehicle Immobilizer Enable/Disable
Pin 12 → Dashboard Warning Light
```

---

## 📊 System Behavior

### Scenario 1: SAFE - No Alcohol Detected
```
Raw Value: < 300
Pin 13: HIGH    → Engine can start ✅
Pin 12: LOW     → No warning
LED: Green
Status: SAFE
Vehicle: RUNNING (if ignition ON)
```

### Scenario 2: DANGER - Alcohol Detected
```
Raw Value: ≥ 300
Pin 13: LOW     → Engine BLOCKED 🔒
Pin 12: HIGH    → Warning activated ⚠️
LED: Red
Status: DANGER
Vehicle: LOCKED (even if ignition ON)
```

### Scenario 3: Car OFF
```
Ignition: OFF
Vehicle: IDLE
Pins 12 & 13: Based on alcohol level
System: Monitoring only
```

---

## 📡 JSON Output (Serial)

The Arduino now sends complete data:

```json
{
  "timestamp": "123456",
  "alcohol_level": 0.045,
  "status": "SAFE",
  "ignition_on": true,
  "vehicle_state": "RUNNING",
  "raw_reading": 245,
  "digital_limit": 0,
  "relay_pin_12": 0,
  "relay_pin_13": 1,
  "device_id": "ARDUINO_001"
}
```

**When alcohol detected:**
```json
{
  "timestamp": "123789",
  "alcohol_level": 0.095,
  "status": "DANGER",
  "ignition_on": true,
  "vehicle_state": "LOCKED",
  "raw_reading": 345,
  "digital_limit": 1,
  "relay_pin_12": 1,    ← HIGH (warning active)
  "relay_pin_13": 0,    ← LOW (immobilizer active)
  "device_id": "ARDUINO_001"
}
```

---

## 🧪 Testing

### Step 1: Upload Code
```
Arduino IDE → Open arduino_sensor_reader.ino
Select Port: COM11
Click Upload
```

### Step 2: Test Without Alcohol (SAFE)
**Expected:**
- Green LED: ON
- Yellow LED: OFF
- Red LED: OFF
- Pin 13: HIGH (engine can start)
- Pin 12: LOW

### Step 3: Test With Alcohol (DANGER)
**Expected:**
- Green LED: OFF
- Yellow LED: OFF
- Red LED: ON
- Pin 13: LOW (engine blocked)
- Pin 12: HIGH (warning)
- Buzzer: Pulsing

### Step 4: Test Ignition
**Connect Pin 7 to GND:**
- Vehicle state: RUNNING (if safe)
- Vehicle state: LOCKED (if danger)

**Disconnect Pin 7:**
- Vehicle state: IDLE

---

## ⚙️ Threshold Adjustment

In the code, adjust these values for your sensor:

```cpp
const int ANALOG_THRESHOLD = 300;  // Raw analog threshold
```

**To find your sensor's threshold:**
1. Run Arduino Serial Monitor
2. Breathe normally near sensor → note value (baseline)
3. Expose to alcohol → note value (high reading)
4. Set ANALOG_THRESHOLD between baseline and high

**Example:**
- Baseline (clean air): 150-200
- Alcohol present: 400-600
- Set threshold: 300 (middle value)

---

## 🔐 Safety Features

✅ **Engine Immobilizer** - Pin 13 prevents engine start
✅ **Visual Indicators** - LEDs show status at a glance
✅ **Audio Alert** - Buzzer warns of danger
✅ **Ignition Detection** - Knows when car is on/off
✅ **Real-time Monitoring** - Updates every 2 seconds
✅ **Dashboard Integration** - All data visible remotely

---

## 🚀 Ready to Test!

1. **Upload the updated code** to your Arduino
2. **Run:** `node arduino_reader.js`
3. **Watch terminal** for relay states (Pin 12 & 13)
4. **Check dashboard** for vehicle control status

---

**Your original Pin 12/13 control logic is now integrated with the full SafeDrive AI system!** 🎉
