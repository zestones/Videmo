import RemoteApi from './RemoteApi.js'

import LocalApi from './LocalApi.js'

import { EXPLORE_MODES } from '../../../utilities/utils/Constants.js'

import io from 'socket.io-client';


export default class SourceManager {
    constructor() {
        this.remote = new RemoteApi();
        this.local = new LocalApi();
    }

    async getAnimeImages(animeList, extensionLink) {
        const socket = io('http://localhost:4000');
        socket.on('connect', () => console.log('Connected to Electron backend'));
        const socketPromise = new Promise((resolve) => {
            socket.emit('get-images', { animes: animeList, referer: extensionLink });
            socket.on('images', (response) => resolve(response.animes));
        });

        const result = await socketPromise;
        socket.disconnect();

        return result;
    }

    async scrapAnime(extension, page, mode = EXPLORE_MODES.POPULAR) {
        let animeList = await this.remote.scrapAnime(extension, page, mode);

        if (extension.name === 'FrenchAnime') {
            animeList = this.getAnimeImages(animeList, extension.link);
        }

        return animeList;
    }

    async scrapAnimeEpisodes(extension, url) {
        return await this.remote.scrapAnimeEpisodes(extension, url);
    }

    async searchAnime(extension, query) {
        let animeList = await this.remote.searchAnime(extension, query);

        if (extension.name === 'FrenchAnime') {
            animeList = this.getAnimeImages(animeList, extension.link);
        }

        return animeList;
    }

    async extractEpisode(extension, url, serverName, quality = null, headers = null) {
        return await this.remote.extractEpisode(extension, url, serverName, quality, headers);
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