import React, { useState } from "react";

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Styles
import styles from "./EpisodeCard.module.scss";


function EpisodeCard({ title, link, modifiedTime }) {
    const [folderManager] = useState(() => new FolderManager());

    const handleOpenEpisode = () => {
        folderManager.openFileInLocalVideoPlayer(link);
    };

    return (
        <li
            key={link}
            className={styles.card}
            onClick={handleOpenEpisode}
        >
            <p className={styles.cardTitle}>{title}</p>
            <p className={styles.cardModifiedTime}>{modifiedTime}</p>
        </li>
    );
}

export default EpisodeCard;