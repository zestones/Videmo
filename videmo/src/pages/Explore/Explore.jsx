import React from "react";

// Pages
import Source from "./Source/Source";
import DetailsContainer from "./DetailsContainer/DetailsContainer";

// Components
import Card from "../../components/Card/Card";
import EpisodeCard from "../../components/EpisodeCard/EpisodeCard";
import RandButton from '../../components/RandButton/RandButton';

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

    // Helper function to retrieve level and folder contents
    const retrieveLevelAndFolderContents = (serie) => {
        folderManager.retrieveLevel(selectedExtension.link, serie.link)
            .then((level) => retrieveFolderContentsAndHandleData(serie.link, level, serie))
            .catch((error) => console.error(error));
    };

    // Function to handle "More" display for local files
    const handleMoreDisplay = (serie) => {
        if (serie.local) {
            retrieveLevelAndFolderContents(serie);
        }
    };

    const onRandomClick = () => {
        const constructedFolderContents = folderContents.map((folderContent) => constructSerieObject(folderContent));
        const randomSerie = constructedFolderContents[Math.floor(Math.random() * constructedFolderContents.length)];
        handleMoreDisplay(randomSerie);
    }

    // Helper function to retrieve folder contents and handle the data
    const retrieveFolderContentsAndHandleData = (link, level, serie) => {
        folderManager.retrieveFolderContents(link, level)
            .then((data) => {
                // If the folder is empty, retrieve the series episodes
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(link);
                }

                onCurrentPathChange(link);
                onFolderContentsChange(data.contents);
                onCurrentLevelChange(currentLevel + 1);
                // TODO: Retrieve real serie details
                const test = {
                    "basename": data.basename,
                    "name": serie.name,
                    "image": serie.image,
                    "local": selectedExtension.local,
                    "extensionId": selectedExtension.id,
                    "link": link,
                    "level": currentLevel,
                    "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias expedita consequuntur, labore repellat blanditiis reiciendis consequatur aliquam accusamus libero fuga dolorum porro eos esse nostrum. Nam, adipisci. Obcaecati, voluptas! Eligendi?",
                    "genres": ['Action', 'Adventure', 'Comedy']
                };
                onSerieDetailsChange(test);
                onShowSerieDetailsChange(true);
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
            "level": currentLevel,
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
                    {showSerieDetails ? (
                        <DetailsContainer serie={serieDetails} />
                    ) : (
                        <RandButton onClick={onRandomClick} />
                    )}
                    <ul className={styles.cardContainer}>
                        {filteredFolderContents.map((folderContent) => (
                            <Card
                                key={folderContent.path}
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
