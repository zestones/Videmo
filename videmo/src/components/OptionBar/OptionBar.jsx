import React from "react";

// External

// Components

// Styles
import styles from "./OptionBar.module.scss";

function OptionBar({ series, onClose }) {
    return (
        <div className={styles.optionBar}>
            <div className={styles.container}>
                <div className={styles.checkbox}>
                    <input type="checkbox" />
                    <span className={styles.label}>{series.length} Séries sélectionnées</span>
                    <span className={styles.erase} onClick={() => onClose()}>Effacer</span>
                </div>
            </div>
        </div>
    );
}

export default OptionBar;