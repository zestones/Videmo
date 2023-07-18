const { ipcMain, dialog, shell } = require('electron');
const FolderManager = require('../../../utilities/folderManager/FolderManager');

const path = require('path');
const fs = require('fs');

// Create a new instance of the FolderManager class
const folderManager = new FolderManager();

// Register the 'getLevel' event listener to the ipcMain module to get the level of the path
ipcMain.on('getLevel', (event, { baseLink, link }) => {
    const baseSeparatorCount = (baseLink.split(path.sep).length - 1) || 0;
    const linkSeparatorCount = (link.split(path.sep).length - 1) || 0;

    const level = linkSeparatorCount - baseSeparatorCount;

    event.reply('level', { success: true, error: null, level: level });
});


// Register the 'getFolderContents' event listener to the ipcMain module to get the contents of a folder
ipcMain.on('getFolderContents', (event, { folderPath, coverFolder, level }) => {
    fs.readdir(folderPath, (err, contents) => {
        if (err) {
            event.reply('folderContents', { success: false, error: err.message, folderContents: [{}] });
        } else {
            const folderContents = folderManager.getFolderContentsWithCovers(folderPath, contents, coverFolder, level);
            const basename = folderManager.getBasenameByLevel(folderPath, level);
            
            event.reply('folderContents', { success: true, error: null, folderContents: folderContents, basename: basename });
        }
    });
});


// Register the 'getBaseNameByLevel' event listener to the ipcMain module to get the basename of a folder
ipcMain.on('getBaseNameByLevel', (event, { basePath, level }) => {
    const basename = folderManager.getBasenameByLevel(basePath, level);
    event.reply('baseNameByLevel', { success: true, error: null, basename: basename });
});


// Register the 'getFolderCover' event listener to the ipcMain module to get the cover of a folder
ipcMain.on('getFolderCover', (event, { folderPath, coverFolder, level }) => {
    const coverImagePath = folderManager.getCoverImagePath(folderPath, coverFolder, level);
    event.reply('folderCover', { success: true, error: null, cover: coverImagePath });
});


// Register the 'openFolderDialog' event listener to the ipcMain module to open a folder dialog
ipcMain.on("openFolderDialog", async (event) => {
    try {
        const result = await dialog.showOpenDialog({ properties: ["openDirectory"], title: "Select a folder" });

        if (!result.canceled) {
            event.reply("folderSelected", { success: true, error: null, folderPath: result.filePaths[0] });
        } else {
            event.reply("folderSelected", { success: false, error: "No folder selected", folderPath: null });
        }
    } catch (error) {
        event.reply("folderSelected", { success: false, error: error.message, folderPath: null });
    }
});


// Register the 'getFilesInFolder' event listener to the ipcMain module to get the files in a folder
ipcMain.on("getFilesInFolder", (event, { folderPath }) => {
    fs.readdir(folderPath, (err, contents) => {
        if (err) {
            event.reply("filesInFolder", { success: false, error: err.message, files: [] });
        } else {
            const files = [];

            for (const file of contents) {
                const fullPath = path.join(folderPath, file);
                const fileStats = fs.statSync(fullPath);
                const isDirectory = fileStats.isDirectory();
                const formattedTime = folderManager.formatTime(fileStats.mtime);

                if (!isDirectory) {
                    files.push({
                        name: file,
                        path: folderManager.accessFileWithCustomProtocol(fullPath),
                        modifiedTime: formattedTime,
                    });
                }
            }

            event.reply("filesInFolder", { success: true, error: null, files });
        }
    });
});


// Register the 'openFileInLocalVideoPlayer' event listener to the ipcMain module to open a file in the local video player
ipcMain.on("openFileInLocalVideoPlayer", (event, { filePath }) => {
    shell.openPath(folderManager.removeCustomProtocolFromPath(filePath));
    event.reply("fileOpened", { success: true, error: null });
});