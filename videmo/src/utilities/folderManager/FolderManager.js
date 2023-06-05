class FolderManager {

    static DEFAULT_COVER_FOLDER_NAME = "Cover";

    retrieveFolderContents(folderPath, level = 0) {
        const coverFolder = FolderManager.DEFAULT_COVER_FOLDER_NAME

        // Send the folder path to the main Electron process
        window.api.send("getFolderContents", { folderPath, coverFolder, level });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("folderContents", (data) => data.success ? resolve(data.folderContents) : reject(data.error));
        });
    }

    retrieveFolderCover(folderPath, level = 0) {
        const coverFolder = FolderManager.DEFAULT_COVER_FOLDER_NAME
        
        // Send the folder path to the main Electron process
        window.api.send("getFolderCover", { folderPath, coverFolder, level });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("folderCover", (data) => data.success ? resolve(data.cover) : reject(data.error));
        });
    }

    retrieveLevel(baseLink, link) {
        window.api.send("getLevel", { baseLink, link });

        return new Promise((resolve, reject) => {
            window.api.receive("level", (data) => data.success ? resolve(data.level) : reject(data.error));
        });
    }

    retrieveParentPath(path) {
        return this.retrieveSplittedPath(path, 1);
    }

    retrieveSplittedPath(basePath, level) {
        window.api.send("getSplittedPath", { basePath, level });

        return new Promise((resolve, reject) => {
            window.api.receive("splittedPath", (data) => data.success ? resolve(data.splittedPath) : reject(data.error));
        });
    }

    retrieveFilesInFolder(folderPath) {
        window.api.send("getFilesInFolder", { folderPath });

        return new Promise((resolve, reject) => {
            window.api.receive("filesInFolder", (data) => data.success ? resolve(data.files) : reject(data.error));
        });
    }

    openFileInLocalVideoPlayer(filePath) {
        window.api.send("openFileInLocalVideoPlayer", { filePath });

        return new Promise((resolve, reject) => {
            window.api.receive("fileOpened", (data) => data.success ? resolve(data.message) : reject(data.error));
        });
    }

    getFileName(filePath) {
        const fileName = filePath.split("\\").pop().split("/").pop();
        return fileName;
    }

    getCoverImage(coverImage) {
        // Construct the file path using the custom protocol 'app://'
        return `app:///${coverImage}`;
    }

    // TODO: Merge with getCoverImage
    getVideoFile(videoFile) {
        // Construct the file path using the custom protocol 'app://'
        return `app:///${videoFile}`;
    }

    openDialogWindow() {
        // Send a message to the main process to open a folder dialog
        window.api.send("openFolderDialog");

        // Create a promise to handle the response from window.api.receive
        return new Promise((resolve, reject) => {
            window.api.receive("folderSelected", (data) => data.success ? resolve(data.folderPath) : reject(data.error));
        });
    }
}

export default FolderManager;
