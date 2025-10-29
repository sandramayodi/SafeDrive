# SafeDrive AI - Hardware Wiring Diagram

## 🔌 Complete Connection Guide

### Components List
```
1. Microcontroller (Arduino Uno/Mega or ESP8266/ESP32)
2. MQ-3 Alcohol Sensor
3. NEO-6M GPS Module
4. SIM800L/SIM900 GSM Module
5. 16x2 LCD Display (or I2C version)
6. 5V Relay Module
7. Active Buzzer (5V)
8. LEDs: Green, Yellow, Red (with 220Ω resistors)
9. Breadboard and jumper wires
10. Power supply (5V for Arduino, 12V for vehicle)
```

---

## Arduino Uno/Mega Wiring

### MQ-3 Alcohol Sensor
```
MQ-3 VCC  → Arduino 5V
MQ-3 GND  → Arduino GND
MQ-3 AOUT → Arduino A0 (Analog Pin)
```

### GPS Module (NEO-6M)
```
GPS VCC → Arduino 5V (or 3.3V depending on module)
GPS GND → Arduino GND
GPS TX  → Arduino Pin 3 (RX - Software Serial)
GPS RX  → Arduino Pin 4 (TX - Software Serial)
```
⚠️ Note: Some GPS modules require 3.3V. Check your module specs!

### GSM Module (SIM800L/SIM900)
```
GSM VCC → External 5V Power Supply (min 2A)
GSM GND → Common Ground (Arduino + Power Supply)
GSM TX  → Arduino Pin 5 (RX - Software Serial)
GSM RX  → Arduino Pin 6 (TX - Software Serial)
```
⚠️ IMPORTANT: GSM modules draw high current (up to 2A during transmission).
   Use external power supply, NOT Arduino 5V pin!

### LCD Display (16x2 without I2C)
```
LCD VSS  → Arduino GND
LCD VDD  → Arduino 5V
LCD V0   → 10kΩ Potentiometer (for contrast)
LCD RS   → Arduino Pin 12
LCD RW   → Arduino GND (write mode)
LCD E    → Arduino Pin 11
LCD D4   → Arduino Pin 5
LCD D5   → Arduino Pin 4
LCD D6   → Arduino Pin 3
LCD D7   → Arduino Pin 2
LCD A    → Arduino 5V (backlight +)
LCD K    → Arduino GND (backlight -)
```

### LCD Display (I2C version - Recommended)
```
LCD VCC → Arduino 5V
LCD GND → Arduino GND
LCD SDA → Arduino A4 (or dedicated SDA pin)
LCD SCL → Arduino A5 (or dedicated SCL pin)
```

### Relay Module (Vehicle Control)
```
Relay VCC → Arduino 5V
Relay GND → Arduino GND
Relay IN  → Arduino Pin 7
Relay COM → Vehicle Ignition Circuit (consult professional!)
Relay NO  → Connected when safe to start
```
⚠️ WARNING: Vehicle ignition modification should be done by professionals!

### Buzzer (Active)
```
Buzzer (+) → Arduino Pin 8
Buzzer (-) → Arduino GND
```

### LED Indicators
```
Green LED:
  Anode (+) → 220Ω Resistor → Arduino Pin 9
  Cathode (-) → Arduino GND

Yellow LED:
  Anode (+) → 220Ω Resistor → Arduino Pin 10
  Cathode (-) → Arduino GND

Red LED:
  Anode (+) → 220Ω Resistor → Arduino Pin 11
  Cathode (-) → Arduino GND
```

---

## ESP8266 (NodeMCU) Wiring

