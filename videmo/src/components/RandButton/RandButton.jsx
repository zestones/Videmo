import React from "react";

// Styles
import styles from "./RandButton.module.scss";

function RandButton({ onClick }) {
    return (
        <button className={styles.randButton} onClick={onClick}>
            <span className={styles.randButtonText}>Random</span>
        </button>
    );
}

export default RandButton;