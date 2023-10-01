const { ipcMain } = require('electron');

const SerieCategoryDAO = require('../services/dao/series/SerieCategoryDAO');
const SourceManager = require('../services/sources/SourceManager');


// Read categories by serie id
ipcMain.on('/read/serie-categories/by/serie/link/', (event, arg) => {
    new SerieCategoryDAO().getSerieCategoryIdsBySerieLink(arg.link)
        .then((categories) => event.reply('/read/serie-categories/by/serie/link/', { success: true, categories: categories }))
        .catch((err) => event.reply('/read/serie-categories/by/serie/link/', { success: false, error: err }));
})

// Read all serie categories by serie link array
ipcMain.on('/read/serie-categories/by/serie/link/array/', (event, arg) => {
    new SerieCategoryDAO().getSerieCategoryIdsBySerieLinkArray(arg.links)
        .then((categories) => event.reply('/read/serie-categories/by/serie/link/array/', { success: true, categories: categories }))
        .catch((err) => event.reply('/read/serie-categories/by/serie/link/array/', { success: false, error: err }));
})

// Add Serie to Category
ipcMain.on('/add/categories/to/serie/', async (event, arg) => {
    // We scrap the serie if needed (if we are inside the explorer page)
    if (arg.shouldUpdateSeries) new SourceManager().scrapAndInsertAnime(arg.series);
    await new SerieCategoryDAO().updateSerieCategories(arg.series, arg.associationSerieCategory)
        .then((categories) => event.reply('/add/categories/to/serie/', { success: true, categories: categories }))
        .catch((err) => event.reply('/add/categories/to/serie/', { success: false, error: err }));
})

// last opened category update
ipcMain.on('/update/last/opened/category/', (event, arg) => {
    new SerieCategoryDAO().updateLastOpenedCategory(arg.id)
        .then(() => event.reply('/update/last/opened/category/', { success: true }))
        .catch((err) => event.reply('/update/last/opened/category/', { success: false, error: err }));
})

// Read last opened category
ipcMain.on('/read/last/opened/category/', (event) => {
    new SerieCategoryDAO().getLastOpenedCategory()
        .then((category) => event.reply('/read/last/opened/category/', { success: true, category: category }))
        .catch((err) => event.reply('/read/last/opened/category/', { success: false, error: err }));
})