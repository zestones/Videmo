const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const SerieEpisodeDAO = require('./SerieEpisodeDAO');
const SerieDAO = require('../series/SerieDAO');


class SerieTrackDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
        this.serieEpisodeDAO = new SerieEpisodeDAO();
        this.serieDAO = new SerieDAO();
    }

    async createSerieTrack(serieId, episodeId) {
        const sql = `INSERT INTO Track (serie_id, episode_id) VALUES (?, ?)`;
        const params = [serieId, episodeId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async getSerieTrackBySerieIdAndEpisodeId(serieId, episodeId) {
        const sql = `SELECT * FROM Track WHERE serie_id = ? AND episode_id = ?`;
        const params = [serieId, episodeId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    async #getOrCreateSerie(serieParsedObject) {
        let retrievedSerie = await this.serieDAO.getSerieByBasenameAndNameAndLink(serieParsedObject);
        if (!retrievedSerie) {
            await this.serieDAO.createSerie(serieParsedObject);
            retrievedSerie = await this.serieDAO.getSerieByBasenameAndNameAndLink(serieParsedObject);
        }
        return retrievedSerie;
    }

    async #createOrUpdateEpisode(episodeParsedObject) {
        let retrievedEpisode = await this.serieEpisodeDAO.getEpisodeByLink(episodeParsedObject.link);

        if (!retrievedEpisode) await this.serieEpisodeDAO.createEpisode(episodeParsedObject);
        else await this.serieEpisodeDAO.updateEpisode({ ...episodeParsedObject, id: retrievedEpisode.id });

        return await this.serieEpisodeDAO.getEpisodeByLink(episodeParsedObject.link)
    }

    async #createSerieTrackIfNotExist(serieId, episodeId) {
        const serieTrackExists = await this.getSerieTrackBySerieIdAndEpisodeId(serieId, episodeId);
        if (!serieTrackExists) {
            await this.createSerieTrack(serieId, episodeId);
        }
    }

    async updateSerieTrack(serie, episode) {
        const serieParsedObject = JSON.parse(serie);
        const episodeParsedObject = JSON.parse(episode);

        const retrievedSerie = await this.#getOrCreateSerie(serieParsedObject);
        const retrievedEpisode = await this.#createOrUpdateEpisode(episodeParsedObject);

        await this.#createSerieTrackIfNotExist(retrievedSerie.id, retrievedEpisode.id);
    }

    // Delete a serie track entry
    async deleteSerieTrack(serieId, episodeId) {
        const sql = `DELETE FROM Track WHERE serie_id = ? AND episode_id = ?`;
        const params = [serieId, episodeId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieTrackDAO;