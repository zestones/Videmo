const QueryExecutor = require('../../sqlite/QueryExecutor');
const SerieDAO = require('../series/SerieDAO');
const CategoryFilterDAO = require('../categories/CategoryFilterDAO');

class CategoriesDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.serieDAO = new SerieDAO();
        this.categoryFilterDAO = new CategoryFilterDAO();
    }

    // Create a new category
    async createCategory(name, orderId) {
        const sql = 'INSERT INTO Category (name, order_id) VALUES (?, ?)';
        const params = [name, orderId];

        await this.queryExecutor.executeAndCommit(sql, params);
        const category = await this.getCategoryByName(name);
        await this.categoryFilterDAO.createDefaultCategorySort(category.id);
        return category;
    }

    // Read all categories
    async getAllCategories() {
        const sql = 'SELECT * FROM Category ORDER BY order_id ASC';
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Read category by name
    async getCategoryByName(name) {
        const sql = 'SELECT * FROM Category WHERE name = ?';
        const params = [name];

        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Update category by ID
    async updateCategory(category) {
        const parsedCategory = JSON.parse(category);

        const sql = 'UPDATE Category SET name = ? WHERE id = ?';
        const params = [parsedCategory.name, parsedCategory.id];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Update categories order
    async updateCategoriesOrder(categories) {
        const sql = 'UPDATE Category SET order_id = ? WHERE id = ?';
        const params = [];

        for (const element of categories) params.push([element.order_id, element.id]);
        await this.queryExecutor.executeManyAndCommit(sql, params);
    }

    // Delete category by ID
    async deleteCategoryById(categoryId) {
        const sql = 'DELETE FROM Category WHERE id = ?';
        const params = [categoryId];

        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = CategoriesDAO;