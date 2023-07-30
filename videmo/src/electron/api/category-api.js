const { ipcMain } = require('electron');

const CategoriesDAO = require('../services/dao/settings/CategoriesDAO');

// Add new category
ipcMain.on('/create/category/', (event, arg) => {
    new CategoriesDAO()
        .createCategory(arg.name);

    event.reply('/create/category/', { success: true, category: { name: arg.name } });
})


// Read all categories
ipcMain.on('/read/all/categories/', (event) => {
    const dao = new CategoriesDAO();
    dao.getAllCategories()
        .then((categories) => {
            event.reply('/read/all/categories/', { success: true, categories: categories });
        }).catch((err) => {
            event.reply('/read/all/categories/', { success: false, error: err });
        });
})

// Update category
ipcMain.on('/update/category/', (event, arg) => {
    new CategoriesDAO()
        .updateCategory(arg.category);

    event.reply('/update/category/', { success: true, category: arg.category });
})

// Read all series in library by extension
ipcMain.on('/read/all/series/in/library/by/extension', (event, arg) => {
    const dao = new CategoriesDAO();
    dao.getAllSeriesInLibraryByExtension(arg.extension)
        .then((series) => {
            event.reply('/read/all/series/in/library/by/extension', { success: true, series: series });
        }).catch((err) => {
            event.reply('/read/all/series/in/library/by/extension', { success: false, error: err });
        });
})


// Delete category by ID
ipcMain.on('/delete/category/', (event, arg) => {
    new CategoriesDAO()
        .deleteCategoryById(arg.id);

    event.reply('/delete/category/', { success: true, category: { id: arg.id } });
})