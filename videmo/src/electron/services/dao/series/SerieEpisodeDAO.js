const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');


class SerieEpisodeDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Insert a new episode in the Episode table
    async createEpisode(episode) {
        const sql = `INSERT INTO Episode (name, link, viewed, bookmarked, played_time, hash) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            episode.name,
            episode.link,
            this.dataTypesConverter.convertBooleanToInteger(episode.viewed),
            this.dataTypesConverter.convertBooleanToInteger(episode.bookmarked),
            episode.played_time,
            episode.hash
        ];
        await this.queryExecutor.executeAndCommit(sql, params);
        return await this.getEpisodeByLink(episode.link);
    }

    async getAllEpisodes() {
        const sql = `SELECT * FROM Episode`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Get an episode by its link
    async getEpisodeByLink(link) {
        const sql = `SELECT * FROM Episode WHERE link = ?`;
        const params = [link];

        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Get all episodes by a serie link
    async getAllEpisodesBySerieLink(link) {
        const sql = `SELECT Episode.* FROM Episode
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Serie.id = Track.serie_id
                    WHERE Serie.link = ?`;
        const params = [link];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Get all episodes by a serie id
    async getAllEpisodesBySerieId(serieId) {
        const sql = `SELECT Episode.* FROM Episode
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Serie.id = Track.serie_id
                    WHERE Serie.id = ?`;
        const params = [serieId];

        const result = await this.queryExecutor.executeAndFetchAll(sql, params);
        return result.map(episode => {
            episode.viewed = this.dataTypesConverter.convertIntegerToBoolean(episode.viewed);
            episode.bookmarked = this.dataTypesConverter.convertIntegerToBoolean(episode.bookmarked);
            return episode;
        }).reverse();
    }

    // Update an episode in the Episode table
    async updateEpisode(episode) {
        const sql = `UPDATE Episode SET viewed = ?, bookmarked = ?, played_time = ? WHERE id = ?`;
        const params = [
            this.dataTypesConverter.convertBooleanToInteger(episode.viewed),
            this.dataTypesConverter.convertBooleanToInteger(episode.bookmarked),
            episode.played_time,
            episode.id
        ];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async deleteEpisodeById(id) {
        const sql = `DELETE FROM Episode WHERE id = ?`;
        const params = [id];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}


module.exports = SerieEpisodeDAO;