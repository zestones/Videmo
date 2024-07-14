import React from "react";
import PropTypes from 'prop-types';

// Styles
import styles from "./SourceCard.module.scss";

// External
import FolderIcon from '@mui/icons-material/Folder';


function UpdateCard({ extension, status, callback }) {

    return (
        <button
            type="button"
            key={extension.id}
            className={styles.extension}
            onClick={() => callback(extension)}
        >
            <div className={styles.extensionIcon}>
                <FolderIcon className={status === "local" ? styles.localSource : styles.remoteSource} />
            </div>
            <p className={styles.extensionName}> {extension.name} </p>
        </button>
    )
}

UpdateCard.propTypes = {
    extension: PropTypes.object.isRequired,
    status: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired
}

export default UpdateCard;
