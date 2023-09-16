const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');

class SortDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Get a sort entry by name
    async getSortByName(name) {
        const query = `SELECT * FROM Sort WHERE name = ?`;
        const params = [name];
        return await this.queryExecutor.executeAndFetchOne(query, params);
    }

    // Get all sort entries
    async getSorts() {
        const query = `SELECT * FROM Sort`;
        return await this.queryExecutor.executeAndFetchAll(query);
    }
}

module.exports = SortDAO;