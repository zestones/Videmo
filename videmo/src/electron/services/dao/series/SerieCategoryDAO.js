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

    // Create a new serie category by serie links
    async createSerieCategoryBySerieLinks(associationSerieCategories) {
        const serieLinks = associationSerieCategories
            .map((entry) => entry.serieLinks)
            .flat(); // Flatten the array of serie links
        const serieLinkToIdMap = await this.#getSerieIdsByLinks(serieLinks);

        const sqlStatements = `INSERT INTO SerieCategory (serie_id, category_id) VALUES (?, ?)`;
        const params = [];

        for (const entry of associationSerieCategories) {
            const categoryId = entry.categoryId;

            for (const serieLink of entry.serieLinks) {
                const serieId = serieLinkToIdMap[serieLink];
                if (serieId) params.push([serieId, categoryId]); // Only add the serie category if the serie exists
            }
        }

        // Execute the generated SQL statements
        await this.queryExecutor.executeManyAndCommit(sqlStatements, params);
    }

    // Function to retrieve serie IDs by links in batch
    async #getSerieIdsByLinks(serieLinks) {
        const sql = `SELECT link, id FROM Serie WHERE link IN (${serieLinks.map(() => '?').join(',')})`;
        const params = serieLinks;
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        const serieLinkToIdMap = {};
        for (const row of result) serieLinkToIdMap[row.link] = row.id;

        return serieLinkToIdMap;
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

    // Read all serie categories by serie link array
    async getSerieCategoryIdsBySerieLinkArray(links) {
        const sql = `
            SELECT SerieCategory.category_id, Serie.link
            FROM SerieCategory
            RIGHT JOIN Serie ON SerieCategory.serie_id = Serie.id
            WHERE Serie.link IN (${links.map(() => '?').join(',')})`;

        const params = links;
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        // Map the result array to an object with the serie link as key and the category IDs as value in an array
        const serieCategoryIdsBySerieLink = {};
        for (const link of links) {
            serieCategoryIdsBySerieLink[link] = [];
        }

        for (const row of result) {
            if (serieCategoryIdsBySerieLink[row.link]) {
                serieCategoryIdsBySerieLink[row.link].push(row.category_id);
            }
        }

        return serieCategoryIdsBySerieLink;
    }

    // Read all serie categories
    async getAllSerieCategories() {
        const sql = `SELECT * FROM SerieCategory`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }


    // Update series categories
    async updateSerieCategories(series, serieCategories) {

        const serieLinks = series.map((serie) => serie.link);
        // Clear existing categories for the series in the SerieCategory table
        await this.deleteSerieCategoryBySerieLinks(serieLinks);
        await this.serieDAO.updateSeriesInLibraryBySerieLinks(serieLinks, true);

        // Insert new categories for the series in the SerieCategory table
        const hasCategories = [];
        let associationSerieCategory = [];
        for (const element of serieCategories) {
            if (element.flag === "checked" || element.flag === "removed") {
                const seriesLinks = element.serie.map((serie) => serie.link);
                associationSerieCategory.push({ categoryId: element.category.id, serieLinks: element.serie.map((serie) => serie.link) });
                hasCategories.push(...seriesLinks);
            }
        }

        await this.createSerieCategoryBySerieLinks(associationSerieCategory);

        // We extract the series that have no categories
        const hasNoCategories = serieLinks.filter((link) => !hasCategories.includes(link));
        await this.serieDAO.updateSeriesInLibraryBySerieLinks(hasNoCategories, false);
    }

    // delete serie categories by series links
    async deleteSerieCategoryBySerieLinks(links) {
        const sql = `DELETE FROM SerieCategory 
                     WHERE serie_id IN 
                        (SELECT id 
                            FROM Serie 
                            WHERE link 
                            IN (${links.map(() => '?').join(',')}))
                    `;

        const params = links;
        await this.queryExecutor.executeAndCommit(sql, params);
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