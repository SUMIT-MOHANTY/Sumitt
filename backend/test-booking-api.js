/**
 * Simple test script to verify the booking API endpoint
 *
 * Usage:
 * 1. Make sure your server is running
 * 2. Run this script with Node.js
 * 3. Check the console output for results
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/bookings';
const TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with a valid user token

// Sample booking data
const newBooking = {
  serviceId: '5f8d0c1dcb56f63c4c7e0c51', // Replace with an actual service ID
  date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  startTime: '10:00',
  endTime: '11:30',
  notes: 'Test booking created via API test script'
};

async function testBookingAPI() {
  console.log('=== Testing Booking API ===');
  console.log('POST /api/bookings - Create a new booking');

  try {
    console.log('Request data:', JSON.stringify(newBooking, null, 2));

    const response = await axios.post(API_URL, newBooking, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('=== SUCCESS ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('=== ERROR ===');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBookingAPI()
    .then(success => {
      console.log('\nTest completed', success ? 'successfully' : 'with errors');
    })
    .catch(error => {
      console.error('Unexpected error during test:', error);
    });
}

module.exports = { testBookingAPI };
