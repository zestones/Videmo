const { ipcMain, dialog, shell } = require('electron');
const FolderManager = require('../../../utilities/folderManager/FolderManager');

const path = require('path');
const fs = require('fs');

const folderManager = new FolderManager();

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
            const folderContents = folderManager.getFolderContentsWithCovers(folderPath, contents, coverFolder, level);
            event.reply('folderContents', { success: true, error: null, folderContents: folderContents });
        }
    });
});

ipcMain.on('getFolderCover', (event, { folderPath, coverFolder, level }) => {
    const coverImagePath = folderManager.getCoverImagePath(folderPath, coverFolder, level);
    event.reply('folderCover', { success: true, error: null, cover: coverImagePath });
});




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
                        path: fullPath,
                        modifiedTime: formattedTime,
                    });
                }
            }

            event.reply("filesInFolder", { success: true, error: null, files });
        }
    });
});

ipcMain.on("openFileInLocalVideoPlayer", (event, { filePath }) => {
    shell.openPath(filePath);
    event.reply("fileOpened", { success: true, error: null });
});