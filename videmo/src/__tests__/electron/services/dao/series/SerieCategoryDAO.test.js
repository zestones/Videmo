const QueryExecutor = require('../../../../../electron/services/sqlite/QueryExecutor');
const SerieDAO = require('../../../../../electron/services/dao/series/SerieDAO');
const SerieCategoryDAO = require('../../../../../electron/services/dao/series/SerieCategoryDAO');

const path = require('path');

describe('SerieCategoryDAO', () => {
    let mockQueryExecutor;
    let serieDAO;
    let serieCategoryDAO;

    const tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/tables.sql');
    const drop_tables = path.join(__dirname, '../../../../../electron/services/sqlite/sql/drop_tables.sql');
    const delete_data = path.join(__dirname, '../../../../../electron/services/sqlite/sql/delete_data.sql');

    beforeAll(async () => {
        mockQueryExecutor = new QueryExecutor();
        
        // Create the SerieCategory table
        await mockQueryExecutor.executeFile(tables);
    });

    beforeEach(() => {
        mockQueryExecutor = new QueryExecutor();
        serieDAO = new SerieDAO();
        serieCategoryDAO = new SerieCategoryDAO();

        serieCategoryDAO.serieDAO = serieDAO;
    });

    afterEach(async () => {
        // Clear the database
        await mockQueryExecutor.executeFile(delete_data);
    });

    afterAll(async () => {
        // Clear the database
        await mockQueryExecutor.executeFile(drop_tables);
    });

    it('should insert a serie category', async () => {
        // Arrange
        const serieId = 1;
        const categoryId = 1;

        // Act
        await serieCategoryDAO.createSerieCategory(serieId, categoryId);
        const sql = `SELECT * FROM SerieCategory WHERE serie_id = ? AND category_id = ?`;
        const params = [serieId, categoryId];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result.serie_id).toBe(serieId);
        expect(result.category_id).toBe(categoryId);
    });

    it('should get a serie category by ID', async () => {
        // Arrange
        const serieId = 1;
        const categoryId = 1;

        // Insert a serie category
        await serieCategoryDAO.createSerieCategory(serieId, categoryId);

        // Act
        const result = await serieCategoryDAO.getSerieCategoryById(categoryId);

        // Assert
        expect(result.serie_id).toBe(serieId);
        expect(result.category_id).toBe(categoryId);
    });

    it('should get a serie category by serie ID', async () => {
        // Arrange
        const serieId = 1;
        const categoryId = 1;

        // Insert a serie category
        await serieCategoryDAO.createSerieCategory(serieId, categoryId);

        // Act
        const result = await serieCategoryDAO.getSerieCategoryBySerieId(serieId);

        // Assert
        expect(result[0].serie_id).toBe(serieId);
        expect(result[0].category_id).toBe(categoryId);
    });

    it('should update the last opened category tab', async () => {
        // Arrange
        const categoryId = 2;

        // Act
        await serieCategoryDAO.updateLastOpenedCategory(categoryId);
        const sql = `SELECT * FROM LastOpenedCategory WHERE category_id = ?`;
        const params = [categoryId];
        const result = await mockQueryExecutor.executeAndFetchOne(sql, params);

        // Assert
        expect(result.category_id).toBe(categoryId);
    });

    it('should get the last opened category tab', async () => {
        // Arrange
        const categoryId = 4;

        // Insert a new category
        const insertCategorySql = `INSERT INTO Category (id, name) VALUES (?, ?)`;
        const insertCategoryParams = [categoryId, 'category-name'];
        await mockQueryExecutor.executeAndCommit(insertCategorySql, insertCategoryParams);

        // Act
        await serieCategoryDAO.updateLastOpenedCategory(categoryId);
        const result = await serieCategoryDAO.getLastOpenedCategory();

        // Assert
        expect(result.category_id).toBe(categoryId);
    });

    it('should get the serie category IDs by serie link', async () => {
        // Arrange
        const serieId = 3;
        const categoryId = 6;

        // Insert a serie category
        const insertSerieCategorySql = `INSERT INTO SerieCategory (serie_id, category_id) VALUES (?, ?)`;
        const insertSerieCategoryParams = [serieId, categoryId];
        await mockQueryExecutor.executeAndCommit(insertSerieCategorySql, insertSerieCategoryParams);

        // Insert a serie 
        const insertSerieSql = `INSERT INTO Serie (id, name, link) VALUES (?, ?, ?)`;
        const insertSerieParams = [serieId, 'serie-name', 'serie-link'];
        await mockQueryExecutor.executeAndCommit(insertSerieSql, insertSerieParams);

        // Act
        const result = await serieCategoryDAO.getSerieCategoryIdsBySerieLink('serie-link');

        // Assert
        expect(result).toEqual([categoryId]);
    });

    it('should get all the serie categories', async () => {
        // Act
        const result = await serieCategoryDAO.getAllSerieCategories();

        // Assert
        expect(result.length).toBe(0);
    });

    it('should update a serie category', async () => {
        // Arrange
        const serieId = 1;
        const categoryId = 1;
        const newCategoryIds = [2, 3, 4];

        // Insert a serie 
        const insertSerieSql = `INSERT INTO Serie (id, name, link) VALUES (?, ?, ?)`;
        const insertSerieParams = [serieId, 'serie-name', 'serie-link'];
        await mockQueryExecutor.executeAndCommit(insertSerieSql, insertSerieParams);

        // retrieve this serie
        const readSerieSql = `SELECT * FROM Serie WHERE id = ?`;
        const readSerieParams = [serieId];
        const serie = await mockQueryExecutor.executeAndFetchOne(readSerieSql, readSerieParams);

        // Insert a serie category
        await serieCategoryDAO.createSerieCategory(serieId, categoryId);

        // Act
        await serieCategoryDAO.updateSerieCategories(JSON.stringify(serie), newCategoryIds);
        const sql = `SELECT * FROM SerieCategory`;
        const result = await mockQueryExecutor.executeAndFetchAll(sql);

        // Assert
        expect(result.length).toBe(newCategoryIds.length);
        result.forEach(element => {
            expect(element.serie_id).toBe(serieId);
            expect(newCategoryIds).toContain(element.category_id);
        }); 
    });

    it('should delete a serie category by serie id', async () => {
        // Arrange
        const serieId = 1;
        const categoryId = 1;

        // Insert a serie category
        await serieCategoryDAO.createSerieCategory(serieId, categoryId);

        // Act
        await serieCategoryDAO.deleteSerieCategoryBySerieId(serieId);
        const sql = `SELECT * FROM SerieCategory WHERE serie_id = ?`;
        const params = [serieId];
        const result = await mockQueryExecutor.executeAndFetchAll(sql, params);

        // Assert
        expect(result.length).toBe(0);
    });

    it('should delete a serie category by id', async () => {
        // Arrange
        const serieId = 1;
        const categoryId = 1;

        // Insert a serie category
        await serieCategoryDAO.createSerieCategory(serieId, categoryId);

        // Act
        await serieCategoryDAO.deleteSerieCategoryById(categoryId);
        const sql = `SELECT * FROM SerieCategory WHERE category_id = ?`;
        const params = [categoryId];
        const result = await mockQueryExecutor.executeAndFetchAll(sql, params);

        // Assert
        expect(result.length).toBe(0);
    });
});