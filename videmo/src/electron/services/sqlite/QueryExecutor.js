const SQLiteQueryExecutor = require('./SQLiteQueryExecutor');

class QueryExecutor {
    constructor() {
        this.sqlQueryExecutor = new SQLiteQueryExecutor();
    }

    async executeAndCommit(sql, params = []) {
        try {
            await this.open();
            await this.sqlQueryExecutor.executeAndCommit(sql, params);
            await this.close();
        } catch (err) {
            console.error('Error executing query and committing changes:', err);
            throw err;
        }
    }

    async executeAndFetchOne(sql, params = []) {
        try {
            await this.open();
            return await this.sqlQueryExecutor.executeAndFetchOne(sql, params);
        } catch (err) {
            console.error('Error executing query and fetching one result:', err);
            throw err;
        }
    }

    async executeAndFetchAll(sql, params = []) {
        try {
            console.log('QueryExecutor.executeAndFetchAll()');
            await this.open();
            const result =  await this.sqlQueryExecutor.executeAndFetchAll(sql, params);
            await this.close();
            return result;
        } catch (err) {
            console.error('Error executing query and fetching all results:', err);
            throw err;
        }
    }

    async executeAndFetchMany(sql, params = [], size = 2) {
        try {
            return await this.sqlQueryExecutor.executeAndFetchMany(sql, params, size);
        } catch (err) {
            console.error('Error executing query and fetching multiple results:', err);
            throw err;
        }
    }

    async executeManyAndCommit(sql, params) {
        try {
            await this.sqlQueryExecutor.executeManyAndCommit(sql, params);
        } catch (err) {
            console.error('Error executing query with multiple parameters and committing changes:', err);
            throw err;
        }
    }

    async open() {
        try {
            await this.sqlQueryExecutor.open();
        } catch (err) {
            console.error('Error opening database connection:', err);
            throw err;
        }
    }

    async close() {
        try {
            await this.sqlQueryExecutor.close();
        } catch (err) {
            console.error('Error closing database connection:', err);
            throw err;
        }
    }
}

module.exports = QueryExecutor;