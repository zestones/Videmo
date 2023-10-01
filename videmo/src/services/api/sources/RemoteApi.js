
export default class RemoteApi {

    scrapAnime(extension, page, mode) {
        window.api.send('/read/remote/anime/', { extension: extension, page: page, mode: mode });

        return new Promise((resolve, reject) => {
            window.api.receive('/read/remote/anime/', (data) => data.success ? resolve(data.animeList) : reject(data.error));
        });
    }

    scrapAnimeEpisodes(extension, url) {
        window.api.send('/read/remote/anime/episodes/', { extension: extension, url: url });

        return new Promise((resolve, reject) => {
            window.api.receive('/read/remote/anime/episodes/', (data) => data.success ? resolve(data.episodes) : reject(data.error));
        });
    }

    searchAnime(extension, query) {
        window.api.send('/search/remote/anime/', { extension: extension, query: query });

        return new Promise((resolve, reject) => {
            window.api.receive('/search/remote/anime/', (data) => data.success ? resolve(data.animeList) : reject(data.error));
        });
    }

    extractEpisode(extension, url, quality = null, headers = null) {
        window.api.send('/extract/remote/episode/', { extension: extension, url: url, quality: quality, headers: headers });

        return new Promise((resolve, reject) => {
            window.api.receive('/extract/remote/episode/', (data) => data.success ? resolve(JSON.parse(data.episode)) : reject(data.error));
        });
    }

    updateAnime(serie) {
        window.api.send('/update/remote/anime/', { serie: JSON.stringify(serie) });

        return new Promise((resolve, reject) => {
            window.api.receive('/update/remote/anime/', (data) => data.success ? resolve(data.success) : reject(data.error));
        });
    }
}