const QueryExecutor = require('../../sqlite/QueryExecutor');

class ExtensionsDAO {
    constructor() {
        this.db = new QueryExecutor();
    }

    // Create a new extension
    createExtension(link, name, type_id) {
        const sql = 'INSERT INTO Extension (link, name, type_id) VALUES (?, ?, ?)';
        const params = [link, name, type_id];

        this.db.executeAndCommit(sql, params);
    }

    // Read extension by ID
    getExtensionById(extensionId) {
        const sql = 'SELECT * FROM Extension WHERE id = ?';
        const params = [extensionId];

        return this.db.executeAndFetchOne(sql, params);
    }

    // Read all extensions
    getAllExtensions() {
        const sql = 'SELECT * FROM Extension';
        return this.db.executeAndFetchAll(sql);
    }

    // Update extension by ID
    async updateExtensionById(extensionId, link, name, type_id) {
        const sql = 'UPDATE Extension SET link = ?, name = ?, type_id = ? WHERE id = ?';
        const params = [link, name, type_id, extensionId];
        
        this.db.executeAndCommit(sql, params);
    }

    // Delete extension by ID
    deleteExtensionById(extensionId) {
        const sql = 'DELETE FROM Extension WHERE id = ?';
        const params = [extensionId];

        this.db.executeAndCommit(sql, params);
    }
}


module.exports = ExtensionsDAO;