const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');


class GenreDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Create a genre entry
    async createGenre(genre) {
        const sql = `INSERT INTO Genre (name) VALUES (?)`;
        const params = [genre.name];
        
        await this.queryExecutor.executeAndCommit(sql, params);
        return await this.getGenreByName(genre.name);
    }

    // Get genre by name
    async getGenreByName(name) {
        const sql = `SELECT * FROM Genre WHERE name = ?`;
        const params = [name];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Get genre by id
    async getGenreById(id) {
        const sql = `SELECT * FROM Genre WHERE id = ?`;
        const params = [id];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Get all genres
    async getAllGenres() {
        const sql = `SELECT * FROM Genre`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }
}

module.exports = GenreDAO;