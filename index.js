const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A client connected.');

  // Event listener for admin button click
  socket.on('adminButtonClick', (data) => {
    console.log('Admin button clicked:', data);
    io.emit('headerUpdate', data); // Send data to all connected clients
  });

  // Event listener for client disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });
});

// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
