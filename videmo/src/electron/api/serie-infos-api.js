const { ipcMain } = require('electron');

const SerieInfosDAO = require('../services/dao/series/SerieInfosDAO');


// Read serie infos by serie id
ipcMain.on('/read/serie-infos/by/id/', async (event, arg) => {
    new SerieInfosDAO().getSerieInfoBySerieId(arg.id)
        .then((infos) => event.reply('/read/serie-infos/by/id/', { success: true, infos: infos }))
        .catch((err) => event.reply('/read/serie-infos/by/id/', { success: false, error: err }));
})
