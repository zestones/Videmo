export default class TrackApi {

    addEpisodeToBookmarks = (serie, episode) => {
        return this.#updateSerieTrack(serie, episode);
    }   

    addEpisodeToViewed = (serie, episode) => {
        return this.#updateSerieTrack(serie, episode);
    }

    #updateSerieTrack = (serie, episode) => {
        window.api.send("/update/serie/track", { serie: JSON.stringify(serie), episode: JSON.stringify(episode) });

        return new Promise((resolve, reject) => {
            window.api.receive("/update/serie/track", (data) => data.success ? resolve(data.episode) : reject(data.error));
        });
    }

    readEpisodeByLink = (link) => {
        window.api.send("/read/episode/by/link", link);

        return new Promise((resolve, reject) => {
            window.api.receive("/read/episode/by/link", (data) => data.success ? resolve(data.episode) : reject(data.error));
        });
    }


    readAllEpisodesBySerieLink = (link) => {
        window.api.send("/read/all/episodes/by/serie/link", link);

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/episodes/by/serie/link", (data) => data.success ? resolve(data.episodes) : reject(data.error));
        });
    }

    mapSerieEpisodeWithDatabaseEpisode(episodes, episodesFromDatabase) {
        // i want here to "filter" the episodes array by replacing the episodes with the episodes from database

        return episodes.map(episode => {
            const episodeFromDatabase = episodesFromDatabase.find(episodeFromDatabase => episodeFromDatabase.link === episode.link);
            if (episodeFromDatabase) {
                return {...episodeFromDatabase, modifiedTime: episode.modifiedTime};
            }
            return episode;
        });

    }
}