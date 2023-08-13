const fs = require('fs');
const path = require('path');

const testDatabaseFilePath = path.join(__dirname, '../src/electron/services/sqlite/sql/videmo.test.db');

if (fs.existsSync(testDatabaseFilePath)) {
    fs.unlinkSync(testDatabaseFilePath);
}