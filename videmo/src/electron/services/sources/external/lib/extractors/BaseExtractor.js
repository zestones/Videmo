
const desktop_headers = { 'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0.1) Gecko/20100101 Firefox/88.0.1" }


class BaseExtractor {
    constructor(url, quality = null, headers = null) {
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        this.url = url;

        if (headers === null) {
            headers = {};
        }

        this.quality = quality;

        if (headers) this.headers = headers;
        else this.headers = desktop_headers;

        this._stream_url = null;
        this._referer = this.headers.Referer || '';
        this._meta = null;
    }

    get stream_url() {
        if (!this._stream_url) {
            this.get_data();
        }

        return this._stream_url;
    }

    get referer() {
        if (this._referer === '') {
            this.get_data();
        }

        return this._referer;
    }

    async get_data() {
        const data = await this._get_data();

        if (!data.stream_url) {
            throw new Error('No stream_url found');
        }

        this._stream_url = data.stream_url;
        this._referer = data.referer || null;
        this.meta = data.meta;
    }

    _get_data() {
        throw new Error('Not implemented');
    }
}

module.exports = BaseExtractor;