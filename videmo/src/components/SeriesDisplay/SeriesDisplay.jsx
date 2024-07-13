import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";

// Constants
import { EXPLORE_STRING, LIBRARY_STRING, SOURCE_STRING } from "../../utilities/utils/Constants";

// External
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Components
import DetailsContainer from "../DetailsContainer/DetailsContainer";
import SerieCard from "../Card/SerieCard/SerieCard";
import EpisodeCard from "../Card/EpisodeCard/EpisodeCard";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import OptionBarSerie from "../OptionBar/OptionBarSerie/OptionBarSerie";
import OptionBarEpisode from "../OptionBar/OptionBarEpisode/OptionBarEpisode";

// Services
import TrackApi from "../../services/api/track/TrackApi";
import FolderManager from "../../utilities/folderManager/FolderManager";
import ExtensionApi from "../../services/api/extension/ExtensionApi";
import SourceManager from "../../services/api/sources/SourceManager";

// Styles
import styles from "./SeriesDisplay.module.scss";

// Context initialization

function SeriesDisplay({ serie, linkedSeries, onPlayClick, onRefresh, calledFrom, setEpisodes, episodes }) {
    // Services initialization
    const trackApi = useMemo(() => new TrackApi(), []);
    const folderManager = useMemo(() => new FolderManager(), []);
    const extensionApi = useMemo(() => new ExtensionApi(), []);
    const sourceManager = useMemo(() => new SourceManager(), []);

    // Refs initialization
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

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
        if (document.getElementById('categoryModal')) return;

        const container = containerRef.current;

        const handleMouseDown = (e) => {
            setIsDragging(true);
            setStartX(e.pageX - container.offsetLeft);
            setScrollLeft(container.scrollLeft);
        };

        const handleMouseLeave = () => setIsDragging(false);
        const handleMouseUp = () => setIsDragging(false);

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 3; // scroll-fast
            container.scrollLeft = scrollLeft - walk;
        };

        // Mouse events
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mousemove', handleMouseMove);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDragging, startX, scrollLeft]);

    useEffect(() => {
        setCheckedSeries(linkedSeries.map(() => false));
        setIsOptionBarActive(false);
    }, [linkedSeries, setCheckedSeries]);

    useEffect(() => {
        setCheckedEpisodes(episodes.map(() => false));
        setIsEpisodeOptionBarActive(false);
    }, [episodes, setCheckedEpisodes]);

    useEffect(() => {
        if ((!linkedSeries || linkedSeries.length === 0) && serie) {
            extensionApi.readExtensionById(serie.extension_id)
                .then((extension) => serie.extension = extension)
                .catch((error) => console.error(error));
        }
    }, [serie, linkedSeries, extensionApi]);

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
                if (!extension.local) {
                    try {
                        const stream = await sourceManager.extractEpisode(extension, resumeEpisode.link, resumeEpisode.serverName);
                        const updatedEpisode = { ...resumeEpisode, stream: stream };
                        setResumeEpisode(updatedEpisode);
                    } catch (error) {
                        console.error(error);
                    }

                    setOpenVideoPlayer(true);
                }
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
        const updatedEpisodes = checkedEpisodes.map((checked, i) => i >= index ? true : checked);
        if (updatedEpisodes.every(checked => checked === true)) setCheckAllEpisodes(true);
        setCheckedEpisodes(updatedEpisodes)
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
    const containerClassName = () => {
        let classname = styles.seriesContainer;
        if (calledFrom === SOURCE_STRING) classname += ` ${styles.source}`;
        if ((calledFrom === EXPLORE_STRING || calledFrom === LIBRARY_STRING) && (episodes.length > 0 || linkedSeries.length > 0)) classname += ` ${styles.explore}`;

        return classname;
    };
    return (
        <div className={styles.sourceContent}>
            {serie && (
                <DetailsContainer serie={serie} calledFrom={calledFrom} />
            )}

            <div ref={containerRef} className={containerClassName()}>
                {(linkedSeries.length > 0) && (linkedSeries.map((linkedSerie, index) => (
                    <SerieCard
                        key={linkedSerie.link + ' ' + index}
                        serie={linkedSerie}
                        onPlayClick={onPlayClick}
                        onRefresh={onRefresh}
                        isCalledFromExplore={calledFrom === EXPLORE_STRING}
                        isCalledFromLibrary={calledFrom === LIBRARY_STRING}
                        isCalledFromSource={calledFrom === SOURCE_STRING}
                        isOptionBarActive={isOptionBarActive}
                        checked={checkedSeries[index] || false}
                        setChecked={() => toggleCheckedSeries(index)}
                    />
                )))}

                {calledFrom === SOURCE_STRING && linkedSeries.length === 0 && !serie && (
                    <div className={styles.noSeries}>
                        <h1>Aucune série trouvée</h1>
                    </div>
                )}

                {serie && episodes.length === 0 && (
                    <div className={styles.noSeries}>
                        <h1>Aucun épisode trouvé</h1>
                    </div>
                )}

            </div>

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

            {
                isOptionBarActive && (
                    <OptionBarSerie
                        series={linkedSeries.filter((_, index) => checkedSeries[index])}
                        onClose={handleCloseOptionBar}
                        checked={checkAllSeries}
                        onCheck={handleCheckAllSeries}
                        onCategoryChange={onRefresh}
                        isCalledFromExplore={calledFrom === EXPLORE_STRING || calledFrom === SOURCE_STRING}
                    />
                )
            }

            {
                isEpisodeOptionBarActive && (
                    <OptionBarEpisode
                        serie={serie}
                        episodes={episodes.filter((_, index) => checkedEpisodes[index])}
                        onClose={handleCloseOptionBarEpisode}
                        checked={checkAllEpisodes}
                        onCheck={handleCheckAllEpisode}
                    />
                )
            }

            {
                openVideoPlayer && (
                    <VideoPlayer
                        episode={resumeEpisode}
                        startTime={!resumeEpisode.played_time ? 0 : resumeEpisode.played_time}
                        onCloseVideoPlayer={handleCloseVideoPlayer}
                    />
                )
            }
        </div >
    );
}

SeriesDisplay.propTypes = {
    serie: PropTypes.object,
    linkedSeries: PropTypes.array,
    episodes: PropTypes.array,
    onPlayClick: PropTypes.func,
    onRefresh: PropTypes.func,
    calledFrom: PropTypes.string,
    setEpisodes: PropTypes.func
};

export default SeriesDisplay;