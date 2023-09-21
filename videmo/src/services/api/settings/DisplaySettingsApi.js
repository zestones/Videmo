export default class DisplaySettingsApi {
    readDisplayMode() {
        window.api.send('/read/display/mode/');

        return new Promise((resolve, reject) => {
            window.api.receive('/read/display/mode/', (data) => data.success ? resolve(data.displayOption) : reject(data.error));
        });
    }

    updateDisplayMode(displayModeId) {
        window.api.send('/update/display/mode/', { displayModeId: displayModeId });

        return new Promise((resolve, reject) => {
            window.api.receive('/update/display/mode/', (data) => data.success ? resolve(data.mode) : reject(data.error));
        });
    }

}