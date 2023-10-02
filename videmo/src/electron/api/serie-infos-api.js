const { ipcMain } = require('electron');

const SerieInfosDAO = require('../services/dao/series/SerieInfosDAO');
const SerieDAO = require('../services/dao/series/SerieDAO');

// Read serie infos by serie id
ipcMain.on('/read/serie-infos/by/id/', (event, arg) => {
    new SerieInfosDAO().getSerieInfosBySerieId(arg.id)
        .then((infos) => event.reply('/read/serie-infos/by/id/', { success: true, data: infos }))
        .catch((err) => event.reply('/read/serie-infos/by/id/', { success: false, error: err }));
})

// Update serie infos
ipcMain.on('/update/serie-infos/', (event, arg) => {
    new SerieDAO()
        .getSerieByLink(arg.link)
        .then((serie) => {
            new SerieInfosDAO()
                .updateSerieInfos(serie.id, arg.infos)
                .then(() => event.reply('/update/serie-infos/', { success: true, data: null }))
                .catch((err) => event.reply('/update/serie-infos/', { success: false, error: err }));
        })
        .catch((err) => event.reply('/update/serie-infos/', { success: false, error: err }));
})