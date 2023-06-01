import React, { useState, useEffect } from "react";

import FolderManager from "../../../utilities/local/FolderManager";
import styles from "./Settings.module.scss";


function Settings() {
    const [folderPath, setFolderPath] = useState("");
    const [folderManager] = useState(() => new FolderManager());
    const [folderContents, setFolderContents] = useState([]);

    const handlePathChange = (event) => {
        setFolderPath(event.target.value);
        folderManager.setFolderPath(event.target.value);
    };

    const handleRetrieveClick = () => {
        folderManager.handleRetrieveClick();
    };

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

    return (
        <div className={styles.settings}>
            <h1>Settings</h1>
            <div>
                <input
                    type="text"
                    value={folderPath}
                    onChange={handlePathChange}
                    style={{ color: "black" }}
                />
                <button onClick={handleRetrieveClick}>Retrieve Folder Content</button>
                <ul>
                    {folderContents.map((folderContent) => (
                        <li key={folderContent.path}>
                            <img src={folderManager.getCoverImage(folderContent.cover)} alt={folderManager.getFileName(folderContent.path)} />
                            <p>{folderManager.getFileName(folderContent.path)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Settings;