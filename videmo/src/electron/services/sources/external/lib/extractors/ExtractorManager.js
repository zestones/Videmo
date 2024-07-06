const Sibnet = require('./sibnet/SibNet');
const Uqload = require('./uqload/Uqload');
const Vido = require('./vido/Vido');

class ExtractorManager {
    constructor(url, serverName, quality = null, headers = null) {
        this.url = url;
        this.serverName = serverName;

        this.quality = quality;
        this.headers = headers;

        this.extractors = {
            'sibnet': new Sibnet(this.url, this.quality, this.headers),
            'vido': new Vido(this.url, this.quality, this.headers),
            'uqload': new Uqload(this.url, this.quality, this.headers),
        };
    }

    async get_data() {
        const extractor = this.extractors[this.serverName];
        await extractor.get_data();

        return {
            stream_url: extractor.stream_url,
            referer: extractor.referer,
            meta: extractor.meta,
        }
    }
}

module.exports = ExtractorManager;