import React from "react";

// Styles
import styles from "./RandButton.module.scss";

// External
import ShuffleIcon from '@mui/icons-material/Shuffle';


function RandButton({ onClick }) {

    return (
        <button className={styles.randButton} onClick={onClick}>
            <ShuffleIcon className={styles.randButtonIcon} />
        </button>
    );
}

export default RandButton;