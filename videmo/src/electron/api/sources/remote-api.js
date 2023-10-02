const { ipcMain } = require('electron');

const SourceManager = require('../../services/sources/SourceManager');
const SibNet = require('../../services/sources/external/lib/extractors/sibnet/SibNet');


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

// TODO : Create an extractor factory to handle all the extractors (SibNet, ...)
ipcMain.on('/extract/remote/episode/', async (event, args) => {
    try {
        const extractor = new SibNet(args.url, args.quality, args.headers);
        await extractor.get_data();

        const episode = {
            stream_url: extractor.stream_url,
            referer: extractor.referer,
            meta: extractor.meta,
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