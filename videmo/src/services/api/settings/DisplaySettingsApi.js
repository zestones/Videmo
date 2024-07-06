import { makeRequest } from "../../../utilities/utils/Utils";

export default class DisplaySettingsApi {

    // Retrieve the display mode
    readDisplayMode() {
        return makeRequest("/read/display/mode/");
    }

    // Update the display mode
    updateDisplayMode(displayModeId) {
        return makeRequest("/update/display/mode/", { displayModeId: displayModeId });
    }
}