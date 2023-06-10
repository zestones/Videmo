const SQLiteQueryExecutor = require('./SQLiteQueryExecutor');

class QueryExecutor {
    constructor() {
        this.sqlQueryExecutor = new SQLiteQueryExecutor();
    }

    async executeAndCommit(sql, params = []) {
        try {
            this.open();
            const result = await this.sqlQueryExecutor.executeAndCommit(sql, params);
            this.close();
            return result;
        } catch (err) {
            console.error('Error executing query and committing changes:', err);
            throw err;
        }
    }

    async executeAndFetchOne(sql, params = []) {
        try {
            this.open();
            const result = await this.sqlQueryExecutor.executeAndFetchOne(sql, params);
            this.close();
            return result;
        } catch (err) {
            console.error('Error executing query and fetching one result:', err);
            throw err;
        }
    }

    async executeAndFetchAll(sql, params = []) {
        try {
            this.open();
            const result = await this.sqlQueryExecutor.executeAndFetchAll(sql, params);
            this.close();
            return result;
        } catch (err) {
            console.error('Error executing query and fetching all results:', err);
            throw err;
        }
    }

    async executeAndFetchMany(sql, params = [], size = 2) {
        try {
            this.open();
            const result = await this.sqlQueryExecutor.executeAndFetchMany(sql, params, size);
            this.close();
            return result;
        } catch (err) {
            console.error('Error executing query and fetching multiple results:', err);
            throw err;
        }
    }

    async executeManyAndCommit(sql, params) {
        try {
            this.open();
            const result = await this.sqlQueryExecutor.executeManyAndCommit(sql, params);
            this.close();
            return result;
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