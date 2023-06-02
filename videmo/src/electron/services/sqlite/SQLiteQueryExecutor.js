const sqlite3 = require('sqlite3');
const fs = require('fs');


class SQLiteQueryExecutor {
    constructor() {
        const dbFilePath = "./sql/videmo.db"

        if (!fs.existsSync(dbFilePath)) {
            this.#createDatabase(dbFilePath);
        }

        // Retrieve the database
        this.db = new sqlite3.Database(dbFilePath);
    }

    /**
     * Creates the database by executing the SQL statements from the tables.sql file.
     * @param {string} dbFilePath - The path to the SQLite database file.
    */
    async #createDatabase(dbFilePath) {
        const tablesFilePath = "../sql/tables.sql";

        try {
            const response = await fetch(tablesFilePath);
            const createTablesQuery = await response.text();

            const db = new sqlite3.Database(dbFilePath);

            db.serialize(() => {
                db.exec(createTablesQuery, (err) => {
                    if (err) {
                        console.error('Error creating tables:', err);
                        throw err;
                    }
                    console.log('Tables created successfully.');
                });
            });

            db.close();
        } catch (error) {
            console.error('Error loading or executing SQL file:', error);
            throw error;
        }
    }

    /**
     * Executes a query and commits the changes to the database.
     * @param {string} sql - The SQL query to execute.
     * @param {Array} params - Optional parameters for the query.
     * @returns {Promise<void>} A promise that resolves when the changes are committed.
    */
    executeAndCommit(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                this.db.run(sql, params, (err) => {
                    if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                    } else {
                        this.db.run('COMMIT', (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        });
    }

    /**
     * Executes a query and fetches the first row.
     * @param {string} sql - The SQL query to execute.
     * @param {Array} params - Optional parameters for the query.
     * @returns {Promise<Object>} A promise that resolves with the first row of the query results.
    */
    executeAndFetchOne(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Executes a query and fetches all rows.
     * @param {string} sql - The SQL query to execute.
     * @param {Array} params - Optional parameters for the query.
     * @returns {Promise<Array>} A promise that resolves with all rows of the query results.
    */
    executeAndFetchAll(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Executes a query and fetches multiple rows.
     * @param {string} sql - The SQL query to execute.
     * @param {Array} params - Optional parameters for the query.
     * @param {number} size - The number of rows to fetch.
     * @returns {Promise<Array>} A promise that resolves with the specified number of rows of the query results.
    */
    executeAndFetchMany(sql, params = [], size = 2) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                    } else {
                        const result = rows.slice(0, size);
                        this.db.run('COMMIT');
                        resolve(result);
                    }
                });
            });
        });
    }

    /**
     * Executes a query with multiple sets of parameters and commits the changes to the database.
     * @param {string} sql - The SQL query to execute.
     * @param {Array<Array>} params - An array of parameter sets for the query.
     * @returns {Promise<void>} A promise that resolves when the changes are committed.
    */
    executeManyAndCommit(sql, params) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                const stmt = this.db.prepare(sql);
                params.forEach((param) => {
                    stmt.run(param);
                });
                stmt.finalize((err) => {
                    if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                    } else {
                        this.db.run('COMMIT', (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        });
    }

    /**
     * Closes the database connection.
     * @returns {Promise<void>} A promise that resolves when the database connection is closed.
    */
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = SQLiteQueryExecutor;