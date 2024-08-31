// const express = require('express');
// const app = express();
// const http = require('http').createServer(app);
// const path = require('path');

// // Middleware to parse JSON request bodies
// app.use(express.json());

// let latestData = {}; // Store the latest data from the admin button click

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'client.html'));
// });

// app.get('/admin', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'admin.html'));
// });

// app.get('/admin1', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'admin1.html'));
// });

// // Endpoint to handle admin button click
// app.post('/admin/update', (req, res) => {
//   latestData = req.body; // Update the latest data
//   console.log('Admin button clicked:', latestData);
//   res.status(200).send('Update received'); // Respond with a success status
// });

// // Endpoint for the client to fetch the latest data
// app.get('/get-data', (req, res) => {
//   res.json(latestData); // Send the latest data as JSON
// });

// // Start the server
// http.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const fs = require('fs');

// Middleware to parse JSON request bodies
app.use(express.json());

let latestData = {}; // Store the latest data from the admin button click

app.use(express.static(path.join(__dirname, 'public')));

// Serve client and admin pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Endpoint to list text files in the lyrics folder
app.get('/lyrics-files', (req, res) => {
  const lyricsDir = path.join(__dirname, 'lyrics');
  fs.readdir(lyricsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to list files' });
    }
    // Filter out only .txt files
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    res.json(txtFiles);
  });
});

// Endpoint to read a selected file's content (in UTF-16)
app.get('/lyrics-content', (req, res) => {
  const { filename } = req.query;
  const filePath = path.join(__dirname, 'lyrics', filename);

  // Ensure the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Read the file content in UTF-16, handling BOM if necessary
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read file' });
    }

    // Strip the BOM if it exists
    if (data.charCodeAt(0) === 0xFEFF) {
      data = data.slice(1);
    }
    // console.log(data);
    res.json({ content: data });
  });
});

// Endpoint to handle admin button click
app.post('/admin/update', (req, res) => {
  latestData = req.body; // Update the latest data
  console.log('Admin button clicked:', latestData);
  res.status(200).send('Update received'); // Respond with a success status
});

// Endpoint for the client to fetch the latest data
app.get('/get-data', (req, res) => {
  res.json(latestData); // Send the latest data as JSON
});

// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
