const SQLiteQueryExecutor = require('../../../../electron/services/sqlite/SQLiteQueryExecutor');

describe('SQLiteQueryExecutor', () => {
    let queryExecutor;

    beforeAll(async () => {
        // Set up an in-memory SQLite database
        queryExecutor = new SQLiteQueryExecutor('test');

        // Initialize the database by creating tables and inserting data
        await queryExecutor.open();
    });

    afterAll(async () => {
        // Close the database connection
        await queryExecutor.close();
    });

    afterEach(async () => {
        // Delete all data from the table
        await queryExecutor.executeAndCommit(`DELETE FROM Test`);
    });

    it('should create a table', async () => {
        const sql = `CREATE TABLE Test (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )`;

        // Execute and commit a query to create a table
        await queryExecutor.executeAndCommit(sql);

        // Execute and fetch all rows from the table
        const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test`);

        expect(result.length).toBe(0);
    });

    it('should insert data into a table', async () => {
        const sql = `INSERT INTO Test (name) VALUES (?)`;

        // Execute and commit a query to insert data into the table
        await queryExecutor.executeAndCommit(sql, ['Test Data']);

        // Execute and fetch all rows from the table
        const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test`);

        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Test Data');
    });

    it('should delete data from a table', async () => {
        const sql = `DELETE FROM Test`;

        // Execute and commit a query to delete data from the table
        await queryExecutor.executeAndCommit(sql);

        // Execute and fetch all rows from the table
        const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test`);

        expect(result.length).toBe(0);
    });

    it('should fetch one row from the table', async () => {
        // Insert data into the table
        await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES (?)`, ['Test Data']);

        // Execute and fetch one row from the table
        const result = await queryExecutor.executeAndFetchOne(`SELECT * FROM Test WHERE name = ?`, ['Test Data']);

        expect(result.name).toBe('Test Data');
    });

    it('should fetch one row without parameters from the table', async () => {
        // Insert data into the table
        await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES (?)`, ['Test Data']);

        // Execute and fetch one row from the table
        const result = await queryExecutor.executeAndFetchOne(`SELECT * FROM Test`);

        expect(result.name).toBe('Test Data');
    });

    it('should fetch all rows from the table', async () => {
        // Insert data into the table
        await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES (?)`, ['Test Data 1']);
        await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES (?)`, ['Test Data 2']);

        // Execute and fetch all rows from the table
        const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test`);

        expect(result.length).toBe(2);
        expect(result[0].name).toBe('Test Data 1');
        expect(result[1].name).toBe('Test Data 2');
    });

    it('should fetch multiple rows from the table', async () => {
        // Define the SQL queries and parameters
        const sql = `INSERT INTO Test (name) VALUES (?)`;
        const paramsArray = [['Test Data 1'], ['Test Data 2'], ['Test Data 3']];

        // Execute multiple queries with parameters and commit the changes
        await queryExecutor.executeManyAndCommit(sql, paramsArray);

        // Execute and fetch two rows from the table
        const result = await queryExecutor.executeAndFetchMany(`SELECT * FROM Test`, [], 3);

        expect(result.length).toBe(3);
        expect(result[0].name).toBe('Test Data 1');
        expect(result[1].name).toBe('Test Data 2');
        expect(result[2].name).toBe('Test Data 3');
    });

    it('should fetch multiple rows without parameters from the table', async () => {
        // Insert data into the table
        await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES (?)`, ['Test Data 1']);
        await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES (?)`, ['Test Data 2']);
        await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES (?)`, ['Test Data 3']);

        // Execute and fetch two rows from the table
        const result = await queryExecutor.executeAndFetchMany(`SELECT * FROM Test`);

        expect(result.length).toBe(2);
        expect(result[0].name).toBe('Test Data 1');
        expect(result[1].name).toBe('Test Data 2');
    });

    it('should execute multiple queries with parameters and commit the changes', async () => {
        // Define the SQL queries and parameters
        const sql = `INSERT INTO Test (name) VALUES (?)`;
        const paramsArray = [['Test Data 1'], ['Test Data 2'], ['Test Data 3']];

        // Execute multiple queries with parameters and commit the changes
        await queryExecutor.executeManyAndCommit(sql, paramsArray);

        // Execute and fetch all rows from the table
        const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test`);

        expect(result.length).toBe(3);
        expect(result[0].name).toBe('Test Data 1');
        expect(result[1].name).toBe('Test Data 2');
        expect(result[2].name).toBe('Test Data 3');
    });

    it('should rollback changes on error during executeAndCommit', async () => {
        // Wrap the async call to executeAndCommit
        const error = await getError(async () => {
            // Attempt to create a table with an invalid SQL query (missing closing parenthesis)
            const invalidSql = `CREATE TABLE Test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL`;

            // Execute and commit the invalid query
            await queryExecutor.executeAndCommit(invalidSql);
        });

        // Ensure that the returned error is not an instance of NoErrorThrownError
        expect(error).not.toBeInstanceOf(NoErrorThrownError);

        // Fetch the result from the database to check if the table was not created due to the error
        const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test`);
        expect(result).toEqual([]);
    });

    it('should reject the promise on error during executeAndFetchOne', async () => {
        // Wrap the async call to executeAndFetchOne
        const error = await getError(async () => {
            const nonExistentId = 999;

            // Attempt to fetch a row with a non-existent ID column
            await queryExecutor.executeAndFetchOne(`SELECT * FROM Test WHERE ids = ?`, [nonExistentId]);
        });

        // Ensure that the returned error is not an instance of NoErrorThrownError
        expect(error).not.toBeInstanceOf(NoErrorThrownError);

        // Ensure that the error is properly thrown
        expect(error).toBeTruthy();
    });

    it('should reject the promise on error during executeAndFetchAll', async () => {
        // Wrap the async call to executeAndFetchAll
        const error = await getError(async () => {
            // Use an invalid SQL query to trigger an error
            const invalidSql = `SELECT * FROM NonExistentTable`;

            // Attempt to fetch all rows with an invalid SQL query
            await queryExecutor.executeAndFetchAll(invalidSql);
        });

        // Ensure that the returned error is not an instance of NoErrorThrownError
        expect(error).not.toBeInstanceOf(NoErrorThrownError);

        // Ensure that the error is properly thrown
        expect(error).toBeTruthy();
    });

    it('should rollback changes on error during executeAndFetchMany', async () => {
        // Wrap the async call to executeAndFetchMany
        const error = await getError(async () => {
            // Use an invalid SQL query to trigger an error
            const invalidSql = `SELECT * FROM NonExistentTable`;

            // Attempt to fetch multiple rows with an invalid SQL query
            await queryExecutor.executeAndFetchMany(invalidSql, [], 2);
        });

        // Ensure that the returned error is not an instance of NoErrorThrownError
        expect(error).not.toBeInstanceOf(NoErrorThrownError);

        // Fetch the result from the database to check if the transaction was rolled back due to the error
        const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test`);
        expect(result).toEqual([]);
    });
});


// Define the NoErrorThrownError class wrapper to check if an error was thrown
class NoErrorThrownError extends Error { }

// Wrap the async function call to handle catching the error and returning it for testing
const getError = async (call) => {
    try {
        await call();
        throw new NoErrorThrownError();
    } catch (error) {
        return error;
    }
};