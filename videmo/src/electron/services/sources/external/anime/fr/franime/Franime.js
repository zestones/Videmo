const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class Franime {

    constructor() {
        this.name = 'FrAnime';
        this.baseUrl = 'https://franime.fr';
        this.lang = 'fr';

        this.searchEnpoint = `${this.baseUrl}/recherche?type=vo&format=TOUT&status=TOUT&ordre=Ressemblance&themes=TOUT&algorithme=Intelligente&page=0&search=`;

        // List of servers to check for (the order is important, it will be used to prioritize the servers)
        this.servers = ['sibnet'];
        this.defaultServer = 'sibnet';
    }

    async #getHtml(page) {
        const browser = await puppeteer.launch();
        const browserPage = await browser.newPage();

        await browserPage.goto(`${this.baseUrl}/recherche?search=&type=vo&format=TOUT&status=TOUT&ordre=Mieux+not%C3%A9&themes=TOUT&algorithme=Normal&page=${page - 1}`, {
            waitUntil: 'networkidle2'
        });

        const content = await browserPage.content();
        await browser.close();

        return cheerio.load(content);
    }

    #getAnimeList($) {
        const animeList = [];
        $('div.select-none.my-3.flex.flex-wrap.justify-center > div').each((_, element) => {
            const anime = {
                link: $(element).find('a').attr('href'),
                image: $(element).find('a div.relative.drop-shadow-xl.ma-lazy-wrapper.rounded-lg > img').attr('src'),
                basename: $(element).find('a > div:last-child').text(),
            };
            animeList.push(anime);
        });

        return animeList;
    }

    async getPopularAnime(page) {
        const $ = await this.#getHtml(page);
        return this.#getAnimeList($);
    }

    async getRecentAnime(page) {
        const $ = await this.#getHtml(page);
        return this.#getAnimeList($);
    }

    async scrapeEpisodes(url) {
        // TODO : Implement this
    }

    async search(query) {
        // TODO : Implement this

    }
}

module.exports = Franime;