import React from "react";

// Styles
import styles from "./RandButton.module.scss";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom } from "@fortawesome/free-solid-svg-icons";


function RandButton({ onClick }) {

    return (
        <button className={styles.randButton} onClick={onClick}>
            <FontAwesomeIcon icon={faRandom} />
        </button>
    );
}

export default RandButton;