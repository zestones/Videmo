export default class DisplayModeApi {
    readAllDisplayMode() {
        window.api.send('/read/all/display/mode/');

        return new Promise((resolve, reject) => {
            window.api.receive('/read/all/display/mode/', (data) => data.success ? resolve(data.modes) : reject(data.error));
        });
    }
}