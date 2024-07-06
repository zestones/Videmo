import { makeRequest } from "../../../utilities/utils/Utils";


export default class LocalApi {

    // Update Local Anime
    updateAnime(serie) {
        return makeRequest("/scrap/local/serie/", { serie: JSON.stringify(serie) });
    }

}