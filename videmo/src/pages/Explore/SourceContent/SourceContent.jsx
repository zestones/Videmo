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

    // Define a function to map folder contents
    const mapFolderContents = useCallback((contents, series) => {
        return contents.map((folderContent) => {
            const serie = series.find((serie) => {
                return serie.link === folderContent.link;
            });

            if (serie !== undefined) {
                folderContent.inLibrary = true;
                folderContent.serie = serie;
            } else {
                folderContent.inLibrary = false;
            }

            return folderContent;
        });
    }, []);

    // Use the functions in useEffect
    useEffect(() => {
        if (!calledFromExplore && searchScope !== null) {
            console.log("called from library");
            console.log("searchScope: ", searchScope);
            setSerie(null);
            setEpisodes([]);
            serieApi.readAllSeriesByCategory(searchScope.id)
                .then((seriesInLibrary) => {
                    console.log("seriesInLibrary: ", seriesInLibrary);
                    setFolderContents(seriesInLibrary);
                })
                .catch((error) => console.error(error));
        }
    }, [serieApi, searchScope, calledFromExplore]);

    useEffect(() => {
        if (calledFromExplore) {
            folderManager.retrieveFolderContents(searchScope.link)
                .then((data) => {
                    categoryApi.readAllSeriesInLibraryByExtension(searchScope)
                        .then((series) => {
                            const mappedFolderContents = mapFolderContents(data.contents, series);
                            console.log("mappedFolderContents: ", mappedFolderContents);
                            setFolderContents(mappedFolderContents);
                        });
                });
        }
    }, [folderManager, categoryApi, searchScope, calledFromExplore, mapFolderContents]);

    const updateContentForExplore = () => {
        categoryApi.readAllSeriesInLibraryByExtension(searchScope)
            .then((series) => {
                const mappedFolderContents = mapFolderContents(folderContents, series);
                setFolderContents(mappedFolderContents);
            });
    };

    const updateContentForLibrary = () => {
        serieApi.readAllSeriesByCategory(searchScope.id)
            .then((seriesInLibrary) => setFolderContents(seriesInLibrary))
            .catch((error) => console.error(error));
    };

    const refreshFolderContents = () => {
        if (calledFromExplore) updateContentForExplore();
        else updateContentForLibrary();
    };

    const handleSearch = (value) => setSearchValue(value);
    // const filterFolders = folderContents.filter((folderContent) =>
    //     folderManager.retrieveFileName(folderContent.path)
    //         .toLowerCase()
    //         .includes(searchValue.toLowerCase())
    // );

    const handlePlayClickInLibrary = async (basename, name, link, image) => {
        try {
            const serie = folderContents.find((serie) => serie.link === link);
            console.log("serie: ", serie);
           
            const extension = await extensionApi.readExtensionById(serie.extension_id);
            console.log("extension: ", extension);
            return extension.link;
        } catch (error) {
            console.error(error);
        }
    };


    // When a serie is clicked, retrieve its contents
    // ! IMPORTANT: This works only for local sources
    const handlePlayClick = async (basename, name, link, image) => {
        let baseLink;
        if (!calledFromExplore) {
            baseLink = await handlePlayClickInLibrary(basename, name, link, image);
            console.log("=====");
            console.log("baseLink: ", baseLink);
        } else {
            baseLink = searchScope.link;
        }

        folderManager.retrieveLevel(baseLink, link)
            .then((level) => {
                console.log("level: ", level);
                // We search for folders
                // TODO : refactor this (retrieveFolderContents), multiple definition 1 usage
                retrieveFolderContents(link, level);
                const searchName = basename === name ? basename : basename + " " + name;
                aniList.searchAnimeDetailsByName(searchName)
                    .then((details) => {
                        // TODO : do not update if no details are found
                        setSerie({
                            "name": folderManager.retrieveFileName(link),
                            "link": link,
                            "basename": basename,
                            "image": image,
                            "local": searchScope.local,
                            "extensionId": searchScope.id ? searchScope.id : serie.extension_id,
                            "description": details?.description,
                            "genres": details?.genres ? details.genres : [],
                            "startDate": aniList.formatDate(details?.startDate),
                            "duration": aniList.formatDuration(details?.duration),
                            "rating": aniList.formatRating(details?.meanScore),
                        });
                    })
            })
            .catch((error) => console.error(error));

        handleSearch("");
    };

    const retrieveFolderContents = (link, level = 0) => {
        folderManager.retrieveFolderContents(link, level)
            .then((data) => {
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(link);
                    setFolderContents([]);
                } else {
                    // TODO : remove duplicate code
                    categoryApi.readAllSeriesInLibraryByExtension(searchScope)
                        .then((series) => {
                            const mappedFolderContents = mapFolderContents(data.contents, series);
                            setFolderContents(mappedFolderContents);
                        });
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
                        retrieveFolderContents(link, level);

                        // If we are at the root level, we unset the serie
                        if (level === 0) {
                            setSerie(null);
                            return;
                        }

                        // We retrieve the parent cover
                        folderManager.retrieveFolderCover(link, level - 1)
                            .then((cover) => setSerie((prevSerie) => ({
                                ...prevSerie,
                                image: folderManager.accessFileWithCustomProtocol(cover),
                                name: folderManager.retrieveFileName(link)
                            })))
                            .catch((error) => console.error(error));

                        folderManager.retrieveBaseNameByLevel(link, level)
                            .then((basename) => setSerie((prevSerie) => ({ ...prevSerie, basename: basename })))
                            .catch((error) => console.error(error));

                        // TODO : retrieve real data from AniList API
                        setSerie((prevSerie) => ({ ...prevSerie, link: link }));
                    })
                    .catch((error) => console.error(error));
            })
            .catch((error) => console.error(error));
    };

    return (
        <>
            {calledFromExplore &&
                <Header title={searchScope.name} onSearch={handleSearch} onBack={handleBackClick} />
            }
            <div className={styles.sourceContent}>
                {serie && (
                    <DetailsContainer serie={serie} />
                )}

                {folderContents.map((folderContent) => (
                    <Card
                        key={folderContent.path}
                        basename={serie && serie.basename !== undefined ? serie.basename : folderManager.retrieveParentBaseName(folderContent.link)}
                        name={folderManager.retrieveFileName(folderContent.link)}
                        link={folderContent.link}
                        image={folderContent.image}
                        extensionId={searchScope.id ? searchScope.id : folderContent.extension_id}
                        showInLibraryLabel={folderContent.inLibrary}
                        onPlayClick={handlePlayClick}
                        onMoreClick={refreshFolderContents}
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