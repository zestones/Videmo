const QueryExecutor = require('../../sqlite/QueryExecutor');

class DisplayModeDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
    }

    // Read all display options
    async getAllDisplayMode() {
        const sql = 'SELECT * FROM DisplayMode';
        return await this.queryExecutor.executeAndFetchAll(sql);
    }
}

module.exports = DisplayModeDAO;