const { ipcMain } = require('electron');

const SerieTrackDAO = require('../services/dao/series/SerieTrackDAO');
const SerieEpisodeDAO = require('../services/dao/series/SerieEpisodeDAO');
const SerieHistoryDAO = require('../services/dao/series/SerieHistoryDAO');
const DataTypesConverter = require('../utilities/converter/DataTypesConverter');

// update serie track
ipcMain.on('/update/serie/track/', async (event, arg) => {
    await new SerieTrackDAO().updateSerieTrack(arg.serie, arg.episodes)
        .then(() => event.reply('/update/serie/track/', { success: true, episode: arg.episode }))
        .catch(error => event.reply('/update/serie/track/', { success: false, error }));
})

// update serie track and history
ipcMain.on('/update/serie/track/and/history/', async (event, arg) => {
    // And then we update the history
    await new SerieHistoryDAO().updateSerieTrackAndHistory(arg.serie, arg.episode, arg.timestamp)
        .then(() => event.reply('/update/serie/track/and/history/', { success: true, episode: arg.episode }))
        .catch(error => event.reply('/update/serie/track/and/history/', { success: false, error }));
})

// update all series episodes viewed flag
ipcMain.on('/update/all/series/episodes/viewed/flag/', async (event, arg) => {
    await new SerieTrackDAO().updateAllSeriesEpisodesViewedFlag(arg.series, arg.viewed)
        .then(() => event.reply('/update/all/series/episodes/viewed/flag/', { success: true}))
        .catch(error => event.reply('/update/all/series/episodes/viewed/flag/', { success: false, error }));
})

// Read episode by link
ipcMain.on('/read/episode/by/link/', async (event, arg) => {
    new SerieEpisodeDAO().getEpisodeByLink(arg)
        .then((retrievedEpisode) => {
            if (retrievedEpisode) {
                const dataTypesConverter = new DataTypesConverter();
                retrievedEpisode.viewed = dataTypesConverter.convertIntegerToBoolean(retrievedEpisode.viewed);
                retrievedEpisode.bookmarked = dataTypesConverter.convertIntegerToBoolean(retrievedEpisode.bookmarked);
            }
            event.reply('/read/episode/by/link/', { success: true, episode: retrievedEpisode });
        })
        .catch(error => event.reply('/read/episode/by/link/', { success: false, error }));
})


// Read episode by serie id and episode id
ipcMain.on('/read/all/episodes/by/serie/link/', async (event, arg) => {
    new SerieEpisodeDAO().getAllEpisodesBySerieLink(arg)
        .then((retrievedEpisodes) => {
            const dataTypesConverter = new DataTypesConverter();
            retrievedEpisodes.forEach(episode => {
                episode.viewed = dataTypesConverter.convertIntegerToBoolean(episode.viewed);
                episode.bookmarked = dataTypesConverter.convertIntegerToBoolean(episode.bookmarked);
            });
            event.reply('/read/all/episodes/by/serie/link/', { success: true, episodes: retrievedEpisodes });
        })
        .catch(error => event.reply('/read/all/episodes/by/serie/link/', { success: false, error }));
})

// Read all episodes by serie id
ipcMain.on('/read/all/episodes/by/serie/id/', async (event, arg) => {
    new SerieEpisodeDAO().getAllEpisodesBySerieId(arg)
        .then((retrievedEpisodes) => event.reply('/read/all/episodes/by/serie/id/', { success: true, episodes: retrievedEpisodes }))
        .catch(error => event.reply('/read/all/episodes/by/serie/id/', { success: false, error }));
})