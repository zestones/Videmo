const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const SerieDAO = require('./SerieDAO');

class SerieEpisodeDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
        this.serieDAO = new SerieDAO();
    }

    // Insert a new episode in the Episode table
    async createEpisode(episode) {
        const sql = `INSERT INTO Episode (name, link, viewed, bookmarked, played_time, hash, serverName) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            episode.name,
            episode.link,
            this.dataTypesConverter.convertBooleanToInteger(episode.viewed),
            this.dataTypesConverter.convertBooleanToInteger(episode.bookmarked),
            episode.played_time,
            episode.hash,
            episode?.serverName
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

        const result = await this.queryExecutor.executeAndFetchOne(sql, params);
        if (result) {
            result.viewed = this.dataTypesConverter.convertIntegerToBoolean(result.viewed);
            result.bookmarked = this.dataTypesConverter.convertIntegerToBoolean(result.bookmarked);
        }

        return result;
    }

    // Get all episodes by a serie link
    async getAllEpisodesBySerieLink(link) {
        const sql = `SELECT Episode.* FROM Episode
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Serie.id = Track.serie_id
                    WHERE Serie.link = ? ORDER BY CAST(SUBSTRING(Episode.name, 8) AS SIGNED);`;
        const params = [link];

        const result = await this.queryExecutor.executeAndFetchAll(sql, params);
        return result.map(episode => {
            episode.viewed = this.dataTypesConverter.convertIntegerToBoolean(episode.viewed);
            episode.bookmarked = this.dataTypesConverter.convertIntegerToBoolean(episode.bookmarked);
            return episode;
        }).reverse();
    }

    // Get all episodes by a serie id
    async getAllEpisodesBySerieId(serieId) {
        const sql = `SELECT Episode.* FROM Episode
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Serie.id = Track.serie_id
                    WHERE Serie.id = ? ORDER BY CAST(SUBSTRING(Episode.name, 8) AS SIGNED);`;
        const params = [serieId];

        const result = await this.queryExecutor.executeAndFetchAll(sql, params);
        return result.map(episode => {
            episode.viewed = this.dataTypesConverter.convertIntegerToBoolean(episode.viewed);
            episode.bookmarked = this.dataTypesConverter.convertIntegerToBoolean(episode.bookmarked);
            return episode;
        }).reverse();
    }

    // Get all episodes by a table of serie links
    async getAllEpisodesBySerieLinks(links) {
        const seriesChilds = await this.serieDAO.getSeriesChildrenByLinks(links);
        const childsLinks = seriesChilds.map(serie => serie.link);

        // Initialize an array to store link conditions
        const linkConditions = [];

        // Generate a condition for each link
        childsLinks.forEach(_ => linkConditions.push("Serie.link = ?"));

        // Combine link conditions with the OR operator
        const linkCondition = linkConditions.join(" OR ");

        const sql = `SELECT Episode.* FROM Episode
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Serie.id = Track.serie_id
                    WHERE ${linkCondition}`;

        const params = childsLinks; // Use the childsLinks array as parameters
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        // Convert integer columns to boolean
        return result.map(episode => {
            episode.viewed = this.dataTypesConverter.convertIntegerToBoolean(episode.viewed);
            episode.bookmarked = this.dataTypesConverter.convertIntegerToBoolean(episode.bookmarked);
            return episode;
        });
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

    // Update all episodes viewed flag
    async updateAllEpisodesViewedFlag(episodeIds, viewed) {
        const sql = `UPDATE Episode SET viewed = ? WHERE id IN (?)`;
        const params = episodeIds.map(episodeId => [this.dataTypesConverter.convertBooleanToInteger(viewed), episodeId]);
        await this.queryExecutor.executeManyAndCommit(sql, params);
    }

    async deleteEpisodeById(id) {
        const sql = `DELETE FROM Episode WHERE id = ?`;
        const params = [id];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}


module.exports = SerieEpisodeDAO;