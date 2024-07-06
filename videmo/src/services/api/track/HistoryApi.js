import { makeRequest } from "../../../utilities/utils/Utils";

export default class HistoryApi {

    retrieveAllEpisodeAndSerieHistory() {
        return makeRequest("/read/all/episode/and/serie/history/");
    }

    deleteEpisodeHistory(episodeId) {
        return makeRequest("/delete/episode/history/", episodeId);
    }

    deleteAllHistory() {
        return makeRequest("/delete/all/history/");
    }
}
