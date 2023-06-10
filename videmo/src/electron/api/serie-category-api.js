const { ipcMain } = require('electron');

const SerieCategoryDAO = require('../services/dao/series/SerieCategoryDAO');

// Read categories by serie id
ipcMain.on('/read/serie-categories/by/serie/name/', (event, arg) => {
    new SerieCategoryDAO().getSerieCategoryIdsBySerieName(arg.serieName)
        .then((categories) => {
            event.reply('/read/serie-categories/by/serie/name/', { success: true, categories: categories });
        }).catch((err) => {
            event.reply('/read/serie-categories/by/serie/name/', { success: false, error: err });
        });
})


// Add Serie to Category
ipcMain.on('/add/categories/to/serie', (event, arg) => {
    new SerieCategoryDAO()
        .updateSerieCategories(arg.serie, arg.categoriesId);

    event.reply('/add/categories/to/serie', { success: true, category: { id: arg.categoriesId } });
})