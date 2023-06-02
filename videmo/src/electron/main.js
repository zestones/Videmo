const electron = require('electron');
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

// Module to handle file system paths
const path = require('path');
const fs = require('fs');

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


// Listen for async message from renderer process
// TODO: Store the folder path in a DB or file,
// TODO: so that it can be retrieved when the app is restarted
ipcMain.on('getFolderContents', (event, { folderPath, coverFolder }) => {
    fs.readdir(folderPath, (err, contents) => {
        if (err) {
            event.reply('folderContents', { success: false, error: err.message, folderContents: [{}] });
        }
        else {
            // create an array of objects with the file name and path
            const folderContents = contents.map((folder) => { return { cover: getCoverImage(folderPath, coverFolder, folder), path: path.join(folderPath, folder) } });
            event.reply('folderContents', { success: true, error: null, folderContents: folderContents });
        }
    });
});


function getCoverImage(folderPath, coverFolder, fileNameWithoutExtension) {
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    // Iterate through supported extensions and check if the image file exists
    for (const extension of supportedExtensions) {
        const imagePath = path.join(folderPath, fileNameWithoutExtension, coverFolder, `${fileNameWithoutExtension}${extension}`);
        if (fs.existsSync(imagePath)) {
            return imagePath;
        }
    }
    return "default.png";
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


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.