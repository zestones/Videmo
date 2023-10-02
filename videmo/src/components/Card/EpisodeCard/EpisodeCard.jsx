import React, { useEffect, useMemo, useState } from "react";

// External
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

// Utilities
import FolderManager from "../../../utilities/folderManager/FolderManager";
import { Utils } from "../../../utilities/utils/Utils";

// Services
import TrackApi from "../../../services/api/track/TrackApi";
import SourceManager from "../../../services/api/sources/SourceManager";

// Components
import VideoPlayer from "../../VideoPlayer/VideoPlayer";

// Styles
import styles from "./EpisodeCard.module.scss";


function EpisodeCard({ serie, episode, setEpisodes, checked, setChecked, exactlyOneChecked, setAllCheckedUnderIndex }) {
    // Services initialization
    const folderManager = useMemo(() => new FolderManager(), []);
    const sourceManager = useMemo(() => new SourceManager(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const utils = useMemo(() => new Utils(), []);

    // State initialization
    const [openVideoPlayer, setOpenVideoPlayer] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(episode);

    useEffect(() => {
        setCurrentEpisode(episode)
    }, [episode]);

    const handleBookmarkClick = () => {
        const updatedEpisode = { ...currentEpisode, bookmarked: !currentEpisode.bookmarked };
        setCurrentEpisode(updatedEpisode);
        setEpisodes((episodes) => episodes.map((episode) => episode.link === updatedEpisode.link ? updatedEpisode : episode));
        trackApi.addEpisodeToBookmarks(serie, updatedEpisode);
    };

    const handleViewedClick = (viewed) => {
        const updatedEpisode = { ...currentEpisode, viewed: typeof viewed === "boolean" ? viewed : !currentEpisode.viewed, played_time: 0 };
        setCurrentEpisode(updatedEpisode);
        setEpisodes((episodes) => episodes.map((episode) => episode.link === updatedEpisode.link ? updatedEpisode : episode));
        trackApi.addEpisodeToViewed(serie, updatedEpisode);
    };

    const handleCloseVideoPlayer = (playedTime, finished) => {
        setOpenVideoPlayer(false);
        if (finished) return handleViewedClick(true);
        updateCurrentEpisode(null, playedTime);
    };

    const updateCurrentEpisode = (viewed, playedTime = 0) => {
        const updatedEpisode = { ...currentEpisode, played_time: playedTime, viewed: viewed || currentEpisode.viewed };
        trackApi.updatePlayedTime(serie, updatedEpisode, new Date().getTime());
        setCurrentEpisode(updatedEpisode);
        setEpisodes((episodes) => episodes.map((episode) => episode.link === updatedEpisode.link ? updatedEpisode : episode));
    };

    const handleOpenLocalVideoPlayer = () => {
        folderManager.openFileInLocalVideoPlayer(currentEpisode.link);
        updateCurrentEpisode(false, currentEpisode.played_time);
    };

    const handleOnPlayClick = async () => {
        if (!serie.extension.local) {
            try {
                const stream = await sourceManager.extractEpisode(serie.extension, currentEpisode.link);
                const updatedEpisode = { ...currentEpisode, stream: stream };
                setCurrentEpisode(updatedEpisode);
            } catch (error) {
                console.error(error);
            }
        }

        setOpenVideoPlayer(true);
    };

    return (
        <li
            className={`${styles.card} 
                ${currentEpisode.viewed ? styles.viewed : ""} 
                ${currentEpisode.bookmarked ? styles.bookmarked : ""}
                ${checked && styles.checked}`}
        >
            <div className={styles.cardContent}>
                <div className={styles.cardCheckboxContainer}>
                    <input
                        type="checkbox"
                        className={styles.cardCheckbox}
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                    />
                </div>
                <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{currentEpisode.name}</p>
                    <div className={styles.cardDescriptionContainer}>
                        <p className={styles.cardModifiedTime}>{currentEpisode.modifiedTime}</p>
                        <p className={styles.cardPlayedTime}>{utils.convertPlayedTime(currentEpisode.played_time)}</p>
                    </div>
                </div>
                <div className={styles.cardButtonsContainer}>
                    {(!checked && !exactlyOneChecked) && (
                        <>
                            <PlayArrowIcon className={styles.cardButton} onClick={handleOnPlayClick} />
                            <OpenInNewIcon className={styles.cardButton} onClick={handleOpenLocalVideoPlayer} />
                            <BookmarkIcon className={`${styles.cardButton} ${currentEpisode.bookmarked ? styles.bookmarked : ""}`} onClick={handleBookmarkClick} />
                        </>
                    )}
                    {!currentEpisode.viewed ? (
                        <DoneAllIcon className={styles.cardButton} onClick={handleViewedClick} />
                    ) : (
                        <RemoveDoneIcon className={styles.cardButton} onClick={handleViewedClick} />
                    )}

                    {(checked && exactlyOneChecked) && <KeyboardDoubleArrowDownIcon className={styles.cardButton} onClick={setAllCheckedUnderIndex} />}
                </div>
            </div>

            {openVideoPlayer && (
                <VideoPlayer
                    episode={currentEpisode}
                    startTime={!currentEpisode.played_time ? 0 : currentEpisode.played_time}
                    onCloseVideoPlayer={handleCloseVideoPlayer}
                />
            )}
        </li>
    );
}

export default EpisodeCard;