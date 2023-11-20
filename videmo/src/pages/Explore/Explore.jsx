import React, { useState, useEffect, useCallback, useMemo } from "react";

// Constants
import { EXPLORE_STRING, EXPLORE_MODES } from "../../utilities/utils/Constants";

// External
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import debounce from 'lodash.debounce';

// Services & Api
import FolderManager from "../../utilities/folderManager/FolderManager";
import SortManager from "../../utilities/sortManager/SortManager";
import CategoryApi from "../../services/api/category/CategoryApi";
import TrackApi from "../../services/api/track/TrackApi";

// Sources
import SourceManager from "../../services/api/sources/SourceManager";

// Pages
import Source from "./Source/Source";

// Components
import SeriesDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import Header from "../../components/Header/Header";
import Notification from "../../components/Notification/Notification";

// Styles
import styles from "./Explore.module.scss";


function Explore() {
    // State initialization
    const [selectedExtension, setSelectedExtension] = useState(null);
    const [activeOption, setActiveOption] = useState(EXPLORE_MODES.POPULAR);
    const [folderContents, setFolderContents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [episodes, setEpisodes] = useState([]);
    const [history, setHistory] = useState([{}]);
    const [serie, setSerie] = useState(null);
    const [error, setError] = useState(null);

    // Utilities and services initialization
    const folderManager = useMemo(() => new FolderManager(), []);
    const sortManager = useMemo(() => new SortManager(), []);
    const categoryApi = useMemo(() => new CategoryApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const sourceManager = useMemo(() => new SourceManager(), []);

    // TODO : refactor the mapping of the folder contents and the data from the database
    const retrieveSeriesInLibraryByExtension = useCallback((contents) => {
        categoryApi.readAllSeriesInLibraryByExtension(selectedExtension)
            .then((series) => {
                const formattedSeries = folderManager.mapFolderContentsWithMandatoryFields(contents, series, selectedExtension);
                setHistory([{ content: formattedSeries, serie: null, episodes: [] }]);
                setFolderContents(formattedSeries)
            })
            .catch((error) => setError({ message: error.message, type: "error" }));
    }, [categoryApi, folderManager, selectedExtension]);

    useEffect(() => {
        if (!selectedExtension) return;

        if (selectedExtension.local) {
            folderManager.retrieveFolderContents(selectedExtension.link)
                .then((data) => retrieveSeriesInLibraryByExtension(data.contents))
                .catch((error) => setError({ message: error.message, type: "error" }));
        } else {
            sourceManager.scrapAnime(selectedExtension, 1, EXPLORE_MODES.POPULAR)
                .then((data) => retrieveSeriesInLibraryByExtension(data))
                .catch((error) => setError({ message: error.message, type: "error" }));
        }
    }, [folderManager, categoryApi, sourceManager, selectedExtension, retrieveSeriesInLibraryByExtension]);

    const fetchNextPage = useCallback(() => {
        if (loading || activeOption === EXPLORE_MODES.FILTER) return;
        setLoading(true);

        sourceManager.scrapAnime(selectedExtension, currentPage + 1, activeOption)
            .then((nextPage) => {
                categoryApi.readAllSeriesInLibraryByExtension(selectedExtension)
                    .then((series) => {
                        const formattedSeries = folderManager.mapFolderContentsWithMandatoryFields(nextPage, series, selectedExtension);
                        setHistory((prevHistory) => {
                            const newHistory = [...prevHistory];
                            newHistory[0].content = [...newHistory[0].content, ...formattedSeries];
                            return newHistory;
                        });

                        setFolderContents((prevContents) => [...prevContents, ...formattedSeries]);
                        setCurrentPage(currentPage + 1);
                        setLoading(false);
                    })
                    .catch((error) => {
                        setLoading(false);
                        setError({ message: error.message, type: "error" });
                    });
            })
            .catch((error) => {
                setLoading(false);
                setError({ message: error.message, type: "error" });
            });
    }, [sourceManager, activeOption, categoryApi, folderManager, selectedExtension, currentPage, loading]);

    const handleScroll = useCallback(() => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Check if the user is near the bottom of the page
        if (!serie && selectedExtension && windowHeight + scrollTop >= documentHeight - 100) {
            fetchNextPage(); // Fetch the next page when near the bottom
        }
    }, [serie, selectedExtension, fetchNextPage]);

    // TODO : Implement the same logic for the Library page
    const handleBackClick = () => {
        window.scrollTo(0, 0);

        if (!serie) {
            setSelectedExtension(null)
            setHistory([{}]);
            return
        }

        if (history.length > 0) {
            history.pop();
            const parentEntry = history[history.length - 1];

            setSerie(parentEntry.serie);
            setEpisodes(parentEntry.episodes);
            setFolderContents(parentEntry.content);
        }
    }

    const handlePlayClick = async (clickedSerie) => {
        detachScrollListener();

        if (selectedExtension.local) await handleLocalSourceExtension(clickedSerie);
        else handleRemoteSourceExtension(clickedSerie);
    }

    const debouncedHandleScroll = debounce(handleScroll, 200);
    const attachScrollListener = useCallback(() => {
        window.addEventListener("scroll", debouncedHandleScroll);
    }, [debouncedHandleScroll]);

    const detachScrollListener = useCallback(() => {
        window.removeEventListener("scroll", debouncedHandleScroll);
    }, [debouncedHandleScroll]);

    useEffect(() => {
        if (selectedExtension?.local) return;
        attachScrollListener();

        // Remove the event listener when the component unmounts
        return () => {
            detachScrollListener();
        };
    }, [selectedExtension, debouncedHandleScroll, attachScrollListener, detachScrollListener]);

    const refreshFolderContents = () => retrieveSeriesInLibraryByExtension(folderContents);

    const retrieveAndSetFolderContents = async (link, extension_id, level = 0) => {
        try {
            let historyEntry;
            const data = await folderManager.retrieveFolderContents(link, level);
            if (data.contents.length === 0) {

                const data = await folderManager.retrieveFilesInFolder(link);
                const retrievedEpisodes = await trackApi.readAllEpisodesBySerieLink(link);
                const episodes = trackApi.mapSerieEpisodeWithDatabaseEpisode(data, retrievedEpisodes)

                setEpisodes(episodes);
                setFolderContents([]);

                historyEntry = { content: [], serie: null, episodes: episodes };
            } else {
                const series = await categoryApi.readAllSeriesInLibraryByExtension(selectedExtension);
                const content = folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename);
                setFolderContents(content);
                setEpisodes([]);

                historyEntry = { content: content, serie: null, episodes: [] };
            }

            return historyEntry;
        } catch (error) {
            setError({ message: error.message, type: "error" })
        }
    }

    const handleLocalSourceExtension = async (clickedSerie) => {
        try {
            const level = await folderManager.retrieveLevel(selectedExtension.link, clickedSerie.link);
            const history = await retrieveAndSetFolderContents(clickedSerie.link, clickedSerie.extension_id, level);

            const serie = { ...clickedSerie, name: folderManager.retrieveBaseName(clickedSerie.link), extension_id: selectedExtension.id };
            setHistory((prevHistory) => [...prevHistory, { content: history.content, serie: serie, episodes: history.episodes }]);
            setSerie(serie);
        } catch (error) {
            setError({ message: error.message, type: "error" })
        }
    }

    const handleRemoteSourceExtension = async (clickedSerie) => {
        try {
            const episodes = await sourceManager.scrapAnimeEpisodes(selectedExtension, clickedSerie.link);
            setEpisodes(episodes);
            setFolderContents([]);

            const serie = { ...clickedSerie, extension: selectedExtension, extension_id: selectedExtension.id };
            setHistory((prevHistory) => [...prevHistory, { content: [], serie: serie, episodes: episodes }]);
            setSerie(serie);
        } catch (error) {
            setError({ message: error.message, type: "error" })
        }
    }

    const handleSearch = async (searchValue) => {
        try {
            if (selectedExtension.local) setFolderContents(sortManager.filterByKeyword(searchValue, folderContents, 'basename'));
            else {
                const searchResult = await sourceManager.searchAnime(selectedExtension, searchValue);
                const seriesInLibrary = await categoryApi.readAllSeriesInLibraryByExtension(selectedExtension);
                const formattedSeries = folderManager.mapFolderContentsWithMandatoryFields(searchResult, seriesInLibrary, selectedExtension);
                setFolderContents(formattedSeries);
            }

            setActiveOption(EXPLORE_MODES.FILTER);
        } catch (error) {
            setError({ message: error.message, type: "error" })
        }
    }

    const handleOptionClick = async (mode) => {
        try {
            window.scrollTo(0, 0);
            const series = await sourceManager.scrapAnime(selectedExtension, 1, mode);

            retrieveSeriesInLibraryByExtension(series);
            setActiveOption(mode);
            setCurrentPage(1);
        } catch (error) {
            setError({ message: error.message, type: "error" })
        }
    }

    return (
        <>
            {error && <Notification message={error.message} type={error.type} onClose={setError} />}
            {!selectedExtension ? (
                <Source handleSelectedExtension={setSelectedExtension} />
            ) : (
                <div className={`${styles.explore} ${(serie || selectedExtension.local) ? styles.spaceOption : ""}`}>

                    <Header
                        title={selectedExtension.name}
                        onSearch={handleSearch}
                        onBack={handleBackClick}
                        onViewMode={() => { }}
                    />

                    {(!selectedExtension.local && !serie) && (
                        <div className={styles.optionsHeader}>
                            <div
                                onClick={() => handleOptionClick(EXPLORE_MODES.POPULAR)}
                                className={`${styles.option} ${activeOption === EXPLORE_MODES.POPULAR ? styles.active : ""}`}
                            >
                                <FavoriteIcon />
                                <span className={styles.label}>Popular</span>
                            </div>
                            <div
                                onClick={() => handleOptionClick(EXPLORE_MODES.RECENT)}
                                className={`${styles.option} ${activeOption === EXPLORE_MODES.RECENT ? styles.active : ""}`}
                            >
                                <NewReleasesIcon />
                                <span className={styles.label}>Recent</span>
                            </div>

                            <div
                                onClick={() => setActiveOption(EXPLORE_MODES.FILTER)}
                                className={`${styles.option} ${activeOption === EXPLORE_MODES.FILTER ? styles.active : ""}`}
                            >
                                <FilterListIcon />
                                <span className={styles.label}>Filter</span>
                            </div>
                        </div>
                    )}

                    <SeriesDisplay
                        linkedSeries={episodes.length ? [] : folderContents}
                        extension={selectedExtension}
                        episodes={episodes}
                        serie={serie}
                        onPlayClick={handlePlayClick}
                        onRefresh={refreshFolderContents}
                        calledFrom={EXPLORE_STRING}
                        setEpisodes={setEpisodes}
                    />

                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.loader}></div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default Explore;
