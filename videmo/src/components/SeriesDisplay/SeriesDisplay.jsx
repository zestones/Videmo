import React, { useState } from "react";

// External
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Components
import DetailsContainer from "../DetailsContainer/DetailsContainer";
import SerieCard from "../Card/SerieCard/SerieCard";
import EpisodeCard from "../Card/EpisodeCard/EpisodeCard";
import VideoPlayer from "../VideoPlayer/VideoPlayer";

// Services
import TrackApi from "../../services/api/track/TrackApi";
// import FolderManager from "../../utilities/folderManager/FolderManager";

// Styles
import styles from "./SeriesDisplay.module.scss";

function SeriesDisplay({ serie, folderContents, episodes, onPlayClick, onRefresh, calledFromExplore, setEpisodes }) {
    // Services initialization
    const [trackApi] = useState(() => new TrackApi());
    // const [folderManager] = useState(() => new FolderManager());

    // State initialization
    const [openVideoPlayer, setOpenVideoPlayer] = useState(false);
    const [resumeEpisode, setResumeEpisode] = useState(null);

    const handleResumeEpisode = () => {
        const resumeEpisode = episodes.slice().reverse().find(episode => episode.played_time && episode.played_time !== 0) ||
            episodes.slice().reverse().find(episode => !episode.viewed);

        if (resumeEpisode) {
            // TODO - Retrieve extension
            // TODO - if Extension is local open in local video player else open in video player
            setResumeEpisode(resumeEpisode);
            setOpenVideoPlayer(true);
        }
    };

    // TODO - Uncomment when #15 is done
    // const handleOpenLocalVideoPlayer = () => {
    //     folderManager.openFileInLocalVideoPlayer(resumeEpisode.link);
    //     updateCurrentEpisode(resumeEpisode.played_time, false);
    // };

    const setEpisodesAsViewed = () => {
        const updatedEpisode = { ...resumeEpisode, viewed: !resumeEpisode.viewed, played_time: 0 };
        setEpisodes((episodes) => episodes.map((episode) => episode.link === updatedEpisode.link ? updatedEpisode : episode));
        trackApi.addEpisodeToViewed(serie, updatedEpisode);
    };

    const updateCurrentEpisode = (playedTime = 0, viewed = false) => {
        const updatedEpisode = { ...resumeEpisode, played_time: playedTime, viewed: viewed };
        trackApi.updatePlayedTime(serie, updatedEpisode, new Date().getTime());
        setEpisodes((episodes) => episodes.map((episode) => episode.link === updatedEpisode.link ? updatedEpisode : episode));
    };

    const handleCloseVideoPlayer = (playedTime, finished) => {
        setOpenVideoPlayer(false);
        setResumeEpisode(null);

        if (finished) return setEpisodesAsViewed();
        updateCurrentEpisode(playedTime);
    };

    return (
        <div className={styles.sourceContent}>
            {serie && (
                <DetailsContainer serie={serie} />
            )}

            <div className={styles.seriesContainer}>
                {folderContents.map((folderContent) => (
                    <SerieCard
                        key={folderContent.link}
                        details={folderContent}
                        onPlayClick={onPlayClick}
                        onMoreClick={onRefresh}
                        displayLabel={calledFromExplore}
                    />
                ))}
            </div>

            <div className={styles.episodesContainer}>
                {episodes.map((episode) => (
                    <EpisodeCard key={episode.link} serie={serie} episode={episode} setEpisodes={setEpisodes} />
                ))}

                {(episodes.length !== 0 && episodes.find((episode) => episodes.viewed || episode.viewed === false)) && (
                    <button className={styles.resumeButton} onClick={handleResumeEpisode}>
                        <PlayArrowIcon />
                        <span>{episodes.find((episode) => (episode.viewed || episode.played_time)) ? "Resume" : "Play"}</span>
                    </button>
                )}
            </div>

            {openVideoPlayer && (
                <VideoPlayer link={resumeEpisode.link} startTime={!resumeEpisode.played_time ? 0 : resumeEpisode.played_time} onCloseVideoPlayer={handleCloseVideoPlayer} />
            )}
        </div>
    );
}


export default SeriesDisplay;