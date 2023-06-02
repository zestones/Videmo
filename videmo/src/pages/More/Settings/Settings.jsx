import React, { useState, useEffect } from "react";

import FolderManager from "../../../utilities/folderManager/FolderManager";
import styles from "./Settings.module.scss";


import Extension from "../../../services/api/extension/Extension";

function Settings() {
    // The purpose of this state is to trigger a re-render when the folder path changes
    const [folderPath, setFolderPath] = useState("");
    const [folderManager] = useState(() => new FolderManager());
    const [extension] = useState(() => new Extension());

    const [folderContents, setFolderContents] = useState([]);

    const handlePathChange = async () => {
        console.log("handlePathChange");
        // Send a message to the main process to open a folder dialog
        window.api.send("openFolderDialog");

        // Wait for a response from the main process with the selected folder path
        await window.api.receive("folderSelected", (data) => {
            if (data.success) {
                setFolderPath(data.folderPath); // Update the state with the selected folder path to trigger a re-render
                folderManager.setFolderPath(data.folderPath);
                extension.createExtension(data.folderPath, "TEST");
            }
        });
    };

    const handleRetrieveClick = () => {
        console.log("handleRetrieveClick");
        console.log(folderManager.folderPath);
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
                <button onClick={handlePathChange}>Select Folder</button>
                {folderPath && (
                    <button onClick={handleRetrieveClick}>Retrieve Folder Content</button>
                )}
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