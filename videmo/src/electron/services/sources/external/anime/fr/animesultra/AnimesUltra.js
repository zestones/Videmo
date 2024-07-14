const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class AnimesUltra {
    constructor() {
        this.name = 'AnimesUltra';
        this.baseUrl = 'https://w4.animesultra.net';
        this.lang = 'fr';

        this.searchEnpoint = `${this.baseUrl}/?do=search&subaction=search&story=`;

        this.servers = ['sibnet'];
        this.defaultServer = 'sibnet';
    }

    #getAnimeList($) {
        const animeList = [];
        $('div#dle-content div.flw-item').each((_, element) => {
            const anime = {
                link: $(element).find('div.film-poster a').attr('href'),
                image: this.baseUrl + '/uploads' + $(element).find('div.film-poster img').attr('data-src').split('uploads')[1],
                basename: $(element).find('div.film-detail h3.film-name').text().trim().replace(/\s+/g, ' '),
            };
            animeList.push(anime);
        });

        return animeList;
    }

    async getPopularAnime(page) {
        const response = await axios.get(`${this.baseUrl}/xfsearch/statut/Termin%C3%A9/page/${page}/`);
        const $ = cheerio.load(response.data);
        return this.#getAnimeList($);
    }

    async getRecentAnime(page) {
        const response = await axios.get(`${this.baseUrl}/xfsearch/statut/En%20Cours/page/${page}/`);
        const $ = cheerio.load(response.data);
        return this.#getAnimeList($);
    }

    #getLink(_id, server) {
        if (server === 'sibnet') {
            return `https://video.sibnet.ru/shell.php?videoid=${_id}`;
        }
    }

    async scrapeEpisodes(url) {
        const episodes = [];

        const browser = await puppeteer.launch();
        const browserPage = await browser.newPage();

        await browserPage.goto(url.split(".html")[0] + "/episode-1.html");

        await browserPage.waitForSelector('div.ss-list');
        const content = await browserPage.content();

        const $ = cheerio.load(content);

        const numberEpisodes = parseInt($('div.ss-list a:last-child').attr('data-number'));
        const sibnetPlayerIds = $('div[id^="content_player_"]').filter((_, element) => $(element).attr('id').split('_')[2].match(/^\d+$/));

        if (sibnetPlayerIds.length !== numberEpisodes && sibnetPlayerIds > 0) {
            for (let i = 1; i <= numberEpisodes; i++) {
                const response = await axios.get(url.split(".html")[0] + `/episode-${i}.html`);
                const $ = cheerio.load(response.data);

                const playerItem = $('div.item.server-item').filter((_, element) => $(element).attr('data-class').trim() === this.defaultServer);
                const _serverId = playerItem.attr('data-server-id');

                if (_serverId === null || _serverId === undefined) continue;
                episodes.push({
                    link: this.#getLink(_serverId, this.defaultServer),
                    name: `Episode ${i}`,
                    serverName: this.defaultServer
                });
            }
        } else {
            let i = 1;
            // For sibnet only the content_player_'%d%' possess only numbers in the id 
            $('div[id^="content_player_"]').each((_, element) => {
                if ($(element).attr('id').split('_')[2].match(/^\d+$/)) {
                    const id = $(element).text().trim();

                    if (!id.match(/^\d+$/)) return;
                    episodes.push({
                        link: this.#getLink(id, this.defaultServer),
                        name: `Episode ${i}`,
                        serverName: this.defaultServer
                    });

                    i++;
                }
            });
        }

        await browser.close();
        return episodes.reverse();
    }

    async search(query) {
        const response = await axios.get(`${this.searchEnpoint}${query}`);

        const $ = cheerio.load(response.data);
        const animeList = this.#getAnimeList($);
        return animeList;
    }
}

module.exports = AnimesUltra;