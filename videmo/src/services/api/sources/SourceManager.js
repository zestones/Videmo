import VostfreeApi from './external/anime/fr/vostfree/VostfreeApi.js'

import LocalFileScrapper from './local/LocalFileScrapper.js'

import { EXPLORE_MODES } from '../../../utilities/utils/Constants.js'


// TODO : refactor the class so it use only one remote source and one local source Api
export default class SourceManager {
    constructor() {
        this.sources = {
            vostfree: new VostfreeApi(),
            local: new LocalFileScrapper()
        }
    }

    async scrapAnime(source, page, mode = EXPLORE_MODES.POPULAR) {
        return await this.sources[source.toLowerCase()][`scrap${mode.charAt(0).toUpperCase() + mode.slice(1)}Anime`](page);
    }

    async scrapAnimeEpisodes(source, url) {
        return await this.sources[source.toLowerCase()].scrapAnimeEpisodes(url);
    }

    async searchAnime(source, query) {
        return await this.sources[source.toLowerCase()].searchAnime(query);
    }

    async extractEpisode(source, url, quality = null, headers = null) {
        return await this.sources[source.toLowerCase()].extractEpisode(url, quality, headers);
    }

    async updateSeries(series) {
        const localSeries = series.filter((serie) => serie.extension.local);
        const remoteSeries = series.filter((serie) => !serie.extension.local);

        const localPromises = localSeries.map((serie) =>
            this.sources["local"].updateAnime(serie)
        );

        const remotePromises = remoteSeries.map((serie) =>
            this.sources[serie.extension.name.toLowerCase()].updateAnime(serie)
        );

        return await Promise.all([...localPromises, ...remotePromises]);
    }
}