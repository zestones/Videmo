import React, { useEffect, useState } from "react";

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


    useEffect(() => {
        // Register the listener when the component mounts
        const listener = (updatedFiles) => {
            setFolderContents([...updatedFiles]);
        };
        folderManager.registerListener(listener);

        return () => {
            // Unregister the listener when the component unmounts
            folderManager.unregisterListener(listener);
        };
    }, [folderManager]); // Empty dependency array ensures that the effect runs only once


    const handleSelectedExtension = (selection) => {
        setSelectedExtension(selection);
        folderManager.retrieveFolderContents(selection.link)
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
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Explore;