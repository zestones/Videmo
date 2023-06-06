import React, { useState } from "react";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faCheck, faPlay, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Components
import VideoPlayer from "../VideoPlayer/VideoPlayer";

// Styles
import styles from "./EpisodeCard.module.scss";


function EpisodeCard({ title, link, modifiedTime }) {
    const [folderManager] = useState(() => new FolderManager());
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);


    const handleOpenEpisodeWith = () => {
        folderManager.openFileInLocalVideoPlayer(link);
    };

    const handleOpenEpisode = () => {
        setShowVideoPlayer(true);
    };

    return (
        <li
            key={link}
            className={styles.card}
        >
            <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{title}</p>
                    <p className={styles.cardModifiedTime}>{modifiedTime}</p>
                </div>
                <div className={styles.cardButtonsContainer}>
                    <FontAwesomeIcon icon={faPlay} className={styles.cardButton} onClick={handleOpenEpisode} />
                    <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.cardButton} onClick={handleOpenEpisodeWith} />
                    <FontAwesomeIcon icon={faBookmark} className={styles.cardButton} />
                    <FontAwesomeIcon icon={faCheck} className={styles.cardButton} />
                </div>
            </div>
            {showVideoPlayer && (
                <VideoPlayer videoUrl={link} onShowVideoChange={setShowVideoPlayer} />
            )}
        </li>
    );
}

export default EpisodeCard;