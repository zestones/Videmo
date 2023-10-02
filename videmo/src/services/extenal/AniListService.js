import { makeRequest } from "../../utilities/utils/Utils";


export default class AniListService {

    // search a serie by name
    searchAnimeInfosName(name) {
        return makeRequest("/ani-list/search/serie/by/name/", { name: name });
    }
}