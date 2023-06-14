const {ipcMain} = require('electron');

const SerieDAO = require('../services/dao/series/SerieDAO');

// Read all series by category id
ipcMain.on('/read/all/series/by/category/', (event, arg) => {
    new SerieDAO().getSeriesByCategoryId(arg.categoryId)
        .then((series) => {
            event.reply('/read/all/series/by/category/', {success: true, series: series});
        }).catch((err) => {
            event.reply('/read/all/series/by/category/', {success: false, error: err});
        });
})


// Read extensions by serie id
ipcMain.on('/read/extension/by/serie/id/', (event, arg) => {
    new SerieDAO().getExtensionBySerieId(arg.serieId)
        .then((extension) => {
            event.reply('/read/extension/by/serie/id/', {success: true, extension: extension});
        }).catch((err) => {
            event.reply('/read/extension/by/serie/id/', {success: false, error: err});
        });
})