import React, { useState } from "react";

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Pages
import Source from "./Source/Source";

// Components
import Card from "../../components/Card/Card";

// Styles
import styles from "./Explore.module.scss";


function Explore({ searchValue, onPageTitleChange }) {
    const [folderManager] = useState(() => new FolderManager());
    const [folderContents, setFolderContents] = useState([]);
    const [selectedExtension, setSelectedExtension] = useState(null);

    const [currentLevel, setCurrentLevel] = useState(0); // Add currentLevel state
    const [currentPath, setCurrentPath] = useState(""); // Add currentPath state

    const handleSelectedExtension = (extension) => {
        setSelectedExtension(extension);
        setCurrentPath(extension.link); // Set currentPath to the current folder
        onPageTitleChange(extension.name);
        folderManager.retrieveFolderContents(extension.link)
            .then((data) => {
                setFolderContents(data);
                setCurrentLevel(0); // Reset currentLevel to 0 when a new extension is selected
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

    const handleMoreDisplay = (link) => {
        folderManager.retrieveLevel(selectedExtension.link, link)
            .then((level) => {
                folderManager.retrieveFolderContents(link, level)
                    .then((data) => {
                        setCurrentPath(link); // Set currentPath to the current folder
                        setFolderContents(data);
                        setCurrentLevel(currentLevel + 1); // Increment currentLevel when more is displayed
                    })
                    .catch((error) => console.error(error));
            })
            .catch((error) => console.error(error));

    };

    const handleBackClick = () => {
        if (currentLevel > 0) {
            // Retrieve the parent folder path
            folderManager.retrieveParentPath(currentPath)
                .then((parentPath) => {
                    // Retrieve the parent folder level
                    folderManager.retrieveLevel(selectedExtension.link, parentPath)
                        .then((level) => {
                            folderManager.retrieveFolderContents(parentPath, level)
                                .then((data) => {
                                    setFolderContents(data);
                                    setCurrentLevel(currentLevel - 1);
                                    setCurrentPath(parentPath); // Set currentPath to the parent folder
                                })
                                .catch((error) => console.error(error));
                        })
                        .catch((error) => console.error(error));
                })
                .catch((error) => console.error(error));
        } else {
            onPageTitleChange("Extensions");
        }
    };


    return (
        <div className={styles.container}>
            {selectedExtension === null ? (
                <Source handleSelectedExtension={handleSelectedExtension} />
            ) : (
                <div className={styles.cardsContainer}>
                    {/* Render back button when currentLevel is greater than 0 */}
                    {currentLevel >= 0 && (
                        <button className={styles.backButton} onClick={handleBackClick}>
                            Back
                        </button>
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
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Explore;
