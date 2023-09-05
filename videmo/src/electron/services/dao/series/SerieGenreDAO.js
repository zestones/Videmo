const QueryExecutor = require('../../sqlite/QueryExecutor');
const DataTypesConverter = require('../../../utilities/converter/DataTypesConverter.js');
const GenreDAO = require('../series/GenreDAO');


class SerieGenreDAO {
    constructor() {
        this.queryExecutor = new QueryExecutor();
        this.dataTypesConverter = new DataTypesConverter();
        this.genreDAO = new GenreDAO();
    }

    // Create a serie genre entry
    async createSerieGenre(serieId, genreId) {
        const sql = `INSERT INTO SerieGenre (serie_id, genre_id) VALUES (?, ?)`;
        const params = [serieId, genreId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Get genre of a serie by serie id
    async getSerieGenreBySerieId(serieId) {
        const sql = `SELECT Genre.* FROM Genre 
                     INNER JOIN SerieGenre ON Genre.id = SerieGenre.genre_id
                     WHERE SerieGenre.serie_id = ?`;

        const params = [serieId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Get serie genre association by serie id
    async getSerieGenreAssociationBySerieId(serieId) {
        const sql = `SELECT * FROM SerieGenre WHERE serie_id = ?`;
        const params = [serieId];
        return await this.queryExecutor.executeAndFetchAll(sql, params);
    }

    // Update genres of a serie
    async updateSerieGenres(serieId, newGenres) {

        // - 1 - Retrieve data from database
        const dbGenres = await this.genreDAO.getAllGenres();
        const dbAssociation = await this.getSerieGenreAssociationBySerieId(serieId);

        // - 2 - Keep only the missing genres
        const missingGenres = newGenres.filter((genre) => !dbGenres.some(dbGenre => dbGenre.name === genre.name));

        // - 3 - insert the missing genres
        if (missingGenres.length) {
            for (const genre of missingGenres) {
                const insertedGenre = await this.genreDAO.createGenre(genre);
                dbGenres.push(insertedGenre);
            }
        }

        // - 4 - Map the newGenres so that they have ids
        newGenres = newGenres.map((genre) => {
            const matchedGenre = dbGenres.find(dbGenre => dbGenre.name === genre.name);
            return matchedGenre || genre;
        });

        // - 5 - create a provisoire association
        const dummyAssociation = newGenres.map((genre) => ({ genre_id: genre.id, serie_id: serieId }));

        // - 6 - Compare dummyAssociation and dbAssociation for differences
        const associationsToAdd = dummyAssociation.filter(dummyAssoc => !dbAssociation.some(dbAssoc => dbAssoc.genre_id === dummyAssoc.genre_id));
        const associationsToRemove = dbAssociation.filter(dbAssoc => !dummyAssociation.some(dummyAssoc => dummyAssoc.genre_id === dbAssoc.genre_id));

        for (const association of associationsToAdd) {
            await this.createSerieGenre(association.serie_id, association.genre_id);
        }

        for (const association of associationsToRemove) {
            await this.deleteSerieGenreAssociation(association.serie_id, association.genre_id);
        }
    }

    // Delete a serie genre association
    async deleteSerieGenreAssociation(serieId, genreId) {
        const sql = `DELETE FROM SerieGenre WHERE serie_id = ? AND genre_id = ?`;
        const params = [serieId, genreId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }

    // Delete all genres of a serie
    async deleteSerieGenres(serieId) {
        const sql = `DELETE FROM SerieGenre WHERE serie_id = ?`;
        const params = [serieId];
        await this.queryExecutor.executeAndCommit(sql, params);
    }
}

module.exports = SerieGenreDAO;
