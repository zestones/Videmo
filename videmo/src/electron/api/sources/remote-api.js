const { ipcMain } = require('electron');

const SourceManager = require('../../services/sources/SourceManager');
const ExtractorManager = require('../../services/sources/external/lib/extractors/ExtractorManager');


ipcMain.on('/read/remote/anime/', (event, args) => {
    new SourceManager().scrapAnime(args.extension, args.page, args.mode)
        .then((animeList) => event.reply('/read/remote/anime/', { success: true, data: animeList }))
        .catch((error) => event.reply('/read/remote/anime/', { success: false, error: error }));
});

ipcMain.on('/read/remote/anime/episodes/', (event, args) => {
    new SourceManager().scrapAnimeEpisodes(args.extension, args.url)
        .then((episodes) => event.reply('/read/remote/anime/episodes/', { success: true, data: episodes }))
        .catch((error) => event.reply('/read/remote/anime/episodes/', { success: false, error: error }));
});

ipcMain.on('/search/remote/anime/', (event, args) => {
    new SourceManager().searchAnime(args.extension, args.query)
        .then((animeList) => event.reply('/search/remote/anime/', { success: true, data: animeList }))
        .catch((error) => event.reply('/search/remote/anime/', { success: false, error: error }));
});

ipcMain.on('/extract/remote/episode/', async (event, args) => {
    try {
        const extractor = new ExtractorManager(args.url, args.serverName, args.quality, args.headers);
        const extractedData = await extractor.get_data();

        const episode = {
            stream_url: extractedData.stream_url,
            referer: extractedData.referer,
            meta: extractedData.meta,
        };

        event.reply('/extract/remote/episode/', { success: true, data: episode });
    } catch (error) {
        event.reply('/extract/remote/episode/', { success: false, error: error });
    }
});

ipcMain.on('/update/remote/anime/', (event, args) => {
    new SourceManager().updateAnime(JSON.parse(args.serie))
        .then(() => event.reply('/update/remote/anime/', { success: true, data: null }))
        .catch((error) => event.reply('/update/remote/anime/', { success: false, error: error }));
});