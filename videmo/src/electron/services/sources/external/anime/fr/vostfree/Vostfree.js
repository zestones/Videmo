const axios = require('axios');
const cheerio = require('cheerio');


class Vostfree {
    constructor() {
        this.name = 'Vostfree';
        this.baseUrl = 'https://vostfree.ws';
        this.lang = 'fr';
    }

    async getPopularAnime(page) {
        const response = await axios.get(`${this.baseUrl}/animes-vostfr/page/${page}/`);
        const $ = cheerio.load(response.data);
        const animeList = [];

        $('div#page-content div.page-left div#content div#dle-content div.movie-poster').each((_, element) => {
            const anime = {
                link: $(element).find('div.movie-poster div.play a').attr('href'),
                image: this.baseUrl + $(element).find('div.movie-poster span.image img').attr('src'),
                basename: $(element).find('div.movie-poster div.info.hidden div.title').text(),
            };
            animeList.push(anime);
        });

        return animeList;
    }

    // async getAnimeEpisodes(url) {
    //     return axios.get(url)
    //         .then(response => {
    //             const $ = cheerio.load(response.data);
    //             const episodes = [];

    //             $('select.new_player_selector option').each((_, element) => {
    //                 const epNum = $(element).text().replace('Episode', '').trim();

    //                 if ($(element).text() === 'Film') {
    //                     episodes.push({
    //                         episode_number: 1,
    //                         name: 'Film',
    //                         url: `?episode:0/${url}`
    //                     });
    //                 } else {
    //                     episodes.push({
    //                         episode_number: parseFloat(epNum),
    //                         name: `Épisode ${epNum}`,
    //                         url: url
    //                     });
    //                 }
    //             });

    //             return episodes;
    //         })
    //         .catch(error => console.error(error));
    // }

    #getLink(_id, server) {
        if (server === 'sibnet') {
            return `https://video.sibnet.ru/shell.php?videoid=${_id}`;
        } else if (server === 'uqload') {
            return `https://uqload.com/embed-${_id}.html`;
        }
    }

    async scrapeEpisodes(url) {
        const server  = 'sibnet'; // TODO : get server from config

        const servers = ['sibnet', 'uqload'];
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const players = $('div[id*=buttons]');
        const links = [];

        for (let i = 0; i < players.length; i++) {
            const player = players.eq(i);
            let current = player.find(`div.new_player_${server}`);

            if (current.length) {
                links.push(this.#getLink($(`div[id=content_${current.attr('id')}]`).text(), server));
                continue;
            }

            const alternateServer = servers[Number(!servers.indexOf(server))];
            current = player.find(`div.new_player_${alternateServer}`);

            if (current.length) {
                links.push(this.#getLink($(`div[id=content_${current.attr('id')}]`).text(), alternateServer));
                continue;
            }
        }

        return links;
    }

}

module.exports = Vostfree;