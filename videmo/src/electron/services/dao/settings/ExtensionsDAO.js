const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter');

class ExtensionsDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Create a new extension
    async createExtension(link, name, local, isActive = true) {
        const retrievedExtension = await this.getExtensionByLink(link);
        if (retrievedExtension) throw new Error('Local source already exists !');

        const sql = 'INSERT INTO Extension (link, name, local, is_active) VALUES (?, ?, ?, ?)';
        const params = [link, name, this.dataTypesConverter.convertBooleanToInteger(local), this.dataTypesConverter.convertBooleanToInteger(isActive)];

        await this.queryExecutor.executeAndCommit(sql, params);
        return await this.getExtensionByLink(link);
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

        const extension = await this.queryExecutor.executeAndFetchOne(sql, params);
        return this.#convertExtensionBooleanValues(extension);
    }

    // Read all extensions
    async getAllExtensions() {
        const sql = 'SELECT * FROM Extension';
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    async getAllActiveExtensions() {
        const sql = 'SELECT * FROM Extension WHERE is_active = ?';
        const params = [this.dataTypesConverter.convertBooleanToInteger(true)];

        const extensions = await this.queryExecutor.executeAndFetchAll(sql, params);
        return extensions.map((extension) => this.#convertExtensionBooleanValues(extension));
    }

    // Update extension by ID
    async updateExtension(extension) {
        const parsedExtension = JSON.parse(extension);
        parsedExtension.local = this.dataTypesConverter.convertBooleanToInteger(parsedExtension.local);

        const sql = 'UPDATE Extension SET link = ?, name = ?, local = ? WHERE id = ?';
        const params = [parsedExtension.link, parsedExtension.name, parsedExtension.local, parsedExtension.id];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Update extension is_active by ID
    async updateExtensionIsActive(extensionId, isActive) {
        const sql = 'UPDATE Extension SET is_active = ? WHERE id = ?';
        const params = [this.dataTypesConverter.convertBooleanToInteger(isActive), extensionId];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete extension by ID
    async deleteExtensionById(extensionId) {
        const sql = 'DELETE FROM Extension WHERE id = ?';
        const params = [extensionId];

        await this.queryExecutor.executeAndCommit(sql, params);
    }

    #convertExtensionBooleanValues(extension) {
        if (extension) {
            extension.local = this.dataTypesConverter.convertIntegerToBoolean(extension.local);
            extension.is_active = this.dataTypesConverter.convertIntegerToBoolean(extension.is_active);
        }
        return extension;
    }
}


module.exports = ExtensionsDAO;