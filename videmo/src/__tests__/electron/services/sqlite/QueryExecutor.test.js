const QueryExecutor = require('../../../../electron/services/sqlite/QueryExecutor');
const SQLiteQueryExecutor = require('../../../../electron/services/sqlite/SQLiteQueryExecutor');

describe('QueryExecutor database connection', () => {
	let queryExecutor;
	let mockSQLiteQueryExecutor;

	beforeAll(async () => {
		mockSQLiteQueryExecutor = new SQLiteQueryExecutor();

		await mockSQLiteQueryExecutor.open();

		// Create an instance of the QueryExecutor with the mock SQLiteQueryExecutor
		queryExecutor = new QueryExecutor();
		queryExecutor.sqlQueryExecutor = mockSQLiteQueryExecutor;
	});

	it('should open a database connection', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's open method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'open');

		// Execute the open method
		await queryExecutor.open();

		// Verify that the open method was called
		expect(spy).toHaveBeenCalled();
	});

	it('should close a database connection', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's close method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'close');

		// Execute the close method
		await queryExecutor.close();

		// Verify that the close method was called
		expect(spy).toHaveBeenCalled();
	});

	it('should fail to open a database connection', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's open method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'open');
		const ERROR_MESSAGE = 'Error opening database connection';

		// Mock the open method to throw an error
		spy.mockImplementation(() => {
			throw new Error(ERROR_MESSAGE);
		});

		// Execute the open method
		const error = await getError(() => queryExecutor.open());

		// Verify that the open method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the error was thrown
		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeTruthy();
		expect(error.message).toBe(ERROR_MESSAGE);
	});

	it('should fail to close a database connection', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's close method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'close');
		const ERROR_MESSAGE = 'Error closing database connection';

		// Mock the close method to throw an error
		spy.mockImplementation(() => {
			throw new Error(ERROR_MESSAGE);
		});

		// Execute the close method
		const error = await getError(() => queryExecutor.close());

		// Verify that the close method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the error was thrown
		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeTruthy();
		expect(error.message).toBe(ERROR_MESSAGE);
	});
});


