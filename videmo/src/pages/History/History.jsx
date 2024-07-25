import React, { useState, useEffect, useMemo } from "react";

// Constants
import { HISTORY_STRING } from "../../utilities/utils/Constants";

// Components
import SeriesDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import HistoryCard from "../../components/Card/HistoryCard/HistoryCard";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import Header from "../../components/Header/Header";

// Services
import SortManager from "../../utilities/sortManager/SortManager";
import HistoryApi from "../../services/api/track/HistoryApi";
import TrackApi from "../../services/api/track/TrackApi";
import { Utils } from "../../utilities/utils/Utils";

// Styles
import styles from "./History.module.scss";


function History() {
    // Services initialization
    const sortManager = useMemo(() => new SortManager(), []);
    const historyApi = useMemo(() => new HistoryApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const utils = useMemo(() => new Utils(), []);

    // State initialization
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showSerieDisplay, setShowSerieDisplay] = useState(false);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [episodes, setEpisodes] = useState([]);


    // Fetch the history
    useEffect(() => {
        historyApi.retrieveAllEpisodeAndSerieHistory()
            .then((data) => {
                setHistory(data);
                setFilteredHistory(data);
            })
            .catch((error) => console.error(error));
    }, [historyApi]);


    // Handle click on serie name to show VideoPlayer
    const handleSerieNameClick = (serie) => {
        setSelectedEntry(serie);
        setShowVideoPlayer(true);
    };

    // Handle click on serie image to show SerieDisplay
    const handleSerieImageClick = (entry) => {
        trackApi.readAllEpisodesBySerieLink(entry.serie.link)
            .then((data) => setEpisodes(data))
            .catch((error) => console.error(error));

        setSelectedEntry(entry);
        setShowSerieDisplay(true);
    };

    const handleDeleteEpisodeHistory = (episode) => {
        historyApi.deleteEpisodeHistory(episode.id)
            .then(() => setHistory(history.filter((entry) => entry.episode.id !== episode.id)))
            .catch((error) => console.error(error));
    };

    const handleCloseVideoPlayer = (playedTime, episodeFinished) => {
        setSelectedEntry(null);
        setShowVideoPlayer(false);

        if (episodeFinished) {
            const updatedEpisode = { ...selectedEntry.episode, viewed: !selectedEntry.episode.viewed, played_time: 0 };
            trackApi.addEpisodeToViewed(updatedEpisode, updatedEpisode);
        }

        const updatedEpisode = { ...selectedEntry.episode, played_time: playedTime };
        trackApi.updatePlayedTime(selectedEntry.serie, updatedEpisode, new Date().getTime());

        // We create a new an updated history array, with the updated entry at the top of the array
        const updatedHistory = [
            { ...selectedEntry, episode: updatedEpisode, history: { ...selectedEntry.history, timestamp: new Date().getTime() } },
            ...history.filter((entry) => entry.episode.id !== updatedEpisode.id)
        ];

        setHistory(updatedHistory);
    };

    const handleBackClick = () => {
        setShowSerieDisplay(false);
        setSelectedEntry(null);
        setEpisodes([]);
    };

    const handleSearch = (value) => {
        if (value === "") setFilteredHistory(history);
        else setFilteredHistory(filterHistory(value));
    }

    const filterHistory = (value) => sortManager.filterByKeyword(value, history, 'serie.basename', 'serie.name', 'episode.name');

    return (
        <div className={styles.history}>
            <Header
                title="Historique"
                onBack={selectedEntry && showSerieDisplay ? handleBackClick : null}
                onDynamiqueSearch={handleSearch}
                onDelete={() => historyApi.deleteAllHistory().then(() => setHistory([]))}
            />

            {!showSerieDisplay ? (
                <>
                    <div className={styles.content}>
                        {filteredHistory.map((entry, index) => {
                            const currentDateLabel = utils.getDateFromTimestamp(entry.history.timestamp);
                            const prevEntry = index > 0 ? filteredHistory[index - 1] : null;
                            const prevDateLabel = prevEntry ? utils.getDateFromTimestamp(prevEntry.history.timestamp) : null;
                            const isNewDateLabel = currentDateLabel !== prevDateLabel;

                            return (
                                <HistoryCard
                                    key={entry.episode.id}
                                    entry={entry}
                                    isNewDateLabel={isNewDateLabel}
                                    currentDateLabel={currentDateLabel}
                                    handleSerieImageClick={handleSerieImageClick}
                                    handleSerieNameClick={handleSerieNameClick}
                                    handleDeleteEpisodeHistory={handleDeleteEpisodeHistory}
                                    serieTime={utils.getTimeFromTimestamp(entry.history.timestamp)}
                                />
                            );
                        })}
                    </div>
                    {showVideoPlayer &&
                        <VideoPlayer
                            episode={selectedEntry.episode}
                            startTime={selectedEntry.episode.played_time}
                            onCloseVideoPlayer={handleCloseVideoPlayer} />
                    }
                </>
            ) : (
                <SeriesDisplay
                    serie={selectedEntry.serie}
                    linkedSeries={[]}
                    calledFrom={HISTORY_STRING}
                    setEpisodes={setEpisodes}
                    episodes={episodes}
                />
            )}
        </div>
    );
}

export default History;