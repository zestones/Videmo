import { makeRequest } from "../../../utilities/utils/Utils";

class FilterApi {

    // Get all filters entries
    getAllFiltersEntries() {
        return makeRequest("/read/filters/");
    }
}

export default FilterApi;
