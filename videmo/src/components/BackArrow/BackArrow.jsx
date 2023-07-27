import React from "react";

// External
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Styles
import styles from "./BackArrow.module.scss";

function BackArrow({ handleClick }) {

    return (
        <div className={styles.backArrow} onClick={handleClick}>
            <ArrowBackIcon className={styles.backArrowIcon} />
        </div>
    );
}

export default BackArrow;