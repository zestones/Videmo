const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');


class ThemeDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Read all themes
    async getThemes() {
        const sql = 'SELECT * FROM Theme';
        const result = await this.queryExecutor.executeAndFetchAll(sql);
        return result.map((theme) => {
            theme.is_active = this.dataTypesConverter.convertIntegerToBoolean(theme.is_active);
            return theme;
        });
    }

    // Read active theme
    async getActiveTheme() {
        const sql = 'SELECT * FROM Theme WHERE is_active = 1';
        const result = await this.queryExecutor.executeAndFetchOne(sql);
        result.is_active = this.dataTypesConverter.convertIntegerToBoolean(result.is_active);
        return result;
    }

    // Update active theme
    async updateActiveTheme(themeId, isActive) {
        // Set all themes to inactive
        const activeTheme = await this.getActiveTheme();
        if (activeTheme) await this.#updateActiveTheme(activeTheme.id, false);

        // Set the selected theme to active
        await this.#updateActiveTheme(themeId, isActive);
    }

    async #updateActiveTheme(themeId, isActive) {
        const sql = 'UPDATE Theme SET is_active = ? WHERE id = ?';
        const params = [this.dataTypesConverter.convertBooleanToInteger(isActive), themeId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = ThemeDAO;