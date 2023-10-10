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

    async scrapeEpisodes(url) {
        const defaultServer = 'streamdav'; // TODO : get server from config
        const servers = ['streamdav', 'doods', 'uqload'];

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const epsDiv = $('div.tabs-sel.linkstab div.eps');

        // Initialize an array to store the results
        const results = [];

        // Process each line inside the div
        epsDiv.text().trim().split('\n').forEach(line => {
            const parts = line.trim().split('!');
            if (parts.length === 2) {
                const episode = parseInt(parts[0]);
                const servers = parts[1].split(',').filter(server => server.trim() !== '');
                results.push({ episode, servers });
            }
        });

        const episodes = [];
        for (const result of results) {
            let serverLink = "";
            let serverName = defaultServer;

            // First, check if the default server is available in the list of servers
            const defaultServerLink = result.servers.find(epServer => epServer.includes(defaultServer));

            if (defaultServerLink) {
                serverLink = defaultServerLink;
            } else {
                // If the default server is not available, check if any of the specified servers are in the link
                serverLink = result.servers.find(epServer => servers.some(server => epServer.includes(server)));
                serverName = servers.find(server => serverLink.includes(server));
            }

            if (serverLink) {
                // TODO : return the server name for each episode (Vostfree)
                episodes.push({ link: serverLink, name: `Episode ${result.episode}`, serverName: serverName });
            } else {
                console.log(`No valid server found for episode ${result.episode}`);
            }
        }

        return episodes.reverse();
    }
}

module.exports = FrenchAnime;