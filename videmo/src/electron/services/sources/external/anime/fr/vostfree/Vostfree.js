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
                inLibrary: false
            };
            animeList.push(anime);
        });

        return animeList;
    }


}

module.exports = Vostfree;