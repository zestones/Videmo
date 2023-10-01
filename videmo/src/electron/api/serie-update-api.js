const { ipcMain } = require('electron');

const SerieUpdateDAO = require('../services/dao/series/SerieUpdateDAO');


// /read/all/update/entries/
ipcMain.on("/read/all/update/entries/", (event) => {
    new SerieUpdateDAO().readAllUpdateEntries()
        .then((entries) => event.reply("/read/all/update/entries/", { success: true, entries: entries }))
        .catch((error) => event.reply("/read/all/update/entries/", { success: false, error: error }));
});