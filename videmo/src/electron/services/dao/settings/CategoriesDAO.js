const QueryExecutor = require('../../sqlite/QueryExecutor');
const SerieDAO = require('../series/SerieDAO');

class CategoriesDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.serieDAO = new SerieDAO();
    }

    // Create a new category
    createCategory(name) {
        const sql = 'INSERT INTO Category (name) VALUES (?)';
        const params = [name];

        this.queryExecutor.executeAndCommit(sql, params);
        return this;
    }

    // Read category by ID
    getCategoryById(categoryId) {
        const sql = 'SELECT * FROM Category WHERE id = ?';
        const params = [categoryId];

        return this.queryExecutor.executeAndFetchOne(sql, params);
    }

    getCategoriesBySerieName(serieName) {
        const serieId = this.serieDAO.getSerieByName(serieName).id;
        const sql = `
            SELECT c.id, c.name
            FROM Category c
            INNER JOIN SerieCategory sc ON sc.category_id = c.id
            WHERE sc.serie_id = ?
        `;

        const params = [serieId];

        return this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Read all categories
    getAllCategories() {
        const sql = 'SELECT * FROM Category';
        return this.queryExecutor.executeAndFetchAll(sql);
    }

    // Update category by ID
    updateCategoryById(categoryId, name) {
        const sql = 'UPDATE Category SET name = ? WHERE id = ?';
        const params = [name, categoryId];

        this.queryExecutor.executeAndCommit(sql, params);
    }

    updateSerieCategories(serie, categoriesId) {
        const serieObject = JSON.parse(serie);
        const { name, link, image, extensionId, description } = serieObject;

        const params = [name, link, image, description, extensionId];

        // Create new serie if it doesn't exist
        if (!this.serieDAO.getSerieByName(name)) {
            const sql = `
                INSERT INTO Serie (name, link, image, description, extension_id)
                VALUES (?, ?, ?, ?, ?)
                `;

            this.queryExecutor.executeAndCommit(sql, params)

                .then(() => {
                    // Get the serie ID
                    const serieId = this.serieDAO.getSerieByName(name).id;

                    // Prepare the INSERT statement
                    const sqlInsert = `
                    INSERT INTO SerieCategory (serie_id, category_id)
                    VALUES (?, ?)
                    `;

                    // Prepare the parameter arrays
                    const paramsArray = categoriesId.map((categoryId) => [serieId, categoryId]);

                    // Execute the multiple INSERT statements
                    return this.queryExecutor.executeManyAndCommit(sqlInsert, paramsArray);
                })
                .catch((err) => {
                    console.error('Error updating serie categories:', err);
                });
        }
    }

    // Delete category by ID
    deleteCategoryById(categoryId) {
        const sql = 'DELETE FROM Category WHERE id = ?';
        const params = [categoryId];

        this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = CategoriesDAO;