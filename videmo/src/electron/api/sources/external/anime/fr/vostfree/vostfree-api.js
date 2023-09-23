const { ipcMain } = require('electron');

const Vostfree = require('../../../../../../services/sources/external/anime/fr/vostfree/Vostfree');
const vostfree = new Vostfree();


ipcMain.on('/read/vostfree/popular/anime', async (event, args) => {
    try {
        console.log("args: ", args.page);
        const animeList = await vostfree.getPopularAnime(args.page);
        console.log("animeList: ", animeList);
        event.reply('/read/vostfree/popular/anime', { success: true, animeList: animeList });
    } catch (error) {
        event.reply('/read/vostfree/popular/anime', { success: false, error: error });
    }
});