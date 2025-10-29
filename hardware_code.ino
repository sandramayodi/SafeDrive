/*
 * SafeDrive AI - Hardware Code
 * Compatible with: Arduino Uno/Mega, ESP8266, ESP32
 * 
 * Components Required:
 * - MQ-3 Alcohol Sensor (Analog)
 * - GPS Module (NEO-6M or similar)
 * - GSM Module (SIM800L/SIM900)
 * - LCD Display (16x2 or 20x4)
 * - Relay Module (for vehicle control)
 * - Buzzer (for alerts)
 * - LED indicators
 */

#include <LiquidCrystal.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

// Pin Definitions
#define MQ3_PIN A0              // MQ-3 Alcohol Sensor
#define RELAY_PIN 7             // Vehicle Ignition Control
#define BUZZER_PIN 8            // Alert Buzzer
#define LED_GREEN 9             // Safe indicator
#define LED_YELLOW 10           // Warning indicator
#define LED_RED 11              // Danger indicator

// GPS Module (RX, TX)
SoftwareSerial gpsSerial(3, 4);
TinyGPSPlus gps;

// GSM Module (RX, TX)
SoftwareSerial gsmSerial(5, 6);

// LCD Display (RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Configuration
const float BAC_THRESHOLD = 0.08;     // Legal limit
const int MONITORING_INTERVAL = 2000; // 2 seconds
const int USER_ID = 1;                // Your user ID from database
const String DEVICE_ID = "SAFEDRIVE_001";

// WiFi/Server Config (for ESP8266/ESP32)
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* SERVER_URL = "http://your-server-ip:3000";

// Emergency Contacts
const String EMERGENCY_CONTACT_1 = "+1234567890";
const String EMERGENCY_CONTACT_2 = "+0987654321";

// State Variables
enum VehicleState { IDLE, RUNNING, LOCKED };
VehicleState currentState = IDLE;
bool engineOn = false;
float currentBAC = 0.0;
float latitude = 0.0;
float longitude = 0.0;
unsigned long lastReading = 0;

void setup() {
  // Initialize Serial
  Serial.begin(9600);
  Serial.println("SafeDrive AI - Initializing...");
  
  // Initialize LCD
  lcd.begin(16, 2);
  lcd.clear();
  lcd.print("SafeDrive AI");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  
  // Initialize Pins
  pinMode(MQ3_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  
  // Initial State
  digitalWrite(RELAY_PIN, LOW);  // Vehicle locked
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED, LOW);
  
  // Initialize GPS
  gpsSerial.begin(9600);
  Serial.println("GPS Module initialized");
  
  // Initialize GSM
  gsmSerial.begin(9600);
  initGSM();
  
  // Calibration Phase
  lcd.clear();
  lcd.print("Calibrating...");
  calibrateSensor();
  
  // WiFi Connection (for ESP8266/ESP32)
  // connectWiFi();
  
  lcd.clear();
  lcd.print("System Ready!");
  delay(2000);
}

void loop() {
  unsigned long currentTime = millis();
  
  // MONITORING PHASE - Every 2 seconds
  if (currentTime - lastReading >= MONITORING_INTERVAL) {
    lastReading = currentTime;
    
    // Read alcohol sensor
    currentBAC = readAlcoholLevel();
    
    // Update LCD display
    updateDisplay();
    
    // Read GPS
    updateGPS();
    
    // DECISION PHASE
    String status = determineStatus(currentBAC);
    
    // CONTROL PHASE
    controlVehicle(currentBAC);
    
    // COMMUNICATION PHASE
    sendDataToServer(currentBAC, status);
    
    // Log to Serial
    Serial.print("BAC: ");
    Serial.print(currentBAC, 3);
    Serial.print("% | Status: ");
    Serial.print(status);
    Serial.print(" | Vehicle: ");
    Serial.println(getStateString());
  }
  
  // Check for GPS data
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  
  delay(100);
}

// ==================== SENSOR FUNCTIONS ====================

