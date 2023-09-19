import React, { useState, useEffect, useMemo } from "react";

// Api
import DisplayModeApi from "../../../services/api/settings/DisplayModeApi";
import DisplaySettingsApi from "../../../services/api/settings/DisplaySettingsApi";

import { useDisplayMode } from "./DisplayModeContext";

// Styles
import styles from "./DisplayOptions.module.scss";


function DisplayOptions() {
    // Api initialization   
    const displayModeApi = useMemo(() => new DisplayModeApi(), []);
    const displaySettingsApi = useMemo(() => new DisplaySettingsApi(), []);

    // State initialization
    const [modes, setModes] = useState([]);
    const { displayMode, setDisplayMode } = useDisplayMode();

    useEffect(() => {
        displayModeApi.readAllDisplayMode()
            .then((modes) => setModes(modes))
            .catch((error) => console.error(error));
    }, [displayModeApi, displaySettingsApi, setDisplayMode]);

    const handleCheckedMode = (mode) => {
        displaySettingsApi.updateDisplayMode(mode.id)
            .then((mode) => setDisplayMode(mode))
            .catch((error) => console.error(error));
    }


    return (
        <div className={styles.displayOptions}>
            <div className={styles.title}>Display Options</div>
            <div className={styles.options}>
                {modes.map((option) => (
                    <div className={styles.option} key={option.id}>
                        <input
                            type="checkbox"
                            id={option.id}
                            className={styles.checkbox}
                            checked={displayMode.display_mode_id === option.id}
                            onChange={() => handleCheckedMode(option)}
                        />
                        <label htmlFor={option.id}>{option.name}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DisplayOptions;