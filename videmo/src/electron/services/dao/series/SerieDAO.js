const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');


class SerieDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    async createSerie(serie) {
        const sql = `INSERT INTO Serie (basename, name, description, image, link, extension_id) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [serie.basename, serie.name, serie.description, serie.image, serie.link, serie.extension_id];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async getSerieById(serieId) {
        const sql = `SELECT * FROM Serie WHERE id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    async getSerieByName(serieName) {
        const sql = `SELECT * FROM Serie WHERE name = ?`;
        const params = [serieName];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // TODO : change method name to getSerieByLink
    async getSerieByBasenameAndNameAndLink(serieObject) {
        const sql = `SELECT * FROM Serie WHERE link = ?`;
        const params = [serieObject.link];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    async getSeriesByCategoryId(categoryId) {
        const sql = `
            SELECT Serie.*
            FROM Serie
            INNER JOIN SerieCategory ON Serie.id = SerieCategory.serie_id
            WHERE SerieCategory.category_id = ?`;

        const params = [categoryId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    async getExtensionBySerieId(serieId) {
        const sql = `
            SELECT Extension.*
            FROM Extension
            INNER JOIN Serie ON Extension.id = Serie.extension_id
            WHERE Serie.id = ?`;

        const params = [serieId];
        const result = await this.queryExecutor.executeAndFetchOne(sql, params);

        // Convert the local value to a boolean value
        result.local = this.dataTypesConverter.convertIntegerToBoolean(result.local);
        return result;
    }

    async getAllSeries() {
        const sql = `SELECT * FROM Serie`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    async deleteSerieById(serieId) {
        const sql = `DELETE FROM Serie WHERE id = ?`;
        const params = [serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async deleteSerieByName(serieName) {
        const sql = `DELETE FROM Serie WHERE name = ?`;
        const params = [serieName];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieDAO;