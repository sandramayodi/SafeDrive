// SMS Notification Module using TalkSasa API
// Sends SMS alerts when danger alerts are triggered

const axios = require('axios');
require('dotenv').config();  // Load environment variables from .env file

// TalkSasa API Configuration
const SMS_CONFIG = {
    API_KEY: process.env.TALKSASA_API_KEY || 'your_api_key_here',
    SENDER_ID: process.env.TALKSASA_SENDER_ID || 'SAFEDRIVE',
    API_URL: 'https://bulksms.talksasa.com/api/v3/sms/send',  // Correct TalkSasa endpoint
    
    // Emergency contact numbers (format: +254XXXXXXXXX for Kenya)
    EMERGENCY_CONTACTS: [
        '+254726313305',  // Replace with actual emergency contacts
        '+254704778344'
    ]
};

/**
 * Format phone number to international format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
        cleaned = '+254' + cleaned.substring(1);
    }
    
    // If starts with 254, add +
    if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }
    
    // If doesn't start with +, assume Kenya and add +254
    if (!cleaned.startsWith('+')) {
        cleaned = '+254' + cleaned;
    }
    
    return cleaned;
}

/**
 * Send SMS using TalkSasa API
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message content
 * @param {string} sender - Optional custom sender ID
 * @returns {Promise<Object>} API response
 */
async function sendSMS(phone, message, sender = null) {
    try {
        // Check if API is configured
        if (!SMS_CONFIG.API_KEY || SMS_CONFIG.API_KEY === 'your_api_key_here') {
            console.error('❌ SMS service not configured. Please set TALKSASA_API_KEY');
            return {
                success: false,
                error: 'SMS service not configured'
            };
        }
        
        // Format phone number
        const formattedPhone = formatPhoneNumber(phone);
        
        // Prepare payload for TalkSasa API
        const payload = {
            recipient: formattedPhone,
            sender_id: sender || SMS_CONFIG.SENDER_ID,
            type: 'plain',
            message: message
        };
        
        console.log(`📤 Sending SMS to ${formattedPhone}...`);
        
        // Send request to TalkSasa API with Bearer token
        const response = await axios.post(SMS_CONFIG.API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SMS_CONFIG.API_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        // Check response - TalkSasa returns status: 'success' in response.data
        if (response.status === 200 && response.data.status === 'success') {
            console.log(`✅ SMS sent successfully to ${formattedPhone}`);
            if (response.data.data) {
                console.log(`   Message Details:`, response.data.data);
            }
            
            return {
                success: true,
                message_id: response.data.data?.uid || response.data.data?.id,
                cost: response.data.data?.cost || 'N/A',
                phone: formattedPhone,
                data: response.data.data
            };
        } else {
            console.error(`❌ SMS failed: ${response.data.message || 'Unknown error'}`);
            return {
                success: false,
                error: response.data.message || 'Unknown error'
            };
        }
        
    } catch (error) {
        console.error('❌ Error sending SMS:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Send danger alert SMS to emergency contacts
 * @param {Object} userData - User information
 * @param {Object} sensorData - Sensor reading data
 * @param {Array} emergencyContacts - Optional array of phone numbers, defaults to config
 * @returns {Promise<Array>} Results for all recipients
 */
async function sendDangerAlert(userData, sensorData, emergencyContacts = null) {
    const { fullName, phoneNumber, email } = userData;
    const { raw_reading, alcohol_level, timestamp, latitude, longitude } = sensorData;
    
    // Use provided contacts or fall back to config
    const contactsToNotify = emergencyContacts || SMS_CONFIG.EMERGENCY_CONTACTS;
    
    // Format timestamp
    const timeStr = new Date(timestamp).toLocaleString('en-KE', { 
        timeZone: 'Africa/Nairobi',
        dateStyle: 'short',
        timeStyle: 'short'
    });
    
    // Create alert message (no emojis to reduce cost from 3 KES to 1 KES)
    const message = `SAFEDRIVE ALERT
Driver: ${fullName}
Alcohol: ${raw_reading} (DANGER)
Time: ${timeStr}
Location: ${latitude ? `${latitude.toFixed(4)},${longitude.toFixed(4)}` : 'N/A'}
${latitude ? `Map: https://maps.google.com/?q=${latitude},${longitude}` : ''}
Vehicle LOCKED - Cannot start`;
    
    const results = [];
    
    // Send to all emergency contacts
    for (const contact of contactsToNotify) {
        console.log(`📱 Sending alert to ${contact}...`);
        
        const result = await sendSMS(contact, message);
        results.push({ 
            contact, 
            ...result 
        });
        
        // Wait 1 second between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

/**
 * Send warning alert SMS (optional - for WARNING level)
 * @param {Object} userData - User information
 * @param {Object} sensorData - Sensor reading data
 * @returns {Promise<Array>} Results for all recipients
 */
async function sendWarningAlert(userData, sensorData) {
    const { fullName } = userData;
    const { raw_reading, timestamp } = sensorData;
    
    const timeStr = new Date(timestamp).toLocaleString('en-KE', { 
        timeZone: 'Africa/Nairobi',
        dateStyle: 'short',
        timeStyle: 'short'
    });
    
    const message = `SAFEDRIVE WARNING
Driver: ${fullName}
Alcohol: ${raw_reading} (WARNING)
Time: ${timeStr}
Elevated alcohol level detected.
Please monitor driver.`;
    
    const results = [];
    
    for (const contact of SMS_CONFIG.EMERGENCY_CONTACTS) {
        const result = await sendSMS(contact, message);
        results.push({ contact, ...result });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

/**
 * Test SMS configuration
 * @returns {Promise<Object>} Test result
 */
async function testSMSConfig() {
    const testMessage = `SafeDrive SMS Test
This is a test message from SafeDrive AI.
Time: ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
If you receive this, SMS alerts are working!`;
    
    console.log('🧪 Testing SMS configuration...\n');
    
    if (SMS_CONFIG.EMERGENCY_CONTACTS.length === 0) {
        console.error('❌ No emergency contacts configured');
        return { success: false, error: 'No emergency contacts' };
    }
    
    const testPhone = SMS_CONFIG.EMERGENCY_CONTACTS[0];
    const result = await sendSMS(testPhone, testMessage);
    
    return result;
}

// Export functions
module.exports = {
    sendSMS,
    sendDangerAlert,
    sendWarningAlert,
    formatPhoneNumber,
    testSMSConfig,
    SMS_CONFIG
};
