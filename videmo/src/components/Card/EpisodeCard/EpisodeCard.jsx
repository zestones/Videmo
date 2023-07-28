import React, { useState } from "react";

// External
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Utilities
import FolderManager from "../../../utilities/folderManager/FolderManager";

// Services
import TrackApi from "../../../services/api/track/TrackApi";

// Components
import VideoPlayer from "../../VideoPlayer/VideoPlayer";

// Styles
import styles from "./EpisodeCard.module.scss";


function EpisodeCard({ serie, episode }) {
    // Services initialization
    const [folderManager] = useState(() => new FolderManager());
    const [trackApi] = useState(() => new TrackApi());

    // State initialization
    const [openVideoPlayer, setOpenVideoPlayer] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(episode);

    const handleBookmarkClick = () => {
        const updatedEpisode = { ...currentEpisode, bookmarked: !currentEpisode.bookmarked };
        setCurrentEpisode(updatedEpisode);
        trackApi.addEpisodeToBookmarks(serie, updatedEpisode);
    };

    const handleViewedClick = () => {
        const updatedEpisode = { ...currentEpisode, viewed: !currentEpisode.viewed, played_time: 0 };
        setCurrentEpisode(updatedEpisode);
        trackApi.addEpisodeToViewed(serie, updatedEpisode);
    };

    const handleCloseVideoPlayer = (playedTime, finished) => {
        setOpenVideoPlayer(false);
        if (finished) return handleViewedClick();

        const updatedEpisode = { ...currentEpisode, played_time: playedTime };
        trackApi.updatePlayedTime(serie, updatedEpisode, new Date().getTime());
        setCurrentEpisode(updatedEpisode);
    };

    // TODO : move this to utilities class
    const convertPlayedTime = () => {
        const hours = Math.floor(currentEpisode.played_time / 3600);
        const minutes = Math.floor((currentEpisode.played_time - (hours * 3600)) / 60);
        const seconds = Math.floor(currentEpisode.played_time - (hours * 3600) - (minutes * 60));

        const displayTime = `${hours ? hours + "h" : ""} ${minutes ? minutes + "m" : ""} ${seconds ? seconds + "s" : ""}`;
        if (displayTime.trim(' ') === "") return "";
        return `• ${displayTime}`;
    };

    return (
        <li className={`${styles.card} ${currentEpisode.viewed ? styles.viewed : ""} ${currentEpisode.bookmarked ? styles.bookmarked : ""}`}>
            <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{currentEpisode.name}</p>
                    <div className={styles.cardDescriptionContainer}>
                        <p className={styles.cardModifiedTime}>{currentEpisode.modifiedTime}</p>
                        <p className={styles.cardPlayedTime}>{convertPlayedTime()}</p>
                    </div>
                </div>
                <div className={styles.cardButtonsContainer}>
                    <PlayArrowIcon className={styles.cardButton} onClick={() => setOpenVideoPlayer(true)} />
                    <OpenInNewIcon className={styles.cardButton} onClick={() => folderManager.openFileInLocalVideoPlayer(currentEpisode.link)} />
                    <BookmarkIcon className={`${styles.cardButton} ${currentEpisode.bookmarked ? styles.bookmarked : ""}`} onClick={handleBookmarkClick} />
                    {!currentEpisode.viewed ? (
                        <DoneAllIcon className={styles.cardButton} onClick={handleViewedClick} />
                    ) : (
                        <RemoveDoneIcon className={styles.cardButton} onClick={handleViewedClick} />
                    )}
                </div>
            </div>
            {openVideoPlayer && (
                <VideoPlayer link={currentEpisode.link} startTime={!currentEpisode.played_time ? 0 : currentEpisode.played_time}
                    onCloseVideoPlayer={handleCloseVideoPlayer} />
            )}
        </li>
    );
}

export default EpisodeCard;