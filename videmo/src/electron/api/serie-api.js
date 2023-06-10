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