void calibrateSensor() {
  Serial.println("Calibrating MQ-3 sensor...");
  lcd.setCursor(0, 1);
  lcd.print("Please wait... ");
  
  // Warm-up period (typically 2-3 minutes for MQ-3)
  for (int i = 0; i < 10; i++) {
    analogRead(MQ3_PIN);
    delay(300);
  }
  
  Serial.println("Calibration complete!");
}

float readAlcoholLevel() {
  // Read analog value from MQ-3 sensor
  int sensorValue = analogRead(MQ3_PIN);
  
  // Convert to voltage (0-5V for Arduino, 0-3.3V for ESP)
  float voltage = sensorValue * (5.0 / 1023.0);
  
  // Convert voltage to BAC (calibration required)
  // This is a simplified conversion - adjust based on your sensor calibration
  float bac = 0.0;
  
  if (voltage > 2.0) {
    // Approximate conversion formula (needs calibration)
    bac = (voltage - 2.0) * 0.1; // Adjust multiplier based on calibration
  }
  
  // Clamp values
  if (bac < 0) bac = 0;
  if (bac > 0.5) bac = 0.5;
  
  return bac;
}

// ==================== DECISION FUNCTIONS ====================

String determineStatus(float bac) {
  if (bac >= BAC_THRESHOLD) {
    return "DANGER";
  } else if (bac >= 0.05) {
    return "WARNING";
  } else {
    return "SAFE";
  }
}

void controlVehicle(float bac) {
  if (bac >= BAC_THRESHOLD) {
    // SAFETY PHASE - Lock vehicle
    currentState = LOCKED;
    digitalWrite(RELAY_PIN, LOW);  // Cut ignition
    engineOn = false;
    
    // Activate warnings
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_YELLOW, LOW);
    
    // Sound alarm
    soundAlarm();
    
    // Send emergency alert
    if (gps.location.isValid()) {
      sendEmergencySMS();
    }
    
  } else if (bac >= 0.05) {
    // WARNING state
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_GREEN, LOW);
    
    if (currentState == RUNNING) {
      // Keep current state but warn
      tone(BUZZER_PIN, 1000, 200);
    }
    
  } else {
    // SAFE state
    currentState = IDLE;
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_RED, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    
    // Allow vehicle start
    if (engineOn) {
      digitalWrite(RELAY_PIN, HIGH);
    }
  }
}

// ==================== DISPLAY FUNCTIONS ====================

void updateDisplay() {
  lcd.clear();
  
  // Line 1: BAC Level
  lcd.setCursor(0, 0);
  lcd.print("BAC: ");
  lcd.print(currentBAC, 3);
  lcd.print("%");
  
  // Line 2: Status
  lcd.setCursor(0, 1);
  String status = determineStatus(currentBAC);
  lcd.print(status);
  lcd.print(" | ");
  lcd.print(getStateString());
}

String getStateString() {
  switch(currentState) {
    case IDLE: return "IDLE";
    case RUNNING: return "RUN";
    case LOCKED: return "LOCK";
    default: return "UNK";
  }
}

// ==================== GPS FUNCTIONS ====================

void updateGPS() {
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
    
    Serial.print("GPS: ");
    Serial.print(latitude, 6);
    Serial.print(", ");
    Serial.println(longitude, 6);
  }
}

// ==================== COMMUNICATION FUNCTIONS ====================

void sendDataToServer(float bac, String status) {
  // For ESP8266/ESP32 with WiFi
  /*
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/sensor-data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{";
  payload += "\"device_id\":\"" + DEVICE_ID + "\",";
  payload += "\"user_id\":" + String(USER_ID) + ",";
  payload += "\"alcohol_level\":" + String(bac, 3);
  payload += "}";
  
  int httpCode = http.POST(payload);
  http.end();
  */
  
  // For Arduino with GSM
  sendDataViaGSM(bac, status);
}

