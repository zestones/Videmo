import React, { useState, useEffect, useMemo } from "react";

// External
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

// Utilities
import FolderManager from "../../../utilities/folderManager/FolderManager";

// Api
import ExtensionApi from "../../../services/api/extension/ExtensionApi";
import CategoryApi from "../../../services/api/category/CategoryApi";

// Styles
import styles from "./Settings.module.scss";
import Header from "../../../components/Header/Header";


function Settings() {
    const extensionApi = useMemo(() => new ExtensionApi(), []); // Create a new instance of the extensionApi
    const [folderManager] = useState(() => new FolderManager()); // Create a new instance of the folderManager
    const categoryApi = useMemo(() => new CategoryApi(), []); // Create a new instance of the categoryApi

    const [categories, setCategories] = useState([]);
    const [extensions, setExtensions] = useState([]);

    useEffect(() => {
        // Get the list of extensions from the database
        extensionApi.readExtension()
            .then((data) => setExtensions(data))
            .catch((error) => console.error(error));

        // Get the list of categories from the database
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error(error));
    }, [extensionApi, categoryApi]);

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

    const handleCreateCategory = (event) => {
        event.preventDefault();

        const categoryName = event.target[0].value;

        // Create a new category with the name entered by the user
        categoryApi.createCategory(categoryName)
            // Update the array of categories by adding the new category
            .then((category) => setCategories([...categories, category]))
            .catch((error) => console.error(error));
    };

    const [isOpen, setIsOpen] = useState(false);

    const handleToggleDropdown = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    return (
        <div className={styles.settings}>
            <Header title="Paramètres" />
            <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
                <div className={styles.dropdownHeader} onClick={handleToggleDropdown}>
                    <h2>Source local</h2>
                    <KeyboardArrowDownIcon className={styles.openIcon} onClick={() => handleToggleDropdown} />
                </div>
                <div className={styles.dropdownContent}>
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
                </div>

                {/* <h2>List of categories</h2>
                <ul>
                    {categories &&
                        categories.map((category) => (
                            <li key={category.id}>
                                <p>{category.name}</p>
                            </li>
                        ))}
                </ul>

                <h2>Create a new category</h2>
                <form onSubmit={handleCreateCategory}>
                    <input type="text" placeholder="Category name" />
                    <button type="submit">Create</button>
                </form> */}
            </div>
        </div>
    );
}

export default Settings;
