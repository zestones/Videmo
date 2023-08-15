const QueryExecutor = require('../../../../../electron/services/sqlite/QueryExecutor');
const SerieEpisodeDAO = require('../../../../../electron/services/dao/series/SerieEpisodeDAO');
const DataTypesConverter = require('../../../../../electron/utilities/converter/DataTypesConverter.js');

const path = require('path');


describe('SerieEpisodeDAO', () => {
    let mockQueryExecutor;
    let serieEpisodeDAO;

    const tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/tables.sql');
    const drop_tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/drop_tables.sql');
    const delete_data = path.join(__dirname, '../../../../../electron/services/sqlite/sql/delete_data.sql');

    beforeAll(async () => {
        mockQueryExecutor = new QueryExecutor();
        serieEpisodeDAO = new SerieEpisodeDAO();

        serieEpisodeDAO.queryExecutor = mockQueryExecutor;
        serieEpisodeDAO.dataTypesConverter = new DataTypesConverter();

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

    it('should insert an episode', async () => {
        // Arrange
        const episode = {
            name: 'Episode 1',
            link: 'https://www.google.com',
            viewed: false,
            bookmarked: false,
            played_time: 0
        };

        // Act
        await serieEpisodeDAO.createEpisode(episode);
        const sql = `SELECT * FROM Episode WHERE link = ?`;
        const params = [episode.link];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result.name).toBe(episode.name);
        expect(result.link).toBe(episode.link);
        expect(result.viewed).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(episode.viewed));
        expect(result.bookmarked).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(episode.bookmarked));
        expect(result.played_time).toBe(episode.played_time);
    });

    it('should get an episode by its link', async () => {
        // Arrange
        const episode = {
            name: 'Episode 1',
            link: 'https://www.google.com',
            viewed: false,
            bookmarked: false,
            played_time: 0
        };

        // Insert an episode
        await serieEpisodeDAO.createEpisode(episode);

        // Act
        const result = await serieEpisodeDAO.getEpisodeByLink(episode.link);

        // Assert
        expect(result.name).toBe(episode.name);
        expect(result.link).toBe(episode.link);
        expect(result.viewed).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(episode.viewed));
        expect(result.bookmarked).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(episode.bookmarked));
        expect(result.played_time).toBe(episode.played_time);
    });

    it('should get all episodes by serie link', async () => {
        // Arrange
        const episode1 = {
            name: 'Episode 1',
            link: 'https://episode-1.com',
            viewed: false,
            bookmarked: false,
            played_time: 1265136
        };

        const episode2 = {
            name: 'Episode 2',
            link: 'https://episode-2.com',
            viewed: false,
            bookmarked: false,
            played_time: 0
        };

        const serie = {
            id: 1,
            basename: 'serie',
            name: 'Serie',
            description: 'Description',
            image: 'image.png',
            link: 'https:serie-1.com',
            extension_id: 1,
            inLibrary: 1
        };

        // Insert episodes
        await serieEpisodeDAO.createEpisode(episode1);
        await serieEpisodeDAO.createEpisode(episode2);

        // Insert a Serie
        const sql = `INSERT INTO Serie (basename, name, description, image, link, extension_id, inLibrary) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [serie.basename, serie.name, serie.description, serie.image, serie.link, serie.extension_id, serie.inLibrary];
        await mockQueryExecutor.executeAndCommit(sql, params);

        // Insert Track
        const insertTrackSql = `INSERT INTO Track (serie_id, episode_id) VALUES (?, ?)`;
        await mockQueryExecutor.executeAndCommit(insertTrackSql, [serie.id, 1]);
        await mockQueryExecutor.executeAndCommit(insertTrackSql, [serie.id, 2]);

        // Act
        const result = await serieEpisodeDAO.getAllEpisodesBySerieLink(serie.link);

        // Assert
        expect(result.length).toBe(2);
        result.forEach((episode) => {
            expect(episode.name).toBe(episode.name);
            expect(episode.link).toBe(episode.link);
            expect(episode.viewed).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(episode.viewed));
            expect(episode.bookmarked).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(episode.bookmarked));
            expect(episode.played_time).toBe(episode.played_time);
        });
    });

    it('should update an episode', async () => {
        // Arrange
        const episode = {
            name: 'Episode 1',
            link: 'https://www.google.com',
            viewed: false,
            bookmarked: false,
            played_time: 0
        };

        // Insert an episode
        await serieEpisodeDAO.createEpisode(episode);

        // Act
        const newEpisode = {
            id: 1,
            viewed: true,
            bookmarked: true,
            played_time: 123456
        };

        await serieEpisodeDAO.updateEpisode(newEpisode);

        const sql = `SELECT * FROM Episode WHERE link = ?`;
        const params = [episode.link];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result.viewed).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(newEpisode.viewed));
        expect(result.bookmarked).toBe(serieEpisodeDAO.dataTypesConverter.convertBooleanToInteger(newEpisode.bookmarked));
        expect(result.played_time).toBe(newEpisode.played_time);
    });
});