import React from "react";

// External

// Components

// Styles
import styles from "./OptionBar.module.scss";

function OptionBar({ series, onClose, checked, onCheck }) {
    return (
        <div className={styles.optionBar}>
            <div className={styles.container}>
                <div className={styles.checkbox}>
                    <input type="checkbox" checked={checked} onChange={() => onCheck()} />
                    <span
                        className={styles.label}
                        onClick={() => onCheck()}
                    >
                        {series.length} Séries sélectionnées
                    </span>
                    <span className={styles.erase} onClick={() => onClose()}>Effacer</span>
                </div>
                <div className={styles.optionContainer}>
        
                </div>
            </div>
        </div>
    );
}

export default OptionBar;