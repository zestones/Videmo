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
        const params = [serie.basename, serie.name, serie.image, serie.link, serie.extension_id, serie.parent_id, this.dataTypesConverter.convertBooleanToInteger(serie.inLibrary)];
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
        try {
            const sql = `SELECT * FROM Serie WHERE link = ?`;
            const params = [link];
    
            const result = await this.queryExecutor.executeAndFetchOne(sql, params);

            if (result !== null && result !== undefined) {
                result.inLibrary = this.dataTypesConverter.convertIntegerToBoolean(result.inLibrary);
            }

            return result;
        } catch (err) {
            console.error('Error executing query and fetching one result:', err);
            throw err;
        }
    }

    // Read all parent series
    async getAllParentSeries(link) {
        const sql = `WITH RECURSIVE SerieHierarchy AS (
                        SELECT id, parent_id
                        FROM Serie
                        WHERE link = ?
                        
                        UNION ALL

                        SELECT S.id, S.parent_id
                            FROM Serie S
                            JOIN SerieHierarchy SH ON S.id = SH.parent_id
                    )
                    SELECT *
                        FROM Serie
                        WHERE id IN (SELECT id FROM SerieHierarchy);
                    `;
        const params = [link];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Read serie children
    async getSerieChildren(serieId) {
        const sql = `SELECT * FROM Serie WHERE parent_id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
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
                SELECT Serie.*, SerieInfos.number_of_episodes, SerieInfos.total_viewed_episodes 
                    FROM Serie
                    INNER JOIN SerieInfos ON SerieInfos.serie_id = Serie.id
                    WHERE Serie.id IN (SELECT id FROM SerieHierarchy)
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
        const sql = `SELECT 
                Serie.*,
                SerieInfos.id AS serieInfos_id, 
                SerieInfos.serie_id AS serieInfos_serie_id, 
                SerieInfos.description AS serieInfos_description, 
                SerieInfos.duration AS serieInfos_duration, 
                SerieInfos.number_of_episodes AS serieInfos_number_of_episodes, 
                SerieInfos.total_viewed_episodes AS serieInfos_total_viewed_episodes, 
                SerieInfos.rating AS serieInfos_rating, 
                SerieInfos.releaseDate AS serieInfos_releaseDate,
                Genre.id AS genre_id,
                Genre.name AS genre_name
            FROM Serie
            INNER JOIN SerieInfos ON SerieInfos.serie_id = Serie.id
            LEFT JOIN SerieGenre ON SerieInfos.serie_id = SerieGenre.serie_id
            LEFT JOIN Genre ON SerieGenre.genre_id = Genre.id
            WHERE parent_id = ?`;

        const params = [parentId];

        const result = await this.queryExecutor.executeAndFetchAll(sql, params);
        return this.formatSerie(result);
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
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);
        
        return result.map(serie => {
            serie.inLibrary = this.dataTypesConverter.convertIntegerToBoolean(serie.inLibrary);
            return serie;
        });
    }

    // Read all series by category ID
    async getSeriesByCategoryId(categoryId) {
        const sql = `
            SELECT Serie.*,
                SerieInfos.id AS serieInfos_id, 
                SerieInfos.serie_id AS serieInfos_serie_id, 
                SerieInfos.description AS serieInfos_description, 
                SerieInfos.duration AS serieInfos_duration, 
                SerieInfos.number_of_episodes AS serieInfos_number_of_episodes, 
                SerieInfos.total_viewed_episodes AS serieInfos_total_viewed_episodes, 
                SerieInfos.rating AS serieInfos_rating, 
                SerieInfos.releaseDate AS serieInfos_releaseDate,
                Genre.id AS genre_id,
                Genre.name AS genre_name
            FROM Serie
            INNER JOIN SerieCategory ON Serie.id = SerieCategory.serie_id
            INNER JOIN SerieInfos ON Serie.id = SerieInfos.serie_id
            LEFT JOIN SerieGenre ON SerieInfos.serie_id = SerieGenre.serie_id
            LEFT JOIN Genre ON SerieGenre.genre_id = Genre.id
            WHERE SerieCategory.category_id = ?
            ORDER BY Serie.basename ASC;
    `;

        const params = [categoryId];
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        // We format the result
        return this.formatSerie(result);
    }


    async getSeriesByLinks(links) {
        const sql = `
                    SELECT Serie.*,
                        SerieInfos.id AS serieInfos_id, 
                        SerieInfos.serie_id AS serieInfos_serie_id, 
                        SerieInfos.description AS serieInfos_description, 
                        SerieInfos.duration AS serieInfos_duration, 
                        SerieInfos.number_of_episodes AS serieInfos_number_of_episodes, 
                        SerieInfos.total_viewed_episodes AS serieInfos_total_viewed_episodes, 
                        SerieInfos.rating AS serieInfos_rating, 
                        SerieInfos.releaseDate AS serieInfos_releaseDate,
                        Genre.id AS genre_id,
                        Genre.name AS genre_name
                    FROM Serie
                    INNER JOIN SerieInfos ON Serie.id = SerieInfos.serie_id
                    LEFT JOIN SerieGenre ON SerieInfos.serie_id = SerieGenre.serie_id
                    LEFT JOIN Genre ON SerieGenre.genre_id = Genre.id
                    WHERE Serie.link IN (${links.map(() => '?').join(',')})
                    ORDER BY Serie.basename ASC;
                `;


        const params = links;
        const result = await this.queryExecutor.executeAndFetchAll(sql, params);

        // We format the result
        return this.formatSerie(result);
    }

    // format complete serie with all infos
    formatSerie(series) {
        const seriesMap = new Map(); // Use a map to group series by their unique ID

        // Populate the map with series data and genres
        series.forEach(serie => {
            // Check if the series is already in the map
            if (!seriesMap.has(serie.id)) {
                // If not, add it to the map with genres as an array
                seriesMap.set(serie.id, {
                    ...serie,
                    genres: [],
                });
            }

            // Add the genre to the series's genre array
            seriesMap.get(serie.id).genres.push({
                id: serie.genre_id,
                name: serie.genre_name,
            });
        });

        // Convert the map values back to an array
        const seriesList = Array.from(seriesMap.values());

        // We rename the serieInfos columns by removing the prefix "serieInfos_"
        return seriesList.map(serie => {
            serie.inLibrary = this.dataTypesConverter.convertIntegerToBoolean(serie.inLibrary);
            serie.infos = {
                id: serie.serieInfos_id,
                description: serie.serieInfos_description,
                duration: serie.serieInfos_duration,
                number_of_episodes: serie.serieInfos_number_of_episodes,
                total_viewed_episodes: serie.serieInfos_total_viewed_episodes,
                rating: serie.serieInfos_rating,
                releaseDate: serie.serieInfos_releaseDate,
            };

            delete serie.serieInfos_id;
            delete serie.serieInfos_description;
            delete serie.serieInfos_duration;
            delete serie.serieInfos_number_of_episodes;
            delete serie.serieInfos_total_viewed_episodes;
            delete serie.serieInfos_rating;
            delete serie.serieInfos_releaseDate;
            delete serie.serieInfos_serie_id;

            delete serie.genre_id;
            delete serie.genre_name;

            return serie;
        });
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