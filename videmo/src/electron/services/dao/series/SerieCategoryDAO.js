const QueryExecutor = require('../../sqlite/QueryExecutor');
const SerieDAO = require('../series/SerieDAO');


class SerieCategoryDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.serieDAO = new SerieDAO();
    }

    async createSerieCategory(serieId, categoryId) {
        const sql = `INSERT INTO SerieCategory (serie_id, category_id) VALUES (?, ?)`;
        const params = [serieId, categoryId];
        return await this.queryExecutor.executeAndCommit(sql, params);
    }

    async getSerieCategoryById(serieCategoryId) {
        const sql = `SELECT * FROM SerieCategory WHERE id = ?`;
        const params = [serieCategoryId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    async getSerieCategoryBySerieId(serieId) {
        const sql = `SELECT * FROM SerieCategory WHERE serie_id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // TODO : change method name to getSerieCategoryIdsBySerieLink
    async getSerieCategoryIdsBySerie(serie) {
        const sql = `
          SELECT SerieCategory.category_id
          FROM SerieCategory, Serie
          WHERE SerieCategory.serie_id = Serie.id
          AND Serie.link = ?`;

        const params = [serie.link];
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        // Extract the category IDs from the result array
        return result.map((row) => row.category_id);
    }

    async getAllSerieCategories() {
        const sql = `SELECT * FROM SerieCategory`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    async countSerieCategoriesBySerieId(serieId) {
        const sql = `SELECT COUNT(*) AS count FROM SerieCategory WHERE serie_id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    async updateSerieCategory(serieId, categoriesId) {
        // Clear existing categories for the series in the SerieCategory table
        await this.deleteSerieCategoryBySerieId(serieId);

        // Insert new categories for the series in the SerieCategory table
        for (const categoryId of categoriesId) {
            await this.createSerieCategory(serieId, categoryId);
        }

        // TODO : maybe remove this part when the serieTracking api will be implemented
        // Delete the serie from the Serie table if it is not used in any SerieCategory row
        const serieCategoryCount = await this.countSerieCategoriesBySerieId(serieId);
        if (serieCategoryCount.count === 0) {
            await this.serieDAO.deleteSerieById(serieId);
        }
    }

    async #createSerieAndCategory(serieParsedObject, categoriesId) {
        // Create the serie
        await this.serieDAO.createSerie(serieParsedObject);

        // Retrieve the inserted serie (we need the id)
        const insertedSerie = await this.serieDAO.getSerieByBasenameAndNameAndLink(serieParsedObject);

        // Update the SerieCategory table with the new series and categories
        await this.updateSerieCategory(insertedSerie.id, categoriesId);
    }

    // Update series categories
    async updateSerieCategories(serie, categoriesId) {
        const serieParsedObject = JSON.parse(serie);

        // Retrieve the serie
        const retrievedSerie = await this.serieDAO.getSerieByBasenameAndNameAndLink(serieParsedObject);

        // Check if the does not exist in the Serie table
        if (retrievedSerie === undefined) {
            // We create the serie and update the SerieCategory table with the attached categories
            await this.#createSerieAndCategory(serieParsedObject, categoriesId);
        } else {
            const serieId = retrievedSerie.id; // Use the retrievedSerie.id instead of making another query
            // Update the SerieCategory table with the new series and categories
            await this.updateSerieCategory(serieId, categoriesId);
        }
    }

    async deleteSerieCategoryBySerieId(serieId) {
        const sql = `DELETE FROM SerieCategory WHERE serie_id = ?`;
        const params = [serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    async deleteSerieCategoryById(serieCategoryId) {
        const sql = `DELETE FROM SerieCategory WHERE id = ?`;
        const params = [serieCategoryId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieCategoryDAO;