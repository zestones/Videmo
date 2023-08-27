import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNotification } from "../../components/Notification/NotificationProvider";
// Api 
import SerieApi from "../../services/api/serie/SerieApi";
import TrackApi from "../../services/api/track/TrackApi";

// Utilities
import SortManager from "../../utilities/sortManager/SortManager";

// Components
import SeriesDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import CategoryHeader from "../../components/CategoryHeader/CategoryHeader";
import Header from "../../components/Header/Header";

// Styles
import styles from "./Library.module.scss";

function Library() {
    // State initialization
    const [navigationHistory, setNavigationHistory] = useState([]);
    const [currentCategory, setCurrentCategory] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [subSeries, setSubSeries] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [serie, setSerie] = useState(null);

    // API initialization
    const serieApi = useMemo(() => new SerieApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const sortManager = useMemo(() => new SortManager(), []);

    // Initialization of the notification hook
    const { showNotification } = useNotification();


    const retrieveAllSeries = useCallback(() => {
        serieApi.readAllSeriesByCategory(currentCategory?.id)
            .then((seriesInLibrary) => setSubSeries(seriesInLibrary))
            .catch((error) => showNotification("error", `Error retrieving series: ${error.message}`));
    }, [serieApi, currentCategory, showNotification]);

    useEffect(() => {
        if (!currentCategory) return;

        setSerie(null);
        setEpisodes([]);
        retrieveAllSeries();
    }, [serieApi, currentCategory, retrieveAllSeries]);


    const onBackClick = async () => {
        try {
            if (navigationHistory.length === 0) {
                // Going back from root level
                setSerie(null);
                retrieveAllSeries();
            } else {
                // Going back from a series level
                const parentSerie = navigationHistory.pop(); // Pop the last serie from history
                const childSeries = await serieApi.readAllSeriesByParentId(parentSerie.id);

                setSerie(parentSerie);
                setSubSeries(childSeries);
            }

            setEpisodes([]); // Clear episodes
        } catch (error) {
            showNotification("error", error.message);
        }
    };

    const getChildSeries = async (parentSerieId) => {
        const childSeries = await serieApi.readAllSeriesByParentId(parentSerieId);
        return childSeries.length === 0 ? [] : childSeries;
    };

    const handleSerieSelection = async (clickedSerie) => {
        try {
            let subSeries = [];
            let episodes = [];

            if (clickedSerie) {
                subSeries = await getChildSeries(clickedSerie.id);
                episodes = await trackApi.readAllEpisodesBySerieId(clickedSerie.id);
            }

            const newHistory = serie ? [...navigationHistory, serie] : navigationHistory;

            setSerie(clickedSerie);
            setSubSeries(subSeries);
            setEpisodes(episodes);
            setNavigationHistory(newHistory);
            setSearchValue("");
        } catch (error) {
            showNotification("error", `Error handling serie selection: ${error.message}`);
            console.error(error);
        }
    }

    const filterFolders = sortManager.filterByKeyword(searchValue, 'basename', subSeries);

    return (
        <div className={styles.library}>
            <div className={styles.libraryContainer}>
                <Header
                    title="Bilbliothèque"
                    onSearch={setSearchValue}
                    onBack={serie ? onBackClick : null}
                    onRandom={() => subSeries.length > 0 && handleSerieSelection(subSeries[Math.floor(Math.random() * subSeries.length)])}
                />

                <CategoryHeader selectedCategory={currentCategory} onSelectCategory={setCurrentCategory} />
                <SeriesDisplay
                    linkedSeries={filterFolders}
                    episodes={episodes}
                    serie={serie}
                    onPlayClick={handleSerieSelection}
                    onRefresh={!serie && retrieveAllSeries}
                    calledFromExplore={false}
                    setEpisodes={setEpisodes}
                />
            </div>
        </div>
    );
}

export default Library;