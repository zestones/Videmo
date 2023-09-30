const QueryExecutor = require('../../sqlite/QueryExecutor');

const SerieEpisodeDAO = require('../../../services/dao/series/SerieEpisodeDAO');
const SerieTrackDAO = require('../../../services/dao/series/SerieTrackDAO');
const SerieInfosDAO = require('../../../services/dao/series/SerieInfosDAO');

class SerieUpdateDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
    }

    // insert new serie update
    async insertNewUpdate(serieId, EpisodeId) {
        const query = `INSERT INTO UpdatedSerie (serie_id, episode_id) VALUES (?, ?)`;
        const params = [serieId, EpisodeId];

        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // get all serie updates
    async getAllUpdates() {
        const query = `SELECT * FROM UpdatedSerie`;
        return await this.queryExecutor.executeAndFetchAll(query);
    }

    // update serie episodes
    async updateSerieEpisodes(serie, episodes) {

        const databaseEpisodes = await new SerieEpisodeDAO().getAllEpisodesBySerieId(serie.id);
        const newEpisodes = episodes.filter(episode => !databaseEpisodes.some(databaseEpisode => databaseEpisode.link === episode.link));
        const deletedEpisodes = databaseEpisodes.filter(databaseEpisode => !episodes.some(episode => episode.link === databaseEpisode.link));

        // Add new episodes
        for (const episode of newEpisodes) {
            episode.serie_id = serie.id;
            const createdEpisode = await new SerieEpisodeDAO().createEpisode(episode);
            await new SerieTrackDAO().createSerieTrack(serie.id, createdEpisode.id);
            await new SerieUpdateDAO().insertNewUpdate(serie.id, createdEpisode.id);
        }

        await new SerieInfosDAO().updateNumberOfEpisodesWithIncrement(serie.id, newEpisodes.length)

        // Delete old episodes
        for (const episode of deletedEpisodes) {
            await new SerieEpisodeDAO().deleteEpisodeById(episode.id);
            await new SerieTrackDAO().deleteSerieTrackByEpisodeId(episode.id);
            await new SerieUpdateDAO().deleteSerieUpdateBySerieId(serie.id);
        }

        const numberOfViewedEpisodes = deletedEpisodes.filter(episode => episode.viewed).length;
        await new SerieInfosDAO().updateNumberOfEpisodesWithIncrement(serie.id, -deletedEpisodes.length);
        await new SerieInfosDAO().updateNumberOfEpisodesViewedWithIncrement(serie.id, -numberOfViewedEpisodes);
    }

    // delete serie update by serie id
    async deleteSerieUpdateBySerieId(serieId) {
        const query = `DELETE FROM UpdatedSerie WHERE serie_id = ?`;
        const params = [serieId];

        return await this.queryExecutor.executeAndCommit(query, params);
    }
}


module.exports = SerieUpdateDAO;