const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const SortDAO = require('./sortDAO');

class CategoryFilterDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();

        this.sortDAO = new SortDAO();

        this.FLAGS = { ASC: 'ASC', DESC: 'DESC', INCLUDE: 'INCLUDE', EXCLUDE: 'EXCLUDE' };
        this.TYPES = { FILTER: 'filter', SORT: 'sort' };
    }

    // Create a category filter entry
    async createCategoryFilter(categoryId, filter_id, flag) {
        if (!(flag in this.FLAGS)) throw new Error('Invalid flag value');

        const query = `INSERT INTO CategoryFilter (category_id, filter_id, flag) VALUES (?, ?, ?)`;
        const params = [categoryId, filter_id, flag];
        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Create a category sort entry
    async createCategorySort(categoryId, sort_id, flag) {
        if (!(flag in this.FLAGS)) throw new Error('Invalid flag value');
        const query = `INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (?, ?, ?)`;
        const params = [categoryId, sort_id, flag];
        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Create a default category sort entry
    async createDefaultCategorySort(categoryId) {
        const query = `INSERT INTO CategoryFilter (category_id, sort_id, flag) VALUES (?, ?, ?)`;
        const params = [categoryId, 1, this.FLAGS.ASC];
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
        const result = await this.queryExecutor.executeAndFetchAll(query, params);

        const filters = { sort: {}, filter: [] };
        // We organize the result
        result.forEach((filter) => {
            if (filter.filter_id === null) filters.sort = { id: filter.sort_id, name: filter.sort_name, flag: filter.flag };
            else filters.filter.push({ id: filter.filter_id, name: filter.filter_name, flag: filter.flag });
        });

        return filters;
    }

    async updateCategorySort(categorySort, categoryId) {
        // We retrieve the id of the sort
        const sort = await this.sortDAO.getSortByName(categorySort.fields.pop());

        // We update the category filter
        const query = `UPDATE CategoryFilter SET sort_id = ?, flag = ? WHERE category_id = ?`;
        const params = [sort.id, categorySort.flag, categoryId];
        return await this.queryExecutor.executeAndCommit(query, params);
    }

    // Update category filter by category ID
    async updateCategoryFilter(categoryFilter, categoryId) {
        // 1. The category filter is of type sort
        if (categoryFilter.type === this.TYPES.SORT) {
            return await this.updateCategorySort(categoryFilter, categoryId);
        }

        // TODO : 2. The category filter is of type filter
    }
}

module.exports = CategoryFilterDAO;