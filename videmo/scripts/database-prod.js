
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');


const tables = path.join(__dirname, '../src/electron/services/sqlite/sql/tables.sql');
const data = path.join(__dirname, '../src/electron/services/sqlite/sql/data.sql');

const DATABASE_PATH = path.join(__dirname, '..', 'public', 'videmo.db');

initProductionDatabase();

async function initProductionDatabase() {
    const production_database = path.join(__dirname, '..', 'public', 'videmo.db');

    if (!fs.existsSync(production_database)) {
        await executeFile(tables);
        await executeFile(data);
    }
}

function executeFile(filePath) {
    const insertDataQuery = fs.readFileSync(filePath, 'utf8');
    const db = new sqlite3.Database(DATABASE_PATH);

    return new Promise((resolve, reject) => {
        db.exec(insertDataQuery, (err) => {
            if (err) {
                console.error('Error inserting data:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}