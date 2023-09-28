const { ipcMain } = require('electron');

const LocalFileScrapper = require('../services/sources/local/local-file-scrapper');

const SerieCategoryDAO = require('../services/dao/series/SerieCategoryDAO');
const SerieEpisodeDAO = require('../services/dao/series/SerieEpisodeDAO');
const ExtensionDAO = require('../services/dao/settings/ExtensionsDAO');
const SerieInfosDAO = require('../services/dao/series/SerieInfosDAO');
const SerieTrackDAO = require('../services/dao/series/SerieTrackDAO');
const SerieDAO = require('../services/dao/series/SerieDAO');


const Vostfree = require('../services/sources/external/anime/fr/vostfree/Vostfree');


// Read categories by serie id
ipcMain.on('/read/serie-categories/by/serie/link/', (event, arg) => {
    new SerieCategoryDAO().getSerieCategoryIdsBySerieLink(arg.link)
        .then((categories) => event.reply('/read/serie-categories/by/serie/link/', { success: true, categories: categories }))
        .catch((err) => event.reply('/read/serie-categories/by/serie/link/', { success: false, error: err }));
})

// Read all serie categories by serie link array
ipcMain.on('/read/serie-categories/by/serie/link/array/', (event, arg) => {
    new SerieCategoryDAO().getSerieCategoryIdsBySerieLinkArray(arg.links)
        .then((categories) => event.reply('/read/serie-categories/by/serie/link/array/', { success: true, categories: categories }))
        .catch((err) => event.reply('/read/serie-categories/by/serie/link/array/', { success: false, error: err }));
})

// Add Serie to Category
ipcMain.on('/add/categories/to/serie/', async (event, arg) => {

    const serieDAO = new SerieDAO();
    const extensionDAO = new ExtensionDAO();
    const serieInfosDAO = new SerieInfosDAO();

    const extension = await extensionDAO.getExtensionById(arg.series[0].extension_id);

    // TODO : SHOULD ADD A CHECK TO SEE IF THE SERIE IS A LOCAL SERIE
    // TODO : DISABLE BATCH MDOFICATION OF THE SERIES FROM THE EXPLORER PAGE

    // We scrap the serie if needed (if we are inside the explorer page)
    if (arg.shouldUpdateSeries) {
        if (extension.local) {
            // We scrap the series
            for (const serie of arg.series) {

                // We scrap the serie
                const scrapper = new LocalFileScrapper(extension.link, serie.link);
                await scrapper.scrap();


                // We update the serie infos - the infos are all the same for all the children
                if (serie.infos) {
                    const retrievedSerie = await serieDAO.getSerieByLink(serie.link);
                    await serieInfosDAO.updateSerieInfos(retrievedSerie.id, serie.infos);
                }
            }
        } else {
            // TODO : Add a Manager to manage the scrapers

            // Create the series that are not present in the database
            await serieDAO.createSeriesIfMissing(arg.series);
            for (const serie of arg.series) {
                // We scrap the serie episodes
                const episodes = await new Vostfree().scrapeEpisodes(serie.link);
                // Initialize the episodes with default values
                episodes.forEach(episode => {
                    episode.played_time = 0;
                    episode.bookmarked = false;
                    episode.viewed = false;
                    episode.hash = "";
                });

                const retrievedSerie = await serieDAO.getSerieByLink(serie.link);
                for (const episode of episodes) {
                    const existEpisode = await new SerieEpisodeDAO().getEpisodeByLink(episode.link);
                    if (!existEpisode) {
                        const childEpisode = await new SerieEpisodeDAO().createEpisode(episode);
                        await new SerieTrackDAO().createSerieTrack(retrievedSerie.id, childEpisode.id);
                    }
                }

                if (!serie.infos) await serieInfosDAO.createSerieInfo(retrievedSerie.id, { numberOfEpisodes: episodes.length });
                else {
                    serie.infos.numberOfEpisodes = episodes.length;
                    await serieInfosDAO.updateSerieInfos(retrievedSerie.id, serie.infos);
                }
            }
        }
    }

    await new SerieCategoryDAO().updateSerieCategories(arg.series, arg.associationSerieCategory)
        .then((categories) => event.reply('/add/categories/to/serie/', { success: true, categories: categories }))
        .catch((err) => event.reply('/add/categories/to/serie/', { success: false, error: err }));
})

// last opened category update
ipcMain.on('/update/last/opened/category/', (event, arg) => {
    new SerieCategoryDAO().updateLastOpenedCategory(arg.id)
        .then(() => event.reply('/update/last/opened/category/', { success: true }))
        .catch((err) => event.reply('/update/last/opened/category/', { success: false, error: err }));
})

// Read last opened category
ipcMain.on('/read/last/opened/category/', (event) => {
    new SerieCategoryDAO().getLastOpenedCategory()
        .then((category) => event.reply('/read/last/opened/category/', { success: true, category: category }))
        .catch((err) => event.reply('/read/last/opened/category/', { success: false, error: err }));
})