const { ipcMain } = require('electron');

const DisplaySettingsDAO = require('../services/dao/settings/DisplaySettingsDAO');

// Read display option
ipcMain.on('/read/display/mode/', (event) => {
    new DisplaySettingsDAO().getDisplayMode()
        .then((displayOption) => event.reply('/read/display/mode/', { success: true, data: displayOption }))
        .catch((err) => event.reply('/read/display/mode/', { success: false, error: err }));
})

// Update display option
ipcMain.on('/update/display/mode/', (event, args) => {
    new DisplaySettingsDAO().updateDisplayMode(args.displayModeId)
        .then((mode) => event.reply('/update/display/mode/', { success: true, data: mode }))
        .catch((err) => event.reply('/update/display/mode/', { success: false, error: err }));
})