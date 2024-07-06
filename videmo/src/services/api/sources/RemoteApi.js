import { makeRequest } from "../../../utilities/utils/Utils";

export default class RemoteApi {

    scrapAnime(extension, page, mode) {
        return makeRequest('/read/remote/anime/', { extension: extension, page: page, mode: mode });
    }

    scrapAnimeEpisodes(extension, url) {
        return makeRequest('/read/remote/anime/episodes/', { extension: extension, url: url });
    }

    searchAnime(extension, query) {
        return makeRequest('/search/remote/anime/', { extension: extension, query: query });
    }

    extractEpisode(extension, url, serverName, quality = null, headers = null) {
        return makeRequest('/extract/remote/episode/', { extension: extension, url: url, serverName: serverName, quality: quality, headers: headers });
    }

    updateAnime(serie) {
        return makeRequest('/update/remote/anime/', { serie: JSON.stringify(serie) });
    }
}