### Pin Mapping
```
NodeMCU Pin | Arduino Equivalent | Function
------------|-------------------|-------------------
A0          | A0                | MQ-3 Sensor
D0          | GPIO16            | (Reserved)
D1          | GPIO5 (SCL)       | LCD I2C SCL
D2          | GPIO4 (SDA)       | LCD I2C SDA
D3          | GPIO0             | GPS RX
D4          | GPIO2             | GPS TX
D5          | GPIO14            | Green LED
D6          | GPIO12            | Yellow LED
D7          | GPIO13            | Red LED
D8          | GPIO15            | Relay Control
RX          | GPIO3             | GSM TX
TX          | GPIO1             | GSM RX
```

### Connections
```
MQ-3 Sensor:
  VCC  → 3.3V
  GND  → GND
  AOUT → A0

GPS Module:
  VCC → 3.3V
  GND → GND
  TX  → D3
  RX  → D4

GSM Module:
  VCC → External 5V/2A
  GND → Common GND
  TX  → RX (GPIO3)
  RX  → TX (GPIO1)

LCD I2C:
  VCC → 5V
  GND → GND
  SDA → D2 (GPIO4)
  SCL → D1 (GPIO5)

Relay:
  VCC → 5V
  GND → GND
  IN  → D8 (GPIO15)

Buzzer:
  (+) → D0 (GPIO16)
  (-) → GND

LEDs (with 220Ω resistors):
  Green  → D5 (GPIO14)
  Yellow → D6 (GPIO12)
  Red    → D7 (GPIO13)
```

---

## Power Supply Recommendations

### Option 1: Arduino Powered by USB (Testing Only)
```
Arduino USB → Computer
Limited to 500mA - NOT suitable for GSM module
Use external power for GSM
```

### Option 2: Arduino + External Power
```
Arduino VIN → 7-12V DC (barrel jack)
GSM → Dedicated 5V/2A power supply
Connect all GNDs together (common ground)
```

### Option 3: Vehicle Installation (Recommended)
```
12V Vehicle Battery
  ↓
12V → 5V DC-DC Buck Converter (3A+)
  ↓
  ├─→ Arduino VIN
  ├─→ GSM Module VCC (through dedicated line)
  └─→ Common GND
```

---

## Connection Checklist

### Before Powering On:
- [ ] All grounds connected together (common ground)
- [ ] GSM module has dedicated power supply (min 2A)
- [ ] GPS module connected to correct voltage (check if 3.3V or 5V)
- [ ] LED resistors in place (220Ω each)
- [ ] Relay module properly connected
- [ ] MQ-3 sensor polarity correct
- [ ] No short circuits visible
- [ ] SIM card inserted in GSM module
- [ ] GPS antenna connected
- [ ] All pin connections match code

### First Power-Up:
- [ ] Green LED lights up (system ready)
- [ ] LCD displays "SafeDrive AI"
- [ ] GPS module LED blinking (searching for satellites)
- [ ] GSM module LED blinking (registering to network)
- [ ] Serial monitor shows initialization messages
- [ ] No smoke, burning smell, or excessive heat

---

## Circuit Diagram (ASCII Art)

```
                    Arduino Uno/Mega
                   ┌───────────────┐
                   │               │
    ┌──────────────│ A0            │
    │              │               │
    │   MQ-3       │ Pin 3  (RX)───┼─────→ GPS TX
    │   Sensor     │ Pin 4  (TX)───┼─────→ GPS RX
    │              │               │
    │              │ Pin 5  (RX)───┼─────→ GSM TX
    │              │ Pin 6  (TX)───┼─────→ GSM RX
    │              │               │
    │              │ Pin 7  ───────┼─────→ Relay IN
    │              │ Pin 8  ───────┼─────→ Buzzer (+)
    │              │               │
    │              │ Pin 9  ───────┼───[220Ω]───→ Green LED
    │              │ Pin 10 ───────┼───[220Ω]───→ Yellow LED
    │              │ Pin 11 ───────┼───[220Ω]───→ Red LED
    │              │               │
    │              │ Pin 12-2 ─────┼─────→ LCD Pins
    │              │               │
    └──────────────│ 5V            │
                   │ GND           │
                   └───────────────┘
                          │
                   Common Ground
                   (All GNDs here)
```

