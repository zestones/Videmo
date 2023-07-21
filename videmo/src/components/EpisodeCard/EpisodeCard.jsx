import React, { useState } from "react";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faCheck, faPlay, faExternalLinkAlt, faXmark } from '@fortawesome/free-solid-svg-icons';

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Services
import TrackApi from "../../services/api/track/TrackApi";

// Components
import VideoPlayer from "../VideoPlayer/VideoPlayer";

// Styles
import styles from "./EpisodeCard.module.scss";


function EpisodeCard({ serie, episode }) {
    // Services initialization
    const [folderManager] = useState(() => new FolderManager());
    const [trackApi] = useState(() => new TrackApi());

    // State initialization
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(episode);

    const handleBookmarkClick = () => {
        const updatedEpisode = { ...currentEpisode, bookmarked: !currentEpisode.bookmarked };
        setCurrentEpisode(updatedEpisode);
        trackApi.addEpisodeToBookmarks(serie, updatedEpisode);
    };

    const handleViewedClick = () => {
        const updatedEpisode = { ...currentEpisode, viewed: !currentEpisode.viewed };
        setCurrentEpisode(updatedEpisode);
        trackApi.addEpisodeToViewed(serie, updatedEpisode);
    };

    return (
        <li className={`${styles.card} ${currentEpisode.viewed ? styles.viewed : ""} ${currentEpisode.bookmarked ? styles.bookmarked : ""}`}>
            <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{currentEpisode.name}</p>
                    <p className={styles.cardModifiedTime}>{currentEpisode.modifiedTime}</p>
                </div>
                <div className={styles.cardButtonsContainer}>
                    <FontAwesomeIcon icon={faPlay} className={styles.cardButton} onClick={() => setShowVideoPlayer(true)} />
                    <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.cardButton} onClick={() => folderManager.openFileInLocalVideoPlayer(currentEpisode.link)} />
                    <FontAwesomeIcon icon={faBookmark} className={`${styles.cardButton} ${currentEpisode.bookmarked ? styles.bookmarked : ""}`} onClick={handleBookmarkClick} />
                    {!currentEpisode.viewed ? (
                        <FontAwesomeIcon icon={faCheck} className={styles.cardButton} onClick={handleViewedClick} />
                    ) : (
                        <FontAwesomeIcon icon={faXmark} className={styles.cardButton} onClick={handleViewedClick} />
                    )}
                </div>
            </div>
            {showVideoPlayer && (
                <VideoPlayer videoUrl={currentEpisode.link} onShowVideoChange={setShowVideoPlayer} />
            )}
        </li>
    );
}

export default EpisodeCard;