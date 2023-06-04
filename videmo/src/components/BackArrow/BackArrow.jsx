import React from "react";

// Components

// Styles
import styles from "./BackArrow.module.scss";

function BackArrow({ handleClick }) {

    return (
        <div className={styles.backArrow} onClick={handleClick}>
            <img
                className={styles.backArrowIcon}
                src="/icons/header/left-arrow.png"
                alt="Back arrow"
            />
        </div>
    );
}

export default BackArrow;