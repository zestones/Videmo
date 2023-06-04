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
                onFolderContentsChange(data); // Set folderContents to the current folder contents
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
            .getFileName(folderContent.path)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );

    // ! ATTENTION: ONLY WORK FOR LOCAL FILES
    const retrieveSeriesEpisodes = (path) => {
        console.log(path);
        folderManager.retrieveFilesInFolder(path)
            .then((data) => {
                console.log(data);
                onEpisodesFilesChange(data);
            })
            .catch((error) => console.error(error));
    };

    // ! ATTENTION: ONLY WORK FOR LOCAL FILES
    const handleMoreDisplay = (serie) => {
        if (serie.local) {
            folderManager.retrieveLevel(selectedExtension.link, serie.link)
                .then((level) => {
                    folderManager.retrieveFolderContents(serie.link, level)
                        .then((data) => {
                            // check if the data is empty
                            if (data.length === 0) {
                                retrieveSeriesEpisodes(serie.link);
                            }

                            onCurrentPathChange(serie.link); // Set currentPath to the current folder
                            onFolderContentsChange(data);
                            onCurrentLevelChange(currentLevel + 1); // Increment currentLevel when more is displayed
                            onShowSerieDetailsChange(true);

                            const test = {
                                "title": serie.title,
                                "image": serie.image,
                                "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias expedita consequuntur, labore repellat blanditiis reiciendis consequatur aliquam accusamus libero fuga dolorum porro eos esse nostrum. Nam, adipisci. Obcaecati, voluptas! Eligendi?",
                                "genres": ['Action', 'Adventure', 'Comedy']
                            };
                            onSerieDetailsChange(test);
                        })
                        .catch((error) => console.error(error));
                })
                .catch((error) => console.error(error));
        }
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
                            title={serieDetails.title}
                            description={serieDetails.description}
                            genres={serieDetails.genres}
                        />
                    )}
                    <ul className={styles.cardContainer}>
                        {filteredFolderContents.map((folderContent) => (
                            <Card
                                link={folderContent.path}
                                title={folderManager.getFileName(folderContent.path)}
                                image={folderManager.getCoverImage(folderContent.cover)}
                                onMoreClick={handleMoreDisplay}
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
