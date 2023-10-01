export default class SerieUpdateApi {

    // Retrieve the update entries
    readAllUpdateEntries() {
        window.api.send("/read/all/update/entries/");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/update/entries/", (data) => data.success ? resolve(data.entries) : reject(data.error));
        });
    }
}
