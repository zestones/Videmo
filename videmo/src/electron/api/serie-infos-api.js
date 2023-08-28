const { ipcMain } = require('electron');

const SerieInfosDAO = require('../services/dao/series/SerieInfosDAO');
const SerieDAO = require('../services/dao/series/SerieDAO');

// Read serie infos by serie id
ipcMain.on('/read/serie-infos/by/id/', async (event, arg) => {
    new SerieInfosDAO().getSerieInfoBySerieId(arg.id)
        .then((infos) => event.reply('/read/serie-infos/by/id/', { success: true, infos: infos }))
        .catch((err) => event.reply('/read/serie-infos/by/id/', { success: false, error: err }));
})

// Update serie infos
ipcMain.on('/update/serie-infos/', async (event, arg) => {
    const serie = await new SerieDAO().getSerieByLink(arg.link);
    new SerieInfosDAO().updateSerieInfos(serie.id, arg.infos)
        .then(() => event.reply('/update/serie-infos/', { success: true }))
        .catch((err) => event.reply('/update/serie-infos/', { success: false, error: err }));
})