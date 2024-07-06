import { makeRequest } from "../../../utilities/utils/Utils";

export default class ExtensionsApi {

    // Create a new extension
    createExtension(link = "", name = "", local = true) {
        return makeRequest("/create/extension/", { link: link, name: name, local: local });
    }

    // Read all extensions
    readExtension() {
        return makeRequest("/read/all/extensions/");
    }

    // Read extension by id
    readExtensionById(id) {
        return makeRequest("/read/extension/by/id/", { id: id });
    }

    // Read extension by link
    updateExtension(extension) {
        return makeRequest("/update/extension/", { extension: JSON.stringify(extension) });
    }

    // Delete extension by ID
    deleteExtension(id) {
        return makeRequest("/delete/extension/", { id: id });
    }
}