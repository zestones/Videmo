class FolderManager {

    constructor() {
        this.folderPath = "";
        this.defaultCoverName = "Cover";
        this.listeners = []; // Store the listeners to be notified when files are updated
        this.folderContents = [{}]; // Initialize the folder contents to an empty array
    }

    setFolderPath(folderPath) {
        this.folderPath = folderPath;
    }

    handleRetrieveClick() {
        // Send the folder path to the main Electron process
        const folderPath = this.folderPath;
        const coverFolder = this.defaultCoverName;

        window.api.send("getFolderContents", { folderPath, coverFolder });

        // Listen for the response from the main Electron process
        window.api.receive("folderContents", (data) => this.handleFolderContents(data));
    }

    handleFolderContents(data) {
        if (data.success) {
            this.folderContents = data.folderContents;
            // Notify listeners about the updated files
            this.notifyListeners();
        } else {
            console.error(data.error);
        }
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
            window.api.receive("folderSelected", (data) => {
                if (data.success) {
                    resolve(data.folderPath);
                } else {
                    reject(data.error);
                }
            });
        });
    }

    // Register a listener to be notified when files are updated
    registerListener(listener) {
        this.listeners.push(listener);
    }

    // Unregister a listener
    unregisterListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Notify all registered listeners about the updated files
    notifyListeners() {
        for (const listener of this.listeners) {
            listener(this.folderContents);
        }
    }
}

export default FolderManager;