describe('QueryExecutor database queries', () => {
	let queryExecutor;
	let mockSQLiteQueryExecutor;

	beforeEach(async () => {
		mockSQLiteQueryExecutor = new SQLiteQueryExecutor();
		queryExecutor = new QueryExecutor();
		queryExecutor.sqlQueryExecutor = mockSQLiteQueryExecutor;

		const sql = `CREATE TABLE IF NOT EXISTS Test (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL
			)`;
		await queryExecutor.executeAndCommit(sql);
	});

	afterEach(async () => {
		// Clear the Test table after each test
		await queryExecutor.executeAndCommit('DELETE FROM Test;');
		await queryExecutor.executeAndCommit('DROP TABLE IF EXISTS Test;');
	});

	it('should execute and commit a query', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's executeAndCommit method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndCommit');

		// Create the SQL query
		const sql = 'INSERT INTO Test (name) VALUES (?);';
		const params = ['First'];

		// Execute the query
		await queryExecutor.executeAndCommit(sql, params);

		// Verify that the executeAndCommit method was called
		expect(spy).toHaveBeenCalled();
	});

	it('should fail to execute and commit a query', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's executeAndCommit method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndCommit');

		// Create the SQL query
		const sql = 'INSERT Test (name) VALUES (?);'; // Invalid SQL
		const params = ['First'];

		// Execute the query
		const error = await getError(async () => await queryExecutor.executeAndCommit(sql, params));

		// Verify that the executeAndCommit method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the error was thrown
		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeTruthy();
	});

	it('should execute and and fetch one row from a query', async () => {
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('Second')`);

		// Create a spy for the mock SQLiteQueryExecutor's executeAndFetchOne method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndFetchOne');

		const sql = `SELECT * FROM Test WHERE id = ?;`;
		const params = [1];

		// Execute the query
		const result = await queryExecutor.executeAndFetchOne(sql, params);

		// Verify that the executeAndFetchOne method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the result is correct
		expect(result).toBeTruthy();
		expect(result.id).toBe(1);
		expect(result.name).toBe('Second');
	});

	it('should fail to execute and and fetch one row from a query', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's close method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndFetchOne');
		const ERROR_MESSAGE = 'Error executing query and fetching one row';

		// Mock the executeAndFetchOne method to throw an error
		spy.mockImplementation(() => { throw new Error(ERROR_MESSAGE) });

		const sql = `SELECT * FROM Test WHERE id = ?;`;
		const params = [1];

		// Execute the query
		const error = await getError(async () => await queryExecutor.executeAndFetchOne(sql, params));

		// Verify that the executeAndFetchOne method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the error was thrown
		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeTruthy();
		expect(error.message).toBe(ERROR_MESSAGE);
	});

	it('should execute and and fetch all rows from a query', async () => {
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('First')`);
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('Second')`);

		// Create a spy for the mock SQLiteQueryExecutor's executeAndFetchAll method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndFetchAll');

		const sql = `SELECT * FROM Test;`;

		// Execute the query
		const result = await queryExecutor.executeAndFetchAll(sql);

		// Verify that the executeAndFetchAll method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the result is correct
		expect(result).toBeTruthy();
		expect(result.length).toBe(2);
		expect(result[0].id).toBe(1);
		expect(result[0].name).toBe('First');
		expect(result[1].id).toBe(2);
		expect(result[1].name).toBe('Second');
	});

	it('should fail to execute and and fetch all rows from a query', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's close method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndFetchAll');
		const ERROR_MESSAGE = 'Error executing query and fetching all rows';

		// Mock the executeAndFetchAll method to throw an error
		spy.mockImplementation(() => { throw new Error(ERROR_MESSAGE) });

		const sql = `SELECT * FROM Test;`;

		// Execute the query
		const error = await getError(async () => await queryExecutor.executeAndFetchAll(sql));

		// Verify that the executeAndFetchAll method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the error was thrown
		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeTruthy();
		expect(error.message).toBe(ERROR_MESSAGE);
	});

	it('should execute and and fetch all rows from a query with parameters', async () => {
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('First')`);
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('Second')`);

		// Create a spy for the mock SQLiteQueryExecutor's executeAndFetchAll method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndFetchAll');

		const sql = `SELECT * FROM Test WHERE id = ?;`;
		const params = [1];

		// Execute the query
		const result = await queryExecutor.executeAndFetchAll(sql, params);

		// Verify that the executeAndFetchAll method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the result is correct
		expect(result).toBeTruthy();
		expect(result.length).toBe(1);
		expect(result[0].id).toBe(1);
		expect(result[0].name).toBe('First');
	});

	it('should execute and fetch many rows from a query', async () => {
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('First')`);
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('Second')`);
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('Third')`);
		await queryExecutor.executeAndCommit(`INSERT INTO Test (name) VALUES ('Fourth')`);

		// Create a spy for the mock SQLiteQueryExecutor's executeAndFetchMany method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndFetchMany');

		const sql = `SELECT * FROM Test;`;

		// Execute the query
		const result = await queryExecutor.executeAndFetchMany(sql, [], 3);

		// Verify that the executeAndFetchMany method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the result is correct
		expect(result).toBeTruthy();
		expect(result.length).toBe(3);
	});

	it('should fail to execute and fetch many rows from a query', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's close method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeAndFetchMany');
		const ERROR_MESSAGE = 'Error executing query and fetching many rows';

		// Mock the executeAndFetchMany method to throw an error
		spy.mockImplementation(() => { throw new Error(ERROR_MESSAGE) });

		const sql = `SELECT * FROM Test;`;

		// Execute the query
		const error = await getError(async () => await queryExecutor.executeAndFetchMany(sql, [], 3));

		// Verify that the executeAndFetchMany method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the error was thrown
		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeTruthy();
		expect(error.message).toBe(ERROR_MESSAGE);
	});

	it('should execute many and commit the changes', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's executeMany method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeManyAndCommit');

		const sql = `INSERT INTO Test (name) VALUES (?);`;
		const params = [['First'], ['Second'], ['Third']];

		// Execute the query
		await queryExecutor.executeManyAndCommit(sql, params);

		// Verify that the executeManyAndCommit method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the changes were committed
		const result = await queryExecutor.executeAndFetchAll(`SELECT * FROM Test;`);
		expect(result).toBeTruthy();
		expect(result.length).toBe(3);
		expect(result[0].id).toBe(1);
		expect(result[0].name).toBe('First');
		expect(result[1].id).toBe(2);
		expect(result[1].name).toBe('Second');
		expect(result[2].id).toBe(3);
		expect(result[2].name).toBe('Third');
	});

	it('should fail to execute many and commit the changes', async () => {
		// Create a spy for the mock SQLiteQueryExecutor's close method
		const spy = jest.spyOn(mockSQLiteQueryExecutor, 'executeManyAndCommit');
		const ERROR_MESSAGE = 'Error executing many and committing the changes';

		// Mock the executeManyAndCommit method to throw an error
		spy.mockImplementation(() => { throw new Error(ERROR_MESSAGE) });

		const sql = `INSERT INTO Test (name) VALUES (?);`;
		const params = [['First'], ['Second'], ['Third']];

		// Execute the query
		const error = await getError(async () => await queryExecutor.executeManyAndCommit(sql, params));

		// Verify that the executeManyAndCommit method was called
		expect(spy).toHaveBeenCalled();

		// Verify that the error was thrown
		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeTruthy();
		expect(error.message).toBe(ERROR_MESSAGE);
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

