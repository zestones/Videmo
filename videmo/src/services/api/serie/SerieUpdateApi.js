import { makeRequest } from "../../../utilities/utils/Utils";


export default class SerieUpdateApi {

    // Retrieve the update entries
    readAllUpdateEntries() {
        return makeRequest("/read/all/update/entries/");
    }
}
