// Description: Main process of the Electron app.
// It is responsible for creating the browser window and for communicating with the renderer process.

const electron = require('electron');
const Menu = electron.Menu;
const path = require('path');

// Update the electron app automatically when a new version is available on GitHub releases
// The update is done using the update-electron-app package
require('update-electron-app')({
    repo: 'https://github.com/zestones/Videmo',
    logger: require(path.resolve(__dirname, '..', 'src', 'electron', 'utilities', 'logger', 'logger'))
})

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Module to define custom protocol
const protocol = electron.protocol;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        // frame: false, // Hide the default window frame
        webPreferences: {
            preload: path.join(__dirname, '..', 'src', 'electron', 'preload.js'), // use a preload script
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Remove the default menu
    Menu.setApplicationMenu(null);

    if (process.env.NODE_ENV === 'development') {
        // Open the DevTools.
        mainWindow.webContents.openDevTools();

        // and load the index.html of the app.
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // and load the index.html of the app.
        mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    // Init the database and create the tables if they don't exist
    // The tables are created using the tables.sql file from the sqlite/sql folder
    // The database file is located inside the sqlite/sql folder
    const SQLiteQueryExecutor = require(path.resolve(__dirname, '..', 'src', 'electron', 'services', 'sqlite', 'SQLiteQueryExecutor.js'))

    const sqliteQueryExecutor = new SQLiteQueryExecutor();
    sqliteQueryExecutor.initializeDatabase();
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


// Import the IPC main event handlers for the renderer process (see preload.js)
// handle the queries to the database using SQLite and the QueryExecutor class from the sqlite folder
// handle the API requests using the API classes from the api folder
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'serie-category-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'extension-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'category-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'serie-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'track-serie-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'serie-history-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'scrappers', 'local-scrapper-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'ani-list-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'serie-infos-api'));
require(path.resolve(__dirname, '..', 'src', 'electron', 'api', 'category-filter-api'));

// handle local file system requests using the endpoint defined inside the local-file-service file from the sources/local folder
// The local-file-service file is responsible for reading the local file system and returning the data to the renderer process
// The local-file-service file uses the FolderManager class from the utilites folder to read the local file system
require(path.resolve(__dirname, '..', 'src', 'electron', 'services', 'sources', 'local', 'local-file-service'));

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.