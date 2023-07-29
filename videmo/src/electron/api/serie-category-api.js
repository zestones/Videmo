const { ipcMain } = require('electron');

const SerieCategoryDAO = require('../services/dao/series/SerieCategoryDAO');

// Read categories by serie id
ipcMain.on('/read/serie-categories/by/serie', (event, arg) => {
    new SerieCategoryDAO().getSerieCategoryIdsBySerie(arg.serie)
        .then((categories) => {
            event.reply('/read/serie-categories/by/serie', { success: true, categories: categories });
        }).catch((err) => {
            event.reply('/read/serie-categories/by/serie', { success: false, error: err });
        });
})

// Add Serie to Category
ipcMain.on('/add/categories/to/serie', async (event, arg) => {
    await new SerieCategoryDAO()
        .updateSerieCategories(arg.serie, arg.categoriesId);

    event.reply('/add/categories/to/serie', { success: true, category: { id: arg.categoriesId } });
})

// last opened category update
ipcMain.on('/update/last/opened/category', async (event, arg) => {
    try {
        await new SerieCategoryDAO()
            .updateLastOpenedCategory(arg.id);
    } catch (err) {
        event.reply('/update/last/opened/category', { success: false, error: err });
    }

})

// Read last opened category
ipcMain.on('/read/last/opened/category', async (event) => {
    const category = await new SerieCategoryDAO()
        .getLastOpenedCategory();

    event.reply('/read/last/opened/category', { success: true, category: category });
})