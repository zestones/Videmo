import React from "react";

// External
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import BookmarkIcon from '@mui/icons-material/Bookmark';

// Styles
import styles from "./OptionBarEpisode.module.scss";
import Tooltip from "../../Tooltip/Tooltip";

function OptionBarEpisode({ episodes, onClose, checked, onCheck }) {

    // TODO : save the changes in the database
    const handleMarkAsViewed = () => {
        onClose();
        episodes.forEach((episode) => episode.viewed = true);
    }

    const handleMarkAsNotViewed = () => {
        onClose();
        episodes.forEach((episode) => episode.viewed = false);
    }

    const handleMarkAsBookmarked = () => {
        onClose();
        episodes.forEach((episode) => episode.bookmarked = true);
    }

    return (
        <div className={styles.episodeOptionBar}>
            <div className={styles.episodeOptionBarCheckboxContainer}>
                <input
                    type="checkbox"
                    className={styles.episodeOptionBarCheckbox}
                    checked={checked}
                    onChange={() => onCheck()}
                />
            </div>
            <div className={styles.episodeOptionBarButtonsContainer}>
                <Tooltip title="Marquer comme vu" placement="right">
                    <div className={styles.episodeOptionBarButton} onClick={handleMarkAsViewed}>
                        <DoneAllIcon />
                    </div>
                </Tooltip>
                <Tooltip title="Marquer comme non vu" placement="right">
                    <div className={styles.episodeOptionBarButton} onClick={handleMarkAsNotViewed}>
                        <RemoveDoneIcon />
                    </div>
                </Tooltip>
                <Tooltip title="Marquer comme favori" placement="right">
                    <div className={styles.episodeOptionBarButton} onClick={handleMarkAsBookmarked}>
                        <BookmarkIcon />
                    </div>
                </Tooltip>
            </div>
        </div>
    )
}

export default OptionBarEpisode;