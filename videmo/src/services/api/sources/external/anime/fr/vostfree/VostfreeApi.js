class Vostfree {

    scrapPopularAnime(page) {
        window.api.send('/read/vostfree/popular/anime', { page: page });

        return new Promise((resolve, reject) => {
            window.api.receive('/read/vostfree/popular/anime', (data) => data.success ? resolve(data.animeList) : reject(data.error));
        });
    }
}

export default Vostfree;