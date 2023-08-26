const { ipcMain } = require('electron');

const ExtensionsDAO = require('../../services/dao/settings/ExtensionsDAO');
const LocalFileScrapper = require('../../services/sources/local/local-file-scrapper');

ipcMain.on('scrap/local/serie', async (event, arg) => {
    console.log(arg);   
    const serie = JSON.parse(arg.serie);

    new ExtensionsDAO().getExtensionById(serie.extension_id)
        .then(async (extension) => {
            const scrapper = new LocalFileScrapper(extension.link, serie.link);
            await scrapper.scrap();

            event.reply('scrap/local/serie', { success: true });
        })
        .catch((err) => event.reply('scrap/local/serie', { success: false, error: err }));
})