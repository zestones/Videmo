import React, { useState, useEffect, useCallback } from "react";

// Api 
import SerieApi from "../../services/api/serie/SerieApi";
import FolderManager from "../../utilities/folderManager/FolderManager";
import CategoryApi from "../../services/api/category/CategoryApi";
import ExtensionsApi from "../../services/api/extension/ExtensionApi";
import AniList from "../../services/aniList/aniList";
import TrackApi from "../../services/api/track/TrackApi";

// Components
import SeriesDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import CategoryHeader from "../../components/CategoryHeader/CategoryHeader";
import Header from "../../components/Header/Header";
import Notification from "../../components/Notification/Notification";

// Styles
import styles from "./Library.module.scss";

function Library() {
    // State initialization
    const [selectedCategory, setSelectedCategory] = useState();
    const [serie, setSerie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [folderContents, setFolderContents] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [error, setError] = useState(null);

    // Api initialization
    const [serieApi] = useState(() => new SerieApi());
    const [trackApi] = useState(() => new TrackApi());
    const [folderManager] = useState(() => new FolderManager());
    const [categoryApi] = useState(() => new CategoryApi());
    const [extensionApi] = useState(() => new ExtensionsApi());
    const [aniList] = useState(() => new AniList());

    const retrieveAllSeriesBySelectedCategory = useCallback(() => {
        serieApi.readAllSeriesByCategory(selectedCategory?.id)
            .then((seriesInLibrary) => setFolderContents(seriesInLibrary.map((serie) => ({ ...serie, inLibrary: true }))))
            .catch((error) => setError({ message: error.message, type: "error" }));
    }, [serieApi, selectedCategory]);

    useEffect(() => {
        if (!selectedCategory) return;

        setSerie(null);
        setEpisodes([]);
        retrieveAllSeriesBySelectedCategory();
    }, [serieApi, selectedCategory, retrieveAllSeriesBySelectedCategory]);

    const retrieveSubSeriesInLibraryByExtension = (data, extension_id) => {
        categoryApi.readAllSeriesInLibraryByExtension(selectedCategory)
            .then((series) => setFolderContents(folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename)))
            .catch((error) => setError({ message: error.message, type: "error" }));
    };

    const onBackClick = async () => {
        // Principle : we take the link of the current serie, 
        // We check if the folder is in the database, if it is, then we are at the root of the library, if not, we are in a subfolder
        // If we are in a subfolder, we retrieve the parent folder of the current folder and we display its content
        // If we are at the root of the library, we display the content of the library
        // We do this until we are at the root of the library
        try {
            const retrievedSerie = await serieApi.readSerieBySerieObject(serie.link);
            if (retrievedSerie?.inLibrary) {
                setSerie(null);
                retrieveAllSeriesBySelectedCategory();
            } else {
                let serieUpdates = {};
                const link = await folderManager.retrieveParentPath(serie.link);
                const extension = await extensionApi.readExtensionById(serie.extension_id);
                const level = await folderManager.retrieveLevel(extension.link, link);

                const folderContents = await folderManager.retrieveFolderContents(link, level)
                retrieveSubSeriesInLibraryByExtension(folderContents, extension.id)

                const cover = await folderManager.retrieveFolderCover(link, level - 1);
                const basename = await folderManager.retrieveBaseNameByLevel(link, level);
                const name = folderManager.retrieveBaseName(link);
                serieUpdates = { ...serieUpdates, ...{ image: cover, basename, name, link } };

                // We search for the serie on AniList to retrieve its details
                const searchName = serieUpdates.basename === serieUpdates.name ? serieUpdates.basename : `${serieUpdates.basename} ${serieUpdates.name}`;
                const data = await aniList.searchAnimeDetailsByName(searchName);
                serieUpdates = { ...serieUpdates, ...data };
                setSerie(serieUpdates);
            }
            setEpisodes([]);
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    };

    // When a serie is clicked, retrieve its contents
    const handlePlayClick = async (details) => {
        try {
            // We retrieve the extension of the serie
            const extension = await extensionApi.readExtensionById(details.extension_id);
            const level = await folderManager.retrieveLevel(extension.link, details.link);

            checkAndHandleFolderContentsWithExtension(details.link, details.extension_id, level);
            const searchName = details.basename === details.name ? details.basename : details.basename + " " + details.name;
            const data = await aniList.searchAnimeDetailsByName(searchName);
            setSerie({
                ...details,
                name: folderManager.retrieveBaseName(details.link),
                extension_id: details.extension_id,
                ...data
            });
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
                const series = await categoryApi.readAllSeriesInLibraryByExtension(selectedCategory);
                setFolderContents(folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename));
                setEpisodes([]);
            }
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    };

    const filterFolders = folderContents.filter((folderContent) =>
        folderManager.retrieveBaseName(folderContent.link)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );

    return (
        <div className={styles.library}>
            {error && <Notification message={error.message} type={error.type} onClose={setError} />}
            <div className={styles.libraryContainer}>
                <Header
                    title="Bilbliothèque"
                    onSearch={setSearchValue}
                    onBack={serie ? onBackClick : null}
                    onRandom={() => folderContents.length > 0 && handlePlayClick(folderContents[Math.floor(Math.random() * folderContents.length)])}
                />

                <CategoryHeader selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                <SeriesDisplay
                    folderContents={filterFolders}
                    episodes={episodes}
                    serie={serie}
                    onPlayClick={handlePlayClick}
                    onRefresh={!serie && retrieveAllSeriesBySelectedCategory}
                    calledFromExplore={false}
                />
            </div>
        </div>
    );
}

export default Library;