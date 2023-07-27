const { app } = require('electron');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

// Set the log level (optional)
log.transports.file.level = 'info';

// Set the custom log file name and path to a common folder
const logFileName = 'app.log';
const logFolderPath = path.join(app.getPath('userData'), 'logs');

// Create the folder if it doesn't exist
if (!fs.existsSync(logFolderPath)) {
    fs.mkdirSync(logFolderPath, { recursive: true });
}

// Set the custom resolvePath function
log.transports.file.resolvePath = (variables) => {
    return path.join(logFolderPath, logFileName);
};

// Handle any uncaught exceptions and log them
process.on('uncaughtException', (error) => {
    log.error(`Uncaught Exception: ${error.message}`);
});

// Replace console.log with log.log to log Electron's console messages to the file
console.log = log.log;

module.exports = log;