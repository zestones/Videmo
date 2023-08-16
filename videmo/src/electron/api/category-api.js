const { ipcMain } = require('electron');

const CategoriesDAO = require('../services/dao/settings/CategoriesDAO');

// Add new category
ipcMain.on('/create/category/', (event, arg) => {
    new CategoriesDAO().createCategory(arg.name)
        .then(() =>  event.reply('/create/category/', { success: true, category: { name: arg.name } }))
        .catch((err) => event.reply('/create/category/', { success: false, error: err }));
})

// Read all categories
ipcMain.on('/read/all/categories/', (event) => {
    new CategoriesDAO().getAllCategories()
        .then((categories) => event.reply('/read/all/categories/', { success: true, categories: categories }))
        .catch((err) => event.reply('/read/all/categories/', { success: false, error: err }));
})

// Update category
ipcMain.on('/update/category/', (event, arg) => {
    new CategoriesDAO().updateCategory(arg.category)
        .then(() => event.reply('/update/category/', { success: true, category: arg.category }))
        .catch((err) => event.reply('/update/category/', { success: false, error: err }));
})

// Delete category by ID
ipcMain.on('/delete/category/', (event, arg) => {
    new CategoriesDAO().deleteCategoryById(arg.id)
        .then(() => event.reply('/delete/category/', { success: true, category: { id: arg.id } }))
        .catch((err) => event.reply('/delete/category/', { success: false, error: err }));
})