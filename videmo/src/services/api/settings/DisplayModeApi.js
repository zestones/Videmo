import { makeRequest } from "../../../utilities/utils/Utils";


export default class DisplayModeApi {

    // Retrieve the display mode entries
    readAllDisplayMode() {
        return makeRequest("/read/all/display/mode/");
    }
}