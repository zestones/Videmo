const { ipcMain } = require('electron');
const ExtensionsDAO = require('../services/dao/settings/ExtensionsDAO');

// Add new extension
ipcMain.on('/create/extension/', (event, arg) => {
    new ExtensionsDAO()
        .createExtension(arg.link, arg.name, arg.local);

    event.reply('/create/extension/', { success: true, extension: { link: arg.link, name: arg.name, local: arg.local } });
})

// Read all extensions
ipcMain.on('/read/extension/', (event) => {
    const dao = new ExtensionsDAO();
    dao.getAllExtensions()
        .then((extensions) => {
            event.reply('/read/extension/', { success: true, extensions: extensions });
        }).catch((err) => {
            event.reply('/read/extension/', { success: false, error: err });
        });
})

// Delete extension
ipcMain.on('/delete/extension/', (event, arg) => {
    new ExtensionsDAO()
        .deleteExtensionById(arg.id);

    event.reply('/delete/extension/', { success: true, extension: { id: arg.id } });
})