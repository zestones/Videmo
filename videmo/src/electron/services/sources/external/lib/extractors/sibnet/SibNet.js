const BaseExtractor = require('../BaseExtractor');
const axios = require('axios');


class SibNet extends BaseExtractor {
    constructor(url, quality = null, headers = null) {
        super(url, quality, headers);
    }

    async _get_data() {
        try {
            const resp = await axios.get(this.url);
            const link = "https://video.sibnet.ru" + resp.data.match(/src:\s+?"(.*?mp4)"/)[1];

            return {
                'stream_url': link,
                'referer': this.url
            };
        } catch (error) {
            console.error("error: ", error)
        }
    }
}


module.exports = SibNet;