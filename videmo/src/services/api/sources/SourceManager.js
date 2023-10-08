import RemoteApi from './RemoteApi.js'

import LocalApi from './LocalApi.js'

import { EXPLORE_MODES } from '../../../utilities/utils/Constants.js'

import io from 'socket.io-client';


export default class SourceManager {
    constructor() {
        this.remote = new RemoteApi();
        this.local = new LocalApi();
    }

    async scrapAnime(extension, page, mode = EXPLORE_MODES.POPULAR) {
        if (!extension.local) {
            let animeList = await this.remote.scrapAnime(extension, page, mode);

            if (extension.name === 'FrenchAnime') {
                const socket = io('http://localhost:4000');
                socket.on('connect', () => console.log('Connected to Electron backend'));

                const socketPromise = new Promise((resolve) => {
                    socket.emit('get-images', { animes: animeList, referer: extension.link });
                    socket.on('images', (response) => resolve(response.animes));
                });

                animeList = await socketPromise;
                socket.disconnect();
                return animeList;
            }
        }
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