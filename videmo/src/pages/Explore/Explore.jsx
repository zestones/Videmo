import React from "react";

// Pages
import Source from "./Source/Source";
import DetailsContainer from "./DetailsContainer/DetailsContainer";

// Components
import Card from "../../components/Card/Card";
import EpisodeCard from "../../components/EpisodeCard/EpisodeCard";

// Styles
import styles from "./Explore.module.scss";


function Explore({
    searchValue,
    onPageTitleChange,
    onSelectedExtensionChange,
    onCurrentLevelChange,
    onCurrentPathChange,
    onFolderContentsChange,
    onShowBackButtonChange,
    onShowSerieDetailsChange,
    onSerieDetailsChange,
    onEpisodesFilesChange,
    episodesFiles,
    showSerieDetails,
    serieDetails,
    folderContents,
    currentLevel,
    selectedExtension,
    folderManager }) {

    const handleSelectedExtension = (extension) => {
        onSelectedExtensionChange(extension);
        onCurrentPathChange(extension.link); // Set currentPath to the current folder
        onPageTitleChange(extension.name);

        folderManager.retrieveFolderContents(extension.link)
            .then((data) => {
                onFolderContentsChange(data.contents); // Set folderContents to the current folder contents
                console.log(data.basename);
                onCurrentLevelChange(0); // Reset currentLevel to 0 when a new extension is selected
                onShowBackButtonChange(true); // Show back button when a new extension is selected
                onSerieDetailsChange(null); // Reset serieDetails when a new extension is selected
                onShowSerieDetailsChange(false); // Hide serieDetails when a new extension is selected
            })
            .catch((error) => console.error(error));
    };

    // Filter the folder contents based on the search value
    const filteredFolderContents = folderContents.filter((folderContent) =>
        folderManager
            .retrieveFileName(folderContent.path)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );

    // Function to retrieve series episodes
    const retrieveSeriesEpisodes = (path) => {
        folderManager.retrieveFilesInFolder(path)
            .then((data) => onEpisodesFilesChange(data))
            .catch((error) => console.error(error));
    };

    // Function to handle "More" display for local files
    const handleMoreDisplay = (serie) => {
        if (serie.local) {
            retrieveLevelAndFolderContents(serie.link, serie);
        }
    };

    // Helper function to retrieve level and folder contents
    const retrieveLevelAndFolderContents = (link, serie) => {
        folderManager.retrieveLevel(selectedExtension.link, link)
            .then((level) => retrieveFolderContentsAndHandleData(link, level, serie))
            .catch((error) => console.error(error));
    };

    // Helper function to retrieve folder contents and handle the data
    const retrieveFolderContentsAndHandleData = (link, level, serie) => {
        folderManager.retrieveFolderContents(link, level)
            .then((data) => {
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(link);
                }

                onCurrentPathChange(link);
                onFolderContentsChange(data.contents);
                console.log(data.basename);
                onCurrentLevelChange(currentLevel + 1);
                onShowSerieDetailsChange(true);

                // TODO: Retrieve real serie details
                const test = {
                    "basename": data.basename,
                    "name": serie.name,
                    "image": serie.image,
                    "local": selectedExtension.local,
                    "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias expedita consequuntur, labore repellat blanditiis reiciendis consequatur aliquam accusamus libero fuga dolorum porro eos esse nostrum. Nam, adipisci. Obcaecati, voluptas! Eligendi?",
                    "genres": ['Action', 'Adventure', 'Comedy']
                };
                onSerieDetailsChange(test);
            })
            .catch((error) => console.error(error));
    };

    const constructSerieObject = (serie) => {
        return {
            "name": folderManager.retrieveFileName(serie.path),
            "link": serie.path,
            "basename": serie.basename,
            "image": folderManager.accessFileWithCustomProtocol(serie.cover),
            "local": selectedExtension.local,
            "extensionId": selectedExtension.id,
            "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias expedita consequuntur, labore repellat blanditiis reiciendis consequatur aliquam accusamus libero fuga dolorum porro eos esse nostrum. Nam, adipisci. Obcaecati, voluptas! Eligendi?",
            "genres": ['Action', 'Adventure', 'Comedy']
        };
    };

    return (
        <div className={styles.container}>
            {selectedExtension === null ? (
                <Source handleSelectedExtension={handleSelectedExtension} />
            ) : (
                <div className={styles.cardsContainer}>
                    {showSerieDetails && (
                        <DetailsContainer
                            image={serieDetails.image}
                            name={serieDetails.name}
                            basename={serieDetails.basename}
                            description={serieDetails.description}
                            genres={serieDetails.genres}
                        />
                    )}
                    <ul className={styles.cardContainer}>
                        {filteredFolderContents.map((folderContent) => (
                            <Card
                                serie={constructSerieObject(folderContent)}
                                onPlayClick={handleMoreDisplay}
                            />
                        ))}
                        {episodesFiles.map((episode) => (
                            <EpisodeCard
                                title={episode.name}
                                link={episode.path}
                                modifiedTime={episode.modifiedTime}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Explore;
