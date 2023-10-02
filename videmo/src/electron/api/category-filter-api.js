const { ipcMain } = require('electron');

const CategoryFilterDAO = require('../services/dao/categories/CategoryFilterDAO');

// Get all category filters for a category
ipcMain.on('/read/filters/by/category-id/', (event, arg) => {
    new CategoryFilterDAO().getCategoryFiltersByCategoryId(arg.categoryId)
        .then((filters) => event.reply('/read/filters/by/category-id/', { success: true, data: filters }))
        .catch((err) => event.reply('/read/filters/by/category-id/', { success: false, error: err }));
})

// Update category filter by category ID
ipcMain.on('/update/category-filter/by/category-id/', (event, arg) => {
    new CategoryFilterDAO().updateCategoryFilters(arg.categoryFilter, arg.categoryId)
        .then((categoryFilter) => event.reply('/update/category-filter/by/category-id/', { success: true, data: categoryFilter }))
        .catch((err) => event.reply('/update/category-filter/by/category-id/', { success: false, error: err }));
})