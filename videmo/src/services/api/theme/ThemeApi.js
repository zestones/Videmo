export default class ThemeApi {

    readAllThemes() {
        window.api.send('/read/all/themes');

        return new Promise((resolve, reject) => {
            window.api.receive('/read/all/themes', (data) => data.success ? resolve(data.themes) : reject(data.error));
        });
    }

    readActiveTheme() {
        window.api.send('/read/active/theme');

        return new Promise((resolve, reject) => {
            window.api.receive('/read/active/theme', (data) => data.success ? resolve(data.theme) : reject(data.error));
        });
    }

    updateActiveTheme(themeId, isActive) {
        window.api.send('/update/active/theme', { themeId: themeId, isActive: isActive });

        return new Promise((resolve, reject) => {
            window.api.receive('/update/active/theme', (data) => data.success ? resolve() : reject(data.error));
        });
    }
}