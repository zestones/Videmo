const { ipcMain } = require('electron');

const SortDAO = require('../../services/dao/categories/SortDAO');

// Get all sorts
ipcMain.on('/read/sorts/', (event) => {
    new SortDAO().getSorts()
        .then((sorts) => event.reply('/read/sorts/', { success: true, data: sorts }))
        .catch((err) => event.reply('/read/sorts/', { success: false, error: err }));
})