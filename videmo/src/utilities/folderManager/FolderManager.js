class FolderManager {

    // Constants
    static DEFAULT_COVER_FOLDER_NAME = "Cover";

    /**
     * @param {String} folderPath 
     * @param {Integer} level 
     * @returns {Promise<Array>} A promise that resolves with the contents of the folder.
     */
    retrieveFolderContents(folderPath, level = 0) {
        const coverFolder = FolderManager.DEFAULT_COVER_FOLDER_NAME

        // Send the folder path to the main Electron process
        window.api.send("retrieveFolderContents", { folderPath, coverFolder, level });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("retrieveFolderContents", (data) => data.success ? resolve({ contents: data.folderContents, basename: data.basename }) : reject(data.error));
        });
    }

    /**
     * @param {String} folderPath 
     * @param {Integer} level 
     * @returns {Promise<String>} A promise that resolves with the path of the folder cover.
     */
    retrieveFolderCover(folderPath, level = 0) {
        const coverFolder = FolderManager.DEFAULT_COVER_FOLDER_NAME

        // Send the folder path to the main Electron process
        window.api.send("retrieveFoderCover", { folderPath, coverFolder, level });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("retrieveFoderCover", (data) => data.success ? resolve(data.cover) : reject(data.error));
        });
    }

    /**
     * @param {String} baseLink 
     * @param {String} link 
     * @returns {Promise<String>} A promise that resolves with the level of the link.
     */
    retrieveLevel(baseLink, link) {
        window.api.send("retrieveLevel", { baseLink, link });

        return new Promise((resolve, reject) => {
            window.api.receive("retrieveLevel", (data) => data.success ? resolve(data.level) : reject(data.error));
        });
    }

    /**
     * @param {String} folderPath 
     * @returns {Promise<Array>} A promise that resolves with the files in the folder.
     */
    retrieveFilesInFolder(folderPath) {
        window.api.send("retrieveFilesInFolder", { folderPath });

        return new Promise((resolve, reject) => {
            window.api.receive("retrieveFilesInFolder", (data) => data.success ? resolve(data.files) : reject(data.error));
        });
    }

    /**
     * 
     * @param {String} basePath 
     * @param {Integer} level 
     * @returns {Promise<String>} A promise that resolves with the base name of the path.
     */
    retrieveBaseNameByLevel(basePath, level) {
        window.api.send("retrieveBaseNameByLevel", { basePath, level });

        return new Promise((resolve, reject) => {
            window.api.receive("retrieveBaseNameByLevel", (data) => data.success ? resolve(data.basename) : reject(data.error));
        });
    }

    /**
     * @param {String} filePath 
     * @returns {Promise<String>} A promise that resolves with the success message.
     */
    openFileInLocalVideoPlayer(filePath) {
        window.api.send("openFileInLocalVideoPlayer", { filePath });

        return new Promise((resolve, reject) => {
            window.api.receive("openFileInLocalVideoPlayer", (data) => data.success ? resolve(data.success) : reject(data.error));
        });
    }

    /**
     * @returns {Promise<String>} A promise that resolves with the selected folder path.
     */
    openDialogWindow() {
        // Send a message to the main process to open a folder dialog
        window.api.send("openFolderDialog");

        // Create a promise to handle the response from window.api.receive
        return new Promise((resolve, reject) => {
            window.api.receive("openFolderDialog", (data) => data.success ? resolve(data.folderPath) : reject(data.error));
        });
    }

    /**
     * @returns {Promise<String>} A promise that resolves with the selected file path.
     */
    createBackup() {
        // Send a message to the main process to create a backup file
        window.api.send("createBackupFile");

        // Create a promise to handle the response from window.api.receive
        return new Promise((resolve, reject) => {
            window.api.receive("createBackupFile", (data) => data.success ? resolve(data.success) : reject(data.error));
        });
    }

    /**
     * @returns {Promise<String>} A promise that resolves with the success message.
     */
    restoreBackup() {
        // Send a message to the main process to restore a backup file
        window.api.send("restoreBackupFile");

        // Create a promise to handle the response from window.api.receive
        return new Promise((resolve, reject) => {
            window.api.receive("restoreBackupFile", (data) => data.success ? resolve(data.success) : reject(data.error));
        });
    }

    /**
     * @param {String} filePath 
     * @returns {String} The file name of the file path.
     */
    retrieveBaseName(filePath) {
        return filePath.split("\\").pop().split("/").pop();
    }

    /**
     * @param {String} filePath 
     * @returns {String} The parent base name of the file path.
     */
    retrieveParentBaseName(filePath) {
        return filePath.split("\\").pop().split("/").pop().split(".").shift();
    }

    /**
     * @param {String} filePath 
     * @param {Integer} level 
     * @returns {String} The path up to the specified level.
     */
    retrieveSplittedPath(filePath, level) {
        const separator = filePath.includes('/') ? '/' : '\\'; // Determine the separator used in the filePath
        const pathParts = filePath.split(separator);

        if (level <= 0) {
            // If level is less than or equal to 0, return an empty string
            return '';
        } else if (level >= pathParts.length) {
            // If level is greater than or equal to the number of parts in the path, return the full path
            return filePath;
        } else {
            // Otherwise, return the path up to the specified level
            return pathParts.slice(0, pathParts.length - level).join(separator);
        }
    }

    /**
     * @param {String} filePath 
     * @returns {String} The parent path of the file path. 
     */
    retrieveParentPath(filePath) {
        return this.retrieveSplittedPath(filePath, 1);
    }

    /**
     * @param {Object} contents 
     * @param {Object} series 
     * @param {Object} extension 
     * @param {Object} basename 
     * @returns {Object} The contents mapped with the mandatory fields.
     */
    superMapFolderContentsWithMandatoryFields(contents, series, extension, basename) {
        if (!basename) return this.mapFolderContentsWithMandatoryFields(contents, series, extension);

        return contents.map((folderContent) => {
            folderContent.basename = basename;
            folderContent.name = this.retrieveBaseName(folderContent.link);
            folderContent.inLibrary = series.some((serie) => serie.link === folderContent.link && serie.inLibrary);
            folderContent.extension_id = extension.id;
            return folderContent;
        });
    }

    /**
     * @param {Object} contents 
     * @param {Object} series 
     * @param {Object} extension 
     * @returns {Object} The contents mapped with the mandatory fields.
     */
    mapFolderContentsWithMandatoryFields(contents, series, extension) {
        return contents.map((folderContent) => {
            folderContent.basename = this.retrieveBaseName(folderContent.link);
            folderContent.name = folderContent.basename;
            folderContent.inLibrary = series.some((serie) => serie.link === folderContent.link && serie.inLibrary);
            folderContent.extension_id = extension.id;
            return folderContent;
        });
    }
}


export default FolderManager;