import React, { useState, useEffect, useCallback } from "react";

// Constants
import { EXPLORE_STRING } from "../../utilities/utils/Constants";

// External
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Components
import DetailsContainer from "../DetailsContainer/DetailsContainer";
import SerieCard from "../Card/SerieCard/SerieCard";
import EpisodeCard from "../Card/EpisodeCard/EpisodeCard";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import OptionBar from "../OptionBar/OptionBar";

// Services
import TrackApi from "../../services/api/track/TrackApi";
import FolderManager from "../../utilities/folderManager/FolderManager";
import ExtensionApi from "../../services/api/extension/ExtensionApi";

// Styles
import styles from "./SeriesDisplay.module.scss";

function SeriesDisplay({ serie, linkedSeries = [], episodes, onPlayClick, onRefresh, calledFrom, setEpisodes }) {
    // Services initialization
    const [trackApi] = useState(() => new TrackApi());
    const [folderManager] = useState(() => new FolderManager());
    const [extensionApi] = useState(() => new ExtensionApi());

    // State initialization
    const [openVideoPlayer, setOpenVideoPlayer] = useState(false);
    const [resumeEpisode, setResumeEpisode] = useState(null);
    const [shouldPlayEpisode, setShouldPlayEpisode] = useState(false);
    const [isOptionBarActive, setIsOptionBarActive] = useState(false);
    const [checkedSeries, setCheckedSeries] = useState([]);

    useEffect(() => {
        setCheckedSeries(linkedSeries.map(() => false));
    }, [linkedSeries]);


    const updateCurrentEpisode = useCallback((playedTime = 0, viewed = false) => {
        const updatedEpisode = { ...resumeEpisode, played_time: playedTime, viewed: viewed };
        trackApi.updatePlayedTime(serie, updatedEpisode, new Date().getTime());
        setEpisodes((episodes) => episodes.map((episode) => episode.link === updatedEpisode.link ? updatedEpisode : episode));
    }, [resumeEpisode, serie, setEpisodes, trackApi]);

    useEffect(() => {
        if (shouldPlayEpisode && resumeEpisode) {
            updateCurrentEpisode(resumeEpisode.played_time, false);
            setShouldPlayEpisode(false);
        }
    }, [shouldPlayEpisode, resumeEpisode, updateCurrentEpisode, setShouldPlayEpisode]);

    const handleResumeEpisode = async () => {
        const resumeEpisode = episodes.slice().reverse().find(episode => episode.played_time && episode.played_time !== 0) ||
            episodes.slice().reverse().find(episode => !episode.viewed);

        if (resumeEpisode) {
            setShouldPlayEpisode(true);
            setResumeEpisode(resumeEpisode);

            try {
                const extension = await extensionApi.readExtensionById(serie.extension_id);
                if (!extension.local) setOpenVideoPlayer(true);
                else handleOpenLocalVideoPlayer(resumeEpisode);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleOpenLocalVideoPlayer = (resumeEpisode) => {
        folderManager.openFileInLocalVideoPlayer(resumeEpisode.link);
        setShouldPlayEpisode(true);
    };

    const setEpisodesAsViewed = () => {
        const updatedEpisode = { ...resumeEpisode, viewed: !resumeEpisode.viewed, played_time: 0 };
        setEpisodes((episodes) => episodes.map((episode) => episode.link === updatedEpisode.link ? updatedEpisode : episode));
        trackApi.addEpisodeToViewed(serie, updatedEpisode);
    };

    const handleCloseVideoPlayer = (playedTime, finished) => {
        setOpenVideoPlayer(false);
        setResumeEpisode(null);

        if (finished) return setEpisodesAsViewed();
        updateCurrentEpisode(playedTime);
    };

    // Function to toggle the checked state for a specific serie
    const toggleChecked = (index) => {
        const newCheckedSeries = [...checkedSeries];
        newCheckedSeries[index] = !newCheckedSeries[index];
        setCheckedSeries(newCheckedSeries);

        // activate the option bar when at least one serie is checked
        if (!isOptionBarActive && newCheckedSeries.some(checked => checked === true)) setIsOptionBarActive(true);
        else if (isOptionBarActive && !newCheckedSeries.some(checked => checked === true)) setIsOptionBarActive(false);
    };

    const handleCloseOptionBar = () => {
        setCheckedSeries(linkedSeries.map(() => false));
        setIsOptionBarActive(false);
    };

    const shouldShowResumeButton = episodes.some(episode => !episode.viewed || episode.played_time);

    return (
        <div className={styles.sourceContent}>
            {serie && (
                <DetailsContainer serie={serie} calledFrom={calledFrom} />
            )}

            <div className={styles.seriesContainer}>
                {linkedSeries.map((linkedSerie, index) => (
                    <SerieCard
                        key={linkedSerie.link}
                        serie={linkedSerie}
                        onPlayClick={onPlayClick}
                        onMoreClick={onRefresh}
                        isCalledFromExplore={calledFrom === EXPLORE_STRING}
                        isOptionBarActive={isOptionBarActive}
                        checked={checkedSeries[index] || false}
                        setChecked={() => toggleChecked(index)}
                    />
                ))}
            </div>

            {isOptionBarActive && (
                <OptionBar
                    series={linkedSeries.filter((_, index) => checkedSeries[index])}
                    onClose={handleCloseOptionBar}
                />
            )}

            <div className={styles.episodesContainer}>
                {episodes.map((episode) => (
                    <EpisodeCard key={episode.link} serie={serie} episode={episode} setEpisodes={setEpisodes} />
                ))}

                {shouldShowResumeButton && (
                    <button className={styles.resumeButton} onClick={handleResumeEpisode}>
                        <PlayArrowIcon />
                        <span>{episodes.find((episode) => (episode.viewed || episode.played_time)) ? "Resume" : "Play"}</span>
                    </button>
                )}
            </div>

            {openVideoPlayer && (
                <VideoPlayer
                    link={resumeEpisode.link}
                    startTime={!resumeEpisode.played_time ? 0 : resumeEpisode.played_time}
                    onCloseVideoPlayer={handleCloseVideoPlayer}
                />
            )}
        </div>
    );
}


export default SeriesDisplay;