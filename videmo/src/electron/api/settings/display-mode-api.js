const { ipcMain } = require('electron');

const DisplayModeDAO = require('../../services/dao/settings/DisplayModeDAO');

// Read all display options
ipcMain.on('/read/all/display/mode/', (event) => {
    new DisplayModeDAO().getAllDisplayMode()
        .then((modes) => event.reply('/read/all/display/mode/', { success: true, data: modes }))
        .catch((err) => event.reply('/read/all/display/mode/', { success: false, error: err }));
})
