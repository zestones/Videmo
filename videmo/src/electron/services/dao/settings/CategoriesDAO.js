const QueryExecutor = require('../../sqlite/QueryExecutor');
const SerieDAO = require('../series/SerieDAO');

class CategoriesDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.serieDAO = new SerieDAO();
    }

    // Create a new category
    async createCategory(name) {
        const sql = 'INSERT INTO Category (name) VALUES (?)';
        const params = [name];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Read all categories
    async getAllCategories() {
        const sql = 'SELECT * FROM Category';
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Update category by ID
    async updateCategory(category) {
        const parsedCategory = JSON.parse(category);

        const sql = 'UPDATE Category SET name = ? WHERE id = ?';
        const params = [parsedCategory.name, parsedCategory.id];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete category by ID
    async deleteCategoryById(categoryId) {
        const sql = 'DELETE FROM Category WHERE id = ?';
        const params = [categoryId];

        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = CategoriesDAO;