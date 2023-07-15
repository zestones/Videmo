import React, { useState, useEffect, useCallback } from "react";

// Utilities
import FolderManager from "../../../utilities/folderManager/folderManager";

// Api
import CategoryApi from "../../../services/api/category/CategoryApi";
import SerieApi from "../../../services/api/serie/SerieApi";
import ExtensionsApi from "../../../services/api/extension/ExtensionApi";
import AniList from "../../../services/aniList/aniList";

// Components
import Header from "../../../components/Header/Header";
import Card from "../../../components/Card/Card";
import EpisodeCard from "../../../components/EpisodeCard/EpisodeCard";
import DetailsContainer from "../DetailsContainer/DetailsContainer";


// Styles
import styles from "./SourceContent.module.scss";


function SourceContent({ searchScope, calledFromExplore, onExtensionReset }) {
    // Utilities and services initialization
    const [folderManager] = useState(() => new FolderManager());
    const [categoryApi] = useState(() => new CategoryApi());
    const [serieApi] = useState(() => new SerieApi());
    const [extensionApi] = useState(() => new ExtensionsApi());
    const [aniList] = useState(() => new AniList());

    // State initialization
    const [folderContents, setFolderContents] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [serie, setSerie] = useState(null);
    const [episodes, setEpisodes] = useState([]);


    // Triggered only when called from Explore is true
    const retrieveSeriesInLibraryByExtension = useCallback((contents) => {
        categoryApi.readAllSeriesInLibraryByExtension(searchScope)
            .then((series) => setFolderContents(folderManager.mapFolderContentsWithMandatoryFields(contents, series, searchScope)))
            .catch((error) => console.error(error));
    }, [categoryApi, folderManager, searchScope]);

    const retrieveSubSeriesInLibraryByExtension = (data, extension_id) => {
        categoryApi.readAllSeriesInLibraryByExtension(searchScope)
            .then((series) => setFolderContents(folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename)))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        if (!calledFromExplore && searchScope !== null) {
            setSerie(null);
            setEpisodes([]);
            serieApi.readAllSeriesByCategory(searchScope.id)
                .then((seriesInLibrary) => setFolderContents(seriesInLibrary.map((serie) => ({ ...serie, inLibrary: true }))))
                .catch((error) => console.error(error));
        }
    }, [serieApi, searchScope, calledFromExplore]);

    useEffect(() => {
        if (calledFromExplore) {
            folderManager.retrieveFolderContents(searchScope.link)
                .then((data) => retrieveSeriesInLibraryByExtension(data.contents))
                .catch((error) => console.error(error));
        }
    }, [folderManager, categoryApi, searchScope, calledFromExplore, retrieveSeriesInLibraryByExtension]);


    const updateContentForLibrary = () => {
        serieApi.readAllSeriesByCategory(searchScope.id)
            .then((seriesInLibrary) => setFolderContents(seriesInLibrary))
            .catch((error) => console.error(error));
    };

    const refreshFolderContents = () => {
        if (calledFromExplore) retrieveSeriesInLibraryByExtension(folderContents);
        else updateContentForLibrary();
    };

    const handleSearch = (value) => setSearchValue(value);
    const filterFolders = folderContents.filter((folderContent) =>
        folderManager.retrieveFileName(folderContent.link)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );

    const handlePlayClickInLibrary = async (link) => {
        try {
            const serie = folderContents.find((serie) => serie.link === link);

            const extension = await extensionApi.readExtensionById(serie.extension_id);
            return extension.link;
        } catch (error) {
            console.error(error);
        }
    };


    // When a serie is clicked, retrieve its contents
    const handlePlayClick = async (details) => {
        // retrieve the base link based on the called component
        const baseLink = !calledFromExplore ? await handlePlayClickInLibrary(details.link) : searchScope.link;

        folderManager.retrieveLevel(baseLink, details.link)
            .then((level) => {
                // We search for folders
                checkAndHandleFolderContentsWithExtension(details.link, level, details.extension_id);
                const searchName = details.basename === details.name ? details.basename : details.basename + " " + details.name;
                aniList.searchAnimeDetailsByName(searchName)
                    .then((data) => setSerie({
                        ...details,
                        name: folderManager.retrieveFileName(details.link),
                        extension_id: calledFromExplore ? searchScope.id : details.extension_id,
                        ...data
                    }))
            }).catch((error) => console.error(error));

        handleSearch("");
    };

    // TODO : define Header Coponent callback inside the parent component (Library or Explore)
    // TODO : pass the needed parameters to the callback (serie, setSerie)
    const handleBackClick = async () => {
        // If the series is null, then a click on the back button will reset the extension
        if (!serie) return onExtensionReset(null);

        try {
            // We retrieve the parent path of the current serie and the level of the serie
            const link = await folderManager.retrieveParentPath(serie.link);
            const level = await folderManager.retrieveLevel(searchScope.link, link);
            // We search for folders or files based on the extension, the level and the parent path
            checkAndHandleFolderContentsWithExtension(link, level, searchScope.id);

            // Then we update the serie with the new data
            let serieUpdates = {};
            if (level === 0) return setSerie(null);
            else {
                const cover = await folderManager.retrieveFolderCover(link, level - 1);
                const basename = await folderManager.retrieveBaseNameByLevel(link, level);
                const name = folderManager.retrieveFileName(link);
                serieUpdates = { ...serieUpdates, ...{ image: cover, basename, name, link } };
            }

            const searchName = serieUpdates.basename === serieUpdates.name ? serieUpdates.basename : `${serieUpdates.basename} ${serieUpdates.name}`;
            const data = await aniList.searchAnimeDetailsByName(searchName);
            serieUpdates = { ...serieUpdates, ...data };

            setSerie((prevSerie) => ({ ...prevSerie, ...serieUpdates }));
        } catch (error) {
            console.error(error);
        }
    };

    // TODO : Handle remote and local sources
    const checkAndHandleFolderContentsWithExtension = (link, level = 0, extension_id) => {
        folderManager.retrieveFolderContents(link, level)
            .then((data) => {
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(link);
                    setFolderContents([]);
                } else {
                    retrieveSubSeriesInLibraryByExtension(data, extension_id);
                    setEpisodes([]);
                }
            })
            .catch((error) => console.error(error));
    };

    // Function to retrieve series episodes
    const retrieveSeriesEpisodes = (path) => {
        folderManager.retrieveFilesInFolder(path)
            .then((data) => setEpisodes(data))
            .catch((error) => console.error(error));
    };

    return (
        <>
            {calledFromExplore &&
                // TODO : move the Header component to the parent component (Library or Explore)
                <Header title={searchScope.name} onSearch={handleSearch} onBack={handleBackClick} />
            }
            <div className={styles.sourceContent}>
                {serie && (
                    <DetailsContainer serie={serie} />
                )}

                {filterFolders.map((folderContent) => (
                    <Card
                        key={folderContent.path}
                        details={folderContent}
                        onPlayClick={handlePlayClick}
                        onMoreClick={refreshFolderContents}
                        displayLabel={calledFromExplore}
                    />
                ))}
                <div className={styles.episodesContainer}>
                    {episodes.map((episode) => (
                        <EpisodeCard
                            title={episode.name}
                            link={episode.path}
                            modifiedTime={episode.modifiedTime}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

export default SourceContent;