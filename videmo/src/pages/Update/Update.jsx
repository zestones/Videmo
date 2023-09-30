import React, { useEffect, useMemo, useState } from "react";

// Components
import Header from "../../components/Header/Header";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";

// Api
import SerieUpdateApi from "../../services/api/serie/SerieUpdateApi";
import TrackApi from "../../services/api/track/TrackApi";
import Utils from "../../utilities/utils/Utils";

// Styles
import styles from "./Update.module.scss";


function Update() {
    // Api initialization
    const serieUpdateApi = useMemo(() => new SerieUpdateApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const utils = useMemo(() => new Utils(), []);

    // States initialization
    const [entries, setEntries] = useState([]);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

    useEffect(() => {
        serieUpdateApi.readAllUpdateEntries()
            .then((entries) => setEntries(entries))
            .catch((error) => console.log(error));
    }, [serieUpdateApi]);


    // Handle click on serie name to show VideoPlayer
    const handleSerieNameClick = (serie) => {
        setSelectedEntry(serie);
        setShowVideoPlayer(true);
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

        console.log("entries", entries);
        setEntries(entries.map((entry) => {
            if (entry.serie.id === selectedEntry.serie.id && entry.episode.id === selectedEntry.episode.id) {
                return { ...entry, episode: updatedEpisode };
            }

            return entry;
        }));
    }

    return (
        <div className={styles.update}>
            <Header title="Nouveautés" />

            <div className={styles.entriesContainer}>
                {entries.map((entry, index) => {
                    const currentDateLabel = utils.getDateFromTimestamp(entry.date);
                    const prevEntry = index > 0 ? entries[index - 1] : null;
                    const prevDateLabel = prevEntry ? utils.getDateFromTimestamp(prevEntry.date) : null;
                    const isNewDateLabel = currentDateLabel !== prevDateLabel;

                    return (
                        <>
                            {isNewDateLabel && <p className={styles.dateLabel}>{currentDateLabel}</p>}
                            <div
                                className={`${styles.entry}
                                ${entry.episode.viewed ? styles.viewed : ''}
                                ${entry.episode.bookmarked ? styles.bookmarked : ''}`}
                                key={index}>
                                <div className={styles.serieInfo}>
                                    <img src={entry.serie.image} alt={entry.serie.name} className={styles.serieImage} />
                                </div>
                                <div className={styles.episodeInfos}>
                                    <div className={styles.serieName}>{entry.serie.name}</div>
                                    <div className={styles.episodeName} onClick={() => handleSerieNameClick(entry)}>
                                        {entry.episode.name}
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                })}
            </div>

            {showVideoPlayer && (
                <VideoPlayer
                    episode={selectedEntry.episode}
                    serie={selectedEntry.serie}
                    onCloseVideoPlayer={handleCloseVideoPlayer}
                />
            )}
        </div>
    );
}

export default Update;
