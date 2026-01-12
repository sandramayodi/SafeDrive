# Emergency Contacts Management

## Overview
The Emergency Contacts feature allows users to manage a list of contacts who will receive SMS alerts when a DANGER level is detected by the SafeDrive AI system.

## Features

### 1. **Add Emergency Contacts**
- Users can add multiple emergency contacts through the dashboard
- Each contact requires:
  - **Name**: Full name of the contact (e.g., "John Doe")
  - **Phone Number**: Contact's phone number (supports multiple formats)
  - **Relationship**: Type of relationship (Family, Friend, Guardian, Emergency Service, Other)

### 2. **View Emergency Contacts**
- All saved contacts are displayed in a card view
- Shows: Name, phone number, and relationship type
- Real-time updates when contacts are added or removed

### 3. **Delete Emergency Contacts**
- Remove contacts with a single click
- Confirmation dialog prevents accidental deletion
- Immediate update of the contact list

## Phone Number Formats

The system automatically formats phone numbers to the Kenyan standard (+254):

| Input Format | Converted To |
|-------------|-------------|
| 0712345678 | +254712345678 |
| 712345678 | +254712345678 |
| 254712345678 | +254254712345678 |
| +254712345678 | +254712345678 |

## Database Structure

```sql
CREATE TABLE emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(100),
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

## API Endpoints

### GET `/api/emergency-contacts`
Fetch all emergency contacts for the logged-in user.

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": 1,
      "name": "John Doe",
      "phone_number": "+254712345678",
      "relationship": "Family",
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### POST `/api/emergency-contacts`
Add a new emergency contact.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone_number": "0712345678",
  "relationship": "Family",
  "user_id": 8
}
```

**Response:**
```json
{
  "success": true,
  "contactId": 23,
  "message": "Contact added successfully"
}
```

### DELETE `/api/emergency-contacts/:id`
Delete an emergency contact by ID.

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

## SMS Alert Integration

When a DANGER alert is triggered (alcohol reading ≥ 250):

1. **System fetches emergency contacts** from database for the user
2. **Formats alert message** with driver info, reading, location, and timestamp
3. **Sends SMS** to all emergency contacts via TalkSasa API
4. **Logs results** showing delivery status and costs

### Alert Message Format

```
SAFEDRIVE ALERT
Driver: Sandra Mayodi
Alcohol: 350 (DANGER)
Time: 1/15/2025, 10:45 AM
Location: -1.2921,36.8219
Map: https://maps.google.com/?q=-1.2921,36.8219
Vehicle LOCKED - Cannot start
```

## Usage in Dashboard

### Adding a Contact

1. Navigate to the **Emergency Contacts** section on the dashboard
2. Fill in the form:
   - Contact Name (e.g., "Mary Smith")
   - Phone Number (e.g., "0722334455" or "+254722334455")
   - Relationship (select from dropdown)
3. Click **Add Contact**
4. Success message appears and contact is added to the list

### Deleting a Contact

1. Find the contact in the list
2. Click the **trash icon** (🗑️) button
3. Confirm deletion in the dialog
4. Contact is removed immediately

## Security

- All contacts are **user-specific** (linked to `user_id`)
- Foreign key constraint ensures contacts are **deleted when user is deleted**
- Phone numbers are **automatically formatted** to prevent errors
- **Session authentication** required to access API endpoints

## Cost Optimization

- SMS messages use **plain text** (no emojis) to keep cost at **1 KES per message**
- Unicode messages (with emojis) cost **3 KES per message**
- System waits 1 second between messages to **avoid rate limiting**

## Testing

Use the test scripts provided:

```bash
# Check emergency contacts table structure
node check_emergency_table.js

# Setup emergency contacts table (if needed)
node setup_emergency_contacts.js

# Test SMS delivery
node test_sms.js
```

## Troubleshooting

### No contacts displayed
- Check if user has added any contacts
- Verify database connection in server.js
- Check browser console for errors

### SMS not sending
- Verify TalkSasa API credentials in `.env`
- Check if contacts have valid phone numbers
- Review server logs for error messages
- Ensure contacts exist in database for the user

### Phone number format issues
- System auto-formats numbers starting with 0, 254, or +254
- For international numbers, include country code
- Kenyan numbers should be 9 digits after 254

## Future Enhancements

- [ ] Mark contacts as primary/secondary priority
- [ ] Add email alerts in addition to SMS
- [ ] Contact groups for different alert levels
- [ ] SMS delivery status tracking
- [ ] Contact verification via SMS
- [ ] Bulk import of contacts
- [ ] Export contacts to CSV

## Files Modified

- `server.js` - Added 3 API endpoints + database query in notification function
- `dashboard.ejs` - Added UI section + JavaScript functions (loadEmergencyContacts, addContact, deleteContact)
- `sms_notifier.js` - Updated sendDangerAlert() to accept dynamic contact list
- `setup_emergency_contacts.js` - Database setup script
- `check_emergency_table.js` - Table verification script

## Support

For issues or questions:
- Check server logs: `npm start`
- Review browser console for frontend errors
- Verify database connection and table structure
- Test with `node test_sms.js`
