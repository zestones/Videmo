export default class HistoryApi {

    retrieveAllEpisodeAndSerieHistory = () => {
        window.api.send("/read/all/episode/and/serie/history");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/episode/and/serie/history", (data) => data.success ? resolve(data.history) : reject(data.error));
        });
    }  

    deleteEpisodeHistory = (episodeId) => {
        window.api.send("/delete/episode/history", episodeId);

        return new Promise((resolve, reject) => {
            window.api.receive("/delete/episode/history", (data) => data.success ? resolve(data.history) : reject(data.error));
        });
    }

    deleteAllHistory = () => {
        window.api.send("/delete/all/history");

        return new Promise((resolve, reject) => {
            window.api.receive("/delete/all/history", (data) => data.success ? resolve(data.history) : reject(data.error));
        });
    }
}
