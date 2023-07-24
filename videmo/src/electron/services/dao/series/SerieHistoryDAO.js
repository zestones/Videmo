const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const SerieTrackDAO = require('./SerieTrackDAO');
const SerieEpisodeDAO = require('./SerieEpisodeDAO');

class SerieHistoryDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
        this.serieTrackDAO = new SerieTrackDAO();
        this.serieEpisodeDAO = new SerieEpisodeDAO();
    }

    async updateSerieTrackAndHistory(serie, episode, timestamp) {
        // We start by updating the serie track
        await this.serieTrackDAO.updateSerieTrack(serie, episode);

        // And then we update the history
        return this.#manageSerieHistory(JSON.parse(episode), timestamp);
    }

    // Manage serie history (create or update)
    async #manageSerieHistory(episode, timestamp) {
        const retrievedEpisode = await this.serieEpisodeDAO.getEpisodeByLink(episode.link);
        const retrievedHistory = await this.readSerieHistoryByEpisodeId(retrievedEpisode.id);

        if (retrievedHistory) return await this.updateSerieHistory(retrievedEpisode, timestamp);
        else return await this.createSerieHistory(retrievedEpisode, timestamp);
    }

    // Update serie history
    async updateSerieHistory(episode, timestamp) {
        const query = `UPDATE History SET timestamp = ? WHERE episode_id = ?`;
        const params = [timestamp, episode.id];

        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Create serie history
    async createSerieHistory(episode, date) {
        const query = `INSERT INTO History (episode_id, timestamp) VALUES (${episode.id}, ?)`;
        const params = [date];

        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Read serie history by episode id
    async readSerieHistoryByEpisodeId(episodeId) {
        const query = `SELECT * FROM History WHERE episode_id = ?`;
        const params = [episodeId];

        return await this.queryExecutor.executeAndFetchOne(query, params);
    }

    async readAllEpisodeAndSerieFromHistory() {
        const query = `SELECT 
                    Serie.id AS serie_id,
                    Serie.basename AS serie_basename,
                    Serie.name AS serie_name,
                    Serie.description AS serie_description,
                    Serie.link AS serie_link,
                    Serie.image AS serie_image,
                    Serie.inLibrary AS serie_inLibrary,
                    Extension.link AS extension_link,
                    Extension.name AS extension_name,
                    Extension.local AS extension_local,
                    Episode.id AS episode_id,
                    Episode.name AS episode_name,
                    Episode.link AS episode_link,
                    Episode.viewed AS episode_viewed,
                    Episode.bookmarked AS episode_bookmarked,
                    Episode.played_time AS episode_played_time,
                    History.timestamp AS history_timestamp
                    FROM History
                    INNER JOIN Episode ON History.episode_id = Episode.id
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Track.serie_id = Serie.id
                    INNER JOIN Extension ON Serie.extension_id = Extension.id
                    GROUP BY History.id
                    ORDER BY History.timestamp DESC`;


        const result = await this.queryExecutor.executeAndFetchAll(query);

        return this.#organizeObject(result);
    }

    #organizeObject(result) {
        return result.map((item) => {
            const { serie_id, serie_basename, serie_name, serie_description, serie_link, serie_image, serie_inLibrary,
                extension_link, extension_name, extension_local,
                episode_id, episode_name, episode_link, episode_viewed, episode_bookmarked, episode_played_time,
                history_timestamp } = item;
            return {
                serie: {
                    id: serie_id,
                    basename: serie_basename,
                    name: serie_name,
                    description: serie_description,
                    link: serie_link,
                    image: serie_image,
                    inLibrary: this.dataTypesConverter.convertIntegerToBoolean(serie_inLibrary),
                },
                episode: {
                    id: episode_id,
                    name: episode_name,
                    link: episode_link,
                    viewed: this.dataTypesConverter.convertIntegerToBoolean(episode_viewed),
                    bookmarked: this.dataTypesConverter.convertIntegerToBoolean(episode_bookmarked),
                    played_time: episode_played_time,
                },
                extension: {
                    link: extension_link,
                    name: extension_name,
                    local: this.dataTypesConverter.convertIntegerToBoolean(extension_local),
                },
                history: {
                    timestamp: this.dataTypesConverter.convertTimestampToDate(history_timestamp),
                }
            };
        });
    }

}

module.exports = SerieHistoryDAO;