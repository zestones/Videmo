import React, { useState, useEffect, useMemo } from "react";

// Utilities
import FolderManager from "../../../utilities/folderManager/FolderManager";

// Services
import ExtensionApi from "../../../services/api/extension/ExtensionApi";

// Styles
import styles from "./Settings.module.scss";


function Settings() {

    const extensionApi = useMemo(() => new ExtensionApi(), []); // Create a new instance of the extensionApi
    const [folderManager] = useState(() => new FolderManager()); // Create a new instance of the folderManager
    const [extensions, setExtensions] = useState([]);

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => {
                setExtensions(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [extensionApi]);


    const handleDeleteExtension = (id) => {
        extensionApi.deleteExtension(id)
            .then(() => {
                // Update the array of extensions by removing the deleted extension
                setExtensions(extensions.filter((extension) => extension.id !== id));
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const selectLocalSourceFolder = () => {
        // Open the dialog window to select a folder
        folderManager.openDialogWindow()
            .then((path) => {
                // Create a new extension with the selected folder path
                extensionApi.createExtension(path, "TEST")
                    .then((link) => {
                        // Update the array of extensions by adding the new extension
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


    return (
        <div className={styles.settings}>
            <h1>Settings</h1>
            <div>
                <h2>List of local source folders</h2>
                <button onClick={selectLocalSourceFolder}>Select Folder</button>
                <ul>
                    {extensions &&
                        extensions.map((extension) => (
                            <li key={extension.id}>
                                <p>{extension.name}</p>
                                <button onClick={() => handleDeleteExtension(extension.id)}>Delete</button>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

export default Settings;
