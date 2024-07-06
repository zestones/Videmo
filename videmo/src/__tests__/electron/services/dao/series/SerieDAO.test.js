const QueryExecutor = require('../../../../../electron/services/sqlite/QueryExecutor');
const SerieDAO = require('../../../../../electron/services/dao/series/SerieDAO');
const DataTypesConverter = require('../../../../../electron/utilities/converter/DataTypesConverter.js');

const path = require('path');


describe('SerieDAO', () => {
    let mockQueryExecutor;
    let serieDAO;

    const tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/tables.sql');
    const drop_tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/drop_tables.sql');
    const delete_data = path.join(__dirname, '../../../../../electron/services/sqlite/sql/delete_data.sql');

    beforeAll(async () => {
        mockQueryExecutor = new QueryExecutor();
        serieDAO = new SerieDAO();

        serieDAO.queryExecutor = mockQueryExecutor;
        serieDAO.dataTypesConverter = new DataTypesConverter();

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

    it('should insert a serie', async () => {
        // Arrange
        const serie = {
            basename: 'serie',
            name: 'Serie',
            image: 'image.png',
            link: 'serie',
            extension_id: 1,
            inLibrary: 1,
            parent_id: 1
        };

        // Act
        await serieDAO.createSerie(serie);
        const sql = `SELECT * FROM Serie WHERE basename = ?`;
        const params = [serie.basename];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result.basename).toBe(serie.basename);
        expect(result.name).toBe(serie.name);
        expect(result.image).toBe(serie.image);
        expect(result.link).toBe(serie.link);
        expect(result.extension_id).toBe(serie.extension_id);
        expect(result.inLibrary).toBe(serie.inLibrary);
        expect(result.parent_id).toBe(serie.parent_id);
    });

    it('should get all series', async () => {
        // Arrange
        const serie1 = {
            basename: 'serie1',
            name: 'Serie 1',
            image: 'image1.png',
            link: 'serie1',
            extension_id: 1,
            inLibrary: 1,
            parent_id: 1
        };

        const serie2 = {
            basename: 'serie2',
            name: 'Serie 2',
            image: 'image2.png',
            link: 'serie2',
            extension_id: 1,
            inLibrary: 1,
            parent_id: 1
        };

        // Insert series
        await serieDAO.createSerie(serie1);
        await serieDAO.createSerie(serie2);

        // Act
        const result = await serieDAO.getAllSeries();

        // remove the id property
        result.forEach(serie => delete serie.id);

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(serie1);
        expect(result[1]).toEqual(serie2);
    });

    it('should get a serie by id', async () => {
        // Arrange
        const serie = {
            basename: 'serie',
            name: 'Serie',
            image: 'image.png',
            link: 'serie',
            extension_id: 1,
            inLibrary: true,
            parent_id: 1
        };

        // Insert serie
        await serieDAO.createSerie(serie);

        // Act
        const result = await serieDAO.getSerieById(1);

        // remove the id property
        delete result.id;

        // Assert
        expect(result).toEqual(serie);
    });

    it('should get a serie by link', async () => {
        // Arrange
        const serie = {
            basename: 'serie',
            name: 'Serie',
            image: 'image.png',
            link: 'serie',
            extension_id: 1,
            inLibrary: true,
            parent_id: 1
        };

        // Insert serie
        await serieDAO.createSerie(serie);

        // Act
        const result = await serieDAO.getSerieByLink(serie.link);

        // remove the id property
        delete result.id;

        // Assert
        expect(result).toEqual(serie);
    });

    it('should get all series inside library by extension id', async () => {
        // Arrange
        const extension = { id: 1, name: 'Extension 1' };
        const serie1 = {
            basename: 'serie1',
            name: 'Serie 1',
            image: 'image1.png',
            link: 'serie1',
            extension_id: extension.id,
            inLibrary: true,
            parent_id: 1
        };

        const serie2 = {
            basename: 'serie2',
            name: 'Serie 2',
            image: 'image2.png',
            link: 'serie2',
            extension_id: extension.id,
            inLibrary: true,
            parent_id: 1
        };

        const serie3 = {
            basename: 'serie3',
            name: 'Serie 3',
            image: 'image3.png',
            link: 'serie3',
            extension_id: 2,
            inLibrary: true,
            parent_id: 1
        };

        // Insert series
        await serieDAO.createSerie(serie1);
        await serieDAO.createSerie(serie2);
        await serieDAO.createSerie(serie3);

        // Insert extension
        await mockQueryExecutor.executeAndCommit(`INSERT INTO Extension (id, name) VALUES (?, ?)`, [extension.id, extension.name]);

        // Act
        const result = await serieDAO.getAllSeriesInLibraryByExtension(extension);

        // remove the id property
        result.forEach(serie => delete serie.id);

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(serie1);
        expect(result[1]).toEqual(serie2);
    });

    it('should get all series by category id', async () => {
        // Arrange
        const category = { id: 2, name: 'Category 1' };
        const serie1 = {
            basename: 'serie1',
            name: 'Serie 1',
            image: 'image1.png',
            link: 'serie1',
            extension_id: 1,
            inLibrary: true,
            parent_id: 1,
            extension: { name: 'Extension 1', local: 1 }
        };

        const serie2 = {
            basename: 'serie2',
            name: 'Serie 2',
            image: 'image2.png',
            link: 'serie2',
            extension_id: 1,
            inLibrary: true,
            parent_id: 1,
            extension: { name: 'Extension 1', local: 1 }
        };

        const serie3 = {
            basename: 'serie3',
            name: 'Serie 3',
            image: 'image3.png',
            link: 'serie3',
            extension_id: 3,
            inLibrary: true,
            parent_id: 1,
            extension: { id: 3, name: 'Extension 3' }
        };

        // Insert series
        const insertedSerie1 = await serieDAO.createSerie(serie1);
        const insertedSerie2 = await serieDAO.createSerie(serie2);
        await serieDAO.createSerie(serie3);

        // Insert extension
        await mockQueryExecutor.executeAndCommit(`INSERT INTO Extension (id, name, local) VALUES (?, ?, ?)`, [1, 'Extension 1', 1]);

        // Insert category
        await mockQueryExecutor.executeAndCommit(`INSERT INTO Category (id, name) VALUES (?, ?)`, [category.id, category.name]);

        // Insert category_serie
        await mockQueryExecutor.executeAndCommit(`INSERT INTO SerieCategory (category_id, serie_id) VALUES (?, ?)`, [category.id, 1]);
        await mockQueryExecutor.executeAndCommit(`INSERT INTO SerieCategory (category_id, serie_id) VALUES (?, ?)`, [category.id, 2]);
        await mockQueryExecutor.executeAndCommit(`INSERT INTO SerieInfos (serie_id) VALUES (?)`, [insertedSerie1.id]);
        await mockQueryExecutor.executeAndCommit(`INSERT INTO SerieInfos (serie_id) VALUES (?)`, [insertedSerie2.id]);

        // Act
        const result = await serieDAO.getSeriesByCategoryId(category.id);

        // remove the id property
        result.forEach(serie => {
            delete serie.id;
            delete serie.infos;
            delete serie.genres;
        });

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(serie1);
        expect(result[1]).toEqual(serie2);
    });

    it('should update library status of a serie', async () => {
        // Arrange
        const serie = {
            basename: 'serie',
            name: 'Serie',
            image: 'image.png',
            link: 'serie',
            extension_id: 1,
            inLibrary: true,
            parent_id: 1
        };

        // Insert serie
        await serieDAO.createSerie(serie);

        // Act
        await serieDAO.updateSerieInLibrary(serie.link, serie.inLibrary);

        // Assert
        const result = await mockQueryExecutor.executeAndFetchAll(`SELECT inLibrary FROM Serie WHERE link = ?`, [serie.link]);
        expect(result[0].inLibrary).toEqual(1); // 1 = true
    });

    it('should delete a serie', async () => {
        // Arrange
        const serie = {
            basename: 'serie',
            name: 'Serie',
            image: 'image.png',
            link: 'serie',
            extension_id: 1,
            inLibrary: true,
            parent_id: 1
        };

        // Insert serie
        await serieDAO.createSerie(serie);

        // Act
        await serieDAO.deleteSerieById(1);

        // Assert
        const result = await mockQueryExecutor.executeAndFetchAll(`SELECT * FROM Serie WHERE link = ?`, [serie.link]);
        expect(result.length).toEqual(0);
    });
});