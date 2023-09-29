import React, { useState, useEffect, useCallback, useMemo } from "react";

// Constants
import { EXPLORE_STRING } from "../../utilities/utils/Constants";

// External
import debounce from 'lodash.debounce';

// Services & Api
import FolderManager from "../../utilities/folderManager/FolderManager";
import SortManager from "../../utilities/sortManager/SortManager";
import CategoryApi from "../../services/api/category/CategoryApi";
import TrackApi from "../../services/api/track/TrackApi";

// Sources
import VostfreeApi from "../../services/api/sources/external/anime/fr/vostfree/VostfreeApi";

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
    const vostfreeApi = useMemo(() => new VostfreeApi(), []);

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
            // TODO : create a Manager Class for the external sources
            vostfreeApi.scrapPopularAnime(1)
                .then((data) => retrieveSeriesInLibraryByExtension(data))
                .catch((error) => {
                    setError({ message: error.message, type: "error" })
                    console.error(error);
                });
        }
    }, [folderManager, categoryApi, vostfreeApi, selectedExtension, retrieveSeriesInLibraryByExtension]);

    const fetchNextPage = useCallback(() => {
        if (loading) return;
        setLoading(true);

        vostfreeApi.scrapPopularAnime(currentPage + 1)
            .then((nextPage) => {
                categoryApi.readAllSeriesInLibraryByExtension(selectedExtension)
                    .then((series) => {
                        const formattedSeries = folderManager.mapFolderContentsWithMandatoryFields(nextPage, series, selectedExtension);
                        setFolderContents((prevContents) => [...prevContents, ...formattedSeries]);
                        setHistory((prevHistory) => {
                            const newHistory = [...prevHistory];
                            newHistory[0].content = [...newHistory[0].content, ...formattedSeries];
                            return newHistory;
                        });

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
    }, [vostfreeApi, categoryApi, folderManager, selectedExtension, currentPage, loading]);

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
        attachScrollListener();

        // Remove the event listener when the component unmounts
        return () => {
            detachScrollListener();
        };
    }, [selectedExtension, debouncedHandleScroll, attachScrollListener, detachScrollListener]);

    const refreshFolderContents = () => retrieveSeriesInLibraryByExtension(folderContents);

    const handleLocalSourceExtension = async (clickedSerie) => {
        try {
            const level = await folderManager.retrieveLevel(selectedExtension.link, clickedSerie.link);
            const history = await retrieveAndSetFolderContents(clickedSerie.link, clickedSerie.extension_id, level);

            const serie = { ...clickedSerie, name: folderManager.retrieveBaseName(clickedSerie.link), extension_id: selectedExtension.id };
            setHistory((prevHistory) => [...prevHistory, { content: history.content, serie: serie, episodes: history.episodes }]);
            setSerie(serie);
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    }

    const handleRemoteSourceExtension = async (clickedSerie) => {
        try {
            const episodes = await vostfreeApi.scrapAnimeEpisodes(clickedSerie.link);

            setEpisodes(episodes);
            setFolderContents([]);

            const serie = { ...clickedSerie, extension: selectedExtension, extension_id: selectedExtension.id };
            setHistory((prevHistory) => [...prevHistory, { content: [], serie: serie, episodes: episodes }]);
            setSerie(serie);
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    }

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
            console.error(error);
        }
    }

    const handleSearch = async (searchValue) => {
        try {
            if (selectedExtension.local) setFolderContents(sortManager.filterByKeyword(searchValue, folderContents, 'basename'));
            else {
                const searchResult = await vostfreeApi.searchAnime(searchValue);
                const seriesInLibrary = await categoryApi.readAllSeriesInLibraryByExtension(selectedExtension);
                const formattedSeries = folderManager.mapFolderContentsWithMandatoryFields(searchResult, seriesInLibrary, selectedExtension);
                setFolderContents(formattedSeries);
            }
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    }

    return (
        <div className={styles.explore}>
            {error && <Notification message={error.message} type={error.type} onClose={setError} />}
            {!selectedExtension ? (
                <Source handleSelectedExtension={setSelectedExtension} />
            ) : (
                <>
                    <Header
                        title={selectedExtension.name}
                        onSearch={handleSearch}
                        onBack={handleBackClick}
                        onRandom={() => (selectedExtension.local && folderContents.length > 0) && handlePlayClick(folderContents[Math.floor(Math.random() * folderContents.length)])}
                    />

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
                </>
            )}
        </div>
    );
}

export default Explore;
