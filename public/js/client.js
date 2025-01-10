// Initialize OneSignal
window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "043f83de-a351-4d50-8f2c-377d67fb6657", // Replace with your actual OneSignal app ID
  });

  // Request permission to send push notifications when the user visits the site
  OneSignal.push(function() {
    OneSignal.showSlidedownPrompt(); // Show the prompt to request notification permission
  });

  // Send the initial welcome notification when the page is loaded
  OneSignal.push(function() {
    OneSignal.sendSelfNotification(
      "Welcome to BTC/USDT Real-Time Data!", 
      "Stay updated with the latest Bitcoin prices and volumes.", 
      null, // Optional URL
      null, // Optional image URL
      null, // Optional action
      null, // Optional additional data
      (response) => {
        console.log("Welcome notification sent:", response);
      }
    );
  });
});

// Connect to the server via socket.io
const socket = io();

// Handle real-time BTC price and volume updates
socket.on('btc-price', (price, volume) => {
  console.log(`Price: ${price}, Volume: ${volume}`);

  // Update the price and volume on the web page
  document.getElementById('btc-price').innerText = `BTC Price: $${price}`;
  document.getElementById('btc-volume').innerText = `BTC Volume: ${volume}`;
});

// Handle WebSocket connection
socket.on('connect', () => {
  console.log('Connected to the server');
});

// Handle WebSocket disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});
