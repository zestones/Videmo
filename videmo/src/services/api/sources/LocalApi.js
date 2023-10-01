
class LocalApi {

    updateAnime(serie) {
        // Send the folder path to the main Electron process
        window.api.send("/scrap/local/serie/", { serie: JSON.stringify(serie) });

        // Listen for the response from the main Electron process
        return new Promise((resolve, reject) => {
            window.api.receive("/scrap/local/serie/", (data) => data.success ? resolve(data.success) : reject(data.error));
        });
    }

}

module.exports = LocalApi;