class Vostfree {

    scrapPopularAnime(page) {
        window.api.send('/read/vostfree/popular/anime', { page: page });

        return new Promise((resolve, reject) => {
            window.api.receive('/read/vostfree/popular/anime', (data) => data.success ? resolve(data.animeList) : reject(data.error));
        });
    }

    scrapAnimeEpisodes(url) {
        window.api.send('/read/vostfree/anime/episodes', { url: url });

        return new Promise((resolve, reject) => {
            window.api.receive('/read/vostfree/anime/episodes', (data) => data.success ? resolve(data.episodes) : reject(data.error));
        });
    }

    extractEpisode(url, quality = null, headers = null) {
        window.api.send('/extract/vostfree/episode', { url: url, quality: quality, headers: headers });

        return new Promise((resolve, reject) => {
            window.api.receive('/extract/vostfree/episode', (data) => data.success ? resolve(JSON.parse(data.episode)) : reject(data.error));
        });
    }
}

export default Vostfree;