const BaseExtractor = require('../BaseExtractor');
const axios = require('axios');

class Vido extends BaseExtractor {
    constructor(url, quality = null, headers = null) {
        super(url, quality, headers);
    }

    async _get_data() {
        try {
            const response = await axios.get(this.url);
            const videoUrl = response.data.match(/(https?:\/\/.*?\.mp4)/)[1];

            return {
                'stream_url': videoUrl,
                'referer': this.url
            };
        } catch (error) {
            console.error("Error occurred: ", error);
            throw error;
        }
    }
}


module.exports = Vido;