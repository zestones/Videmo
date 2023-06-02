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
        window.api.send("test", { link: link, name: name, local: local });

        window.api.receive("/create/extension/", (data) => data.success ? "" : console.error(data.error));
    }

    // Read all extensions
    readExtension() {
        window.api.send("/read/extension/", (data) => this.#handleReadExtension(data));
    }

    #handleReadExtension(data) {
        if (data.success) {
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
}