
require('./server');
require('./routes.js');


const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

const appServer = express();
const PORT = 3000;

// Serve static files from the build directory
appServer.use(express.static(path.join(__dirname, 'build')));

// For any GET request, send back the index.html file
// This allows client-side routing to take over
appServer.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

appServer.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
