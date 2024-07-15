import React from "react";
import PropTypes from "prop-types";

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
};

RandButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default RandButton;