import React, { useState, useEffect, useCallback, useRef } from "react";

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Api
import CategoryApi from "../../services/api/category/CategoryApi";
import SerieApi from "../../services/api/serie/SerieApi";

// Components
import Card from "../../components/Card/Card";
import DetailsContainer from "../Explore/DetailsContainer/DetailsContainer";
import EpisodeCard from "../../components/EpisodeCard/EpisodeCard";

// Styles
import styles from "./Library.module.scss";


function Library({ searchValue }) {
    // States
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [series, setSeries] = useState([]);

    const [serieExtension, setSerieExtension] = useState(null);
    const [serieDetails, setSerieDetails] = useState(null);
    const [showSerieDetails, setShowSerieDetails] = useState(false);
    const [episodesFiles, setEpisodesFiles] = useState([]);

    // Variables and refs for the header scroll
    const headerRef = useRef(null);
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    // Api instances
    const [categoryApi] = useState(() => new CategoryApi());
    const [serieApi] = useState(() => new SerieApi());

    // Utilities instances
    const [folderManager] = useState(() => new FolderManager());

    const handleSelectCategory = useCallback((category) => () => {
        setSelectedCategory(category);
        setEpisodesFiles([]);
        setSerieDetails(null);
        setShowSerieDetails(false);

        serieApi.readAllSeriesByCategory(category.id)
            .then((series) => setSeries(series))
            .catch((error) => console.error(error));
    }, [serieApi]);

    useEffect(() => {
        categoryApi.readAllCategories()
            .then((categories) => {
                setCategories(categories)
                handleSelectCategory(categories[0])();
            })
            .catch((error) => console.error(error));
    }, [categoryApi, handleSelectCategory]);

    // Refresh the series when the category changes
    const refreshSeriesOnSerieCategoryChange = () => {
        serieApi.readAllSeriesByCategory(selectedCategory.id)
            .then((series) => setSeries(series))
            .catch((error) => console.error(error));
    }

    const handleMouseDown = (event) => {
        isDragging = true;
        startX = event.pageX - headerRef.current.offsetLeft;
        scrollLeft = headerRef.current.scrollLeft;
    };

    const handleMouseMove = (event) => {
        if (!isDragging) return;
        event.preventDefault();

        const x = event.pageX - headerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Adjust the scrolling speed
        headerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => isDragging = false;

    const manageLocalSerie = (extension, serie) => {
        if (extension.local) {
            retrieveLevelAndFolderContents(extension, serie);
        }
    }

    const handleMoreDisplay = (serie) => {
        if (serieExtension === null) {
            serieApi.readExtensionBySerieId(serie.id)
                .then((extension) => {
                    setSerieExtension(extension);
                    manageLocalSerie(extension, serie);
                }).catch((error) => console.error(error));
        } else {
            manageLocalSerie(serieExtension, serie);
        }
    }

    // Helper function to retrieve level and folder contents
    const retrieveLevelAndFolderContents = (extension, serie) => {
        folderManager.retrieveLevel(extension.link, serie.link)
            .then((level) => retrieveFolderContentsAndHandleData(extension, serie, level))
            .catch((error) => console.error(error));
    };

    // Helper function to retrieve folder contents and handle the data
    const retrieveFolderContentsAndHandleData = (extension, serie, level) => {
        folderManager.retrieveFolderContents(serie.link, level)
            .then((data) => {
                // If the folder is empty, retrieve the series episodes
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(serie.link);
                }

                // onCurrentPathChange(serie.link);
                retrieveDataOfFolderContents(extension, serie, data.contents);
                // onCurrentLevelChange(currentLevel + 1);
                setShowSerieDetails(true);
                // TODO: Retrieve real serie details
                const test = {
                    "basename": data.basename,
                    "name": serie.name,
                    "image": serie.image,
                    "local": extension.local,
                    "extensionId": extension.id,
                    "link": serie.link,
                    "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias expedita consequuntur, labore repellat blanditiis reiciendis consequatur aliquam accusamus libero fuga dolorum porro eos esse nostrum. Nam, adipisci. Obcaecati, voluptas! Eligendi?",
                    "genres": ['Action', 'Adventure', 'Comedy']
                };
                setSerieDetails(test);
            })
            .catch((error) => console.error(error));
    };

    // Helper function to retrieve data of folder contents
    const retrieveDataOfFolderContents = (extension, serie, contents) => {
        const data = contents.map((content) => {
            return {
                name: folderManager.retrieveFileName(content.path),
                link: content.path,
                extensionId: extension.id,
                local: extension.local,
                basename: serie.basename,
                image: folderManager.accessFileWithCustomProtocol(content.cover),
                description: serie.description,
                genres: serie.genres,
            };
        });

        setSeries(data);
    };

    // Function to retrieve series episodes
    const retrieveSeriesEpisodes = (path) => {
        folderManager.retrieveFilesInFolder(path)
            .then((data) => setEpisodesFiles(data))
            .catch((error) => console.error(error));
    };

    // Sort the series alphabetically
    const alphabeticallySortSeries = series.sort((a, b) => a.name.localeCompare(b.name));

    // Filter the series based on the search value
    const filteredSeriesOnSearch = alphabeticallySortSeries.filter((serie) => serie.name.toLowerCase().includes(searchValue.toLowerCase()));

    // Filter the series based on the search value
    const filteredSeries = searchValue === "" ? alphabeticallySortSeries : filteredSeriesOnSearch;

    return (
        <div className={styles.library}>
            <div className={styles.libraryContainer}>
                <div
                    className={styles.libraryHeader}
                    ref={headerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className={styles.libraryHeaderButtons}>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`${styles.libraryHeaderButton} ${selectedCategory?.id === category.id ? styles.active : ""}`}
                                onClick={handleSelectCategory(category)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.libraryContent}>
                    {selectedCategory && (
                        <div className={styles.libraryContentCategorySeries}>
                            {showSerieDetails && (
                                <DetailsContainer
                                    image={serieDetails.image}
                                    name={serieDetails.name}
                                    basename={serieDetails.basename}
                                    description={serieDetails.description}
                                    genres={serieDetails.genres}
                                />
                            )}

                            {filteredSeries.map((serie) => (
                                <Card
                                    key={serie.id}
                                    serie={serie}
                                    onPlayClick={handleMoreDisplay}
                                    onMoreClick={refreshSeriesOnSerieCategoryChange}
                                    inLibrary={true}
                                />
                            ))}

                            {episodesFiles.map((episode) => (
                                <EpisodeCard
                                    title={episode.name}
                                    link={episode.path}
                                    modifiedTime={episode.modifiedTime}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Library;