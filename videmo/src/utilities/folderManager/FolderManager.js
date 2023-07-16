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
        window.api.send("getFolderContents", { folderPath, coverFolder, level });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("folderContents", (data) => data.success ? resolve({ contents: data.folderContents, basename: data.basename }) : reject(data.error));
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
        window.api.send("getFolderCover", { folderPath, coverFolder, level });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("folderCover", (data) => data.success ? resolve(data.cover) : reject(data.error));
        });
    }

    /**
     * @param {String} baseLink 
     * @param {String} link 
     * @returns {Promise<String>} A promise that resolves with the level of the link.
     */
    retrieveLevel(baseLink, link) {
        window.api.send("getLevel", { baseLink, link });

        return new Promise((resolve, reject) => {
            window.api.receive("level", (data) => data.success ? resolve(data.level) : reject(data.error));
        });
    }

    /**
     * @param {String} folderPath 
     * @returns {Promise<Array>} A promise that resolves with the files in the folder.
     */
    retrieveFilesInFolder(folderPath) {
        window.api.send("getFilesInFolder", { folderPath });

        return new Promise((resolve, reject) => {
            window.api.receive("filesInFolder", (data) => data.success ? resolve(data.files) : reject(data.error));
        });
    }

    /**
     * 
     * @param {String} basePath 
     * @param {Integer} level 
     * @returns {Promise<String>} A promise that resolves with the base name of the path.
     */
    retrieveBaseNameByLevel(basePath, level) {
        window.api.send("getBaseNameByLevel", { basePath, level });

        return new Promise((resolve, reject) => {
            window.api.receive("baseNameByLevel", (data) => data.success ? resolve(data.basename) : reject(data.error));
        });
    }

    /**
     * @param {String} filePath 
     * @returns {Promise<String>} A promise that resolves with the success message.
     */
    openFileInLocalVideoPlayer(filePath) {
        window.api.send("openFileInLocalVideoPlayer", { filePath });

        return new Promise((resolve, reject) => {
            window.api.receive("fileOpened", (data) => data.success ? resolve(data.success) : reject(data.error));
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
            window.api.receive("folderSelected", (data) => data.success ? resolve(data.folderPath) : reject(data.error));
        });
    }

    /**
     * @param {String} filePath 
     * @returns {String} The file name of the file path.
     */
    retrieveFileName(filePath) {
        return filePath.split("\\").pop().split("/").pop();
    }

    /**
     * @param {String} filePath 
     * @returns {String} The parent base name of the file path.
     */
    retrieveParentBaseName(filePath) {
        return filePath.split("\\").pop().split("/").pop().split(".").shift();
    }

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

    retrieveParentPath(filePath) {
        return this.retrieveSplittedPath(filePath, 1);
    }

    /**
     * 
     * @param {Object} contents 
     * @param {Object} series 
     * @returns {Object} The contents with the series status.
     */
    mapFolderContentsWithSeriesStatus(contents, series) {
        return contents.map((folderContent) => {
            folderContent.inLibrary = series.some((serie) => serie.link === folderContent.link);
            return folderContent;
        });
    };

    /**
     * @param {Object} contents 
     * @param {Interger} extensionId 
     * @returns {Object} The contents with the extension id.
     */
    mapFolderContentsWithExtensionId(contents, extensionId) {
        return contents.map((folderContent) => {
            folderContent.extensionId = extensionId;
            return folderContent;
        });
    };

    /**
     * @param {Object} contents 
     * @returns {Object} The contents with the basename.
     */
    mapFolderContentsWithBasename(contents) {
        return contents.map((folderContent) => {
            folderContent.basename = this.retrieveFileName(folderContent.link);
            folderContent.name = folderContent.basename;
            return folderContent;
        });
    };

    superMapFolderContentsWithMandatoryFields(contents, series, extension, basename) {
        if (!basename) return this.mapFolderContentsWithMandatoryFields(contents, series, extension);

        return contents.map((folderContent) => {
            folderContent.basename = basename;
            folderContent.name = this.retrieveFileName(folderContent.link);
            folderContent.inLibrary = series.some((serie) => serie.link === folderContent.link);
            folderContent.extension_id = extension.id;
            return folderContent;
        });
    }

    mapFolderContentsWithMandatoryFields(contents, series, extension) {
        return contents.map((folderContent) => {
            folderContent.basename = this.retrieveFileName(folderContent.link);
            folderContent.name = folderContent.basename;
            folderContent.inLibrary = series.some((serie) => serie.link === folderContent.link);
            folderContent.extension_id = extension.id;
            return folderContent;
        });
    }
}


export default FolderManager;