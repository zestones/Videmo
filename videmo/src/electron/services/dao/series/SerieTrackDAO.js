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

    // Create a serie track entry
    async createSerieTrack(serieId, episodeId) {
        const sql = `INSERT INTO Track (serie_id, episode_id) VALUES (?, ?)`;
        const params = [serieId, episodeId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async getAllTracks() {
        const sql = `SELECT * FROM Track`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Get tracks by serie id and episode id
    async getSerieTrackBySerieIdAndEpisodeId(serieId, episodeId) {
        const sql = `SELECT * FROM Track WHERE serie_id = ? AND episode_id = ?`;
        const params = [serieId, episodeId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Get all track of a serie if it exists or create it
    async #getOrCreateSerie(serieParsedObject) {
        let retrievedSerie = await this.serieDAO.getSerieByLink(serieParsedObject.link);
        if (!retrievedSerie) {
            await this.serieDAO.createSerie({ ...serieParsedObject, inLibrary: 0 });
            retrievedSerie = await this.serieDAO.getSerieByLink(serieParsedObject.link);
        }
        return retrievedSerie;
    }

    // Create or update an episode track
    async #createOrUpdateEpisode(episodeParsedObject) {
        let retrievedEpisode = await this.serieEpisodeDAO.getEpisodeByLink(episodeParsedObject.link);

        if (!retrievedEpisode) await this.serieEpisodeDAO.createEpisode(episodeParsedObject);
        else await this.serieEpisodeDAO.updateEpisode({ ...episodeParsedObject, id: retrievedEpisode.id });

        return await this.serieEpisodeDAO.getEpisodeByLink(episodeParsedObject.link)
    }

    // Create a serie track if it does not exist
    async #createSerieTrackIfNotExist(serieId, episodeId) {
        const serieTrackExists = await this.getSerieTrackBySerieIdAndEpisodeId(serieId, episodeId);
        if (!serieTrackExists) {
            await this.createSerieTrack(serieId, episodeId);
        }
    }
    
    // Update a serie track entry
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