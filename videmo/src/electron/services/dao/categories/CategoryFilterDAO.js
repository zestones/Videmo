const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');

class CategoryFilterDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();

        this.FLAGS = { ASC: 'ASC', DESC: 'DESC', INCLUDE: 'INCLUDE', EXCLUDE: 'EXCLUDE' };
    }

    // Create a category filter entry
    async createCategoryFilter(categoryId, filter_id, flag) {
        if (!(flag in this.FLAGS)) throw new Error('Invalid flag value');

        const query = `INSERT INTO CategoryFilter (category_id, filter_id, flag) VALUES (?, ?, ?)`;
        const params = [categoryId, filter_id, flag];
        return await this.queryExecutor.executeAndCommit(query, params);
    }

    async createCategorySort(categoryId, sort_id, flag) {
        if (!(flag in this.FLAGS)) throw new Error('Invalid flag value');
        const query = `INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (?, ?, ?)`;
        const params = [categoryId, sort_id, flag];
        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Get all category filters
    async getCategoryFilters() {
        const query = `SELECT * FROM CategoryFilter`;
        return await this.queryExecutor.executeAndCommit(query);
    }

    // Get all category sorts
    async getCategorySorts() {
        const query = `SELECT * FROM CategoryFilter`;
        return await this.queryExecutor.executeAndCommit(query);
    }

    // Get all category filters for a category
    async getCategoryFiltersByCategoryId(categoryId) {
        const query = `SELECT CategoryFilter.id, 
                        category_id, 
                        filter_id,
                        sort_id,
                        flag,
                        Filter.name as filter_name,
                        Sort.name AS sort_name 
                        FROM CategoryFilter
                            LEFT JOIN Filter ON CategoryFilter.filter_id = Filter.id
                            LEFT JOIN Sort ON CategoryFilter.sort_id = Sort.id
                            WHERE category_id = ?
                        `;
        const params = [categoryId];
        return await this.queryExecutor.executeAndFetchAll(query, params);
    }
}

module.exports = CategoryFilterDAO;