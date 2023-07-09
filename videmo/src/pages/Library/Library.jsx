import React, { useState, useEffect, useCallback } from "react";

// Utilities
import FolderManager from "../../utilities/folderManager/folderManager";

// Api
import AniList from "../../services/aniList/aniList";
import SerieApi from "../../services/api/serie/SerieApi";
import CategoryApi from "../../services/api/category/CategoryApi";

// Components
import Card from "../../components/Card/Card";
import DetailsContainer from "../Explore/DetailsContainer/DetailsContainer";
import EpisodeCard from "../../components/EpisodeCard/EpisodeCard";
import Header from "../../components/Header/Header";
import CategoryHeader from "../../components/CategoryHeader/CategoryHeader";

// Styles
import styles from "./Library.module.scss";


function Library() {
    // States initialization
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [seriesInLibrary, setSeriesInLibrary] = useState([]);
    const [serie, setSerie] = useState(null);
    const [episodes, setEpisodes] = useState([]);

    const [searchValue, setSearchValue] = useState("");

    // Api instances
    const [serieApi] = useState(() => new SerieApi());
    const [categoryApi] = useState(() => new CategoryApi());
    const [aniList] = useState(() => new AniList());

    // Utilities instances
    const [folderManager] = useState(() => new FolderManager());

    const handleSelectCategory = useCallback((category) => () => {
        setSelectedCategory(category);

        serieApi.readAllSeriesByCategory(category.id)
            .then((seriesInLibrary) => {
                setSeriesInLibrary(seriesInLibrary);
            })
            .catch((error) => console.error(error));
    }, [serieApi]);

    // Refresh the seriesInLibrary when the category changes
    const refreshSeriesOnSerieCategoryChange = () => {
        serieApi.readAllSeriesByCategory(selectedCategory.id)
            .then((seriesInLibrary) => setSeriesInLibrary(seriesInLibrary))
            .catch((error) => console.error(error));
    }

    // Define a function to map folder contents
    const mapFolderContents = useCallback((contents, series) => {
        return contents.map((folderContent) => {
            const serie = series.find((serie) => {
                return serie.basename === folderManager.retrieveFileName(folderContent.path);
            });

            if (serie !== undefined) {
                folderContent.inLibrary = true;
                folderContent.serie = serie;
            } else {
                folderContent.inLibrary = false;
            }

            return folderContent;
        });
    }, [folderManager]);

    const retrieveFolderContents = (link, level = 0, extension) => {
        folderManager.retrieveFolderContents(link, level)
            .then((data) => {
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(link);
                    setSeriesInLibrary([]);
                } else {
                    // TODO : remove duplicate code
                    categoryApi.readAllSeriesInLibraryByExtension(extension)
                        .then((series) => {
                            const mappedFolderContents = mapFolderContents(data.contents, series);
                            setSeriesInLibrary(mappedFolderContents);
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

    // When a serie is clicked, retrieve its contents
    // ! IMPORTANT: This works only for local sources
    const handlePlayClick = (basename, name, link, image) => {
        serieApi.readSerieBySerieObject({ basename: basename, name: name, link: link })
            .then((serie) => {
                serieApi.readExtensionBySerieId(serie.id)
                    .then((extension) => {

                        folderManager.retrieveLevel(extension.link, link)
                            .then((level) => {
                                // We search for folders
                                // TODO : refactor this (retrieveFolderContents), multiple definition 1 usage
                                retrieveFolderContents(link, level, extension);
                                const searchName = basename === name ? basename : basename + " " + name;
                                aniList.searchAnimeDetailsByName(searchName)
                                    .then((details) => {
                                        // TODO : do not update if no details are found
                                        setSerie({
                                            "name": folderManager.retrieveFileName(link),
                                            "link": link,
                                            "basename": basename,
                                            "image": image,
                                            "local": extension.local,
                                            "extensionId": extension.id,
                                            "description": details?.description,
                                            "genres": details?.genres ? details.genres : [],
                                            "startDate": aniList.formatDate(details?.startDate),
                                            "duration": aniList.formatDuration(details?.duration),
                                            "rating": aniList.formatRating(details?.meanScore),
                                        });
                                    })
                            })
                            .catch((error) => console.error(error));
                    })
                    .catch((error) => console.error(error));
            })
            .catch((error) => console.error(error));
        handleSearch("");
    };

    // Filter the seriesInLibrary based on the search value
    const handleSearch = (value) => setSearchValue(value);
    const filteredSeries = seriesInLibrary.filter((folderContent) =>
        folderManager.retrieveFileName(folderContent.link)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );


    return (
        <>
            <Header title="Library" onSearch={handleSearch} />
            <div className={styles.library}>
                <div className={styles.libraryContainer}>
                    <CategoryHeader selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />

                    <div className={styles.libraryContent}>
                        {selectedCategory && (

                            <div className={styles.libraryContentCategorySeries}>
                                {serie && (
                                    <DetailsContainer serie={serie} />
                                )}

                                {filteredSeries.map((serie) => (
                                    <Card
                                        key={serie.id}
                                        basename={serie.basename}
                                        name={serie.name}
                                        link={serie.link}
                                        image={serie.image}
                                        extensionId={serie.extensionId}
                                        onPlayClick={handlePlayClick}
                                        onMoreClick={refreshSeriesOnSerieCategoryChange}
                                        inLibrary={true}
                                    />
                                ))}

                                <div className={styles.libraryContentCategorySeriesEmpty}>
                                    {episodes.map((episode) => (
                                        <EpisodeCard
                                            key={episode.id}
                                            title={episode.name}
                                            link={episode.path}
                                            modifiedTime={episode.modifiedTime}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Library;