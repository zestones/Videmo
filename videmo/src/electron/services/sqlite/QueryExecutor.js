const SQLiteQueryExecutor = require('./SQLiteQueryExecutor');

class QueryExecutor {
    constructor() {
        this.queryExecutor = new SQLiteQueryExecutor();
    }

    async executeAndCommit(sql, params = []) {
        try {
            await this.queryExecutor.executeAndCommit(sql, params);
        } catch (err) {
            console.error('Error executing query and committing changes:', err);
            throw err;
        }
    }

    async executeAndFetchOne(sql, params = []) {
        try {
            return await this.queryExecutor.executeAndFetchOne(sql, params);
        } catch (err) {
            console.error('Error executing query and fetching one result:', err);
            throw err;
        }
    }

    async executeAndFetchAll(sql, params = []) {
        try {
            return await this.queryExecutor.executeAndFetchAll(sql, params);
        } catch (err) {
            console.error('Error executing query and fetching all results:', err);
            throw err;
        }
    }

    async executeAndFetchMany(sql, params = [], size = 2) {
        try {
            return await this.queryExecutor.executeAndFetchMany(sql, params, size);
        } catch (err) {
            console.error('Error executing query and fetching multiple results:', err);
            throw err;
        }
    }

    async executeManyAndCommit(sql, params) {
        try {
            await this.queryExecutor.executeManyAndCommit(sql, params);
        } catch (err) {
            console.error('Error executing query with multiple parameters and committing changes:', err);
            throw err;
        }
    }

    async close() {
        try {
            await this.queryExecutor.close();
        } catch (err) {
            console.error('Error closing database connection:', err);
            throw err;
        }
    }
}

module.exports = QueryExecutor;