const QueryExecutor = require('../../../../../electron/services/sqlite/QueryExecutor');
const DataTypesConverter = require('../../../../../electron/utilities/converter/DataTypesConverter.js');
const SerieTrackDAO = require('../../../../../electron/services/dao/series/SerieTrackDAO');

const path = require('path');

describe('SerieTrackDAO', () => {
    let mockQueryExecutor;
    let serieTrackDAO;

    const tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/tables.sql');
    const drop_tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/drop_tables.sql');
    const delete_data = path.join(__dirname, '../../../../../electron/services/sqlite/sql/delete_data.sql');

    beforeAll(async () => {
        mockQueryExecutor = new QueryExecutor();
        serieTrackDAO = new SerieTrackDAO();

        serieTrackDAO.queryExecutor = mockQueryExecutor;
        serieTrackDAO.dataTypesConverter = new DataTypesConverter();

        // Create the SerieCategory table
        await mockQueryExecutor.executeFile(tables);
    });

    afterEach(async () => {
        // Clear the database
        await mockQueryExecutor.executeFile(delete_data);
    });

    afterAll(async () => {
        // Clear the database
        await mockQueryExecutor.executeFile(drop_tables);
    });

    it('should create a track', async () => {
        // Arrange
        const serieId = 1;
        const episodeId = 1;

        // Act
        await serieTrackDAO.createSerieTrack(serieId, episodeId);
        const sql = `SELECT * FROM Track WHERE serie_id = ? AND episode_id = ?`;
        const params = [serieId, episodeId];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result.serie_id).toBe(serieId);
        expect(result.episode_id).toBe(episodeId);
    });

    it('should get tracks by serie id and episode id', async () => {
        // Arrange
        const serieId = 1;
        const episodeId = 1;

        // Act
        await serieTrackDAO.createSerieTrack(serieId, episodeId);
        const result = await serieTrackDAO.getSerieTrackBySerieIdAndEpisodeId(serieId, episodeId);

        // Assert
        expect(result.serie_id).toBe(serieId);
        expect(result.episode_id).toBe(episodeId);
    });

    it('should update a serie track entry', async () => {
        // Arrange
        const serie = {
            id: 1,
            basename: 'Serie 1',
            name: 'Serie 1',
            description: 'Description 1',
            image: 'Image 1',
            link: 'Link 1',
            extension_id: 1,
            inLibrary: 0,
        };

        const episode = {
            id: 1,
            name: 'Episode 1',
            link: 'Link 1',
            viewed: 0,
            bookmarked: 0,
            played_time: 5151351,
        };

        // Insert the serie and episode
        const insertSerieSql = `INSERT INTO Serie (id, basename, name, description, image, link, extension_id, inLibrary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const insertSerieParams = [serie.id, serie.basename, serie.name, serie.description, serie.image, serie.link, serie.extension_id, serie.inLibrary];
        await mockQueryExecutor.executeAndCommit(insertSerieSql, insertSerieParams);

        const insertEpisodeSql = `INSERT INTO Episode (id, name, link, viewed, bookmarked, played_time) VALUES (?, ?, ?, ?, ?, ?)`;
        const insertEpisodeParams = [episode.id, episode.name, episode.link, episode.viewed, episode.bookmarked, episode.played_time];
        await mockQueryExecutor.executeAndCommit(insertEpisodeSql, insertEpisodeParams);

        // Act
        await serieTrackDAO.createSerieTrack(serie.id, episode.id);
        await serieTrackDAO.updateSerieTrack(JSON.stringify(serie), JSON.stringify(episode));

        const sql = `SELECT * FROM Track WHERE serie_id = ? AND episode_id = ?`;
        const params = [serie.id, episode.id];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result.serie_id).toBe(serie.id);
        expect(result.episode_id).toBe(episode.id);
    });

    it('should delete a serie track entry', async () => {
        // Arrange
        const serieId = 1;
        const episodeId = 1;

        // Act
        await serieTrackDAO.createSerieTrack(serieId, episodeId);
        await serieTrackDAO.deleteSerieTrack(serieId, episodeId);
        const sql = `SELECT * FROM Track WHERE serie_id = ? AND episode_id = ?`;
        const params = [serieId, episodeId];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result).toBeUndefined();
    });
});