class FolderManager {

    static DEFAULT_COVER_FOLDER_NAME = "Cover";

    retrieveFolderContents(folderPath, level = 0) {
        const coverFolder = FolderManager.DEFAULT_COVER_FOLDER_NAME

        // Send the folder path to the main Electron process
        window.api.send("getFolderContents", { folderPath, coverFolder, level });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("folderContents", (data) => {
                if (data.success) {
                    resolve(data.folderContents);
                } else {
                    reject(data.error);
                }
            });
        });
    }

    getLevel(baseLink, link) {
        window.api.send("getLevel", { baseLink, link });

        return new Promise((resolve, reject) => {
            window.api.receive("level", (data) => data.success ? resolve(data.level) : reject(data.error));
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
