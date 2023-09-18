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
    async createCategory(name) {
        const sql = 'INSERT INTO Category (name) VALUES (?)';
        const params = [name];

        await this.queryExecutor.executeAndCommit(sql, params);
        const category = await this.getCategoryByName(name);
        await this.categoryFilterDAO.createDefaultCategorySort(category.id);
    }

    // Read all categories
    async getAllCategories() {
        const sql = 'SELECT * FROM Category';
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
        const sql = 'UPDATE Category SET id = ? WHERE name = ?';

        for (const element of categories) {
            const params = [element.id, element.name];
            await this.queryExecutor.executeAndCommit(sql, params);
        }
    }

    // Delete category by ID
    async deleteCategoryById(categoryId) {
        const sql = 'DELETE FROM Category WHERE id = ?';
        const params = [categoryId];

        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = CategoriesDAO;