const express = require('express');
const axios = require('axios');
const WebSocket = require('ws');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);  // Create a socket.io server on top of the HTTP server

const port = process.env.PORT || 3000;
const ONE_SIGNAL_APP_ID = '043f83de-a351-4d50-8f2c-377d67fb6657';
const ONE_SIGNAL_API_KEY = 'os_v2_app_aq7yhxvdkfgvbdzmg56wp63gk7tdpdumpawehoucei6mmj2anyzgk7cbcfbd6cofymw4wyv4w6w5qy2rkhwcqm3qonwfw5bab5duvjq';

// Serve static files (index.html)
app.use(express.static('public'));

// Function to send push notification via OneSignal
const sendPushNotification = async (message) => {
  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: message },
        included_segments: ['All']
      },
      {
        headers: {
          'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
  }
};

// Function to fetch hourly volume from Binance REST API
const getHourlyVolume = async () => {
  try {
    const response = await axios.get(
      'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h'
    );

    // Get the last hour's volume from the data
    const lastHourData = response.data[response.data.length - 1];
    const volume = parseFloat(lastHourData[5]);

    console.log(`Hourly Volume: ${volume}`);

    // Define the threshold for volume
    const volumeThreshold = 100;  // Example threshold for volume

    if (volume > volumeThreshold) {
      sendPushNotification(`Hourly BTC Volume crossed the threshold! Current volume: ${volume}`);
    }
  } catch (error) {
    console.error('Error fetching hourly volume:', error.message);
  }
};

// Set an interval to fetch hourly volume every hour (every 60 minutes)
setInterval(getHourlyVolume, 60 * 60 * 1000); // 1 hour in milliseconds

// Start the WebSocket connection to Binance for real-time price and volume data
const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

// Monitor the data from WebSocket for real-time price updates
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const price = parseFloat(data.p);
  const volume = parseFloat(data.q);

  console.log(`Price: ${price}, Volume: ${volume}`);

  // Emit the price and volume to all connected clients
  io.emit('btcData', { price, volume });

  // Set the price threshold to 93,000
  const priceThreshold = 93000;  // Price threshold

  // Send a push notification if the price falls below the threshold
  if (price < priceThreshold) {
    sendPushNotification(`BTC Price has fallen below the threshold! Current price: ${price}`);
  }

  const volumeThresholdRealtime = 100;  // Real-time volume threshold
  if (volume > volumeThresholdRealtime) {
    sendPushNotification(`Real-time Volume crossed the threshold! Current volume: ${volume}`);
  }
};

// Start the Express server with socket.io
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
