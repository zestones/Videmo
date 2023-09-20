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

    updateAllSeriesEpisodesViewedFlag = (series, viewed) => {
        window.api.send("/update/all/series/episodes/viewed/flag/", { series: series, viewed });

        return new Promise((resolve, reject) => {
            window.api.receive("/update/all/series/episodes/viewed/flag/", (data) => data.success ? resolve(data.success) : reject(data.error));
        });
    }

    updatePlayedTime = (serie, episode, timestamp) => {
        window.api.send("/update/serie/track/and/history/", { serie: JSON.stringify(serie), episode: JSON.stringify(episode), timestamp: timestamp });

        return new Promise((resolve, reject) => {
            window.api.receive("/update/serie/track/and/history/", (data) => data.success ? resolve(data.episode) : reject(data.error));
        });
    }

    #updateSerieTrack = (serie, episodes) => {
        window.api.send("/update/serie/track/", { serie: JSON.stringify(serie), episodes: JSON.stringify(episodes) });

        return new Promise((resolve, reject) => {
            window.api.receive("/update/serie/track/", (data) => data.success ? resolve(data.episode) : reject(data.error));
        });
    }

    readEpisodeByLink = (link) => {
        window.api.send("/read/episode/by/link/", link);

        return new Promise((resolve, reject) => {
            window.api.receive("/read/episode/by/link/", (data) => data.success ? resolve(data.episode) : reject(data.error));
        });
    }

    readAllEpisodesBySerieLink = (link) => {
        window.api.send("/read/all/episodes/by/serie/link/", link);

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/episodes/by/serie/link/", (data) => data.success ? resolve(data.episodes) : reject(data.error));
        });
    }

    readAllEpisodesBySerieId = (id) => {
        window.api.send("/read/all/episodes/by/serie/id/", id);

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/episodes/by/serie/id/", (data) => data.success ? resolve(data.episodes) : reject(data.error));
        });
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