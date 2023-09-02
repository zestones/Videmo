const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');

class SerieDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
    }

    // Create a new serie
    async createSerie(serie) {
        const sql = `INSERT INTO Serie (basename, name, image, link, extension_id, parent_id, inLibrary) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [serie.basename, serie.name, serie.image, serie.link, serie.extension_id, serie.parent_id, serie.inLibrary];
        await this.queryExecutor.executeAndCommit(sql, params);

        return await this.getSerieByLink(serie.link);
    }

    // Read all series
    async getAllSeries() {
        const sql = `SELECT * FROM Serie`;
        return await this.queryExecutor.executeAndFetchAll(sql);
    }

    // Read serie by ID
    async getSerieById(serieId) {
        const sql = `SELECT * FROM Serie WHERE id = ?`;
        const params = [serieId];

        const result = await this.queryExecutor.executeAndFetchOne(sql, params);
        result.inLibrary = this.dataTypesConverter.convertIntegerToBoolean(result.inLibrary);
        return result;
    }

    // Read serie by link
    async getSerieByLink(link) {
        const sql = `SELECT * FROM Serie WHERE link = ?`;
        const params = [link];
        return await this.queryExecutor.executeAndFetchOne(sql, params);
    }

    // Read serie children
    async getSerieChildren(serieId) {
        const sql = `SELECT * FROM Serie WHERE parent_id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    async getNumberOfEpisodes(series) {
        let newSeries = [];

        for (const serie of series) {

            const childsSeries = await this.getSeriesChildrenByLinks([serie.link]);
            const serieIds = childsSeries.map(serie => serie.id);

            const idsConditions = [];
            serieIds.forEach(_ => idsConditions.push("Serie.id = ?"));
            const idsCondition = idsConditions.join(" OR ");


            const sql = `SELECT COUNT(*) AS number FROM Episode
                    INNER JOIN Track ON Episode.id = Track.episode_id
                    INNER JOIN Serie ON Serie.id = Track.serie_id
                    WHERE ${idsCondition}`;

            const params = serieIds;
            const result = await this.queryExecutor.executeAndFetchOne(sql, params);
            serie.number = result.number;
            newSeries.push(serie);
        }

        return newSeries;
    }

    async getSeriesChildrenByLinks(links) {
        const linkConditions = [];
        links.forEach(_ => linkConditions.push("Serie.link = ?"));

        // Combine link conditions with the OR operator
        const linkCondition = linkConditions.join(" OR ");

        const sql = `WITH RECURSIVE SerieHierarchy AS (
                        SELECT id, parent_id
                        FROM Serie
                        WHERE ${linkCondition}
                        
                        UNION ALL
                        
                        SELECT S.id, S.parent_id
                            FROM Serie S
                            JOIN SerieHierarchy SH ON S.parent_id = SH.id
                    )
                    SELECT *
                        FROM Serie
                        WHERE id IN (SELECT id FROM SerieHierarchy);
                `;

        const params = links;
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        return result.map(serie => {
            serie.inLibrary = this.dataTypesConverter.convertIntegerToBoolean(serie.inLibrary);
            return serie;
        });
    }

    // Read all series by parent ID
    async getSeriesByParentId(parentId) {
        const sql = `SELECT * FROM Serie WHERE parent_id = ?`;
        const params = [parentId];

        const result = await this.queryExecutor.executeAndFetchAll(sql, params);
        return result.map(serie => {
            serie.inLibrary = this.dataTypesConverter.convertIntegerToBoolean(serie.inLibrary);
            return serie;
        });
    }

    // Read all series in library by extension
    async getAllSeriesInLibraryByExtension(extension) {
        const sql = `
            SELECT s.*
            FROM Serie AS s
            INNER JOIN Extension AS e ON s.extension_id = e.id
            WHERE e.id = ?
            AND s.inLibrary = 1
            ORDER BY s.basename ASC
        `;

        const params = [extension.id];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Read all series by category ID
    async getSeriesByCategoryId(categoryId) {
        const sql = `
            SELECT Serie.*
            FROM Serie
            INNER JOIN SerieCategory ON Serie.id = SerieCategory.serie_id
            WHERE SerieCategory.category_id = ?
            ORDER BY Serie.basename ASC`;

        const params = [categoryId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Update serie by ID (add serie to library)
    async updateSerieInLibrary(serieId, inLibrary) {
        const sql = `UPDATE Serie SET inLibrary = ? WHERE id = ?`;
        const params = [inLibrary, serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Update series by serie links (add serie to library)
    async updateSeriesInLibraryBySerieLinks(serieLinks, inLibrary) {
        const sql = `UPDATE Serie SET inLibrary = ? WHERE link IN (${serieLinks.map(() => '?').join(',')})`;
        const params = [this.dataTypesConverter.convertBooleanToInteger(inLibrary), ...serieLinks];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete serie by ID
    async deleteSerieById(serieId) {
        const sql = `DELETE FROM Serie WHERE id = ?`;
        const params = [serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieDAO;