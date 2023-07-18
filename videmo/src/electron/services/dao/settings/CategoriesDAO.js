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

    // Read all categories
    getAllCategories() {
        const sql = 'SELECT * FROM Category';
        return this.queryExecutor.executeAndFetchAll(sql);
    }

    // TODO : move inside the SerieDAO
    getAllSeriesInLibraryByExtension(extension) {
        // TODO : Select all serie that has a category (means that are in library) and that has a specific extension
        // TODO : Something like this:
        const sql = `
            SELECT s.*
            FROM Serie AS s
            INNER JOIN Extension AS e ON s.extension_id = e.id
            WHERE e.id = ?
            ORDER BY s.basename ASC
        `;

        const params = [extension.id];
        return this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Update category by ID
    updateCategoryById(categoryId, name) {
        const sql = 'UPDATE Category SET name = ? WHERE id = ?';
        const params = [name, categoryId];

        this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete category by ID
    deleteCategoryById(categoryId) {
        const sql = 'DELETE FROM Category WHERE id = ?';
        const params = [categoryId];

        this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = CategoriesDAO;