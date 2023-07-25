import React, { useState, useEffect } from "react";

// External
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Components
import Header from "../../components/Header/Header";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";

// Services
import HistoryApi from "../../services/api/track/HistoryApi";

// Styles
import styles from "./History.module.scss";


function History() {
    // Services initialization
    const [historyApi] = useState(() => new HistoryApi());

    // State initialization
    const [history, setHistory] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedSerie, setSelectedSerie] = useState(null); // To store the selected serie for display


    useEffect(() => {
        // Fetch the history
        historyApi.retrieveAllEpisodeAndSerieHistory()
            .then((data) => setHistory(data))
            .catch((error) => console.log(error));
    }, [historyApi]);

    // Handle click on serie name to show VideoPlayer
    const handleSerieNameClick = (serie) => {
        setSelectedSerie(serie);
    };

    // Handle click on serie image to show SerieDisplay
    const handleSerieImageClick = (serie) => {
        setSelectedSerie(serie);
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


    // TODO : define as utils function
    const constructTitle = (serie) => (serie.basename !== serie.name) ? `${serie.basename} (${serie.name})` : serie.basename;

    const filterHistory = history.filter((entry) => {
        const serieName = constructTitle(entry.serie);
        return serieName.toLowerCase().includes(searchValue.toLowerCase());
    });

    const handleDeleteEpisodeHistory = (episode) => () => {
        historyApi.deleteEpisodeHistory(episode.id)
            .then(() => {
                // Remove the episode from the history
                setHistory(history.filter((entry) => entry.episode.id !== episode.id));
            })
            .catch((error) => console.log(error));
    };


    return (
        <div className={styles.history}>
            <Header
                title="Historique"
                onSearch={setSearchValue}
            />

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
                                    onClick={() => handleSerieImageClick(entry.serie)}
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

            {selectedSerie && (
                <div>
                    {/* Render VideoPlayer or SerieDisplay based on the selectedSerie */}
                    {/* Pass the necessary props, e.g., link, startTime, onCloseVideoPlayer */}
                    {/* You can also add a close button or handle closing in a similar way */}
                    <VideoPlayer link={selectedSerie.episode.link} startTime={selectedSerie.episode.played_time} onCloseVideoPlayer={() => setSelectedSerie(null)} />
                    {/* <SerieDisplay serie={selectedSerie} onCloseSerieDisplay={() => setSelectedSerie(null)} /> */}
                </div>
            )}
        </div>
    );
}

export default History;