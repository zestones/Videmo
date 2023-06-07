const QueryExecutor = require('../../sqlite/QueryExecutor');

class CategoriesDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
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

    // Update category by ID
    async updateCategoryById(categoryId, name) {
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