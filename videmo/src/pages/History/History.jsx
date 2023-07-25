import React, { useState, useEffect } from "react";

// External
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Components
import Header from "../../components/Header/Header";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import SerieDisplay from "../../components/SeriesDisplay/SeriesDisplay";

// Services
import HistoryApi from "../../services/api/track/HistoryApi";
import TrackApi from "../../services/api/track/TrackApi";
import FolderManager from "../../utilities/folderManager/FolderManager";

// Styles
import styles from "./History.module.scss";


function History() {
    // Services initialization
    const [historyApi] = useState(() => new HistoryApi());
    const [trackApi] = useState(() => new TrackApi());
    const [folderManager] = useState(() => new FolderManager());

    // State initialization
    const [history, setHistory] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedEntry, setelectedEntry] = useState(null); // To store the selected entry
    const [showSerieDisplay, setShowSerieDisplay] = useState(false); // To show the serie display
    const [showVideoPlayer, setShowVideoPlayer] = useState(false); // To show the video player
    const [episodes, setEpisodes] = useState([]); // To store the episodes of the selected serie


    useEffect(() => {
        // Fetch the history
        historyApi.retrieveAllEpisodeAndSerieHistory()
            .then((data) => setHistory(data))
            .catch((error) => console.log(error));
    }, [historyApi, showSerieDisplay]);


    // Handle click on serie name to show VideoPlayer
    const handleSerieNameClick = (serie) => {
        setelectedEntry(serie);
        setShowVideoPlayer(true);
    };

    // Handle click on serie image to show SerieDisplay
    const handleSerieImageClick = async (entry) => {
        try {
            const data = await folderManager.retrieveFilesInFolder(entry.serie.link);
            const retrievedEpisodes = await trackApi.readAllEpisodesBySerieLink(entry.serie.link);
            setEpisodes(trackApi.mapSerieEpisodeWithDatabaseEpisode(data, retrievedEpisodes));

            setelectedEntry(entry);
            setShowSerieDisplay(true);
        } catch (error) {
            console.log(error);
        }
    };

    // TODO : define as utils function
    const constructTitle = (serie) => (serie.basename !== serie.name) ? `${serie.basename} (${serie.name})` : serie.basename;

    const filterHistory = history.filter((entry) => {
        const serieName = constructTitle(entry.serie);
        return serieName.toLowerCase().includes(searchValue.toLowerCase());
    });

    const handleDeleteEpisodeHistory = (episode) => () => {
        historyApi.deleteEpisodeHistory(episode.id)
            .then(() => setHistory(history.filter((entry) => entry.episode.id !== episode.id)))
            .catch((error) => console.log(error));
    };

    const handleCloseVideoPlayer = (playedTime, episodeFinished) => {
        setelectedEntry(null);
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


    // TODO : move the helper function to process the date label inside a utils file
    const getDateLabel = (timestamp) => {
        const now = new Date();
        const entryDate = new Date(timestamp);

        if (
            entryDate.getDate() === now.getDate() &&
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
        ) {
            return 'Aujourd\'hui';
        } else if (
            entryDate.getDate() === now.getDate() - 1 &&
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
        ) {
            return 'Hier';
        } else {
            return entryDate.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    };

    const handleBackClick = () => {
        setShowSerieDisplay(false);
        setelectedEntry(null);
        setEpisodes([]);
    };

    return (
        <div className={styles.history}>
            <Header
                title="Historique"
                onBack={selectedEntry && showSerieDisplay ? handleBackClick : null}
                onSearch={setSearchValue}
            />

            {!showSerieDisplay ? (
                <>
                    <div className={styles.content}>
                        {filterHistory.map((entry, index) => {
                            const currentDateLabel = getDateLabel(entry.history.timestamp);
                            const prevEntry = index > 0 ? filterHistory[index - 1] : null;
                            const prevDateLabel = prevEntry ? getDateLabel(prevEntry.history.timestamp) : null;
                            const isNewDateLabel = currentDateLabel !== prevDateLabel;

                            return (
                                <>
                                    {isNewDateLabel && <p className={styles.dateLabel}>{currentDateLabel}</p>}
                                    <div className={styles.historyCard} key={entry.episode.id}>
                                        <img
                                            className={styles.cover}
                                            src={entry.serie.image}
                                            alt={entry.serie.name}
                                            onClick={() => handleSerieImageClick(entry)}
                                        />
                                        <div className={styles.info}>
                                            <h2 className={styles.title} onClick={() => handleSerieNameClick(entry)}>
                                                {constructTitle(entry.serie)}
                                            </h2>
                                            <p className={styles.episodeName}> {entry.episode.name} </p>
                                        </div>
                                        <DeleteOutlineIcon className={styles.deleteIcon} onClick={handleDeleteEpisodeHistory(entry.episode)} />
                                    </div>
                                </>
                            );
                        })}
                    </div>
                    {showVideoPlayer &&
                        <VideoPlayer link={selectedEntry.episode.link} startTime={selectedEntry.episode.played_time} onCloseVideoPlayer={handleCloseVideoPlayer} />
                    }
                </>
            ) : (
                <SerieDisplay
                    serie={selectedEntry.serie}
                    episodes={episodes}
                    calledFromExplore={true}
                    folderContents={[]}
                />
            )}
        </div>
    );
}

export default History;