const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const SerieEpisodeDAO = require('./SerieEpisodeDAO');
const SerieDAO = require('../series/SerieDAO');
const SerieInfosDAO = require('../series/SerieInfosDAO');


class SerieTrackDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
        this.serieEpisodeDAO = new SerieEpisodeDAO();
        this.serieDAO = new SerieDAO();
        this.serieInfosDAO = new SerieInfosDAO();
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

    // Get track by episode id
    async getSerieTrackByEpisodeId(episodeId) {
        const sql = `SELECT * FROM Track WHERE episode_id = ?`;
        const params = [episodeId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Get all track of a serie if it exists or create it
    async #getOrCreateSerie(serieParsedObject) {
        let retrievedSerie = await this.serieDAO.getSerieByLink(serieParsedObject.link);

        if (!retrievedSerie) {
            await this.serieDAO.createSerie({ ...serieParsedObject, inLibrary: false });
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
    async updateSerieTrack(serie, episodes) {
        const serieParsedObject = JSON.parse(serie);
        const episodeParsedObject = JSON.parse(episodes);
        const retrievedSerie = await this.#getOrCreateSerie(serieParsedObject);

        for (const episode of episodeParsedObject) {

            const episodeBeforeUpdate = await this.serieEpisodeDAO.getEpisodeByLink(episode.link);
            const retrievedEpisode = await this.#createOrUpdateEpisode(episode);

            await this.#createSerieTrackIfNotExist(retrievedSerie.id, retrievedEpisode.id);

            if (episodeBeforeUpdate && episodeBeforeUpdate.viewed !== retrievedEpisode.viewed) {
                const viewed = retrievedEpisode.viewed;
                const parentSeries = await this.serieDAO.getAllParentSeries(retrievedSerie.link);

                for (const parentSerie of parentSeries) {
                    await this.serieInfosDAO.updateNumberOfEpisodesViewedWithIncrement(parentSerie.id, viewed ? 1 : -1);
                }
            }
        }
    }

    // Update all series episodes viewed flag
    async updateAllSeriesEpisodesViewedFlag(series, viewed) {
        // Retrieve all the episodes ids from the database
        const episodesFromDatabase = await this.serieEpisodeDAO.getAllEpisodesBySerieLinks(series.map(serie => serie.link));
        const episodesIdsFromDatabase = episodesFromDatabase.map(episode => episode.id);

        // Update the viewed flag for all the episodes
        await this.serieEpisodeDAO.updateAllEpisodesViewedFlag(episodesIdsFromDatabase, viewed);

        for (const serie of series) {
            // Check if the serie has child series
            const childSeries = await this.serieDAO.getSeriesChildrenByLinks([serie.link]);

            // 1. Set current series and child series to max (total number of episodes)
            // 1.1 If viewed is false we set the viewed number of episodes to 0
            for (const child of childSeries) {
                await this.serieInfosDAO.updateSerieEpisodesViewed(child.id, viewed ? child.number_of_episodes : 0);
            }

            // 2. Set parent series to the sum of viewed episodes of all child series
            if (!serie.parent_id) continue;
            await this.#updateParentSeriesViewedEpisodes(serie.parent_id);
        }
    }

    // Update parent series viewed episodes
    async #updateParentSeriesViewedEpisodes(parentId) {
        let parentSerie = await this.serieDAO.getSerieById(parentId);
        do {
            // If the serie has a parent serie
            const childrens = await this.serieDAO.getSerieChildren(parentSerie.id)

            let sumViewedEpisodes = 0;
            for (const child of childrens) {
                const infos = await this.serieInfosDAO.getSerieInfosBySerieId(child.id);
                sumViewedEpisodes += infos?.total_viewed_episodes || 0;
            }

            await this.serieInfosDAO.updateSerieEpisodesViewed(parentSerie.id, sumViewedEpisodes);
            if (!parentSerie.parent_id) break;

            // Get the parent serie of the parent serie
            parentSerie = await this.serieDAO.getSerieById(parentSerie.parent_id);
        } while (parentSerie);
    }

    // Delete a serie track entry
    async deleteSerieTrack(serieId, episodeId) {
        const sql = `DELETE FROM Track WHERE serie_id = ? AND episode_id = ?`;
        const params = [serieId, episodeId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async deleteSerieTrackByEpisodeId(episodeId) {
        const sql = `DELETE FROM Track WHERE episode_id = ?`;
        const params = [episodeId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieTrackDAO;