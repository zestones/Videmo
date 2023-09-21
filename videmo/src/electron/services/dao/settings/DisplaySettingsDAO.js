const QueryExecutor = require('../../sqlite/QueryExecutor');

class DisplaySettingsDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.DISPLAY_OPTION_TYPE = { COMPACT: 1, SPACED: 2, LIST: 3 };
    }

    // Read all card settings
    async getAllDisplaySettings() {
        const sql = 'SELECT * FROM DisplaySettings';
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Get the CardSetting display option
    async getDisplayMode() {
        const sql = 'SELECT * FROM DisplaySettings INNER JOIN DisplayMode ON DisplaySettings.display_mode_id = DisplayMode.id';
        return await this.queryExecutor.executeAndFetchOne(sql);
    } 

    // Update the CardSetting display option
    async updateDisplayMode(displayModeId) {
        const sql = 'UPDATE DisplaySettings SET display_mode_id = ?';
        await this.queryExecutor.executeAndCommit(sql, [displayModeId]);

        return await this.getDisplayMode();
    }
}

module.exports = DisplaySettingsDAO;