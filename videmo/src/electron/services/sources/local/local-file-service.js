const { ipcMain, dialog, shell } = require('electron');
const FolderManager = require('../../../utilities/folderManager/FolderManager');
const BackupDAO = require('../../dao/settings/BackupDAO');

const path = require('path');
const fs = require('fs');

// Create a new instance of the FolderManager class
const folderManager = new FolderManager();

// Register the 'retrieveLevel' event listener to the ipcMain module to get the level of the path
ipcMain.on('retrieveLevel', (event, { baseLink, link }) => {

    const level = folderManager.retrieveLevel(baseLink, link);
    event.reply('retrieveLevel', { success: true, error: null, level: level });
});


// Register the 'retrieveFolderContents' event listener to the ipcMain module to get the contents of a folder
ipcMain.on('retrieveFolderContents', (event, { folderPath, coverFolder, level }) => {
    fs.readdir(folderPath, (err, contents) => {
        if (err) {
            event.reply('retrieveFolderContents', { success: false, error: err.message, folderContents: [{}] });
        } else {
            const folderContents = folderManager.getFolderContentsWithCovers(folderPath, contents, coverFolder, level);
            const basename = folderManager.getBasenameByLevel(folderPath, level);

            event.reply('retrieveFolderContents', { success: true, error: null, folderContents: folderContents, basename: basename });
        }
    });
});


// Register the 'retrieveBaseNameByLevel' event listener to the ipcMain module to get the basename of a folder
ipcMain.on('retrieveBaseNameByLevel', (event, { basePath, level }) => {
    const basename = folderManager.getBasenameByLevel(basePath, level);
    event.reply('retrieveBaseNameByLevel', { success: true, error: null, basename: basename });
});


// Register the 'retrieveFoderCover' event listener to the ipcMain module to get the cover of a folder
ipcMain.on('retrieveFoderCover', (event, { folderPath, coverFolder, level }) => {
    const coverImagePath = folderManager.getCoverImagePath(folderPath, coverFolder, level);
    event.reply('retrieveFoderCover', { success: true, error: null, cover: coverImagePath });
});


ipcMain.on('openImageFileDialog', async (event) => {
    try {
        const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'gif', 'bmp', 'webp'] }] });

        if (!result.canceled) {
            event.reply('openImageFileDialog', { success: true, error: null, imagePath: result.filePaths[0] });
        } else {
            event.reply('openImageFileDialog', { success: false, error: 'No image selected', imagePath: null });
        }
    } catch (error) {
        event.reply('openImageFileDialog', { success: false, error: error.message, imagePath: null });
    }
});

// Register the 'openFolderDialog' event listener to the ipcMain module to open a folder dialog
ipcMain.on("openFolderDialog", async (event) => {
    try {
        const result = await dialog.showOpenDialog({ properties: ["openDirectory"], title: "Select a folder" });

        if (!result.canceled) {
            event.reply("openFolderDialog", { success: true, error: null, folderPath: result.filePaths[0] });
        } else {
            event.reply("openFolderDialog", { success: false, error: "No folder selected", folderPath: null });
        }
    } catch (error) {
        event.reply("openFolderDialog", { success: false, error: error.message, folderPath: null });
    }
});

// Register the 'createBackupFile' event listener to the ipcMain module to create a backup file
ipcMain.on("createBackupFile", async (event) => {
    new BackupDAO().generateBackup()
        .then(() => event.reply("createBackupFile", { success: true, error: null }))
        .catch((error) => event.reply("createBackupFile", { success: false, error: error.message }));
});

// Register the 'restoreBackupFile' event listener to the ipcMain module to restore a backup file
ipcMain.on("restoreBackupFile", async (event) => {
    // Open a dialog to select the backup file
    const result = await dialog.showOpenDialog({ properties: ["openFile"], title: "Select a backup file" });
    if (result.canceled) {
        event.reply("restoreBackupFile", { success: false, error: "No backup file selected" });
        return;
    }

    // Get the path of the backup file
    const filePath = result.filePaths[0];
    new BackupDAO().restoreBackup(filePath)
        .then(() => event.reply("restoreBackupFile", { success: true, error: null }))
        .catch((error) => event.reply("restoreBackupFile", { success: false, error: error.message }));
});

// Register the 'retrieveFilesInFolder' event listener to the ipcMain module to get the files in a folder
ipcMain.on("retrieveFilesInFolder", (event, { folderPath }) => {
    fs.readdir(folderPath, (err, contents) => {
        if (err) {
            event.reply("retrieveFilesInFolder", { success: false, error: err.message, files: [] });
        } else {
            let files = [];

            for (const file of contents) {
                const fullPath = path.join(folderPath, file);
                const fileStats = fs.statSync(fullPath);
                const isDirectory = fileStats.isDirectory();
                const formattedTime = folderManager.formatTime(fileStats.mtime);

                if (!isDirectory) {
                    files.push({
                        name: file,
                        link: folderManager.accessFileWithCustomProtocol(fullPath),
                        modifiedTime: formattedTime,
                    });
                }
            }

            files = files.reverse();
            event.reply("retrieveFilesInFolder", { success: true, error: null, files });
        }
    });
});


// Register the 'openFileInLocalVideoPlayer' event listener to the ipcMain module to open a file in the local video player
ipcMain.on("openFileInLocalVideoPlayer", (event, { filePath }) => {
    shell.openPath(folderManager.removeCustomProtocolFromPath(filePath));
    event.reply("openFileInLocalVideoPlayer", { success: true, error: null });
});