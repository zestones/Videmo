const { ipcMain } = require('electron');
const ExtensionsDAO = require('../services/dao/settings/ExtensionsDAO');


// Add new extension
ipcMain.on('/create/extension/', (event, arg) => {

    new ExtensionsDAO()
        .createExtension(arg.link, arg.name, arg.local);

    event.reply('/create/extension/', { success: true });
})

// Read all extensions
ipcMain.on('/read/extension/', (event) => {
    const dao = new ExtensionsDAO();
    dao.getAllExtensions()
        .then((extensions) => {
            console.log(extensions);
            event.reply('/read/extension/', { success: true, extensions: extensions });
        }).catch((err) => {
            console.error('Error retrieving extensions:', err);
            event.reply('/read/extension/', { success: false, error: err });
        });
})
