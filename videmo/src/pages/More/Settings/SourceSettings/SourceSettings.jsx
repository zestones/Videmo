import React, { useEffect, useState } from "react";

// External
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        // Get the list of extensions from the database
        extensionApi.readExtension()
            .then((data) => setExtensions(data))
            .catch((error) => console.error(error));
    }, [extensionApi]);

    const handleDeleteExtension = (id) => {
        extensionApi.deleteExtension(id)
            // Update the array of extensions by removing the deleted extension
            .then(() => setExtensions(extensions.filter((extension) => extension.id !== id)))
            .catch((error) => console.error(error));
    };

    const selectLocalSourceFolder = () => {
        // Open the dialog window to select a folder
        folderManager.openDialogWindow()
            .then((path) => {
                // Create a new extension with the selected folder path 
                extensionApi.createExtension(path, folderManager.retrieveBaseName(path))
                    // Update the array of extensions by adding the new extension
                    .then((link) => setExtensions([...extensions, link]))
                    .catch((error) => console.error(error));
            }).catch((error) => console.error(error));
    };

    const handleEditExtensionName = (id) => {
        // Update the extension name with the new name
        const updatedExtensions = extensions.map((extension) =>
            extension.id === id ? { ...extension, name: editingName } : extension
        );
        setExtensions(updatedExtensions);
        setEditingId(null);
        setEditingName("");
    };

    const editExtensionName = (id, name) => {
        setEditingId(id);
        setEditingName(name);
    };

    return (
        <>
            <ul className={styles.sourceList}>
                {extensions.map((extension, index) => (
                    <li key={index} className={styles.sourceItem}>
                        <div className={styles.sourceInfos}>
                            {editingId === extension.id ? ( // If in edit mode, show the input field
                                <input
                                    type="text"
                                    className={styles.editInput}
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleEditExtensionName(extension.id)}
                                    autoFocus // Automatically focus on the input when in edit mode
                                />
                            ) : (
                                <p className={styles.sourceName}>{extension.name}</p> // Show the name if not in edit mode
                            )}
                            <p className={styles.sourcePath}>{extension.link}</p>
                        </div>
                        <div className={styles.sourceEdit}>
                            {editingId !== extension.id ? (
                                <EditOutlinedIcon
                                    className={styles.editIcon}
                                    onClick={() => editExtensionName(extension.id, extension.name)} // Enable edit mode
                                />
                            ) : (
                                <CheckCircleIcon className={styles.editIcon} onClick={() => handleEditExtensionName(extension.id)} />
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