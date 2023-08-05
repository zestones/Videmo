const QueryExecutor = require('../../sqlite/QueryExecutor');
const SerieDAO = require('../series/SerieDAO');


class SerieCategoryDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.serieDAO = new SerieDAO();
    }

    // Create a new serie category
    async createSerieCategory(serieId, categoryId) {
        const sql = `INSERT INTO SerieCategory (serie_id, category_id) VALUES (?, ?)`;
        const params = [serieId, categoryId];
        return await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Read serie category by ID
    async getSerieCategoryById(serieCategoryId) {
        const sql = `SELECT * FROM SerieCategory WHERE id = ?`;
        const params = [serieCategoryId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Read all serie categories by serie ID
    async getSerieCategoryBySerieId(serieId) {
        const sql = `SELECT * FROM SerieCategory WHERE serie_id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Update the last opened category tab
    async updateLastOpenedCategory(id) {
        const sql = `UPDATE LastOpenedCategory SET category_id = ? WHERE id = 1`;
        const params = [id];
        return await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Read the last opened category tab
    async getLastOpenedCategory() {
        const sql = `SELECT * FROM LastOpenedCategory 
        INNER JOIN Category ON LastOpenedCategory.category_id = Category.id
        WHERE LastOpenedCategory.id = 1`;
        return await this.queryExecutor.executeAndFetchOne(sql);
    }

    // Read all serie categories by serie link
    async getSerieCategoryIdsBySerieLink(link) {
        const sql = `
          SELECT SerieCategory.category_id
          FROM SerieCategory, Serie
          WHERE SerieCategory.serie_id = Serie.id
          AND Serie.link = ?`;

        const params = [link];
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        // Extract the category IDs from the result array
        return result.map((row) => row.category_id);
    }

    // Read all serie categories
    async getAllSerieCategories() {
        const sql = `SELECT * FROM SerieCategory`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    async updateSerieCategory(serieId, categoriesId) {
        // Clear existing categories for the series in the SerieCategory table
        await this.deleteSerieCategoryBySerieId(serieId);
        await this.serieDAO.updateSerieInLibrary(serieId, 1);

        // Insert new categories for the series in the SerieCategory table
        for (const categoryId of categoriesId) {
            await this.createSerieCategory(serieId, categoryId);
        }

        // Delete the serie from the Serie table if it is not used in any SerieCategory row
        const serieCategoryCount = await this.#countSerieCategoriesBySerieId(serieId);
        if (serieCategoryCount.count === 0) {
            await this.serieDAO.deleteSerieById(serieId);
        }
    }

    // Create a new serie and update the SerieCategory table with the attached categories
    async #createSerieAndCategory(serieParsedObject, categoriesId) {
        // Create the serie
        await this.serieDAO.createSerie({ ...serieParsedObject, inLibrary: 1 });

        // Retrieve the inserted serie (we need the id)
        const insertedSerie = await this.serieDAO.getSerieByLink(serieParsedObject.link);

        // Update the SerieCategory table with the new series and categories
        await this.updateSerieCategory(insertedSerie.id, categoriesId);
    }

    // Count serie categories by serie ID
    async #countSerieCategoriesBySerieId(serieId) {
        const sql = `SELECT COUNT(*) AS count FROM SerieCategory WHERE serie_id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Update series categories
    async updateSerieCategories(serie, categoriesId) {
        const serieParsedObject = JSON.parse(serie);
        // Retrieve the serie
        const retrievedSerie = await this.serieDAO.getSerieByLink(serieParsedObject.link);

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
    
    // Delete serie categories by serie ID
    async deleteSerieCategoryBySerieId(serieId) {
        const sql = `DELETE FROM SerieCategory WHERE serie_id = ?`;
        const params = [serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete serie categories by category ID
    async deleteSerieCategoryById(serieCategoryId) {
        const sql = `DELETE FROM SerieCategory WHERE id = ?`;
        const params = [serieCategoryId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieCategoryDAO;