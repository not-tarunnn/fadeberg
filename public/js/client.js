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
