const BaseExtractor = require('../BaseExtractor');
const fetch = require('node-fetch');
const axios = require('axios');


class SibNet extends BaseExtractor {
    constructor(url, quality = null, headers = null) {
        super(url, quality, headers);
    }

    async _get_data() {
        const resp = await fetch(this.url);
        const text = await resp.text();
        const link = "https://video.sibnet.ru" + text.match(/src:\s+?"(.*?mp4)"/)[1];

        return {
            'stream_url': link,
            'referer': this.url
        };
    }
}


module.exports = SibNet;