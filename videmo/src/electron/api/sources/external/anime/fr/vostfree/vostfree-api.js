const { ipcMain } = require('electron');

const Vostfree = require('../../../../../../services/sources/external/anime/fr/vostfree/Vostfree');
const SibNet = require('../../../../../../services/sources/external/lib/extractors/sibnet/SibNet');

const SerieEpisodeDAO = require('../../../../../../services/dao/series/SerieEpisodeDAO');
const SerieTrackDAO = require('../../../../../../services/dao/series/SerieTrackDAO');
const SerieUpdateDAO = require('../../../../../../services/dao/series/SerieUpdateDAO');


ipcMain.on('/read/vostfree/popular/anime', async (event, args) => {
    try {
        const animeList = await new Vostfree().getPopularAnime(args.page);
        event.reply('/read/vostfree/popular/anime', { success: true, animeList: animeList });
    } catch (error) {
        event.reply('/read/vostfree/popular/anime', { success: false, error: error });
    }
});

ipcMain.on('/read/vostfree/recent/anime', async (event, args) => {
    try {
        const animeList = await new Vostfree().getRecentAnime(args.page);
        event.reply('/read/vostfree/recent/anime', { success: true, animeList: animeList });
    } catch (error) {
        event.reply('/read/vostfree/recent/anime', { success: false, error: error });
    }
});

ipcMain.on('/read/vostfree/anime/episodes', async (event, args) => {
    try {
        const episodes = await new Vostfree().scrapeEpisodes(args.url);
        event.reply('/read/vostfree/anime/episodes', { success: true, episodes: episodes });
    } catch (error) {
        event.reply('/read/vostfree/anime/episodes', { success: false, error: error });
    }
});

ipcMain.on('/search/vostfree/anime', async (event, args) => {
    try {
        const animeList = await new Vostfree().search(args.query);
        console.log(animeList);
        event.reply('/search/vostfree/anime', { success: true, animeList: animeList });
    } catch (error) {
        event.reply('/search/vostfree/anime', { success: false, error: error });
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

        event.reply('/extract/vostfree/episode', { success: true, episode: JSON.stringify(episode) });
    } catch (error) {
        event.reply('/extract/vostfree/episode', { success: false, error: error });
    }
});


ipcMain.on('/update/vostfree/anime', async (event, args) => {
    try {
        const serie = JSON.parse(args.serie);

        const episodes = await new Vostfree().scrapeEpisodes(serie.link);
        const databaseEpisodes = await new SerieEpisodeDAO().getAllEpisodesBySerieId(serie.id);

        const newEpisodes = episodes.filter(episode => !databaseEpisodes.some(databaseEpisode => databaseEpisode.link === episode.link));
        const deletedEpisodes = databaseEpisodes.filter(databaseEpisode => !episodes.some(episode => episode.link === databaseEpisode.link));

        console.log("newEpisodes", newEpisodes);
        console.log("deletedEpisodes", deletedEpisodes);

        // Add new episodes
        for (const episode of newEpisodes) {
            episode.serie_id = serie.id;
            const createdEpisode = await new SerieEpisodeDAO().createEpisode(episode);
            await new SerieTrackDAO().createSerieTrack(serie.id, createdEpisode.id);
            await new SerieUpdateDAO().insertNewUpdate(serie.id, createdEpisode.id);
            // TODO : Update the number of episodes in the serie infos
        }

        // Delete old episodes
        for (const episode of deletedEpisodes) {
            await new SerieEpisodeDAO().deleteEpisodeById(episode.id);
            await new SerieTrackDAO().deleteSerieTrackByEpisodeId(episode.id);
            // TODO : delete episode from serie update
            // TODO : Update the number of episodes in the serie infos
            // TODO : Update the number of viewed episodes in the serie infos
        }

        event.reply('/update/vostfree/anime', { success: true });
    } catch (error) {
        event.reply('/update/vostfree/anime', { success: false, error: error });
    }
});