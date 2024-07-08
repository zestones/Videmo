const axios = require('axios');
const cheerio = require('cheerio');

class Yukiflix {
    constructor() {
        this.name = 'Yukiflix';
        this.baseUrl = 'https://yukiflix.pythonanywhere.com';
        this.lang = 'fr';

        this.currentYear = new Date().getFullYear();
        this.searchEnpoint = `${this.baseUrl}/get_suggestions?q=`;

        this.servers = ['sibnet'];
        this.defaultServer = 'sibnet';
    }

    async getPopularAnime(page) {
        const response = await axios.get(`${this.baseUrl}/catalog/top/${page}`);

        const $ = cheerio.load(response.data);
        const animeList = [];

        $('div#animes-grid-movies div.anime-card').each((_, element) => {
            const anime = {
                link: $(element).find('div.anime-card a').attr('href'),
                image: $(element).find('div.anime-card div.card-head img.card-img').attr('src'),
                basename: $(element).find('div.anime-card div.card-body h3.card-title').text().trim().replace(/\s+/g, ' '),
            };
            animeList.push(anime);
        });

        return animeList;
    }

    async getRecentAnime(page) {
        const response = await axios.get(`${this.baseUrl}/catalog/year/${this.currentYear}/${page}`);
        const $ = cheerio.load(response.data);
        const animeList = [];

        $('div#animes-grid-movies div.anime-card').each((_, element) => {
            const anime = {
                link: $(element).find('div.anime-card a').attr('href'),
                image: $(element).find('div.anime-card div.card-head img.card-img').attr('src'),
                basename: $(element).find('div.anime-card div.card-body h3.card-title').text().trim().replace(/\s+/g, ' '),
            };
            animeList.push(anime);
        });

        return animeList;
    }

    async #scrapeSerieEpisodes(url) {
        const response = await axios.get(`${this.baseUrl}/${url}`);
        const $ = cheerio.load(response.data);

        const seasons = $('div.seasons div.anime-card.s');
        const seasonsObj = {};

        seasons.each((_, season) => {
            const seasonName = $(season).find('h3.card-title').text().trim();
            const seasonUrl = $(season).find('a').attr('href').replace('/vf/', '/vostfr/');
            seasonsObj[seasonName] = {
                url: this.baseUrl + seasonUrl,
                episodes: [],
                nbEpisodes: 0
            };
        });

        const seasonPromises = Object.keys(seasonsObj).map(async season => {
            const response = await axios.get(seasonsObj[season].url);
            const $ = cheerio.load(response.data);

            const episodes = $('select#episode-select option');
            episodes.each((_, episode) => {
                const episodeName = $(episode).text();
                const episodeUrl = $(episode).attr('data-link');
                seasonsObj[season].episodes.push({
                    link: episodeUrl,
                    name: episodeName,
                    serverName: this.defaultServer
                });
            });

            seasonsObj[season].nbEpisodes = seasonsObj[season].episodes.length;
        });

        await Promise.all(seasonPromises);

        const episodes = [];

        for (const season in seasonsObj) {
            seasonsObj[season].episodes.forEach(episode => {
                episodes.push({
                    name: season + ' - ' + episode.name,
                    link: episode.link,
                    serverName: this.defaultServer
                });
            });
        }

        return episodes;
    }


    async scrapeEpisodes(url) {
        let episodes = [];
        if (!url.includes('/watch/movie/')) {
            episodes = await this.#scrapeSerieEpisodes(url);
            return episodes;
        } else {
            // TODO: Movies don't have seasons page
            return [];
        }
    }

    async search(query) {
        const response = await axios.get(`${this.searchEnpoint}${query}`);

        return response.data.suggestions.map(result => ({
            basename: result.name,
            link: result.url,
            image: result.image_V,
        }));
    }
}

module.exports = Yukiflix;