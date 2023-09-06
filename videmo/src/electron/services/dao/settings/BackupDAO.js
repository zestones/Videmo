const { app } = require('electron');
const path = require('path');


const QueryExecutor = require('../../sqlite/QueryExecutor');

class BackupDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();

    }

    async generateBackup() {
        const date = new Date();
        const fileName = `backup-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.db`;

        const downloadsPath = app.getPath('downloads');
        const filePath = path.join(downloadsPath, fileName);

        await this.queryExecutor.createDatabaseBackup(filePath);
    }

    async restoreBackup(filePath) {
        return await this.queryExecutor.restoreDatabaseBackup(filePath);
    }
}


module.exports = BackupDAO;