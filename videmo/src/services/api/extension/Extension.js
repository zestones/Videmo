export default class Extensions {

    constructor() {
        this.extensions = [{}];
    }

    
    // * --- API Calls --- * //
    // ----------------------- 

    // Create a new extension
    createExtension(link = "", name = "", local = true) {
        if (link === "" || name === "") {
            console.error("Link and name are required");
            return;
        }
        console.log("Creating extension: ", link, name, local);
        // TODO: Check if extension already exists
        window.api.send("/create/extension/", { link: link, name: name, local: local });

        // Listen for the response from the main Electron process
        window.api.receive("/create/extension/", (data) => data.success ? console.log('hourra') : console.error(data.error));
    }

    // Read all extensions
    readExtension() {
        console.log("Reading extensions");
        // Send the request to the main Electron process
        window.api.send("/read/extension/");

        // Listen for the response from the main Electron process
        window.api.receive("/read/extension/", (data) => this.#handleReadExtension(data));
    }

    #handleReadExtension(data) {
        if (data.success) {
            console.log("Extensions retrieved: ");
            console.log(data.extensions);
            this.extensions = data.extensions;
        } else {
            console.error(data.error);
        }
    }


    // * --- Getters --- * //
    // ---------------------

    // Search for an extension by name on the retrieved extensions
    getExtensionByName(name) {
        const extension = this.extensions.find(extension => extension.name === name);
        return extension;
    }

    getAllExtensions() {
        return this.extensions;
    }
}