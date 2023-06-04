// Description: Main process of the Electron app.
// It is responsible for creating the browser window and for communicating with the renderer process.

const electron = require('electron');
const path = require('path');
const fs = require('fs');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Module to communicate with the renderer process
const ipcMain = electron.ipcMain;
// Module to define custom protocol
const protocol = electron.protocol;
// Module to display native system dialogs for opening and saving files, alerting, etc.
const dialog = electron.dialog;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // use a preload script
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:3000');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});


// Register a custom protocol to allow loading local resources
app.whenReady().then(() => {
    protocol.registerFileProtocol('app', (request, callback) => {
        const filePath = request.url.replace('app:///', '');
        const resolvedPath = path.normalize(filePath);
        callback(resolvedPath);
    });
});


ipcMain.on('getSplittedPath', (event, { basePath, level }) => {
    const pathArray = basePath.split(path.sep); // Split the path by the platform-specific separator

    // Check if the level is within the valid range
    if (level < 0 || level > pathArray.length - 1) {
        // Return the original path if the level is invalid
        event.reply('splittedPath', { success: false, error: 'Invalid level', splittedPath: path });
    }

    const slicedPathArray = pathArray.slice(0, pathArray.length - level); // Get the sliced array based on the level
    const splittedPath = slicedPathArray.join(path.sep); // Join the sliced array back into a path string
    // Return the splitted path
    event.reply('splittedPath', { success: true, error: null, splittedPath: splittedPath });
});

ipcMain.on('getLevel', (event, { baseLink, link }) => {
    const baseSeparatorCount = (baseLink.split(path.sep).length - 1) || 0;
    const linkSeparatorCount = (link.split(path.sep).length - 1) || 0;

    const level = linkSeparatorCount - baseSeparatorCount;

    event.reply('level', { success: true, error: null, level: level });
});


// Listen for async message from renderer process
ipcMain.on('getFolderContents', (event, { folderPath, coverFolder, level }) => {
    fs.readdir(folderPath, (err, contents) => {
        if (err) {
            event.reply('folderContents', { success: false, error: err.message, folderContents: [{}] });
        } else {
            const folderContents = getFolderContentsWithCovers(folderPath, contents, coverFolder, level);
            event.reply('folderContents', { success: true, error: null, folderContents: folderContents });
        }
    });
});

function getFolderContentsWithCovers(folderPath, contents, coverFolder, level) {
    const folderContents = [];

    for (const folder of contents) {
        const fullPath = path.join(folderPath, folder);
        const isDirectory = fs.statSync(fullPath).isDirectory();

        // If the entry is a directory, process it
        if (isDirectory && folder !== coverFolder) {
            const coverImagePath = getCoverImagePath(fullPath, coverFolder, level);
            folderContents.push({ cover: coverImagePath, path: fullPath });
        }
    }

    return folderContents;
}

function getCoverImagePath(folderPath, coverFolder, level) {
    const pathArray = folderPath.split(path.sep);
    const slicedPathArray = pathArray.slice(0, pathArray.length - level);

    const coverFolderPath = path.join(...slicedPathArray, coverFolder);
    const folderName = path.basename(folderPath);
    const coverImagePath = path.join(coverFolderPath, folderName);

    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    for (const extension of supportedExtensions) {
        const imagePath = `${coverImagePath}${extension}`;

        if (fs.existsSync(imagePath)) {
            return imagePath;
        }
    }

    return getDefaultCoverImage();
}

function getDefaultCoverImage() {
    return path.join(__dirname, '..', '..', 'public', 'images', 'default_cover.jpeg');
}

ipcMain.on("openFolderDialog", async (event) => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (!result.canceled) {
            const selectedPath = result.filePaths[0];
            event.reply("folderSelected", { success: true, error: null, folderPath: selectedPath });
        }
        else {
            event.reply("folderSelected", { success: false, error: "No folder selected", folderPath: null });
        }
    } catch (error) {
        event.reply("folderSelected", { success: false, error: error.message, folderPath: null });
    }
});

// Import the IPC main event handlers
require('./api/api');

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.