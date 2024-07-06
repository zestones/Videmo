import { makeRequest } from "../../../utilities/utils/Utils";

export default class TrackApi {

    addEpisodeToBookmarks = (serie, episode) => {
        return this.#updateSerieTrack(serie, [episode]);
    }

    addEpisodeToViewed = (serie, episode) => {
        return this.#updateSerieTrack(serie, [episode]);
    }

    addManyEpisodesToBookmarks = (serie, episodes) => {
        return this.#updateSerieTrack(serie, episodes);
    }

    addManyEpisodesToViewed = (serie, episodes) => {
        return this.#updateSerieTrack(serie, episodes);
    }

    updateAllSeriesEpisodesViewedFlag(series, viewed) {
        return makeRequest("/update/all/series/episodes/viewed/flag/", { series: series, viewed });
    }

    updatePlayedTime(serie, episode, timestamp) {
        return makeRequest("/update/serie/track/and/history/", { serie: JSON.stringify(serie), episode: JSON.stringify(episode), timestamp: timestamp });
    }

    #updateSerieTrack(serie, episodes) {
        return makeRequest("/update/serie/track/", { serie: JSON.stringify(serie), episodes: JSON.stringify(episodes) });
    }

    readEpisodeByLink(link) {
        return makeRequest("/read/episode/by/link/", link);
    }

    readAllEpisodesBySerieLink(link) {
        return makeRequest("/read/all/episodes/by/serie/link/", link);
    }

    readAllEpisodesBySerieId(id) {
        return makeRequest("/read/all/episodes/by/serie/id/", id);
    }

    mapSerieEpisodeWithDatabaseEpisode(episodes, episodesFromDatabase) {
        return episodes.map(episode => {
            const episodeFromDatabase = episodesFromDatabase.find(episodeFromDatabase => episodeFromDatabase.link === episode.link);
            if (episodeFromDatabase) {
                return { ...episodeFromDatabase, modifiedTime: episode.modifiedTime };
            }
            return episode;
        });
    }
}