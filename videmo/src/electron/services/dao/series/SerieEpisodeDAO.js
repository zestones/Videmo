const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');


class SerieEpisodeDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Insert a new episode in the Episode table
    async createEpisode(episode) {
        const sql = `INSERT INTO Episode (name, link, viewed, bookmarked, played_time) VALUES (?, ?, ?, ?, ?)`;
        const params = [
            episode.name,
            episode.link,
            this.dataTypesConverter.convertBooleanToInteger(episode.viewed),
            this.dataTypesConverter.convertBooleanToInteger(episode.bookmarked),
            episode.played_time
        ];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Get an episode by its link
    async getEpisodeByLink(link) {
        const sql = `SELECT * FROM Episode WHERE link = ?`;
        const params = [link];

        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Get all episodes by a serie
    async getAllEpisodesBySerieLink(link) {
        const sql = `SELECT Episode.* FROM Episode
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Serie.id = Track.serie_id
                    WHERE Serie.link = ?`;
        const params = [link];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
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

}


module.exports = SerieEpisodeDAO;