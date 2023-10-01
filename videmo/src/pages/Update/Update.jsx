import React, { useEffect, useMemo, useState } from "react";

// Constants
import { UPDATE_STRING } from "../../utilities/utils/Constants";

// Components
import SeriesDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import Header from "../../components/Header/Header";

// Api
import SerieUpdateApi from "../../services/api/serie/SerieUpdateApi";
import TrackApi from "../../services/api/track/TrackApi";
import Utils from "../../utilities/utils/Utils";

// Styles
import styles from "./Update.module.scss";
import UpdateCard from "../../components/Card/UpdateCard/UpdateCard";


function Update() {
    // Api initialization
    const serieUpdateApi = useMemo(() => new SerieUpdateApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const utils = useMemo(() => new Utils(), []);

    // States initialization
    const [entries, setEntries] = useState([]);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showSerieDisplay, setShowSerieDisplay] = useState(false);
    const [episodes, setEpisodes] = useState([]);


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

    // Handle click on serie image to show SerieDisplay
    const handleSerieImageClick = (entry) => {
        trackApi.readAllEpisodesBySerieLink(entry.serie.link)
            .then((data) => setEpisodes(data))
            .catch((error) => console.error(error));

        setSelectedEntry(entry);
        setShowSerieDisplay(true);
    };

    // Handle click on back button
    const handleBackClick = () => {
        setShowSerieDisplay(false);
        setSelectedEntry(null);
        setEpisodes([]);
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

        setEntries(entries.map((entry) => {
            if (entry.serie.id === selectedEntry.serie.id && entry.episode.id === selectedEntry.episode.id) {
                return { ...entry, episode: updatedEpisode };
            }

            return entry;
        }));
    }

    return (
        <div className={styles.update}>
            <Header
                title="Nouveautés"
                onBack={selectedEntry && showSerieDisplay ? handleBackClick : null}
            />

            {!showSerieDisplay ? (
                <>
                    <div className={styles.entriesContainer}>
                        {entries.map((entry, index) => {
                            const currentDateLabel = utils.getDateFromTimestamp(entry.date);
                            const prevEntry = index > 0 ? entries[index - 1] : null;
                            const prevDateLabel = prevEntry ? utils.getDateFromTimestamp(prevEntry.date) : null;
                            const isNewDateLabel = currentDateLabel !== prevDateLabel;

                            return (
                                <UpdateCard
                                    isNewDateLabel={isNewDateLabel}
                                    currentDateLabel={currentDateLabel}
                                    entry={entry}
                                    handleSerieImageClick={handleSerieImageClick}
                                    handleSerieNameClick={handleSerieNameClick}
                                    key={entry.episode.link}
                                />
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
                </>
            ) : (
                <SeriesDisplay
                    serie={selectedEntry.serie}
                    linkedSeries={[]}
                    calledFrom={UPDATE_STRING}
                    setEpisodes={setEpisodes}
                    episodes={episodes}
                />
            )}
        </div>
    );
}

export default Update;
