import React, { useState, useEffect, useCallback, useMemo } from "react";

// Constants
import { EXPLORE_STRING } from "../../utilities/utils/Constants";

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
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [history, setHistory] = useState([{}]); // {serie, episodes}
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
        }
        else {
            vostfreeApi.scrapPopularAnime(1)
                .then((data) => {
                    setHistory([{ content: data, serie: null, episodes: [] }]);
                    setFolderContents(data)
                    console.log(data);
                })
                .catch((error) => setError({ message: error.message, type: "error" }));
        }
    }, [folderManager, categoryApi, vostfreeApi, selectedExtension, retrieveSeriesInLibraryByExtension]);

    const handleBackClick = () => {

        if (!serie) {
            setSelectedExtension(null)
            setHistory([{}]);
            return
        }

        if (history.length > 0) {
            history.pop();

            // If the history is empty, reset to the root
            if (history.length === 0) {
                setSerie(null);
                if (selectedExtension.local) retrieveSeriesInLibraryByExtension(folderContents);
                else {
                    vostfreeApi.scrapPopularAnime(1).then((data) => {
                        setFolderContents(data);
                        setHistory([{ content: data, serie: null, episodes: [] }]);
                        setEpisodes([]);
                    });
                }
            } else {
                // Navigate back to the previous folder
                const parentEntry = history[history.length - 1];
                setSerie(parentEntry.serie);
                setFolderContents(parentEntry.content);
                setEpisodes(parentEntry.episodes);
            }
        }
    };

    const refreshFolderContents = () => {
        retrieveSeriesInLibraryByExtension(folderContents);
    };

    const handleLocalSourceExtension = async (clickedSerie) => {
        try {
            const level = await folderManager.retrieveLevel(selectedExtension.link, clickedSerie.link);
            const history = await retrieveAndSetFolderContents(clickedSerie.link, clickedSerie.extension_id, level);

            const serie = { ...clickedSerie, name: folderManager.retrieveBaseName(clickedSerie.link), extension_id: selectedExtension.id };
            setHistory((prevHistory) => [...prevHistory, { content: history.content, serie: serie, episodes: history.episodes }]);
            setSerie(serie);

            setSearchValue("");
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    }

    const handleRemoteSourceExtension = async (clickedSerie) => {
        try {
            const data = await vostfreeApi.scrapAnimeEpisodes(clickedSerie.link);
            const episodes = data.map((url, index) => ({ link: url, name: `Episode ${index + 1}` }));
            console.log(episodes);
            setEpisodes(episodes);
            setFolderContents([]);

            const serie = { ...clickedSerie, extension: selectedExtension, extension_id: selectedExtension.id };
            setHistory((prevHistory) => [...prevHistory, { content: [], serie: serie, episodes: episodes }]);
            setSerie(serie);

            setSearchValue("");
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
    };

    const handlePlayClick = async (clickedSerie) => {
        if (selectedExtension.local) await handleLocalSourceExtension(clickedSerie);
        else handleRemoteSourceExtension(clickedSerie);
    };

    const handleSearch = async (searchValue) => {
        setSearchValue(searchValue);
        try {
            if (selectedExtension.local) setSearchResults(sortManager.filterByKeyword(searchValue, folderContents, 'basename'));
            else setSearchResults(await vostfreeApi.searchAnime(searchValue));
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    };


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
                        onRandom={() => folderContents.length > 0 && handlePlayClick(folderContents[Math.floor(Math.random() * folderContents.length)])}
                    />
                    <SeriesDisplay
                        linkedSeries={searchValue !== "" ? searchResults : folderContents}
                        episodes={episodes}
                        serie={serie}
                        onPlayClick={handlePlayClick}
                        onRefresh={refreshFolderContents}
                        calledFrom={EXPLORE_STRING}
                        setEpisodes={setEpisodes}
                    />
                </>
            )}
        </div>
    );
}

export default Explore;
