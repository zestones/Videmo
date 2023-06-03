import React, { useState } from "react";

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Pages
import Source from "./Source/Source";

// Components
import Card from "../../components/Card/Card";

// Styles
import styles from "./Explore.module.scss";


function Explore({ searchValue }) {
    const [folderManager] = useState(() => new FolderManager());
    const [folderContents, setFolderContents] = useState([]);
    const [selectedExtension, setSelectedExtension] = useState(null);

    const handleSelectedExtension = (extension) => {
        setSelectedExtension(extension);
        folderManager.retrieveFolderContents(extension.link)
            .then((data) => {
                setFolderContents(data);
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
        folderManager.getLevel(selectedExtension.link, link)
            .then((level) => {
                folderManager.retrieveFolderContents(link, level)
                    .then((data) => {
                        setFolderContents(data);
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