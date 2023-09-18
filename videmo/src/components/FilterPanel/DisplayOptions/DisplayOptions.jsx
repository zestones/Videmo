import React, { useState, useEffect, useMemo } from "react";


// Api
import DisplayModeApi from "../../../services/api/settings/DisplayModeApi";
import DisplaySettingsApi from "../../../services/api/settings/DisplaySettingsApi";

// Styles
import styles from "./DisplayOptions.module.scss";

function DisplayOptions() {
    // Api initialization   
    const displayModeApi = useMemo(() => new DisplayModeApi(), []);
    const displaySettingsApi = useMemo(() => new DisplaySettingsApi(), []);

    // State initialization
    const [modes, setModes] = useState([]);
    const [checkedDisplayMode, setCheckedDisplayMode] = useState({});

    useEffect(() => {
        displayModeApi.readAllDisplayMode()
            .then((modes) => setModes(modes))
            .catch((error) => console.error(error));

        displaySettingsApi.readDisplayMode()
            .then((mode) => setCheckedDisplayMode(mode))
    }, [displayModeApi, displaySettingsApi]);

    const handleCheckedMode = (mode) => {
        displaySettingsApi.updateDisplayMode(mode.id)
            .then((mode) => {
                console.log(mode);
                setCheckedDisplayMode(mode)
            })
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
                            checked={checkedDisplayMode.display_mode_id === option.id}
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