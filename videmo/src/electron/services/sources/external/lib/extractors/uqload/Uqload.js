const BaseExtractor = require('../BaseExtractor');
const axios = require('axios');
const cheerio = require('cheerio');


class Uqload extends BaseExtractor {
    constructor(url, quality = null, headers = null) {
        super(url, quality, headers);
    }

    async _get_data() {
        try {
            const response = await axios.get(this.url);
            const $ = cheerio.load(response.data);

            // Select script tags containing "new Clappr.Player"
            const scriptTags = $('script').filter((_, elem) => {
                return /new\s+Clappr\.Player/.test($(elem).html());
            });

            let link = null;
            // Iterate through the selected script tags
            scriptTags.each((_, elem) => {
                const scriptContent = $(elem).html();
                const match = scriptContent.match(/sources:\s*\[([\s\S]*?)\]/);

                if (match && match[1]) {
                    const sourcesArray = JSON.parse('[' + match[1] + ']');
                    link = sourcesArray[0];
                }
            });

            return {
                'stream_url': link,
                'referer': this.url
            };
        } catch (error) {
            console.error("error: ", error)
        }
    }
}

module.exports = Uqload;