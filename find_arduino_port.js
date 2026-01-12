/**
 * SafeDrive AI - Arduino Port Finder
 * Automatically detects which COM port your Arduino is connected to
 */

const { SerialPort } = require('serialport');

console.log('\n🔍 SafeDrive AI - Arduino Port Finder');
console.log('=====================================\n');

async function findArduinoPorts() {
  try {
    const ports = await SerialPort.list();
    
    if (ports.length === 0) {
      console.log('❌ No serial ports found!');
      console.log('\n📌 Troubleshooting:');
      console.log('   1. Is your Arduino connected via USB?');
      console.log('   2. Try unplugging and reconnecting the Arduino');
      console.log('   3. Check if the USB cable is working (some cables are power-only)\n');
      return;
    }

    console.log(`📡 Found ${ports.length} Serial Port(s):\n`);
    
    let arduinoFound = false;
    
    ports.forEach((port, index) => {
      const isArduino = 
        (port.manufacturer && port.manufacturer.toLowerCase().includes('arduino')) ||
        (port.vendorId && (port.vendorId === '2341' || port.vendorId === '1A86')) ||
        (port.productId && (port.productId === '0043' || port.productId === '7523'));
      
      if (isArduino) {
        console.log(`✅ ARDUINO FOUND!`);
        arduinoFound = true;
      } else {
        console.log(`${index + 1}.`);
      }
      
      console.log(`   Port: ${port.path}`);
      if (port.manufacturer) console.log(`   Manufacturer: ${port.manufacturer}`);
      if (port.vendorId) console.log(`   Vendor ID: ${port.vendorId}`);
      if (port.productId) console.log(`   Product ID: ${port.productId}`);
      if (port.serialNumber) console.log(`   Serial Number: ${port.serialNumber}`);
      console.log('');
    });

    if (arduinoFound) {
      console.log('✨ Update arduino_reader.js with the port above!\n');
      console.log('   Example:');
      ports.forEach(port => {
        const isArduino = 
          (port.manufacturer && port.manufacturer.toLowerCase().includes('arduino')) ||
          (port.vendorId && (port.vendorId === '2341' || port.vendorId === '1A86'));
        
        if (isArduino) {
          console.log(`   const ARDUINO_PORT = '${port.path}';`);
        }
      });
    } else {
      console.log('⚠️  No Arduino detected, but available ports listed above.');
      console.log('   Your Arduino might be on one of these ports.\n');
      console.log('   Most common Arduino ports:');
      ports.forEach(port => {
        if (port.path.startsWith('COM')) {
          console.log(`   - Try: ${port.path}`);
        }
      });
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error listing ports:', error.message);
  }
}

// Run the port finder
findArduinoPorts();
