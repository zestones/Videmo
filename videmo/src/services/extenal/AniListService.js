
export default class AniListService {

    // search a serie by name
    searchAnimeInfosName(name) {
        window.api.send('/ani-list/search/serie/by/name/', { name: name });

        return new Promise((resolve, reject) => {
            window.api.receive('/ani-list/search/serie/by/name/', (data) => data.success ? resolve(data.serie) : reject(data.error));
        });
    }
}