void sendDataViaGSM(float bac, String status) {
  // Send HTTP POST via GSM (simplified)
  gsmSerial.println("AT+HTTPINIT");
  delay(1000);
  
  String url = String(SERVER_URL) + "/api/sensor-data";
  gsmSerial.println("AT+HTTPPARA=\"URL\",\"" + url + "\"");
  delay(1000);
  
  String data = "{\"device_id\":\"" + DEVICE_ID + "\",\"user_id\":" + 
                String(USER_ID) + ",\"alcohol_level\":" + String(bac, 3) + "}";
  
  gsmSerial.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(1000);
  
  gsmSerial.println("AT+HTTPDATA=" + String(data.length()) + ",10000");
  delay(1000);
  gsmSerial.println(data);
  delay(1000);
  
  gsmSerial.println("AT+HTTPACTION=1");
  delay(3000);
  
  gsmSerial.println("AT+HTTPTERM");
  delay(1000);
  
  // Send GPS data if available
  if (gps.location.isValid()) {
    sendGPSData();
  }
}

void sendGPSData() {
  String url = String(SERVER_URL) + "/api/gps-data";
  gsmSerial.println("AT+HTTPINIT");
  delay(1000);
  
  gsmSerial.println("AT+HTTPPARA=\"URL\",\"" + url + "\"");
  delay(1000);
  
  String data = "{\"device_id\":\"" + DEVICE_ID + "\",\"user_id\":" + 
                String(USER_ID) + ",\"latitude\":" + String(latitude, 6) + 
                ",\"longitude\":" + String(longitude, 6) + "}";
  
  gsmSerial.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(1000);
  
  gsmSerial.println("AT+HTTPDATA=" + String(data.length()) + ",10000");
  delay(1000);
  gsmSerial.println(data);
  delay(1000);
  
  gsmSerial.println("AT+HTTPACTION=1");
  delay(3000);
  
  gsmSerial.println("AT+HTTPTERM");
}

// ==================== ALERT FUNCTIONS ====================

void soundAlarm() {
  // Pulsing alarm pattern
  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, 2000, 300);
    delay(400);
  }
}

void sendEmergencySMS() {
  String message = "ALERT! High alcohol level detected in SafeDrive vehicle.\n";
  message += "BAC: " + String(currentBAC, 3) + "%\n";
  message += "Location: https://maps.google.com/?q=" + 
             String(latitude, 6) + "," + String(longitude, 6);
  
  sendSMS(EMERGENCY_CONTACT_1, message);
  delay(5000);
  sendSMS(EMERGENCY_CONTACT_2, message);
}

void sendSMS(String phoneNumber, String message) {
  gsmSerial.println("AT+CMGF=1"); // Text mode
  delay(1000);
  
  gsmSerial.println("AT+CMGS=\"" + phoneNumber + "\"");
  delay(1000);
  
  gsmSerial.print(message);
  delay(1000);
  
  gsmSerial.write(26); // Ctrl+Z to send
  delay(3000);
  
  Serial.println("SMS sent to " + phoneNumber);
}

// ==================== GSM INITIALIZATION ====================

void initGSM() {
  Serial.println("Initializing GSM...");
  lcd.setCursor(0, 1);
  lcd.print("GSM Init...    ");
  
  gsmSerial.println("AT");
  delay(1000);
  
  gsmSerial.println("AT+CPIN?");
  delay(1000);
  
  gsmSerial.println("AT+CREG?");
  delay(1000);
  
  gsmSerial.println("AT+CGATT=1");
  delay(1000);
  
  gsmSerial.println("AT+CIPSHUT");
  delay(1000);
  
  gsmSerial.println("AT+CIPMUX=0");
  delay(1000);
  
  Serial.println("GSM initialized!");
}

// ==================== WIFI FUNCTIONS (ESP8266/ESP32) ====================

/*
#include <ESP8266WiFi.h>  // For ESP8266
// #include <WiFi.h>      // For ESP32
#include <ESP8266HTTPClient.h>

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  lcd.setCursor(0, 1);
  lcd.print("WiFi Connect...");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  lcd.setCursor(0, 1);
  lcd.print("WiFi OK        ");
  delay(1000);
}
*/
