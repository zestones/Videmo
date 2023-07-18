const fs = require('fs');
const path = require('path');

class FolderManager {

    /**
     * @param {String} folderPath 
     * @param {String} coverFolder 
     * @param {Integer} level 
     * @returns {String} The path of cover image.
     */
    getCoverImagePath(folderPath, coverFolder, level) {
        const pathArray = folderPath.split(path.sep);
        const slicedPathArray = pathArray.slice(0, pathArray.length - level);

        const coverFolderPath = path.join(...slicedPathArray, coverFolder);
        const folderName = path.basename(folderPath);
        const coverImagePath = path.join(coverFolderPath, folderName);

        const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.jfif', '.jpe'];

        for (const extension of supportedExtensions) {
            const imagePath = `${coverImagePath}${extension}`;

            if (fs.existsSync(imagePath)) {
                return this.accessFileWithCustomProtocol(imagePath);;
            }
        }

        return this.accessFileWithCustomProtocol(this.getDefaultCoverImage());
    }

    /**
     * @returns {String} The path of default cover image.
     */
    getDefaultCoverImage() {
        return path.join(__dirname, '..', '..', '..', '..', 'public', 'images', 'default_cover.jpeg');
    }

    /**
     * @param {String} folderPath 
     * @param {Array} contents 
     * @param {String} coverFolder 
     * @param {Integer} level 
     * @returns {Array} The contents of the folder.
     */
    getFolderContentsWithCovers(folderPath, contents, coverFolder, level) {
        const folderContents = [];

        for (const folder of contents) {
            const fullPath = path.join(folderPath, folder);
            const isDirectory = fs.statSync(fullPath).isDirectory();

            // If the entry is a directory, process it
            if (isDirectory && folder !== coverFolder) {
                const coverImagePath = this.getCoverImagePath(fullPath, coverFolder, level);
                folderContents.push({ image: coverImagePath, link: fullPath });
            }
        }

        return folderContents;
    }

    /**
     * 
     * @param {String} givenPath 
     * @param {Integer} level 
     * @returns {String} The basename at the specified level.
     */
    getBasenameByLevel(givenPath, level) {
        const parts = givenPath.split(path.sep);

        // Make sure the level is within the valid range
        const normalizedLevel = Math.min(level, parts.length - 1);
        return parts[parts.length - normalizedLevel];
    }

    /**
     * @param {String} filePath 
     * @returns {String} The file path with the custom protocol 'app://'
    */
    accessFileWithCustomProtocol(filePath) {
        return `app:///${filePath}`;
    }

    /**
     * @param {String} filePath 
     * @returns {String} The file path without the custom protocol 'app://'
     */
    removeCustomProtocolFromPath(filePath) {
        return filePath.replace('app:///', '');
    }

    /**
     * @param {Date} time 
     * @returns {String} The formatted time.
     */
    formatTime(time) {
        const year = time.getFullYear();
        const month = String(time.getMonth() + 1).padStart(2, '0');
        const day = String(time.getDate()).padStart(2, '0');
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');

        return `${year}/${month}/${day} - ${hours}h${minutes}`;
    }
}

module.exports = FolderManager;