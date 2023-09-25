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
                console.log(formattedSeries);
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
                .then((data) => setFolderContents(data))
                .catch((error) => setError({ message: error.message, type: "error" }));
        }
    }, [folderManager, categoryApi, vostfreeApi, selectedExtension, retrieveSeriesInLibraryByExtension]);

    const handleBackClick = async () => {
        // If the series is null, then a click on the back button will reset the extension
        if (!serie) return setSelectedExtension(null);

        // TODO : Handle remote and local sources
        try {
            // We retrieve the parent path of the current serie and the level of the serie
            const link = folderManager.retrieveParentPath(serie.link);
            const level = await folderManager.retrieveLevel(selectedExtension.link, link);
            // We search for folders or files based on the extension, the level and the parent path
            retrieveAndSetFolderContents(link, selectedExtension.id, level);

            // Then we update the serie with the new data
            let serieUpdates = {};
            if (level === 0) return setSerie(null);
            else {
                const cover = await folderManager.retrieveFolderCover(link, level - 1);
                const basename = await folderManager.retrieveBaseNameByLevel(link, level);
                const name = folderManager.retrieveBaseName(link);
                serieUpdates = { ...serieUpdates, ...{ image: cover, basename, name, link } };
            }

            setSerie((prevSerie) => ({ ...prevSerie, ...serieUpdates }));
        } catch (error) {
            setError({ message: error.message, type: "error" });
            console.error(error);
        }
    };

    const refreshFolderContents = () => {
        retrieveSeriesInLibraryByExtension(folderContents);
    };


    const handleLocalSourceExtension = async (clickedSerie) => {
        try {
            const level = await folderManager.retrieveLevel(selectedExtension.link, clickedSerie.link);
            retrieveAndSetFolderContents(clickedSerie.link, clickedSerie.extension_id, level);
            setSerie({ ...clickedSerie, name: folderManager.retrieveBaseName(clickedSerie.link), extension_id: selectedExtension.id });
            setSearchValue("");
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    }

    const handleRemoteSourceExtension = async (clickedSerie) => {
        try {
            const data = await vostfreeApi.scrapAnimeEpisodes(clickedSerie.link);
            setEpisodes(data.map((url, index) => ({ link: url, name: `Episode ${index + 1}` })));
            setFolderContents([]);
            setSerie({ ...clickedSerie, extension: selectedExtension, extension_id: selectedExtension.id });
            setSearchValue("");
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    }

    // When a serie is clicked, retrieve its contents
    const handlePlayClick = async (clickedSerie) => {
        if (selectedExtension.local) await handleLocalSourceExtension(clickedSerie);
        else handleRemoteSourceExtension(clickedSerie);
    };

    // TODO : Handle remote and local sources
    const retrieveAndSetFolderContents = async (link, extension_id, level = 0) => {
        try {
            const data = await folderManager.retrieveFolderContents(link, level);
            if (data.contents.length === 0) {
                const data = await folderManager.retrieveFilesInFolder(link);
                const retrievedEpisodes = await trackApi.readAllEpisodesBySerieLink(link);

                setEpisodes(trackApi.mapSerieEpisodeWithDatabaseEpisode(data, retrievedEpisodes));
                setFolderContents([]);
            } else {
                const series = await categoryApi.readAllSeriesInLibraryByExtension(selectedExtension);
                setFolderContents(folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename));
                setEpisodes([]);
            }
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
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
