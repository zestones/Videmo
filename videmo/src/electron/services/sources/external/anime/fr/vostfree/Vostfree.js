const axios = require('axios');
const cheerio = require('cheerio');

class Vostfree {
    constructor() {
        this.name = 'Vostfree';
        this.baseUrl = 'https://vostfree.ws';
        this.lang = 'fr';

        this.searchEnpoint = `${this.baseUrl}?do=search&subaction=search&story=`;
    }

    async getPopularAnime(page) {
        const response = await axios.get(`${this.baseUrl}/animes-vostfr/page/${page}/`);
        const $ = cheerio.load(response.data);
        const animeList = [];

        $('div#page-content div.page-left div#content div#dle-content div.movie-poster').each((_, element) => {
            const anime = {
                link: $(element).find('div.movie-poster div.play a').attr('href'),
                image: this.baseUrl + $(element).find('div.movie-poster span.image img').attr('src'),
                basename: $(element).find('div.movie-poster div.info.hidden div.title').text().trim().replace(/\s+/g, ' ').replace(/\s+(FRENCH|VOSTFR)\s*$/, ''),
            };
            animeList.push(anime);
        });

        return animeList;
    }

    async getRecentAnime(page) {
        const response = await axios.get(`${this.baseUrl}/animes-vostfr-recement-ajoutees.html/page/${page}/`);
        const $ = cheerio.load(response.data);
        const animeList = [];

        $('div#page-content div.page-left div#content div#dle-content div.movie-poster').each((_, element) => {
            const anime = {
                link: $(element).find('div.movie-poster div.play a').attr('href'),
                image: this.baseUrl + $(element).find('div.movie-poster span.image img').attr('src'),
                basename: $(element).find('div.movie-poster div.info.hidden div.title').text().trim().replace(/\s+/g, ' ').replace(/\s+(FRENCH|VOSTFR)\s*$/, ''),
            };
            animeList.push(anime);
        });

        return animeList;
    }

    #getLink(_id, server) {
        if (server === 'sibnet') {
            return `https://video.sibnet.ru/shell.php?videoid=${_id}`;
        } else if (server === 'uqload') {
            return `https://uqload.com/embed-${_id}.html`;
        }
    }

    async scrapeEpisodes(url) {
        const server = 'sibnet'; // TODO : get server from config

        const servers = ['sibnet', 'uqload'];
        const response = await axios.get(url);

        const $ = cheerio.load(response.data);
        const players = $('div[id*=buttons]');
        const episodes = [];

        for (let i = 0; i < players.length; i++) {
            const player = players.eq(i);

            const name = `Episode ${player.attr('id').split('_')[1]}`;
            let current = player.find(`div.new_player_${server}`);

            if (current.length) {
                episodes.push({
                    link: this.#getLink($(`div[id=content_${current.attr('id')}]`).text(), server),
                    name: name
                });
                continue;
            }

            const alternateServer = servers[Number(!servers.indexOf(server))];
            current = player.find(`div.new_player_${alternateServer}`);

            if (current.length) {
                episodes.push({
                    link: this.#getLink($(`div[id=content_${current.attr('id')}]`).text(), alternateServer),
                    name: name
                });
                continue;
            }
        }

        return episodes.reverse();
    }

    async search(query) {
        const response = await axios.post(`${this.searchEnpoint}${query}`);

        const $ = cheerio.load(response.data);
        const results = $('div.search-result');

        return results.map((_, result) => {
            const basename = $(result).find('div.info div.title a').text().trim().replace(/\s+/g, ' ');
            const cleanedBasename = basename.replace(/\s+(FRENCH|VOSTFR)\s*$/, '');

            return {
                basename: cleanedBasename,
                link: $(result).find('div.info div.title a').attr('href'),
                image: `${this.baseUrl}${$(result).find('span.image img').attr('src')}`,
            };
        }).get();
    }
}

module.exports = Vostfree;