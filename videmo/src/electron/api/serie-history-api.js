const { ipcMain } = require('electron');

const SerieHistoryDAO = require('../services/dao/series/SerieHistoryDAO');


// Read serie and episode history
ipcMain.on('/read/all/episode/and/serie/history/', async (event) => {
    new SerieHistoryDAO().getAllEpisodeAndSerieFromHistory()
        .then((retrievedHistory) => event.reply('/read/all/episode/and/serie/history/', { success: true, data: retrievedHistory }))
        .catch(error => event.reply('/read/all/episode/and/serie/history/', { success: false, error }));
})

// Delete episode history
ipcMain.on('/delete/episode/history/', async (event, episodeId) => {
    new SerieHistoryDAO().deleteSerieHistoryByEpisodeId(episodeId)
        .then((retrievedHistory) => event.reply('/delete/episode/history/', { success: true, data: retrievedHistory }))
        .catch(error => event.reply('/delete/episode/history/', { success: false, error }));
})

// Delete all history
ipcMain.on('/delete/all/history/', async (event) => {
    new SerieHistoryDAO().deleteAllSerieHistory()
        .then((retrievedHistory) => event.reply('/delete/all/history/', { success: true, data: retrievedHistory }))
        .catch(error => event.reply('/delete/all/history/', { success: false, error }));
})