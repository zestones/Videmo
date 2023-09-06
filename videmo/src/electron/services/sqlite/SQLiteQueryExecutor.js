const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();

const path = require('path');
const fs = require('fs');
const zlib = require('zlib');


class SQLiteQueryExecutor {
    constructor() {
        this.database = this.#retrieveDatabasePath();
        this.create_tables_sql = path.join(__dirname, 'sql', 'tables.sql');
        this.fill_data_sql = path.join(__dirname, 'sql', 'data.sql');
    }

    /**
     * Retrieves the path to the SQLite database file depending on the environment. (development or production)
     * @returns {string} The path to the SQLite database file.
     */
    #retrieveDatabasePath() {
        if (process.env.NODE_ENV === 'development') {
            return path.join(__dirname, 'sql', 'videmo.db');
        }

        if (process.env.NODE_ENV === 'test') {
            return path.join(__dirname, 'sql', 'videmo.test.db');
        }

        let appPath = app.getAppPath();
        if (app.isPackaged) {
            appPath = appPath.replace('\\app.asar', '');
        }
        return path.join(appPath, 'public/videmo.db');
    }

    /**
     * Initializes the database by creating it if it doesn't exist.
     * @param {string} dbFilePath - The path to the SQLite database file.
     * @returns {Promise<void>} A promise that resolves when the database is initialized.
     * @private
    */
    async initializeDatabase() {

        if (!fs.existsSync(this.database)) {
            this.db = new sqlite3.Database(this.database);

            await this.executeFile(this.create_tables_sql);
            await this.executeFile(this.fill_data_sql);
        }

    }

    /**
     * Reads the contents of a file and executes the SQL statements from it.
     * @param {string} filePath 
     * @returns {Promise<void>} A promise that resolves when the database is filled with data.
     */
    executeFile(filePath) {
        const insertDataQuery = fs.readFileSync(filePath, 'utf8');

        return new Promise((resolve, reject) => {
            this.db.exec(insertDataQuery, (err) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
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
    executeManyAndCommit(sql, paramsArray = []) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                const stmt = this.db.prepare(sql);

                paramsArray.forEach((params) => {
                    stmt.run(params, function (err) {
                        if (err) {
                            this.db.run('ROLLBACK', () => reject(err));
                        }
                    });
                });

                stmt.finalize((err) => {
                    if (err) {
                        this.db.run('ROLLBACK', () => reject(err));
                        return;
                    }

                    this.db.run('COMMIT', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        });
    }

    createDatabaseBackup(filePath) {
        return new Promise((resolve, reject) => {
            this.#createDatabaseBackupFile(filePath)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    #compressBackupFile(filePath) {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(filePath);
            const writeStream = fs.createWriteStream(`${filePath}.gz`);
            const gzip = zlib.createGzip();

            readStream.pipe(gzip).pipe(writeStream);

            writeStream.on('finish', () => {
                fs.unlink(filePath, (err) => {
                    if (err) reject(err);
                    else resolve(`${filePath}.gz`);
                });
            });

            writeStream.on('error', reject);
        });
    }

    /**
     * Creates a backup of the database.
     * @param {String} filePath - The path to the backup file.
     * @returns {Promise<void>} A promise that resolves when the backup is created.
     */
    #createDatabaseBackupFile(filePath) {
        // We copy the database file to the backup file
        return new Promise((resolve, reject) => {
            fs.copyFile(this.database, filePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.#compressBackupFile(filePath)
                        .then(() => resolve())
                        .catch((err) => reject(err));
                }
            });
        });
    }

    /**
     * Restores a database backup.
     * @param {String} filePath 
     * @returns {Promise<void>} A promise that resolves when the backup is restored.
     */
    restoreDatabaseBackup(filePath) {
        return new Promise((resolve, reject) => {
            // the backup file is compressed
            if (filePath.endsWith('.gz')) {
                this.#decompressBackupFile(filePath)
                    .then((decompressedFilePath) => this.#restoreDatabaseBackupFile(decompressedFilePath))
                    .then(() => resolve())
                    .catch((err) => reject(err));
            } else {
                reject(new Error('Invalid backup file'));
            }
        });
    }

    #decompressBackupFile(filePath) {
        return new Promise((resolve, reject) => {
            const gunzip = zlib.createGunzip();
            const input = fs.createReadStream(filePath);
            const decompressedFilePath = filePath.replace('.gz', '');
            const output = fs.createWriteStream(decompressedFilePath);

            input.pipe(gunzip).pipe(output);

            output.on('finish', () => {
                output.close(() => {
                    resolve(decompressedFilePath);
                });
            });

            output.on('error', (err) => {
                reject(err);
            });
        });
    }


    /**
     * Restores a database backup by replacing the current
     * @param {String} filePath - The path to the backup file.
     */
    #restoreDatabaseBackupFile(filePath) {
        fs.copyFile(filePath, this.database, (err) => {
            if (err) throw err;
            else fs.unlink(filePath, (err) => {
                if (err) throw err;
            });
        });
    }

    /**
     * Opens the database connection.
     * @returns {Promise<void>} A promise that resolves when the database connection is opened.
    */
    open() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.database, (err) => {
                if (err) {
                    reject(err);
                } else {
                    // Change the journal mode to WAL after opening the connection
                    this.db.exec("PRAGMA journal_mode = WAL;", (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
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