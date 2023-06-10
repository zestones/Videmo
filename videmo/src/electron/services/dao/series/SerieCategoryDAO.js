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

    async getSerieCategoryIdsBySerieName(serieName) {
        const sql = `
          SELECT SerieCategory.category_id
          FROM SerieCategory, Serie
          WHERE SerieCategory.serie_id = Serie.id
          AND Serie.name = ?`;

        const params = [serieName];
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        // Extract the category IDs from the result array
        return result.map((row) => row.category_id);
    }

    async getAllSerieCategories() {
        const sql = `SELECT * FROM SerieCategory`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    async updateSerieCategory(serieId, categoriesId) {
        // Clear existing categories for the series in the SerieCategory table
        await this.deleteSerieCategoryBySerieId(serieId);

        // Insert new categories for the series in the SerieCategory table
        for (const categoryId of categoriesId) {
            await this.createSerieCategory(serieId, categoryId);
        }
    }

    async #createSerieAndCategory(serieParsedObject, categoriesId) {
        // Create the serie
        await this.serieDAO.createSerie(serieParsedObject);

        // Retrieve the inserted serie
        const insertedSerie = await this.serieDAO.getSerieByName(serieParsedObject.name);

        // Update the SerieCategory table with the new series and categories
        await this.updateSerieCategory(insertedSerie.id, categoriesId);
    }

    // Update series categories
    async updateSerieCategories(serie, categoriesId) {
        const serieParsedObject = JSON.parse(serie);

        // Retrieve the serie ID
        const retrievedSerie = await this.serieDAO.getSerieByName(serieParsedObject.name);

        // Check if the series already exists in the Serie table
        if (retrievedSerie === undefined) {
            // Create the serie and update the SerieCategory table with the attached categories
            this.#createSerieAndCategory(serieParsedObject, categoriesId);
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