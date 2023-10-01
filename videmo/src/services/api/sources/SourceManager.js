import RemoteApi from './RemoteApi.js'

import LocalApi from './LocalApi.js'

import { EXPLORE_MODES } from '../../../utilities/utils/Constants.js'


export default class SourceManager {
    constructor() {
        this.remote = new RemoteApi();
        this.local = new LocalApi();
    }

    async scrapAnime(extension, page, mode = EXPLORE_MODES.POPULAR) {
        if (!extension.local) return await this.remote.scrapAnime(extension, page, mode);
    }

    async scrapAnimeEpisodes(extension, url) {
        return await this.remote.scrapAnimeEpisodes(extension, url);
    }

    async searchAnime(extension, query) {
        return await this.remote.searchAnime(extension, query);
    }

    async extractEpisode(extension, url, quality = null, headers = null) {
        return await this.remote.extractEpisode(extension, url, quality, headers);
    }

    async updateSeries(series) {
        const localSeries = series.filter((serie) => serie.extension.local);
        const remoteSeries = series.filter((serie) => !serie.extension.local);

        const localPromises = localSeries.map((serie) =>
            this.local.updateAnime(serie)
        );

        const remotePromises = remoteSeries.map((serie) =>
            this.remote.updateAnime(serie)
        );

        return await Promise.all([...localPromises, ...remotePromises]);
    }
}