---

## Safety Warnings

### ⚠️ CRITICAL SAFETY NOTES

1. **Vehicle Integration:**
   - NEVER modify vehicle wiring without professional help
   - Improper wiring can cause fire or electrical damage
   - Test thoroughly before in-vehicle installation
   - Use proper automotive-grade connectors
   - Add fuses to all power lines

2. **Power Supply:**
   - GSM modules can draw 2A during transmission
   - Arduino 5V pin can only provide ~500mA
   - Always use external power for GSM
   - Never connect high-current devices to Arduino pins

3. **Electrical:**
   - Always connect common ground
   - Check polarity before connecting power
   - Use proper gauge wires for high current
   - Secure all connections with heat shrink or tape
   - Keep wires away from moving parts

4. **Testing:**
   - Test on breadboard first
   - Never test while driving
   - Use a test vehicle in controlled environment
   - Have emergency shutoff mechanism

5. **Legal:**
   - Check local laws regarding vehicle modifications
   - This device is for educational purposes
   - Professional breathalyzers required for legal evidence
   - Improper installation may void vehicle warranty

---

## Wiring Tips

### Best Practices:
1. **Use color-coded wires:**
   - Red: Power (+5V, +3.3V, +12V)
   - Black: Ground (GND)
   - Yellow: Analog signals
   - Blue/Green: Serial communication
   - White: Digital signals

2. **Secure connections:**
   - Solder permanent connections
   - Use heat shrink tubing
   - Label all wires
   - Strain relief at connectors

3. **Organization:**
   - Bundle wires together
   - Use cable ties
   - Keep power and signal wires separate
   - Document all connections

4. **Testing:**
   - Test each component individually first
   - Use multimeter to check voltages
   - Verify continuity before power on
   - Monitor current draw

---

## Troubleshooting Wiring Issues

### GPS Not Working:
- Check RX/TX not swapped
- Ensure 3.3V/5V correct for your module
- GPS needs clear sky view
- Wait 2-3 minutes for satellite lock

### GSM Not Connecting:
- Check SIM card inserted correctly
- Verify external power supply (2A min)
- Check antenna connected
- Ensure correct voltage (3.7-4.2V for SIM800L)

### LCD Not Displaying:
- Adjust contrast potentiometer
- Check RW pin connected to GND
- Verify all data pins connected
- Check 5V power supply

### Sensor Reading Zero:
- Wait for warm-up (2-3 minutes)
- Check AOUT connected to A0
- Verify 5V power to sensor
- Sensor may need calibration

### LEDs Not Lighting:
- Check LED polarity (long leg = +)
- Verify resistors in place
- Test with multimeter
- Check pin assignments in code

---

## PCB Layout (Future Upgrade)

For permanent installation, consider designing a custom PCB:
- Eliminates loose wires
- More reliable connections
- Professional appearance
- Easier to mount in vehicle

Recommended PCB features:
- Screw terminals for sensors
- Status LEDs
- Reset button
- Power indicator
- Fuse holders
- Voltage regulators onboard

---

## Final Assembly Steps

1. **Breadboard Testing:**
   - Wire everything on breadboard
   - Test each component
   - Upload code and verify functionality

2. **Permanent Assembly:**
   - Transfer to solderable breadboard or PCB
   - Solder all connections
   - Add heat shrink tubing
   - Use proper connectors

3. **Enclosure:**
   - Use plastic project box
   - Drill holes for sensors/wires
   - Mount components securely
   - Label everything

4. **Vehicle Installation:**
   - Find suitable mounting location
   - Route wires properly
   - Connect to vehicle power
   - Test before final assembly

---

## Questions?

Refer to:
- Component datasheets for specifications
- Arduino documentation for pin capabilities
- Vehicle service manual for electrical system
- Professional installer for vehicle integration

**Remember: Safety First! When in doubt, consult a professional!**
