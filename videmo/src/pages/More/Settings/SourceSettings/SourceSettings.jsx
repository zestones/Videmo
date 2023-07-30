import React, { useEffect, useState } from "react";

// External
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

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
                extensionApi.createExtension(path, "TEST")
                    // Update the array of extensions by adding the new extension
                    .then((link) => setExtensions([...extensions, link]))
                    .catch((error) => console.error(error));
            }).catch((error) => console.error(error));
    };
    return (
        <>
            <ul className={styles.sourceList}>
                {extensions?.map((extension) => (
                    <li key={extension.id} className={styles.sourceItem}>
                        <div className={styles.sourceInfos}>
                            <p className={styles.sourceName}>{extension.name}</p>
                            <p className={styles.sourcePath}>{extension.link}</p>
                        </div>
                        <div className={styles.sourceEdit}>
                            <EditOutlinedIcon className={styles.editIcon} />
                            <DeleteForeverIcon className={styles.deleteIcon} onClick={() => handleDeleteExtension(extension.id)} />
                        </div>
                    </li>
                ))}
            </ul>

            <hr className={styles.separator} />
            <div className={styles.dropdownFooter}>
                <CreateNewFolderOutlinedIcon className={styles.addIcon} onClick={selectLocalSourceFolder} />
                <p className={styles.addSource}>Ajouter un dossier</p>
            </div>
        </>
    );
}

export default SourceSettings;