import React, { useState } from "react";

// External
import ViewModuleIcon from '@mui/icons-material/ViewModule';

// Components
import DisplayOptions from "../FilterPanel/DisplayOptions/DisplayOptions";

import styles from "./ViewModule.module.scss";

function ViewModule() {
    const [displayOptions, setDisplayOptions] = useState(false);

    return (
        <>
            <button className={styles.viewModule} onClick={() => setDisplayOptions(!displayOptions)}>
                <div className={styles.viewModuleIcon}>
                    <ViewModuleIcon />
                </div>
            </button>

            <div className={`${styles.modal} ${displayOptions ? styles.open : ''}`}>
                {displayOptions && <DisplayOptions />}
            </div>
        </>
    );
}

export default ViewModule;