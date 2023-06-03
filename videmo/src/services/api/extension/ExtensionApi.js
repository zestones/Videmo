export default class ExtensionsApi {

    // * --- API Calls --- * //
    // ----------------------- 

    // Create a new extension
    createExtension(link = "", name = "", local = true) {
        if (link === "" || name === "") {
            console.error("Link and name are required");
            return;
        }

        // TODO: Check if extension already exists
        window.api.send("/create/extension/", { link: link, name: name, local: local });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/create/extension/", (data) => data.success ? resolve(data.extension) : reject(data.error));
        });
    }

    // Read all extensions
    async readExtension() {
        console.log("Reading extensions");

        // Send the request to the main Electron process
        window.api.send("/read/extension/");

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/read/extension/", (data) => this.#handleReadExtension(resolve, reject, data));
        });
    }

    #handleReadExtension(resolve, reject, data) {
        if (data.success) {
            resolve(data.extensions);
        } else {
            reject(data.error);
        }
    }

}