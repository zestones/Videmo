const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const SerieDAO = require('../series/SerieDAO');
const SerieGenreDAO = require('../series/SerieGenreDAO');


class SerieInfosDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
        this.serieDAO = new SerieDAO();
        this.serieGenreDAO = new SerieGenreDAO();
    }

    // Create a serie info entry
    async createSerieInfo(serieId, infos) {
        const sql = `INSERT INTO SerieInfos 
                    (serie_id, description, duration, rating, releaseDate, number_of_episodes, total_viewed_episodes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

        const params = [serieId, infos?.description, infos?.duration, infos?.rating, infos?.releaseDate, infos.numberOfEpisodes ?? 0, infos.totalViewedEpisodes ?? 0];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async getSerieInfoBySerieId(serieId) {
        const sql = `SELECT * FROM SerieInfos WHERE serie_id = ?`;
        const params = [serieId];

        const serieInfos = await this.queryExecutor.executeAndFetchOne(sql, params);
        const serieGenres = await this.serieGenreDAO.getSerieGenreBySerieId(serieId);

        return { ...serieInfos, genres: serieGenres };
    }

    async #getSerieInfoBySerieId(serieId) {
        const sql = `SELECT * FROM SerieInfos WHERE serie_id = ?`;
        const params = [serieId];

        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Update the total number of episodes of a serie
    async updateSerieTotalEpisodes(serieId, numberOfEpisodes) {
        const sql = `UPDATE SerieInfos SET number_of_episodes = ? WHERE serie_id = ?`;
        const params = [numberOfEpisodes, serieId];
        
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Update the number of episodes viewed of a serie
    async updateSerieEpisodesViewed(serieId, numberOfViewedEpisodes) {
        const sql = `UPDATE SerieInfos SET total_viewed_episodes = ? WHERE serie_id = ?`;
        const params = [numberOfViewedEpisodes, serieId];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Update a serie info entry
    async updateSerieInfos(serieId, infos) {

        // We check if an entry exists
        const serieInfoExists = await this.#getSerieInfoBySerieId(serieId);
        
        // If it does not exist, we create it
        if (!serieInfoExists) await this.createSerieInfo(serieId, infos);
        else await this.#updateSerieInfos(serieId, infos);

        // We finally update the genres
        if (infos.genres) await this.serieGenreDAO.updateSerieGenres(serieId, infos.genres);
    }

    async #updateSerieInfos(serieId, infos) {
        const sql = `UPDATE SerieInfos SET description = ?, duration = ?, rating = ?, releaseDate = ? WHERE serie_id = ?`;
        const params = [infos.description, infos.duration, infos.rating, infos.releaseDate, serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async updateNumberOfEpisodesWithIncrement(serieId, increment) {
        const sql = `UPDATE SerieInfos SET number_of_episodes = number_of_episodes + ? WHERE serie_id = ?`;
        const params = [increment, serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Get all serie infos
    async getAllSerieInfos() {
        const sql = `SELECT * FROM SerieInfos`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }
}

module.exports = SerieInfosDAO;
