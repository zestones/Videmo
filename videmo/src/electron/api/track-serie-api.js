const { ipcMain } = require('electron');

const SerieTrackDAO = require('../services/dao/series/SerieTrackDAO');
const SerieEpisodeDAO = require('../services/dao/series/SerieEpisodeDAO');
const DataTypesConverter = require('../utilities/converter/DataTypesConverter.js');

// Add episode to bookmark
ipcMain.on('/add/episode/to/bookmarks', async (event, arg) => {
    await new SerieTrackDAO()
        .updateSerieTrack(arg.serie, arg.episode);

    event.reply('/add/episode/to/bookmarks', { success: true, episode: arg.episode });
})

// Read episode by link
ipcMain.on('/read/episode/by/link', async (event, arg) => {
    new SerieEpisodeDAO().getEpisodeByLink(arg)
        .then((retrievedEpisode) => {
            if (retrievedEpisode) {
                const dataTypesConverter = new DataTypesConverter();
                retrievedEpisode.viewed = dataTypesConverter.convertIntegerToBoolean(retrievedEpisode.viewed);
                retrievedEpisode.bookmarked = dataTypesConverter.convertIntegerToBoolean(retrievedEpisode.bookmarked);
            }
            event.reply('/read/episode/by/link', { success: true, episode: retrievedEpisode });
        })
        .catch(error => event.reply('/read/episode/by/link', { success: false, error }));
})


// Read episode by serie id and episode id
ipcMain.on('/read/all/episodes/by/serie/link', async (event, arg) => {
    new SerieEpisodeDAO().readAllEpisodesBySerieLink(arg)
        .then((retrievedEpisodes) => {
            const dataTypesConverter = new DataTypesConverter();
            retrievedEpisodes.forEach(episode => {
                episode.viewed = dataTypesConverter.convertIntegerToBoolean(episode.viewed);
                episode.bookmarked = dataTypesConverter.convertIntegerToBoolean(episode.bookmarked);
            });
            event.reply('/read/all/episodes/by/serie/link', { success: true, episodes: retrievedEpisodes });
        })
        .catch(error => event.reply('/read/all/episodes/by/serie/link', { success: false, error }));
})