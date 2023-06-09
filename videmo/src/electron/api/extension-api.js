const { ipcMain } = require('electron');
const ExtensionsDAO = require('../services/dao/settings/ExtensionsDAO');

// Add new extension
ipcMain.on('/create/extension/', (event, arg) => {
    new ExtensionsDAO()
        .createExtension(arg.link, arg.name, arg.local);

    event.reply('/create/extension/', { success: true, extension: { link: arg.link, name: arg.name, local: arg.local } });
})

// Read all extensions
ipcMain.on('/read/all/extensions/', (event) => {
    const dao = new ExtensionsDAO();
    dao.getAllExtensions()
        .then((extensions) => {
            // convert local to boolean
            extensions.forEach((extension) => extension.local = extension.local === 1);
            event.reply('/read/all/extensions/', { success: true, extensions: extensions });
        }).catch((err) => {
            event.reply('/read/all/extensions/', { success: false, error: err });
        });
})

// Delete extension
ipcMain.on('/delete/extension/', (event, arg) => {
    new ExtensionsDAO()
        .deleteExtensionById(arg.id);

    event.reply('/delete/extension/', { success: true, extension: { id: arg.id } });
})