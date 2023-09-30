const QueryExecutor = require('../../sqlite/QueryExecutor');


class SerieUpdateDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
    }

    async insertNewUpdate(serieId, EpisodeId) {
        const query = `INSERT INTO UpdatedSerie (serie_id, episode_id) VALUES (?, ?)`;
        const params = [serieId, EpisodeId];

        return await this.queryExecutor.executeAndCommit(query, params);
    }

    async getAllUpdates() {
        const query = `SELECT * FROM UpdatedSerie`;
        return await this.queryExecutor.executeAndFetchAll(query);
    }
}


module.exports = SerieUpdateDAO;