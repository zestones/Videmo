const { ipcMain } = require('electron');

const CategoryFilterDAO = require('../services/dao/categories/CategoryFilterDAO');

// Get all category filters for a category
ipcMain.on('/read/filters/by/category-id/', (event, arg) => {
    new CategoryFilterDAO().getCategoryFiltersByCategoryId(arg.categoryId)
        .then((filters) => event.reply('/read/filters/by/category-id/', { success: true, filters: filters }))
        .catch((err) => event.reply('/read/filters/by/category-id/', { success: false, error: err }));
})