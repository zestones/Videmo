const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter');

class ExtensionsDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Create a new extension
    async createExtension(link, name, local) {
        const retrievedExtension = await this.getExtensionByLink(link);
        if (retrievedExtension) throw new Error('Local source already exists !'); 

        const sql = 'INSERT INTO Extension (link, name, local) VALUES (?, ?, ?)';
        const params = [link, name, this.dataTypesConverter.convertBooleanToInteger(local)];
        
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Read extension by ID
    async getExtensionById(extensionId) {
        const sql = 'SELECT * FROM Extension WHERE id = ?';
        const params = [extensionId];

        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    async getExtensionByLink(link) {
        const sql = 'SELECT * FROM Extension WHERE link = ?';
        const params = [link];

        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Read all extensions
    async getAllExtensions() {
        const sql = 'SELECT * FROM Extension';
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Update extension by ID
    async updateExtension(extension) {
        const parsedExtension = JSON.parse(extension);
        parsedExtension.local = this.dataTypesConverter.convertBooleanToInteger(parsedExtension.local);

        const sql = 'UPDATE Extension SET link = ?, name = ?, local = ? WHERE id = ?';
        const params = [parsedExtension.link, parsedExtension.name, parsedExtension.local, parsedExtension.id];
        
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete extension by ID
    async deleteExtensionById(extensionId) {
        const sql = 'DELETE FROM Extension WHERE id = ?';
        const params = [extensionId];

        await this.queryExecutor.executeAndCommit(sql, params);
    }
}


module.exports = ExtensionsDAO;