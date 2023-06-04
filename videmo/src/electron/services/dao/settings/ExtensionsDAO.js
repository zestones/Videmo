const QueryExecutor = require('../../sqlite/QueryExecutor');

class ExtensionsDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
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
    async updateExtensionById(extensionId, link, name, type_id) {
        const sql = 'UPDATE Extension SET link = ?, name = ?, type_id = ? WHERE id = ?';
        const params = [link, name, type_id, extensionId];
        
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