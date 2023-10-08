const axios = require('axios');
const cheerio = require('cheerio');


class FrenchAnime {

    constructor() {
        this.name = 'FrenchAnime';
        this.baseUrl = 'https://www.french-anime.com';
        this.lang = 'fr';

        this.searchEnpoint = `${this.baseUrl}/?do=search&subaction=search&story=`;
    }

    async getPopularAnime(page) {
        const response = await axios.get(`${this.baseUrl}/animes-vostfr/page/${page}/`);
        const $ = cheerio.load(response.data);
        const animeList = [];

        $('div#dle-content div.mov.clearfix').each((_, element) => {
            const anime = {
                link: $(element).find('div .mov-t.nowrap').attr('href'),
                image: this.baseUrl + $(element).find('div .mov-i.img-box.aaa > img').attr('src'),
                basename: $(element).find('div .mov-t.nowrap').text(),
            };
            animeList.push(anime);
        });

        return animeList;
    }
}

module.exports = FrenchAnime;