const { ipcMain } = require('electron');

const FilterDAO = require('../services/dao/categories/FilterDAO');

// Get all filters
ipcMain.on('/read/filters/', (event, arg) => {
    new FilterDAO().getFilters()
        .then((filters) => event.reply('/read/filters/', { success: true, data: filters }))
        .catch((err) => event.reply('/read/filters/', { success: false, error: err }));
})