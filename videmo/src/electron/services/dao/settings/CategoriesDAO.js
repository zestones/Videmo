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

    // Add Serie to Categories
    updateSerieCategories(serie, categoriesId) {
        const categoryPlaceholders = categoriesId.map(() => '(?)').join(', ');
        
        const serieObject = JSON.parse(serie);
        const { name, link, image, local, extensionId, description, genres } = serieObject;
        const params = [name, link, image, description, extensionId, ...categoriesId];

        const sql = `
                    INSERT INTO Serie (name, link, image, description, extension_id, category_id)
                    VALUES (?, ?, ?, ?, ?, ${categoryPlaceholders})
                    ON CONFLICT (id) DO UPDATE SET category_id = excluded.category_id;
                    `;

        this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = CategoriesDAO;