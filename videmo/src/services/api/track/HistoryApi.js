export default class HistoryApi {

    retrieveAllEpisodeAndSerieHistory = () => {
        window.api.send("/read/all/episode/and/serie/history");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/episode/and/serie/history", (data) => data.success ? resolve(data.history) : reject(data.error));
        });
    }  

}
