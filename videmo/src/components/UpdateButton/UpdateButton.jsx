import React from "react";
import PropTypes from "prop-types";

// External
import SyncIcon from '@mui/icons-material/Sync';

// Styles
import styles from "./UpdateButton.module.scss";

function UpdateButton({ onClick, progress }) {
    return (
        <>
            {progress === 0 ? (
                <div role="button" className={styles.updateButton} onClick={onClick}>
                    <SyncIcon className={styles.updateButtonIcon} />
                </div>
            ) : (
                <div className={styles.updateButtonSpinner}>
                    <span>{progress}</span>
                </div>
            )}
        </>
    );
};

UpdateButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    progress: PropTypes.number.isRequired,
};

export default UpdateButton;