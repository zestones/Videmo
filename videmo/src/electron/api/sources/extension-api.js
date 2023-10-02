const { ipcMain } = require('electron');
const DataTypesConverter = require('../../utilities/converter/DataTypesConverter.js');
const ExtensionsDAO = require('../../services/dao/settings/ExtensionsDAO.js');
const LocalFileScrapper = require('../../services/sources/local/local-file-scrapper.js');


// Add new extension
ipcMain.on('/create/extension/', async (event, arg) => {
    const extensionDAO = new ExtensionsDAO();
    const scrapper = new LocalFileScrapper(arg.link);

    const retrievedExtension = await extensionDAO.getExtensionByLink(arg.link);

    if (retrievedExtension !== undefined && !retrievedExtension.is_active) {
        await scrapper.scrap();
        await extensionDAO.updateExtensionIsActive(retrievedExtension.id, true);
        event.reply('/create/extension/', { success: true, data: { id: retrievedExtension.id, link: arg.link, name: arg.name, local: arg.local } })
    } else {
        extensionDAO.createExtension(arg.link, arg.name, arg.local, false)
            .then(async (extension) => {
                // Scrap all the tree structure and insert it into the database
                await scrapper.scrap();
                await extensionDAO.updateExtensionIsActive(extension.id, true);
                event.reply('/create/extension/', { success: true, data: extension })
            })
            .catch((err) => event.reply('/create/extension/', { success: false, error: err }));
    }
})

// Read all extensions
ipcMain.on('/read/all/extensions/', (event) => {
    new ExtensionsDAO().getAllActiveExtensions()
        .then((extensions) => event.reply('/read/all/extensions/', { success: true, data: extensions }))
        .catch((err) => event.reply('/read/all/extensions/', { success: false, error: err }));
})

// Read extension by id
ipcMain.on('/read/extension/by/id/', (event, arg) => {
    new ExtensionsDAO().getExtensionById(arg.id)
        .then((extension) => {
            // convert local to boolean
            extension.local = new DataTypesConverter().convertIntegerToBoolean(extension?.local);
            event.reply('/read/extension/by/id/', { success: true, data: extension });
        })
        .catch((err) => event.reply('/read/extension/by/id/', { success: false, error: err }));
})

// Update extension
ipcMain.on('/update/extension/', (event, arg) => {
    new ExtensionsDAO().updateExtension(arg.extension)
        .then(() => event.reply('/update/extension/', { success: true, data: arg.extension }))
        .catch((err) => event.reply('/update/extension/', { success: false, error: err }));
})

// Delete extension
ipcMain.on('/delete/extension/', (event, arg) => {
    new ExtensionsDAO().updateExtensionIsActive(arg.id, false)
        .then(() => event.reply('/delete/extension/', { success: true, data: { id: arg.id } }))
        .catch((err) => event.reply('/delete/extension/', { success: false, error: err }));
})