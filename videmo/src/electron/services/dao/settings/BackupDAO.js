const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const QueryExecutor = require('../../sqlite/QueryExecutor');
const SerieCategoryDAO = require('../series/SerieCategoryDAO');
const SerieDAO = require('../series/SerieDAO');
const SerieEpisodeDAO = require('../series/SerieEpisodeDAO');
const SerieHistoryDAO = require('../series/SerieHistoryDAO');
const SerieTrackDAO = require('../series/SerieTrackDAO');
const CategoriesDAO = require('./CategoriesDAO');
const ExtensionsDAO = require('./ExtensionsDAO');


class BackupDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();

        this.serieDAO = new SerieDAO();
        this.serieCategoryDAO = new SerieCategoryDAO();
        this.serieEpisodeDAO = new SerieEpisodeDAO();
        this.serieHistoryDAO = new SerieHistoryDAO();
        this.serieTrackDAO = new SerieTrackDAO();
        this.categoriesDAO = new CategoriesDAO();
        this.extensionsDAO = new ExtensionsDAO();
    }

    async generateBackup() {
        const data = await this.getAllData();
        const date = new Date();
        const fileName = `backup-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.sql`;

        const downloadsPath = app.getPath('downloads');
        const filePath = path.join(downloadsPath, fileName);

        await this.#writeBackupToFile(filePath, data);

        return path;
    }

    async restoreBackup(filePath) {
        return await this.queryExecutor.executeFile(filePath); 
    }

    async getAllData() {
        const series = await this.serieDAO.getAllSeries();
        const parsedSeries = this.#generateInsertSeriesStatements(series);

        const categories = await this.categoriesDAO.getAllCategories();
        const parsedCategories = this.#generateInsertCategoriesStatements(categories);

        const extensions = await this.extensionsDAO.getAllExtensions();
        const parsedExtensions = this.#generateInsertExtensionsStatements(extensions);

        const episodes = await this.serieEpisodeDAO.getAllEpisodes();
        const parsedEpisodes = this.#generateInsertEpisodesStatements(episodes);

        const tracks = await this.serieTrackDAO.getAllTracks();
        const parsedTracks = this.#generateInsertTracksStatements(tracks);

        const histories = await this.serieHistoryDAO.getAllHistory();
        const parsedHistories = this.#generateInsertHistoriesStatements(histories);

        const serieCategories = await this.serieCategoryDAO.getAllSerieCategories();
        const parsedSerieCategories = this.#generateInsertSerieCategoriesStatements(serieCategories);

        return 'BEGIN TRANSACTION;\n' +
            parsedSeries + '\n' +
            parsedCategories + '\n' +
            parsedExtensions + '\n' +
            parsedEpisodes + '\n' +
            parsedTracks + '\n' +
            parsedHistories + '\n' +
            parsedSerieCategories + '\n' +
            'COMMIT;';
    }

    // The generate function transform the data from the database, 
    // to an sql insert statement that can be used to insert the data in the database,
    // in case of a restore. So it check if the data is already in the database.

    #generateInsertSeriesStatements(series) {
        return series.map(serie => `
            INSERT OR IGNORE INTO Serie (id, basename, name, link, image, inLibrary, extension_id)
            VALUES (${serie.id}, '${serie.basename}', '${serie.name}', '${serie.link}', '${serie.image}', ${serie.inLibrary}, ${serie.extension_id});
        `).join('');
    }

    #generateInsertCategoriesStatements(categories) {
        return categories.map(category => `
            INSERT OR IGNORE INTO Category (id, name)
            VALUES (${category.id}, '${category.name}');
        `).join('');
    }

    #generateInsertExtensionsStatements(extensions) {
        return extensions.map(extension => `
            INSERT OR IGNORE INTO Extension (id, link, name, local)
            VALUES (${extension.id}, '${extension.link}', '${extension.name}', ${extension.local});
        `).join('');
    }

    #generateInsertEpisodesStatements(episodes) {
        return episodes.map(episode => `
            INSERT OR IGNORE INTO Episode (id, name, link, viewed, bookmarked, played_time)
            VALUES (${episode.id}, '${episode.name}', '${episode.link}', ${episode.viewed}, ${episode.bookmarked}, ${episode.played_time});
        `).join('');
    }

    #generateInsertTracksStatements(tracks) {
        return tracks.map(track => `
            INSERT OR IGNORE INTO Track (id, serie_id, episode_id)
            VALUES (${track.id}, ${track.serie_id}, ${track.episode_id});
        `).join('');
    }

    #generateInsertHistoriesStatements(histories) {
        return histories.map(history => `
            INSERT OR IGNORE INTO History (id, episode_id, timestamp)
            VALUES (${history.id}, ${history.episode_id}, ${history.timestamp});
        `).join('');
    }

    #generateInsertSerieCategoriesStatements(serieCategories) {
        return serieCategories.map(serieCategory => `
            INSERT OR IGNORE INTO SerieCategory (id, serie_id, category_id)
            VALUES (${serieCategory.id}, ${serieCategory.serie_id}, ${serieCategory.category_id});
        `).join('');
    }

    async #writeBackupToFile(path, data) {
        try {
            await fs.promises.writeFile(path, data);
        } catch (error) {
            throw new Error(`Error while writing backup to file: ${error}`);
        }
    }
}


module.exports = BackupDAO;