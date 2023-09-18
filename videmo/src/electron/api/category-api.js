const { ipcMain } = require('electron');

const CategoriesDAO = require('../services/dao/settings/CategoriesDAO');

// Add new category
ipcMain.on('/create/category/', (event, arg) => {
    new CategoriesDAO().createCategory(arg.name, arg.order_id)
        .then((category) =>  event.reply('/create/category/', { success: true, category: category }))
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

// Update categories order
ipcMain.on('/update/categories/order/', (event, arg) => {
    new CategoriesDAO().updateCategoriesOrder(JSON.parse(arg.categories))
        .then(() => event.reply('/update/categories/order/', { success: true, categories: arg.categories }))
        .catch((err) => event.reply('/update/categories/order/', { success: false, error: err }));
})

// Delete category by ID
ipcMain.on('/delete/category/', (event, arg) => {
    new CategoriesDAO().deleteCategoryById(arg.id)
        .then(() => event.reply('/delete/category/', { success: true, category: { id: arg.id } }))
        .catch((err) => event.reply('/delete/category/', { success: false, error: err }));
})