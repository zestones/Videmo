import { makeRequest } from "../../../utilities/utils/Utils";

class SortApi {

    // Get all sorts entries
    getAllSortsEntries() {
        return makeRequest("/read/sorts/");
    }
}

export default SortApi;
