import React, { useState, useEffect, useCallback, useMemo } from "react";

// Services & Api
import FolderManager from "../../utilities/folderManager/FolderManager";
import SortManager from "../../utilities/sortManager/SortManager";
import CategoryApi from "../../services/api/category/CategoryApi";
import TrackApi from "../../services/api/track/TrackApi";
import AniList from "../../services/aniList/aniList";

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
    const [episodes, setEpisodes] = useState([]);
    const [serie, setSerie] = useState(null);
    const [error, setError] = useState(null);

    // Utilities and services initialization
    const folderManager = useMemo(() => new FolderManager(), []);
    const sortManager = useMemo(() => new SortManager(), []);
    const categoryApi = useMemo(() => new CategoryApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);
    const aniList = useMemo(() => new AniList(), []);


    const retrieveSeriesInLibraryByExtension = useCallback((contents) => {
        categoryApi.readAllSeriesInLibraryByExtension(selectedExtension)
            .then((series) => setFolderContents(folderManager.mapFolderContentsWithMandatoryFields(contents, series, selectedExtension)))
            .catch((error) => setError({ message: error.message, type: "error" }));
    }, [categoryApi, folderManager, selectedExtension]);

    useEffect(() => {
        if (!selectedExtension) return;
        folderManager.retrieveFolderContents(selectedExtension.link)
            .then((data) => retrieveSeriesInLibraryByExtension(data.contents))
            .catch((error) => setError({ message: error.message, type: "error" }));
    }, [folderManager, categoryApi, selectedExtension, retrieveSeriesInLibraryByExtension]);

    const handleBackClick = async () => {
        // If the series is null, then a click on the back button will reset the extension
        if (!serie) return setSelectedExtension(null);

        try {
            // We retrieve the parent path of the current serie and the level of the serie
            const link = await folderManager.retrieveParentPath(serie.link);
            const level = await folderManager.retrieveLevel(selectedExtension.link, link);
            // We search for folders or files based on the extension, the level and the parent path
            checkAndHandleFolderContentsWithExtension(link, selectedExtension.id, level);

            // Then we update the serie with the new data
            let serieUpdates = {};
            if (level === 0) return setSerie(null);
            else {
                const cover = await folderManager.retrieveFolderCover(link, level - 1);
                const basename = await folderManager.retrieveBaseNameByLevel(link, level);
                const name = folderManager.retrieveBaseName(link);
                serieUpdates = { ...serieUpdates, ...{ image: cover, basename, name, link } };
            }

            // We search for the serie on AniList to retrieve its details
            const searchName = serieUpdates.basename === serieUpdates.name ? serieUpdates.basename : `${serieUpdates.basename} ${serieUpdates.name}`;
            const data = await aniList.searchAnimeDetailsByName(searchName);
            serieUpdates = { ...serieUpdates, ...data };

            setSerie((prevSerie) => ({ ...prevSerie, ...serieUpdates }));
        } catch (error) {
            setError({ message: error.message, type: "error" });
            console.error(error);
        }
    };

    const refreshFolderContents = () => {
        retrieveSeriesInLibraryByExtension(folderContents);
    };

    // When a serie is clicked, retrieve its contents
    const handlePlayClick = async (details) => {
        try {
            const level = await folderManager.retrieveLevel(selectedExtension.link, details.link);
            checkAndHandleFolderContentsWithExtension(details.link, details.extension_id, level);
            setSerie({...details, name: folderManager.retrieveBaseName(details.link), extension_id: selectedExtension.id});
            setSearchValue("");
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    };

    // TODO : Handle remote and local sources
    const checkAndHandleFolderContentsWithExtension = async (link, extension_id, level = 0) => {
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

    const filterFolders = sortManager.filterByKeyword(searchValue, 'basename', folderContents);

    return (
        <div className={styles.explore}>
            {error && <Notification message={error.message} type={error.type} onClose={setError} />}
            {!selectedExtension ? (
                <Source handleSelectedExtension={setSelectedExtension} />
            ) : (
                <>
                    <Header
                        title={selectedExtension.name}
                        onSearch={setSearchValue}
                        onBack={handleBackClick}
                        onRandom={() => folderContents.length > 0 && handlePlayClick(folderContents[Math.floor(Math.random() * folderContents.length)])}
                    />
                    <SeriesDisplay
                        linkedSeries={filterFolders}
                        episodes={episodes}
                        serie={serie}
                        onPlayClick={handlePlayClick}
                        onRefresh={refreshFolderContents}
                        calledFromExplore={true}
                        setEpisodes={setEpisodes}
                    />
                </>
            )}
        </div>
    );
}

export default Explore;
