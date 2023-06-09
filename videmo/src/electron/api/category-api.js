const { ipcMain } = require('electron');

const CategoriesDAO = require('../services/dao/settings/CategoriesDAO');

// Add new category
ipcMain.on('/create/category/', (event, arg) => {
    new CategoriesDAO()
        .createCategory(arg.name);

    event.reply('/create/category/', { success: true, category: { name: arg.name } });
})


// Read categories by serie id
ipcMain.on('/read/categories/by/serie/id/', (event, arg) => {
    new CategoriesDAO()
        .getCategoriesBySerieName(arg.serieName)
        .then((categories) => {
            event.reply('/read/categories/by/serie/id/', { success: true, categories: categories });
        }).catch((err) => {
            event.reply('/read/categories/by/serie/id/', { success: false, error: err });
        });
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

// Delete category by ID
ipcMain.on('/delete/category/', (event, arg) => {
    new CategoriesDAO()
        .deleteCategoryById(arg.id);

    event.reply('/delete/category/', { success: true, category: { id: arg.id } });
})

// Add Serie to Category
ipcMain.on('/add/serie/to/categories/', (event, arg) => {
    new CategoriesDAO()
        .updateSerieCategories(arg.serie, arg.categoriesId);

    event.reply('/add/serie/to/categories/', { success: true, category: { id: arg.categoriesId } });
})