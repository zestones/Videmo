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


    const retrieveSeriesInLibraryByExtension = useCallback((contents) => {
        categoryApi.readAllSeriesInLibraryByExtension(searchScope)
            .then((series) => setFolderContents(folderManager.mapFolderContentsWithMandatoryFields(contents, series, searchScope)))
            .catch((error) => console.error(error));
    }, [categoryApi, folderManager, searchScope]);

    const retrieveSubSeriesInLibraryByExtension = (contents, extension_id) => {
        categoryApi.readAllSeriesInLibraryByExtension(searchScope)
            .then((series) => setFolderContents(folderManager.mapFolderContentsWithMandatoryFields(contents, series, { id: extension_id })))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        if (!calledFromExplore && searchScope !== null) {
            setSerie(null);
            setEpisodes([]);
            serieApi.readAllSeriesByCategory(searchScope.id)
                .then((seriesInLibrary) => setFolderContents(seriesInLibrary))
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
        let baseLink;
        if (!calledFromExplore) {
            baseLink = await handlePlayClickInLibrary(details.link);
        } else {
            baseLink = searchScope.link;
        }

        folderManager.retrieveLevel(baseLink, details.link)
            .then((level) => {
                // We search for folders
                // TODO : refactor this (retrieveFolderContents), multiple definition 1 usage
                testIfNeeded(details.link, level, details.extension_id); // TODO : condition check for remote sources
                const searchName = details.basename === details.name ? details.basename : details.basename + " " + details.name;
                aniList.searchAnimeDetailsByName(searchName)
                    .then((data) => {
                        // TODO : do not update if no details are found (for sub folders (undefined, NaN, etc.))
                        setSerie({
                            "name": folderManager.retrieveFileName(details.link),
                            "link": details.link,
                            "basename": details.basename,
                            "image": details.image,
                            "local": searchScope.local,
                            "extension_id": calledFromExplore ? searchScope.id : details.extension_id,
                            "description": data?.description,
                            "genres": data?.genres ? data.genres : [],
                            "startDate": aniList.formatDate(data?.startDate),
                            "duration": aniList.formatDuration(data?.duration),
                            "rating": aniList.formatRating(data?.meanScore),
                        });
                    })
            })
            .catch((error) => console.error(error));

        handleSearch("");
    };

    // TODO : check if really needed
    const testIfNeeded = (link, level = 0, extension_id) => {
        folderManager.retrieveFolderContents(link, level)
            .then((data) => {
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(link);
                    setFolderContents([]);
                } else {
                    retrieveSubSeriesInLibraryByExtension(data.contents, extension_id);
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

    // TODO : define Header Coponent callback inside the parent component (Library or Explore)
    // TODO : pass the needed parameters to the callback (serie, setSerie)
    // Handle back click
    const handleBackClick = () => {
        // If any serie is selected, we reset the selected extension
        if (!serie) {
            onExtensionReset(null);
            setSerie(null);
            return;
        }

        // We start by retrieving the parent path
        folderManager.retrieveParentPath(serie.link)
            .then((link) => {
                // We also retrieve the parent level
                folderManager.retrieveLevel(searchScope.link, link)
                    .then((level) => {
                        // Then from the parent path, and its level, we retrieve its contents
                        testIfNeeded(link, level);

                        // If we are at the root level, we unset the serie
                        if (level === 0) {
                            setSerie(null);
                            return;
                        }

                        // We retrieve the parent cover
                        folderManager.retrieveFolderCover(link, level - 1)
                            .then((cover) => {
                                setSerie((prevSerie) => ({
                                    ...prevSerie,
                                    image: cover,
                                    name: folderManager.retrieveFileName(link)
                                }))
                            })
                            .catch((error) => console.error(error));

                        folderManager.retrieveBaseNameByLevel(link, level)
                            .then((basename) => setSerie((prevSerie) => ({ ...prevSerie, basename: basename })))
                            .catch((error) => console.error(error));

                        // TODO : update the data (...prevSerie) with the aniList API class
                        setSerie((prevSerie) => ({ ...prevSerie, link: link }));
                    })
                    .catch((error) => console.error(error));
            })
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