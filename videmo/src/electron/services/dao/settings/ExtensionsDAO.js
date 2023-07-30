const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter');

class ExtensionsDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Create a new extension
    createExtension(link, name, local) {
        const sql = 'INSERT INTO Extension (link, name, local) VALUES (?, ?, ?)';
        const params = [link, name, local ? 1 : 0];
        
        this.queryExecutor.executeAndCommit(sql, params);
        return this;
    }

    // Read extension by ID
    getExtensionById(extensionId) {
        const sql = 'SELECT * FROM Extension WHERE id = ?';
        const params = [extensionId];

        return this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Read all extensions
    getAllExtensions() {
        const sql = 'SELECT * FROM Extension';
        return this.queryExecutor.executeAndFetchAll(sql);
    }

    // Update extension by ID
    async updateExtension(extension) {
        const parsedExtension = JSON.parse(extension);
        parsedExtension.local = this.dataTypesConverter.convertBooleanToInteger(parsedExtension.local);

        const sql = 'UPDATE Extension SET link = ?, name = ?, local = ? WHERE id = ?';
        const params = [parsedExtension.link, parsedExtension.name, parsedExtension.local, parsedExtension.id];
        
        this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete extension by ID
    deleteExtensionById(extensionId) {
        const sql = 'DELETE FROM Extension WHERE id = ?';
        const params = [extensionId];

        this.queryExecutor.executeAndCommit(sql, params);
    }
}


module.exports = ExtensionsDAO;