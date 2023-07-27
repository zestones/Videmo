import React from "react";

// External
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';


// Styles
import styles from "./DeleteButton.module.scss";


function DeleteButton({ onClick }) {
    return (
        <button className={styles.deleteButton} onClick={onClick}>
            <DeleteSweepIcon className={styles.deleteButtonIcon} />
        </button>
    );
}

export default DeleteButton;