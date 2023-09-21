const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');

class FilterDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Get all filter entries
    async getFilters() {
        const query = `SELECT * FROM Filter`;
        return await this.queryExecutor.executeAndFetchAll(query);
    }

    // Get a filter entry by name
    async getFilterByName(name) {
        const query = `SELECT * FROM Filter WHERE name = ?`;
        const params = [name];
        return await this.queryExecutor.executeAndFetchOne(query, params);
    }
}

module.exports = FilterDAO;