import React, { useState, useEffect, useMemo } from "react";
import FolderManager from "../../../utilities/folderManager/FolderManager";
import styles from "./Settings.module.scss";
import ExtensionApi from "../../../services/api/extension/ExtensionApi";

function Settings() {
    // The purpose of this state is to trigger a re-render when the folder path changes
    const [folderPath, setFolderPath] = useState("");

    const [folderManager] = useState(() => new FolderManager());
    const [folderContents, setFolderContents] = useState([]);

    const extensionApi = useMemo(() => new ExtensionApi(), []); // Memoize the extensionApi instance
    const [extensions, setExtensions] = useState([]);

    const handlePathChange = () => {

        // Open the dialog window to select a folder
        folderManager.openDialogWindow()
            .then((path) => {
                setFolderPath(path); // Update the state with the selected folder path to trigger a re-render
                folderManager.setFolderPath(path);
                extensionApi.createExtension(path, "OKAY")
                .then((link) => {
                        console.log(link);
                        setExtensions([...extensions, link]);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    };


    const handleRetrieveClick = () => folderManager.handleRetrieveClick();

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

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => {
                console.log(data);
                setExtensions(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [extensionApi]);


    return (
        <div className={styles.settings}>
            <h1>Settings</h1>
            <div>
                <h2>List of local source folders</h2>
                <ul>
                    {extensions &&
                        extensions.map((extension) => (
                            <li key={extension.path}>
                                <p>{extension.name}</p>
                            </li>
                        ))}
                </ul>
            </div>

            <div>
                <button onClick={handlePathChange}>Select Folder</button>
                {folderPath && (
                    <button onClick={handleRetrieveClick}>Retrieve Folder Content</button>
                )}
                <ul>
                    {folderContents.map((folderContent) => (
                        <li key={folderContent.path}>
                            <img
                                src={folderManager.getCoverImage(folderContent.cover)}
                                alt={folderManager.getFileName(folderContent.path)}
                            />
                            <p>{folderManager.getFileName(folderContent.path)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Settings;
