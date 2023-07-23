const { ipcMain } = require('electron');

const SerieHistoryDAO = require('../services/dao/series/SerieHistoryDAO');


// Read serie and episode history
ipcMain.on('/read/all/episode/and/serie/history', async (event) => {
    console.log("ipcMain.on('/read/all/episode/and/serie/history'");
    new SerieHistoryDAO().readAllEpisodeAndSerieFromHistory()
        .then((retrievedHistory) => {
            event.reply('/read/all/episode/and/serie/history', { success: true, history: retrievedHistory });
        })
        .catch(error => event.reply('/read/all/episode/and/serie/history', { success: false, error }));
})