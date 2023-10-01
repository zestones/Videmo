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
        const query = `INSERT INTO UpdatedSerie (serie_id, episode_id, date) VALUES (?, ?, ?)`;
        const params = [serieId, EpisodeId, Date.now()];

        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // get all serie updates
    async getAllUpdates() {
        const query = `SELECT * FROM UpdatedSerie`;
        return await this.queryExecutor.executeAndFetchAll(query);
    }

    // read all update entries
    async readAllUpdateEntries() {
        const query = `SELECT Episode.name AS episode_name, 
                        Episode.bookmarked AS episode_bookmarked,
                        Episode.link AS episode_link,
                        Episode.played_time AS episode_played_time,
                        Episode.id AS episode_id,
                        Episode.viewed AS episode_viewed,
                        Serie.basename AS serie_basename,
                        Serie.name AS serie_name,
                        Serie.image AS serie_image,
                        Serie.inLibrary AS serie_inLibrary,
                        Serie.id AS serie_id,
                        Serie.link AS serie_link,
                        Serie.extension_id AS serie_extension_id,
                        UpdatedSerie.date AS date
                        FROM UpdatedSerie
                        INNER JOIN EPISODE ON Episode.id = UpdatedSerie.episode_id
                        INNER JOIN Serie ON Serie.id = UpdatedSerie.serie_id;
                    `;
        const result = await this.queryExecutor.executeAndFetchAll(query);

        // Construct an array of update entries
        const formattedResult = result.map((row) => {
            return {
                episode: {
                    id: row.episode_id,
                    name: row.episode_name,
                    bookmarked: row.episode_bookmarked,
                    link: row.episode_link,
                    played_time: row.episode_played_time,
                    viewed: row.episode_viewed,
                },
                serie: {
                    id: row.serie_id,
                    basename: row.serie_basename,
                    name: row.serie_name,
                    image: row.serie_image,
                    inLibrary: row.serie_inLibrary,
                    link: row.serie_link,
                    extension_id: row.serie_extension_id,
                },
                date: row.date,
            };
        });

        // Sort the array by date (most recent first)
        return formattedResult.sort((a, b) => b.date - a.date);
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
            await new SerieUpdateDAO().deleteSerieUpdateByEpisodeId(episode.id);
        }

        const numberOfViewedEpisodes = deletedEpisodes.filter(episode => episode.viewed).length;
        await new SerieInfosDAO().updateNumberOfEpisodesWithIncrement(serie.id, -deletedEpisodes.length);
        await new SerieInfosDAO().updateNumberOfEpisodesViewedWithIncrement(serie.id, -numberOfViewedEpisodes);
    }

    // delete serie update by serie id
    async deleteSerieUpdateByEpisodeId(episodeId) {
        const query = `DELETE FROM UpdatedSerie WHERE episode_id = ?`;
        const params = [episodeId];

        return await this.queryExecutor.executeAndCommit(query, params);
    }
}


module.exports = SerieUpdateDAO;