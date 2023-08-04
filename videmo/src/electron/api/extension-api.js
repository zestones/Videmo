const { ipcMain } = require('electron');
const DataTypesConverter = require('../utilities/converter/DataTypesConverter.js');
const ExtensionsDAO = require('../services/dao/settings/ExtensionsDAO');

// Add new extension
ipcMain.on('/create/extension/', (event, arg) => {
    new ExtensionsDAO().createExtension(arg.link, arg.name, arg.local)
        .then(() => event.reply('/create/extension/', { success: true, extension: { link: arg.link, name: arg.name, local: arg.local } }))
        .catch((err) => event.reply('/create/extension/', { success: false, error: err }));
})

// Read all extensions
ipcMain.on('/read/all/extensions/', (event) => {
    new ExtensionsDAO().getAllExtensions()
        .then((extensions) => {
            // convert local to boolean
            extensions.forEach((extension) => extension.local = new DataTypesConverter().convertIntegerToBoolean(extension.local));
            event.reply('/read/all/extensions/', { success: true, extensions: extensions });
        })
        .catch((err) => event.reply('/read/all/extensions/', { success: false, error: err }));
})

// Read extension by id
ipcMain.on('/read/extension/by/id/', (event, arg) => {
    new ExtensionsDAO().getExtensionById(arg.id)
        .then((extension) => {
            // convert local to boolean
            extension.local = new DataTypesConverter().convertIntegerToBoolean(extension?.local);
            event.reply('/read/extension/by/id/', { success: true, extension: extension });
        })
        .catch((err) => event.reply('/read/extension/by/id/', { success: false, error: err }));
})

// Update extension
ipcMain.on('/update/extension/', (event, arg) => {
    new ExtensionsDAO().updateExtension(arg.extension)
        .then(() => event.reply('/update/extension/', { success: true, extension: arg.extension }))
        .catch((err) => event.reply('/update/extension/', { success: false, error: err }));
})

// Delete extension
ipcMain.on('/delete/extension/', (event, arg) => {
    new ExtensionsDAO().deleteExtensionById(arg.id)
        .then(() => event.reply('/delete/extension/', { success: true, extension: { id: arg.id } }))
        .catch((err) => event.reply('/delete/extension/', { success: false, error: err }));
})