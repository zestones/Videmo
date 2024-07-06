import { makeRequest } from "../../../utilities/utils/Utils";

export default class SerieInfosApi {

    // Read serie infos by serie id
    readSerieInfosById(id) {
        return makeRequest("/read/serie-infos/by/id/", { id: id });
    }

    // Update serie infos by serie link
    updateSerieInfos(link, infos) {
        return makeRequest("/update/serie-infos/", { link: link, infos: infos });
    }
}