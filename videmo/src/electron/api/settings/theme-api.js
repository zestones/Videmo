const { ipcMain } = require('electron');

const ThemeDAO = require('../../services/dao/theme/ThemeDAO');

// Get all themes
ipcMain.on('/read/all/themes/', (event) => {
    new ThemeDAO().getThemes()
        .then((themes) => event.reply('/read/all/themes/', { success: true, data: themes }))
        .catch((err) => event.reply('/read/all/themes/', { success: false, error: err }));
});

// Get active theme
ipcMain.on('/read/active/theme/', (event) => {
    new ThemeDAO().getActiveTheme()
        .then((theme) => event.reply('/read/active/theme/', { success: true, data: theme.name }))
        .catch((err) => event.reply('/read/active/theme/', { success: false, error: err }));
});

// Update active theme
ipcMain.on('/update/active/theme/', (event, arg) => {
    new ThemeDAO().updateActiveTheme(arg.themeId, arg.isActive)
        .then(() => event.reply('/update/active/theme/', { success: true, data: null }))
        .catch((err) => event.reply('/update/active/theme/', { success: false, error: err }));
});