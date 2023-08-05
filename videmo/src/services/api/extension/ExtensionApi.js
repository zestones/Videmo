export default class ExtensionsApi {

    // Create a new extension
    createExtension(link = "", name = "", local = true) {
        // Send the request to the main Electron process
        window.api.send("/create/extension/", { link: link, name: name, local: local });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/create/extension/", (data) => data.success ? resolve(data.extension) : reject(data.error));
        });
    }

    // Read all extensions
    readExtension() {
        // Send the request to the main Electron process
        window.api.send("/read/all/extensions/");

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/extensions/", (data) => data.success ? resolve(data.extensions) : reject(data.error));
        });
    }

    readExtensionById(id) {
        // Send the request to the main Electron process
        window.api.send("/read/extension/by/id/", { id: id });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/read/extension/by/id/", (data) => data.success ? resolve(data.extension) : reject(data.error));
        });
    }

    updateExtension(extension) {
        // Send the request to the main Electron process
        window.api.send("/update/extension/", { extension: JSON.stringify(extension) });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/update/extension/", (data) => data.success ? resolve(data.extension) : reject(data.error));
        });
    }

    deleteExtension(id) {
        // Send the request to the main Electron process
        window.api.send("/delete/extension/", { id: id });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/delete/extension/", (data) => data.success ? resolve(data.extension) : reject(data.error));
        });
    }
}