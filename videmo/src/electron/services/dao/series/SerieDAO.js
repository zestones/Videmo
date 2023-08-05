const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');

class SerieDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Create a new serie
    async createSerie(serie) {
        const sql = `INSERT INTO Serie (basename, name, description, image, link, extension_id, inLibrary) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [serie.basename, serie.name, serie.description, serie.image, serie.link, serie.extension_id, serie.inLibrary];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Read all series
    async getAllSeries() {
        const sql = `SELECT * FROM Serie`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Read serie by ID
    async getSerieById(serieId) {
        const sql = `SELECT * FROM Serie WHERE id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Read serie by link
    async getSerieByLink(link) {
        const sql = `SELECT * FROM Serie WHERE link = ?`;
        const params = [link];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Read all series in library by extension
    async getAllSeriesInLibraryByExtension(extension) {
        const sql = `
            SELECT s.*
            FROM Serie AS s
            INNER JOIN Extension AS e ON s.extension_id = e.id
            WHERE e.id = ?
            AND s.inLibrary = 1
            ORDER BY s.basename ASC
        `;

        const params = [extension.id];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Read all series by category ID
    async getSeriesByCategoryId(categoryId) {
        const sql = `
            SELECT Serie.*
            FROM Serie
            INNER JOIN SerieCategory ON Serie.id = SerieCategory.serie_id
            WHERE SerieCategory.category_id = ?`;

        const params = [categoryId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Update serie by ID (add serie to library)
    async updateSerieInLibrary(serieId, inLibrary) {
        const sql = `UPDATE Serie SET inLibrary = ? WHERE id = ?`;
        const params = [inLibrary, serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete serie by ID
    async deleteSerieById(serieId) {
        const sql = `DELETE FROM Serie WHERE id = ?`;
        const params = [serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieDAO;