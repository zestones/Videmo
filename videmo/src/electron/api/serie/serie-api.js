const { ipcMain } = require('electron');

const SerieDAO = require('../../services/dao/series/SerieDAO');

// Read all series by category id
ipcMain.on('/read/all/series/by/category/', (event, arg) => {
    new SerieDAO().getSeriesByCategoryId(arg.categoryId)
        .then((series) => event.reply('/read/all/series/by/category/', { success: true, data: series }))
        .catch((err) => event.reply('/read/all/series/by/category/', { success: false, error: err }));
})


// Read all series in library by extension
ipcMain.on('/read/all/series/in/library/by/extension/', (event, arg) => {
    new SerieDAO().getAllSeriesInLibraryByExtension(arg.extension)
        .then((series) => event.reply('/read/all/series/in/library/by/extension/', { success: true, data: series }))
        .catch((err) => event.reply('/read/all/series/in/library/by/extension/', { success: false, error: err }));
})


// Read serie by name
ipcMain.on('/read/serie/by/serie-link/', (event, arg) => {
    new SerieDAO().getSerieByLink(arg.link)
        .then((serie) => event.reply('/read/serie/by/serie-link/', { success: true, data: serie }))
        .catch((err) => event.reply('/read/serie/by/serie-link/', { success: false, error: err }));
})

// Read all series by parent id
ipcMain.on('/read/all/series/by/parent-id/', (event, arg) => {
    new SerieDAO().getSeriesByParentId(arg.parentId)
        .then((series) => event.reply('/read/all/series/by/parent-id/', { success: true, data: series }))
        .catch((err) => event.reply('/read/all/series/by/parent-id/', { success: false, error: err }));
})

// Read all series by links
ipcMain.on('/read/all/series/by/links/', (event, arg) => {
    new SerieDAO().getSeriesByLinks(arg.links)
        .then((series) => event.reply('/read/all/series/by/links/', { success: true, data: series }))
        .catch((err) => event.reply('/read/all/series/by/links/', { success: false, error: err }));
})

// Read serie by id
ipcMain.on('/read/serie/by/id/', (event, arg) => {
    new SerieDAO().getSerieById(arg.id)
        .then((serie) => event.reply('/read/serie/by/id/', { success: true, data: serie }))
        .catch((err) => event.reply('/read/serie/by/id/', { success: false, error: err }));
})

// Update serie image
ipcMain.on('/update/serie/image/', (event, arg) => {
    new SerieDAO().updateSerieImage(arg.serieId, arg.image)
        .then(() => event.reply('/update/serie/image/', { success: true }))
        .catch((err) => event.reply('/update/serie/image/', { success: false, error: err }));
})