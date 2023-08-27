import React, { useState, useEffect } from "react";

// Components
import Header from "../../components/Header/Header";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import SerieDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import HistoryCard from "../../components/Card/HistoryCard/HistoryCard";

// Services
import HistoryApi from "../../services/api/track/HistoryApi";
import TrackApi from "../../services/api/track/TrackApi";
import FolderManager from "../../utilities/folderManager/FolderManager";
import Utils from "../../utilities/utils/Utils";

// Styles
import styles from "./History.module.scss";


function History() {
    // Services initialization
    const [historyApi] = useState(() => new HistoryApi());
    const [trackApi] = useState(() => new TrackApi());
    const [folderManager] = useState(() => new FolderManager());
    const [utils] = useState(() => new Utils());

    // State initialization
    const [history, setHistory] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedEntry, setSelectedEntry] = useState(null); // To store the selected entry
    const [showSerieDisplay, setShowSerieDisplay] = useState(false); // To show the serie display
    const [showVideoPlayer, setShowVideoPlayer] = useState(false); // To show the video player
    const [episodes, setEpisodes] = useState([]); // To store the episodes of the selected serie


    useEffect(() => {
        // Fetch the history
        historyApi.retrieveAllEpisodeAndSerieHistory()
            .then((data) => setHistory(data))
            .catch((error) => console.error(error));
    }, [historyApi, showSerieDisplay]);


    // Handle click on serie name to show VideoPlayer
    const handleSerieNameClick = (serie) => {
        setSelectedEntry(serie);
        setShowVideoPlayer(true);
    };

    // Handle click on serie image to show SerieDisplay
    const handleSerieImageClick = async (entry) => {
        try {
            const data = await folderManager.retrieveFilesInFolder(entry.serie.link);
            const retrievedEpisodes = await trackApi.readAllEpisodesBySerieLink(entry.serie.link);
            setEpisodes(trackApi.mapSerieEpisodeWithDatabaseEpisode(data, retrievedEpisodes));

            setSelectedEntry(entry);
            setShowSerieDisplay(true);
        } catch (error) {
            console.log(error);
        }
    };

    const filterHistory = history.filter((entry) => {
        const serieName = utils.constructTitle(entry.serie);
        return serieName.toLowerCase().includes(searchValue.toLowerCase());
    });

    const handleDeleteEpisodeHistory = (episode) => {
        historyApi.deleteEpisodeHistory(episode.id)
            .then(() => setHistory(history.filter((entry) => entry.episode.id !== episode.id)))
            .catch((error) => console.log(error));
    };

    const handleCloseVideoPlayer = (playedTime, episodeFinished) => {
        setSelectedEntry(null);
        setShowVideoPlayer(false);

        if (episodeFinished) {
            const updatedEpisode = { ...selectedEntry.episode, viewed: !selectedEntry.serie.currentEpisode.viewed, played_time: 0 };
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

    return (
        <div className={styles.history}>
            <Header
                title="Historique"
                onBack={selectedEntry && showSerieDisplay ? handleBackClick : null}
                onSearch={setSearchValue}
                onDelete={() => historyApi.deleteAllHistory().then(() => setHistory([]))}
            />

            {!showSerieDisplay ? (
                <>
                    <div className={styles.content}>
                        {filterHistory.map((entry, index) => {
                            const currentDateLabel = utils.getDateFromTimestamp(entry.history.timestamp);
                            const prevEntry = index > 0 ? filterHistory[index - 1] : null;
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
                        <VideoPlayer link={selectedEntry.episode.link} startTime={selectedEntry.episode.played_time} onCloseVideoPlayer={handleCloseVideoPlayer} />
                    }
                </>
            ) : (
                <SerieDisplay
                    serie={{ ...selectedEntry.serie, extension_id: selectedEntry.extension.id }}
                    episodes={episodes}
                    // TODO : check if selectedEntry.extension works
                    extension={selectedEntry.extension}
                    calledFromExplore={true}
                    linkedSeries={[]}
                    setEpisodes={setEpisodes}
                />
            )}
        </div>
    );
}

export default History;