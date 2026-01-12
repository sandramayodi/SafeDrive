// Simple Arduino Connection Test
const { SerialPort } = require('serialport');

console.log('Testing Arduino Connection...\n');

// List all available ports first
SerialPort.list().then((ports) => {
    console.log('Available Serial Ports:');
    ports.forEach((port) => {
        console.log(`  ${port.path} - ${port.manufacturer || 'Unknown'}`);
        if (port.vendorId) {
            console.log(`    Vendor ID: ${port.vendorId}, Product ID: ${port.productId}`);
        }
    });
    console.log('');
    
    // Try to open COM11
    console.log('Attempting to connect to COM11...\n');
    
    const port = new SerialPort({
        path: 'COM11',
        baudRate: 115200,
        autoOpen: false
    });
    
    port.open((err) => {
        if (err) {
            console.error('❌ FAILED to open COM11');
            console.error('Error:', err.message);
            console.log('\n🔧 Troubleshooting Steps:');
            console.log('1. Unplug Arduino USB cable');
            console.log('2. Wait 5 seconds');
            console.log('3. Plug it back in');
            console.log('4. Close Arduino IDE completely (if open)');
            console.log('5. Run this test again');
            console.log('6. If still fails, try restarting your computer');
            process.exit(1);
        }
        
        console.log('✅ SUCCESS! Arduino connected on COM11');
        console.log('Connection is working properly.');
        
        port.close(() => {
            console.log('Port closed successfully.');
            process.exit(0);
        });
    });
    
}).catch(err => {
    console.error('Error listing ports:', err.message);
    process.exit(1);
});
