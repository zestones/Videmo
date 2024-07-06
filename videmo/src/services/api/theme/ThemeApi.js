import { makeRequest } from "../../../utilities/utils/Utils";

export default class ThemeApi {

    readAllThemes() {
        return makeRequest("/read/all/themes/");
    }

    readActiveTheme() {
        return makeRequest("/read/active/theme/");
    }

    updateActiveTheme(themeId, isActive) {
        return makeRequest("/update/active/theme/", { themeId: themeId, isActive: isActive });
    }
}