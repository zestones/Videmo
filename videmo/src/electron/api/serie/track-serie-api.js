const { ipcMain } = require('electron');

const SerieTrackDAO = require('../../services/dao/series/SerieTrackDAO');
const SerieEpisodeDAO = require('../../services/dao/series/SerieEpisodeDAO');
const SerieHistoryDAO = require('../../services/dao/series/SerieHistoryDAO');

// update serie track
ipcMain.on('/update/serie/track/', (event, arg) => {
    new SerieTrackDAO().updateSerieTrack(arg.serie, arg.episodes)
        .then(() => event.reply('/update/serie/track/', { success: true, data: arg.episode }))
        .catch(error => event.reply('/update/serie/track/', { success: false, error }));
})

// update serie track and history
ipcMain.on('/update/serie/track/and/history/', (event, arg) => {
    // And then we update the history
    new SerieHistoryDAO().updateSerieTrackAndHistory(arg.serie, arg.episode, arg.timestamp)
        .then(() => event.reply('/update/serie/track/and/history/', { success: true, data: arg.episode }))
        .catch(error => event.reply('/update/serie/track/and/history/', { success: false, error }));
})

// update all series episodes viewed flag
ipcMain.on('/update/all/series/episodes/viewed/flag/', (event, arg) => {
    new SerieTrackDAO().updateAllSeriesEpisodesViewedFlag(arg.series, arg.viewed)
        .then(() => event.reply('/update/all/series/episodes/viewed/flag/', { success: true, data: null }))
        .catch(error => event.reply('/update/all/series/episodes/viewed/flag/', { success: false, error }));
})

// Read episode by link
ipcMain.on('/read/episode/by/link/', (event, arg) => {
    new SerieEpisodeDAO().getEpisodeByLink(arg)
        .then((retrievedEpisode) => event.reply('/read/episode/by/link/', { success: true, data: retrievedEpisode }))
        .catch(error => event.reply('/read/episode/by/link/', { success: false, error }));
})


// Read episode by serie id and episode id
ipcMain.on('/read/all/episodes/by/serie/link/', (event, arg) => {
    new SerieEpisodeDAO().getAllEpisodesBySerieLink(arg)
        .then((retrievedEpisodes) => event.reply('/read/all/episodes/by/serie/link/', { success: true, data: retrievedEpisodes }))
        .catch(error => event.reply('/read/all/episodes/by/serie/link/', { success: false, error }));
})

// Read all episodes by serie id
ipcMain.on('/read/all/episodes/by/serie/id/', (event, arg) => {
    new SerieEpisodeDAO().getAllEpisodesBySerieId(arg)
        .then((retrievedEpisodes) => event.reply('/read/all/episodes/by/serie/id/', { success: true, data: retrievedEpisodes }))
        .catch(error => event.reply('/read/all/episodes/by/serie/id/', { success: false, error }));
})