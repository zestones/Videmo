const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const SerieTrackDAO = require('./SerieTrackDAO');
const SerieEpisodeDAO = require('./SerieEpisodeDAO');
const SerieInfosDAO = require('./SerieInfosDAO');

class SerieHistoryDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
        this.serieEpisodeDAO = new SerieEpisodeDAO();
        this.serieTrackDAO = new SerieTrackDAO();
        this.serieInfosDAO = new SerieInfosDAO();
    }

    // Create serie history
    async createSerieHistory(episode, date) {
        const query = `INSERT INTO History (episode_id, timestamp) VALUES (${episode.id}, ?)`;
        const params = [date];

        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Get all history
    async getAllHistory() {
        const query = `SELECT * FROM History`;
        return await this.queryExecutor.executeAndFetchAll(query);
    }

    // Read serie history by episode id
    async getSerieHistoryByEpisodeId(episodeId) {
        const query = `SELECT * FROM History WHERE episode_id = ?`;
        const params = [episodeId];

        return await this.queryExecutor.executeAndFetchOne(query, params);
    }

    // Read all episodes and series from history
    async getAllEpisodeAndSerieFromHistory() {
        const query = `SELECT 
                        Serie.id AS serie_id,
                        Serie.basename AS serie_basename,
                        Serie.name AS serie_name,
                        Serie.link AS serie_link,
                        Serie.image AS serie_image,
                        Serie.inLibrary AS serie_inLibrary,
                        Serie.extension_id AS serie_extension_id,
                        Serie.parent_id AS serie_parent_id,
                        SerieInfos.description AS serie_infos_description,
                        SerieInfos.duration AS serie_infos_duration,
                        SerieInfos.rating AS serie_infos_rating,
                        SerieInfos.release_date AS serie_infos_releaseDate,
                        GROUP_CONCAT(Genre.name) AS serie_genres,
                        Extension.id AS extension_id,
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
                            LEFT JOIN SerieInfos ON Serie.id = SerieInfos.serie_id
                            LEFT JOIN SerieGenre ON SerieInfos.serie_id = SerieGenre.serie_id
                            LEFT JOIN Genre ON SerieGenre.genre_id = Genre.id
                            INNER JOIN Extension ON Serie.extension_id = Extension.id
                        GROUP BY History.id
                        ORDER BY History.timestamp DESC`;

        const result = await this.queryExecutor.executeAndFetchAll(query);
        return this.#organizeObject(result);
    }

    // Organize the retrieved data
    #organizeObject(result) {
        return result.map((item) => {
            const { serie_id, serie_basename, serie_name, serie_link, serie_image, serie_inLibrary, serie_extension_id, serie_parent_id,
                serie_infos_description, serie_infos_duration, serie_infos_rating, serie_infos_releaseDate,
                serie_genres,
                extension_id, extension_link, extension_name, extension_local,
                episode_id, episode_name, episode_link, episode_viewed, episode_bookmarked, episode_played_time,
                history_timestamp } = item;
            return {
                serie: {
                    id: serie_id,
                    basename: serie_basename,
                    extension_id: serie_extension_id,
                    name: serie_name,
                    link: serie_link,
                    infos: {
                        description: serie_infos_description,
                        duration: serie_infos_duration,
                        rating: serie_infos_rating,
                        release_date: serie_infos_releaseDate,
                        genres: serie_genres?.split(',').map((genre) => ({ name: genre })),
                    },
                    image: serie_image,
                    inLibrary: this.dataTypesConverter.convertIntegerToBoolean(serie_inLibrary),
                    parent_id: serie_parent_id,
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
                    id: extension_id,
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

    // Update serie track and history
    async updateSerieTrackAndHistory(serie, episode, timestamp) {
        // We start by updating the serie track
        await this.serieTrackDAO.updateSerieTrack(serie, JSON.stringify([JSON.parse(episode)]));

        // And then we update the history
        return this.#manageSerieHistory(JSON.parse(episode), timestamp);
    }

    // Manage serie history (create or update)
    async #manageSerieHistory(episode, timestamp) {
        const retrievedEpisode = await this.serieEpisodeDAO.getEpisodeByLink(episode.link);
        const retrievedHistory = await this.getSerieHistoryByEpisodeId(retrievedEpisode.id);

        if (retrievedHistory) return await this.updateSerieHistory(retrievedEpisode, timestamp);
        else return await this.createSerieHistory(retrievedEpisode, timestamp);
    }

    // Update serie history
    async updateSerieHistory(episode, timestamp) {
        const query = `UPDATE History SET timestamp = ? WHERE episode_id = ?`;
        const params = [timestamp, episode.id];

        return await this.queryExecutor.executeAndCommit(query, params);
    }
    
    // Delete serie history by episode id
    async deleteSerieHistoryByEpisodeId(episodeId) {
        const query = `DELETE FROM History WHERE episode_id = ?`;
        const params = [episodeId];

        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Delete all serie history
    async deleteAllSerieHistory() {
        const query = `DELETE FROM History`;
        return await this.queryExecutor.executeAndCommit(query);
    }
}

module.exports = SerieHistoryDAO;