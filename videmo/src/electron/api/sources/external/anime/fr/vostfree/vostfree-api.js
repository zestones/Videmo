const { ipcMain } = require('electron');
const axios = require('axios');
const fetch = require('node-fetch');

const Vostfree = require('../../../../../../services/sources/external/anime/fr/vostfree/Vostfree');
const SibNet = require('../../../../../../services/sources/external/lib/extractors/sibnet/SibNet');

const vostfree = new Vostfree();

ipcMain.on('/read/vostfree/popular/anime', async (event, args) => {
    try {
        const animeList = await vostfree.getPopularAnime(args.page);
        event.reply('/read/vostfree/popular/anime', { success: true, animeList: animeList });
    } catch (error) {
        event.reply('/read/vostfree/popular/anime', { success: false, error: error });
    }
});

ipcMain.on('/read/vostfree/anime/episodes', async (event, args) => {
    try {
        const episodes = await vostfree.scrapeEpisodes(args.url);
        event.reply('/read/vostfree/anime/episodes', { success: true, episodes: episodes });
    } catch (error) {
        event.reply('/read/vostfree/anime/episodes', { success: false, error: error });
    }
});


ipcMain.on('/extract/vostfree/episode', async (event, args) => {
    try {
        const extractor = new SibNet(args.url, args.quality, args.headers);
        await extractor.get_data();

        const episode = {
            stream_url: extractor.stream_url,
            referer: extractor.referer,
            meta: extractor.meta,
        };
        console.log("episode: ", episode)
        event.reply('/extract/vostfree/episode', { success: true, episode: JSON.stringify(episode) });
    } catch (error) {
        event.reply('/extract/vostfree/episode', { success: false, error: error });
    }
});