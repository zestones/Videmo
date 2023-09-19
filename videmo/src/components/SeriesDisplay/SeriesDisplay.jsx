import React, { useState, useEffect, useCallback, useMemo } from "react";

// Constants
import { EXPLORE_STRING, LIBRARY_STRING } from "../../utilities/utils/Constants";

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
import OptionBarEpisode from "../OptionBar/OptionBarEpisode/OptionBarEpisode";

// Context initialization

function SeriesDisplay({ serie, linkedSeries = [], episodes, onPlayClick, onRefresh, calledFrom, setEpisodes }) {
    // Services initialization
    const trackApi = useMemo(() => new TrackApi(), []);
    const folderManager = useMemo(() => new FolderManager(), []);
    const extensionApi = useMemo(() => new ExtensionApi(), []);

    // State initialization
    const [openVideoPlayer, setOpenVideoPlayer] = useState(false);
    const [resumeEpisode, setResumeEpisode] = useState(null);
    const [shouldPlayEpisode, setShouldPlayEpisode] = useState(false);
    
    const [isOptionBarActive, setIsOptionBarActive] = useState(false);
    const [isEpisodeOptionBarActive, setIsEpisodeOptionBarActive] = useState(false);
    const [checkAllEpisodes, setCheckAllEpisodes] = useState(false);

    const [checkedSeries, setCheckedSeries] = useState([]);
    const [checkAllSeries, setCheckAllSeries] = useState(false);

    // checked episodes initialization
    const [checkedEpisodes, setCheckedEpisodes] = useState([]);

    useEffect(() => {
        setCheckedSeries(linkedSeries.map(() => false));
        setIsOptionBarActive(false);
    }, [linkedSeries, setIsOptionBarActive, setCheckedSeries]);

    useEffect(() => {
        setCheckedEpisodes(episodes.map(() => false));
        setIsEpisodeOptionBarActive(false);
    }, [episodes, setCheckedEpisodes]);

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

    const toggleCheckedSeries = (index) => {
        const newCheckedSeries = [...checkedSeries];
        newCheckedSeries[index] = !newCheckedSeries[index];
        setCheckedSeries(newCheckedSeries);

        // activate the option bar when at least one serie is checked
        if (!isOptionBarActive && newCheckedSeries.some(checked => checked === true)) setIsOptionBarActive(true);
        else if (isOptionBarActive && !newCheckedSeries.some(checked => checked === true)) setIsOptionBarActive(false); // deactivate the option bar when no serie is checked

        setCheckAllSeries(newCheckedSeries.every(checked => checked === true)); // check the checkAllSeries checkbox if all series are checked
    };

    const toggleCheckedEpisode = (index) => {
        const newCheckedEpisodes = [...checkedEpisodes];
        newCheckedEpisodes[index] = !newCheckedEpisodes[index];
        setCheckedEpisodes(newCheckedEpisodes);

        // activate the option bar when at least one serie is checked
        if (!isEpisodeOptionBarActive && newCheckedEpisodes.some(checked => checked === true)) setIsEpisodeOptionBarActive(true);
        else if (isEpisodeOptionBarActive && !newCheckedEpisodes.some(checked => checked === true)) setIsEpisodeOptionBarActive(false); // deactivate the option bar when no serie is checked

        setCheckAllEpisodes(newCheckedEpisodes.every(checked => checked === true)); // check the checkAllSeries checkbox if all series are checked
    };

    const handleCloseOptionBar = () => {
        setCheckedSeries(linkedSeries.map(() => false));
        setIsOptionBarActive(false);
        setCheckAllSeries(false);
    };

    const handleCheckAllSeries = () => {
        setCheckAllSeries(!checkAllSeries);
        setCheckedSeries(linkedSeries.map(() => !checkAllSeries));
        setIsOptionBarActive(!checkAllSeries);
    };

    const handleCheckAllEpisodeUnderIndex = (index) => {
        const test = checkedEpisodes.map((checked, i) => i >= index ? true : checked);
        console.log("test", test);

        setCheckedEpisodes(test)
    };

    const handleCheckAllEpisode = () => {
        setCheckAllEpisodes(!checkAllEpisodes);
        setCheckedEpisodes(episodes.map(() => !checkAllEpisodes));
        setIsEpisodeOptionBarActive(!checkAllEpisodes);
    };

    const handleCloseOptionBarEpisode = () => {
        setCheckedEpisodes(episodes.map(() => false));
        setIsEpisodeOptionBarActive(false);
        setCheckAllEpisodes(false);
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
                        isCalledFromLibrary={calledFrom === LIBRARY_STRING}
                        isOptionBarActive={isOptionBarActive}
                        checked={checkedSeries[index] || false}
                        setChecked={() => toggleCheckedSeries(index)}
                    />
                ))}
            </div>

            {isOptionBarActive && (
                // TODO rename component to OptionBarSeries
                <OptionBar
                    series={linkedSeries.filter((_, index) => checkedSeries[index])}
                    onClose={handleCloseOptionBar}
                    checked={checkAllSeries}
                    onCheck={handleCheckAllSeries}
                    onCategoryChange={onRefresh}
                    isCalledFromExplore={calledFrom === EXPLORE_STRING}
                />
            )}

            {isEpisodeOptionBarActive && (
                <OptionBarEpisode
                    episodes={episodes.filter((_, index) => checkedEpisodes[index])}
                    onClose={handleCloseOptionBarEpisode}
                    checked={checkAllEpisodes}
                    onCheck={handleCheckAllEpisode}
                />
            )}

            <div className={styles.episodesContainer}>
                {episodes.map((episode, index) => (
                    <EpisodeCard
                        key={episode.link}
                        serie={serie}
                        episode={episode}
                        setEpisodes={setEpisodes}
                        setChecked={() => toggleCheckedEpisode(index)}
                        checked={checkedEpisodes[index] || false}
                        exactlyOneChecked={checkedEpisodes.filter(checked => checked === true).length === 1}
                        setAllCheckedUnderIndex={() => handleCheckAllEpisodeUnderIndex(index)}
                    />
                ))}

                {shouldShowResumeButton && (
                    <button className={styles.resumeButton} onClick={handleResumeEpisode}>
                        <PlayArrowIcon />
                        <span>{episodes.find((episode) => (episode.viewed || episode.played_time)) ? "Reprendre" : "Commencer"}</span>
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