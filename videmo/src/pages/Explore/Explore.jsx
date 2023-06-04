import React from "react";

// Pages
import Source from "./Source/Source";

// Components
import Card from "../../components/Card/Card";

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
                onFolderContentsChange(data);
                onCurrentLevelChange(0); // Reset currentLevel to 0 when a new extension is selected
                onShowBackButtonChange(true); // Show back button when a new extension is selected
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // Filter the folder contents based on the search value
    const filteredFolderContents = folderContents.filter((folderContent) =>
        folderManager
            .getFileName(folderContent.path)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );

    // ! ATTENTION: ONLY WORK FOR LOCAL FILES
    const handleMoreDisplay = (link) => {
        folderManager.retrieveLevel(selectedExtension.link, link)
            .then((level) => {
                folderManager.retrieveFolderContents(link, level)
                    .then((data) => {
                        onCurrentPathChange(link); // Set currentPath to the current folder
                        onFolderContentsChange(data);
                        onCurrentLevelChange(currentLevel + 1); // Increment currentLevel when more is displayed
                    })
                    .catch((error) => console.error(error));
            })
            .catch((error) => console.error(error));

    };

    return (
        <div className={styles.container}>
            {selectedExtension === null ? (
                <Source handleSelectedExtension={handleSelectedExtension} />
            ) : (
                <div className={styles.cardsContainer}>
                    <ul className={styles.cardContainer}>
                        {filteredFolderContents.map((folderContent) => (
                            <Card
                                link={folderContent.path}
                                title={folderManager.getFileName(folderContent.path)}
                                image={folderManager.getCoverImage(folderContent.cover)}
                                onMoreClick={handleMoreDisplay}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Explore;
