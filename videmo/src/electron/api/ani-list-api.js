const { ipcMain } = require('electron');

const AniListService = require('../services/external/AniListService');

// search a serie by name
ipcMain.on('/ani-list/search/serie/by/name/', (event, arg) => {
    new AniListService().searchAnimeInfosName(arg.name)
        .then((serie) => event.reply('/ani-list/search/serie/by/name/', { success: true, data: serie }))
        .catch((err) => event.reply('/ani-list/search/serie/by/name/', { success: false, error: err }));
})