import React, { useEffect, useState } from "react";

// External
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Components
import Notification from "../../../../components/Notification/Notification";

// Services
import ExtensionsApi from "../../../../services/api/extension/ExtensionApi";
import FolderManager from "../../../../utilities/folderManager/FolderManager";

// Styles
import styles from "./SourceSettings.module.scss";


function SourceSettings() {
    // Services initialization
    const [extensionApi] = useState(() => new ExtensionsApi());
    const [folderManager] = useState(() => new FolderManager());

    // State initialization
    const [extensions, setExtensions] = useState([]);
    const [editingExtension, setEditingExtension] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get the list of extensions from the database
        extensionApi.readExtension()
            .then((data) => setExtensions(data))
            .catch((error) => setError({ message: error.message, type: "error" }));
    }, [extensionApi]);

    const handleDeleteExtension = (id) => {
        extensionApi.deleteExtension(id)
            // Update the array of extensions by removing the deleted extension
            .then(() => setExtensions(extensions.filter((extension) => extension.id !== id)))
            .catch((error) => setError({ message: error.message, type: "error" }));
    };

    const selectLocalSourceFolder = () => {
        // Open the dialog window to select a folder
        folderManager.openDialogWindow()
            .then((path) => {
                // Create a new extension with the selected folder path 
                extensionApi.createExtension(path, folderManager.retrieveBaseName(path))
                    // Update the array of extensions by adding the new extension
                    .then((_) => setExtensions([...extensions, { id: null, name: folderManager.retrieveBaseName(path), link: path }]))
                    .catch((error) => setError({ message: error.message, type: "error" }));
            }).catch((error) => setError({ message: error.message, type: "error" }));
    };

    const updateEditedExtension = (id) => {
        // Update the extension name with the new name
        const updatedExtensions = extensions.map((extension) =>
            extension.id === id ? { ...extension, name: editingExtension.name } : extension
        );

        extensionApi.updateExtension(editingExtension)
            .catch((error) => setError({ message: error.message, type: "error" }));

        setExtensions(updatedExtensions);
        setEditingExtension(null);
    };

    const editExtension = (extension) => {
        setEditingExtension(extension);
    };

    const updateExtensionPath = (id) => {
        // Open the dialog window to select a folder
        folderManager.openDialogWindow()
            .then((path) => {
                // Update the extension path with the new path
                const updatedExtensions = extensions.map((extension) =>
                    extension.id === id ? { ...extension, link: path } : extension
                );

                extensionApi.updateExtension(updatedExtensions.find((extension) => extension.id === id))
                    .catch((error) => setError({ message: error.message, type: "error" }));

                setExtensions(updatedExtensions);
            }).catch((error) => setError({ message: error.message, type: "error" }));
    };

    return (
        <>
            {error && <Notification message={error.message} type={error.type} onClose={setError} />}
            <ul className={styles.sourceList}>
                {extensions.map((extension, index) => (
                    <li key={index} className={styles.sourceItem}>
                        <div className={styles.sourceInfos}>
                            {editingExtension?.id === extension.id ? (
                                <input
                                    type="text"
                                    className={styles.editInput}
                                    value={editingExtension.name}
                                    onChange={(e) => setEditingExtension({ ...editingExtension, name: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && updateEditedExtension(extension.id)}
                                    autoFocus // Automatically focus on the input when in edit mode
                                />
                            ) : (
                                <p className={styles.sourceName}>{extension.name}</p>
                            )}
                            <p className={styles.sourcePath} onClick={() => updateExtensionPath(extension.id)}>{extension.link}</p>
                        </div>
                        <div className={styles.sourceEdit}>
                            {editingExtension?.id !== extension.id ? (
                                <EditOutlinedIcon
                                    className={styles.editIcon}
                                    onClick={() => editExtension(extension)} // Enable edit mode
                                />
                            ) : (
                                <CheckCircleIcon className={styles.editIcon} onClick={() => updateEditedExtension(extension.id)} />
                            )}
                            <DeleteForeverIcon
                                className={styles.deleteIcon}
                                onClick={() => handleDeleteExtension(extension.id)}
                            />
                        </div>
                    </li>
                ))}
            </ul>

            <hr className={styles.separator} />

            <div className={styles.dropdownFooter} onClick={selectLocalSourceFolder}>
                <CreateNewFolderOutlinedIcon className={styles.addIcon} />
                <p className={styles.addSource}>Ajouter un dossier</p>
            </div>
        </>
    );
}

export default SourceSettings;