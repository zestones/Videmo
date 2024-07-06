const SerieEpisodeDAO = require('../dao/series/SerieEpisodeDAO');
const SerieUpdateDAO = require('../dao/series/SerieUpdateDAO');
const ExtensionDAO = require('../dao/settings/ExtensionsDAO');
const SerieInfosDAO = require('../dao/series/SerieInfosDAO');
const SerieTrackDAO = require('../dao/series/SerieTrackDAO');
const SerieDAO = require('../dao/series/SerieDAO');

const VostfreeApi = require('./external/anime/fr/vostfree/Vostfree');
const FrenchAnime = require('./external/anime/fr/frenchanime/FrenchAnime');
const Yukiflix = require('./external/anime/fr/yukiflix/Yukiflix');

const LocalFileScrapper = require('./local/local-file-scrapper');


class SourceManager {
    constructor() {
        this.sources = {
            vostfree: new VostfreeApi(),
            frenchanime: new FrenchAnime(),
            yukiflix: new Yukiflix(),
        }

        this.serieDAO = new SerieDAO();
        this.extensionDAO = new ExtensionDAO();
        this.serieTrackDAO = new SerieTrackDAO();
        this.serieInfosDAO = new SerieInfosDAO();
        this.serieUpdateDAO = new SerieUpdateDAO();
        this.serieEpisodeDAO = new SerieEpisodeDAO();
    }

    async scrapAnime(source, page, mode) {
        return await this.sources[source.name.toLowerCase()][`get${mode.charAt(0).toUpperCase() + mode.slice(1)}Anime`](page);
    }

    async scrapAnimeEpisodes(source, url) {
        return await this.sources[source.name.toLowerCase()].scrapeEpisodes(url);
    }

    async searchAnime(source, query) {
        return await this.sources[source.name.toLowerCase()].search(query);
    }

    async updateAnime(serie) {
        const extension = await this.extensionDAO.getExtensionById(serie.extension_id);

        const episodes = await this.sources[extension.name.toLowerCase()].scrapeEpisodes(serie.link);
        await this.serieUpdateDAO.updateSerieEpisodes(serie, episodes);
    }

    async scrapAndInsertAnime(series) {
        const extension = await this.extensionDAO.getExtensionById(series[0].extension_id);
        if (extension.local) await this.#scrapAndInsertLocalSource(extension, series);
        else await this.#scrapAndInsertRemoteSource(extension, series);
    }

    async #scrapAndInsertLocalSource(extension, series) {
        // We scrap the series
        for (const serie of series) {

            // We scrap the serie
            const scrapper = new LocalFileScrapper(extension.link, serie.link);
            await scrapper.scrap();

            // We update the serie infos - the infos are all the same for all the children
            if (serie.infos) {
                const retrievedSerie = await this.serieDAO.getSerieByLink(serie.link);
                await this.serieInfosDAO.updateSerieInfos(retrievedSerie.id, serie.infos);
            }
        }
    }

    async #scrapAndInsertRemoteSource(extension, series) {
        // Create the series that are not present in the database
        await this.serieDAO.createSeriesIfMissing(series);
        for (const serie of series) {
            const episodes = await this.sources[extension.name.toLowerCase()].scrapeEpisodes(serie.link);

            episodes.forEach(episode => {
                episode.played_time = 0;
                episode.bookmarked = false;
                episode.viewed = false;
                episode.hash = "";
            });

            const retrievedSerie = await this.serieDAO.getSerieByLink(serie.link);
            for (const episode of episodes) {
                const existEpisode = await this.serieEpisodeDAO.getEpisodeByLink(episode.link);
                if (!existEpisode) {
                    const childEpisode = await this.serieEpisodeDAO.createEpisode(episode);
                    await this.serieTrackDAO.createSerieTrack(retrievedSerie.id, childEpisode.id);
                }
            }

            if (!serie.infos) await this.serieInfosDAO.createSerieInfo(retrievedSerie.id, { numberOfEpisodes: episodes.length });
            else {
                serie.infos.numberOfEpisodes = episodes.length;
                await this.serieInfosDAO.updateSerieInfos(retrievedSerie.id, serie.infos);
            }
        }
    }
}

module.exports = SourceManager;