const { ipcMain } = require('electron');
const ExtensionsDAO = require('../services/dao/settings/ExtensionsDAO');


// Add new extension
ipcMain.on('test', (event, arg) => {
    console.log(arg) // prints "ping"
    new ExtensionsDAO()
        .createExtension(arg.link, arg.name, arg.local)
        .close();

    event.reply('/create/extension/', { success: true });
})

// Read all extensions
ipcMain.on('/read/extension/', (event) => {
    const dao = new ExtensionsDAO();
    const extensions = dao.getAllExtensions();
    console.log(extensions);
    dao.close();
    event.reply('/read/extension/', { success: true, extensions: extensions });
})
