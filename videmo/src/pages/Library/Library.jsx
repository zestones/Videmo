import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNotification } from "../../components/Notification/NotificationProvider";

// Constants
import { LIBRARY_STRING } from "../../utilities/utils/Constants";

// Api 
import SerieApi from "../../services/api/serie/SerieApi";
import TrackApi from "../../services/api/track/TrackApi";
import CategoryFilterApi from "../../services/api/category/CategoryFilterApi";

// Source
import SourceManager from "../../services/api/sources/SourceManager";

// Utilities
import SortManager from "../../utilities/sortManager/SortManager";
import FilterManager from "../../utilities/filterManager/FilterManager";

// Components
import SeriesDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import CategoryHeader from "../../components/CategoryHeader/CategoryHeader";
import Header from "../../components/Header/Header";

// Styles
import styles from "./Library.module.scss";

function Library() {
    // State initialization
    const [navigationHistory, setNavigationHistory] = useState([]);
    const [updateCategoryName, setUpdateCategoryName] = useState();
    const [currentCategory, setCurrentCategory] = useState();
    const [updateProgress, setUpdateProgress] = useState(0);
    const [filteredSeries, setFilteredSeries] = useState(); // Filtered array of series (used to display)
    const [searchValue, setSearchValue] = useState("");
    const [subSeries, setSubSeries] = useState([]); // Original array of series (not filtered)
    const [episodes, setEpisodes] = useState([]);
    const [serie, setSerie] = useState(null);


    // API initialization
    const serieApi = useMemo(() => new SerieApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const sortManager = useMemo(() => new SortManager(), []);
    const filterManager = useMemo(() => new FilterManager(), []);
    const sourceManager = useMemo(() => new SourceManager(), []);
    const categoryFilterApi = useMemo(() => new CategoryFilterApi(), []);


    // Initialization of the notification hook
    const { showNotification } = useNotification();

    const retrieveAllSeries = useCallback(async () => {
        try {
            const seriesInLibrary = await serieApi.readAllSeriesByCategory(currentCategory?.id);
            const filters = await categoryFilterApi.getFiltersByCategoryId(currentCategory?.id);

            const sortedSeries = [...sortManager.sortSeriesByField(seriesInLibrary, filters.sort.name, filters.sort.flag)];
            const filteredSeries = [...filterManager.filterSeriesByFilters(sortedSeries, filters.filter)];

            setSubSeries(sortedSeries);
            setFilteredSeries(filteredSeries);
        } catch (error) {
            showNotification("error", `Error retrieving series: ${error.message}`);
            console.error(error);
        }
    }, [serieApi, currentCategory, sortManager, filterManager, categoryFilterApi, showNotification]);

    // Used to update the series when the number of episodes change
    const retrieveAllSeriesByLinks = async (links) => {
        if (!links) return;

        try {
            const series = await serieApi.readAllSeriesByLinks(links);
            const map = subSeries.map((serie) => series.find((s) => s.link === serie.link) || serie);
            setSubSeries(map);
            setFilteredSeries(map);
        } catch (error) {
            showNotification("error", `Error retrieving series: ${error.message}`);
            console.error(error);
        }
    }

    // Used to update the series when the update triggered
    useEffect(() => {
        if (updateProgress === 100) {
            if (currentCategory?.name === updateCategoryName && !serie) retrieveAllSeries();
            setUpdateProgress(0);
            showNotification("success", "Update completed");
        }
    }, [updateProgress, showNotification, currentCategory, updateCategoryName, serie, retrieveAllSeries]);

    // Used to update the series when the category change
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
                setFilteredSeries(childSeries);
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
            setFilteredSeries(subSeries);

            setEpisodes(episodes);
            setNavigationHistory(newHistory);
            setSearchValue("");
        } catch (error) {
            showNotification("error", `Error handling serie selection: ${error.message}`);
            console.error(error);
        }
    }

    const handleUpdateSeries = async () => {
        try {
            setUpdateCategoryName(currentCategory?.name);
            const totalSeries = serie ? [serie] : subSeries;
            let completedSeries = 0;

            for (const series of totalSeries) {
                await sourceManager.updateSeries([series]);
                completedSeries++;
                const progressPercentage = Math.floor((completedSeries / totalSeries.length) * 100);
                setUpdateProgress(progressPercentage);
            }

            setUpdateProgress(100);
        } catch (error) {
            showNotification("error", `Error updating series: ${error.message}`);
            console.error(error);
        }
    }

    const filterFolders = sortManager.filterByKeyword(searchValue, filteredSeries || subSeries, 'basename', 'name');

    const handleSearch = (value) => {
        setSearchValue(value);

        if (value === "") {
            setFilteredSeries(subSeries);
        } else {
            const filtered = sortManager.filterByKeyword(value, subSeries, 'basename', 'name');
            sortManager.sortByName(filtered);
            setFilteredSeries(filtered);
        }
    }

    return (
        <div className={styles.library}>
            <div className={styles.libraryContainer}>
                <Header
                    title="Bilbliothèque"
                    onDynamiqueSearch={handleSearch}
                    onBack={serie ? onBackClick : null}
                    onRandom={() => (filteredSeries && filteredSeries.length > 0) && handleSerieSelection(filteredSeries[Math.floor(Math.random() * filteredSeries.length)])}
                    onFilter={setFilteredSeries}
                    onUpdate={handleUpdateSeries}
                    progress={updateProgress}
                    series={subSeries}
                    currentCategory={currentCategory}
                />

                <CategoryHeader selectedCategory={currentCategory} onSelectCategory={setCurrentCategory} setNavigationHistory={setNavigationHistory} />

                <SeriesDisplay
                    linkedSeries={filterFolders}
                    episodes={episodes}
                    serie={serie}
                    onPlayClick={handleSerieSelection}
                    onRefresh={!serie ? retrieveAllSeries : retrieveAllSeriesByLinks}
                    calledFrom={LIBRARY_STRING}
                    setEpisodes={setEpisodes}
                />
            </div>
        </div>
    );
}

export default Library;