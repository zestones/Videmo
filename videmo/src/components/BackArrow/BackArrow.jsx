import React from "react";
import PropTypes from "prop-types";

// External
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Styles
import styles from "./BackArrow.module.scss";

function BackArrow({ handleClick }) {

    return (
        <button className={styles.backArrow} onClick={handleClick}>
            <ArrowBackIcon className={styles.backArrowIcon} />
        </button>
    );
}

BackArrow.propTypes = {
    handleClick: PropTypes.func.isRequired
};

export default BackArrow;