const int AOUTpin = 0; 
const int DOUTpin = 8; 

// Control pins
const int PIN_12 = 12;
const int PIN_13 = 13;

// LED indicator pins
const int LED_GREEN = 9;  
const int LED_YELLOW = 10; 
const int LED_RED = 11;    

int limit; 
int value; 

// Alcohol level thresholds - LOWERED FOR TESTING
const int THRESHOLD_DANGER = 250;  
const int THRESHOLD_WARNING = 180;  

void setup() { 
    Serial.begin(115200);
    pinMode(DOUTpin, INPUT); 
    
    // Setup Control pins
    pinMode(PIN_12, OUTPUT);
    pinMode(PIN_13, OUTPUT);
    
    // Setup LED pins
    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_YELLOW, OUTPUT);
    pinMode(LED_RED, OUTPUT);
    
    // Initial state - Green LED ON (SAFE)
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_RED, LOW);
} 

void loop() { 
    value = analogRead(AOUTpin); 
    limit = digitalRead(DOUTpin); 
    
    String status = "";
    String vehicleState = "";
    float bacLevel = 0.0;
    
    // Control logic based on alcohol level
    if (value >= THRESHOLD_DANGER) {
        // DANGER - Above threshold (250+)
        digitalWrite(PIN_13, LOW);   // Pin 13 LOW - Engine BLOCKED
        digitalWrite(PIN_12, HIGH);  // Pin 12 HIGH - Warning active
        
        // RED LED ON - All others OFF
        digitalWrite(LED_GREEN, LOW);
        digitalWrite(LED_YELLOW, LOW);
        digitalWrite(LED_RED, HIGH);
        
        status = "DANGER";
        vehicleState = "LOCKED";  // Car is LOCKED/OFF
        bacLevel = map(value, 0, 1023, 0, 150) / 1000.0;  // Convert to BAC percentage
        
        Serial.print("Level: DANGER | Pin 13: LOW | Pin 12: HIGH | LED: RED | ");
    } 
    else if (value >= THRESHOLD_WARNING) {
        // WARNING - Between 180-249
        digitalWrite(PIN_13, HIGH);  // Pin 13 HIGH - Engine allowed but warned
        digitalWrite(PIN_12, LOW);   // Pin 12 LOW
        
        // YELLOW LED ON - All others OFF
        digitalWrite(LED_GREEN, LOW);
        digitalWrite(LED_YELLOW, HIGH);
        digitalWrite(LED_RED, LOW);
        
        status = "WARNING";
        vehicleState = "RUNNING";  // Car can run but warned
        bacLevel = map(value, 0, 1023, 0, 150) / 1000.0;
        
        Serial.print("Level: WARNING | Pin 13: HIGH | Pin 12: LOW | LED: YELLOW | ");
    }
    else {
        // SAFE - Below 200
        digitalWrite(PIN_13, HIGH);  // Pin 13 HIGH - Normal operation
        digitalWrite(PIN_12, LOW);   // Pin 12 LOW
        
        // GREEN LED ON - All others OFF
        digitalWrite(LED_GREEN, HIGH);
        digitalWrite(LED_YELLOW, LOW);
        digitalWrite(LED_RED, LOW);
        
        status = "SAFE";
        vehicleState = "RUNNING";  // Car is safe to run
        bacLevel = map(value, 0, 1023, 0, 150) / 1000.0;
        
        Serial.print("Level: SAFE | Pin 13: HIGH | Pin 12: LOW | LED: GREEN | ");
    }
    
    // Serial output
    Serial.print("Alcohol value: ");
    Serial.print(value);
    Serial.print(" | Limit: ");
    Serial.println(limit);
    
    // Send JSON data for dashboard
    Serial.print("{\"alcohol_level\":");
    Serial.print(bacLevel, 3);
    Serial.print(",\"status\":\"");
    Serial.print(status);
    Serial.print("\",\"vehicle_state\":\"");
    Serial.print(vehicleState);
    Serial.print("\",\"raw_reading\":");
    Serial.print(value);
    Serial.print(",\"ignition_on\":");
    Serial.print(digitalRead(PIN_13) == HIGH ? "true" : "false");
    Serial.print(",\"relay_pin_12\":");
    Serial.print(digitalRead(PIN_12));
    Serial.print(",\"relay_pin_13\":");
    Serial.print(digitalRead(PIN_13));
    Serial.println("}");
    
    delay(500); 
}