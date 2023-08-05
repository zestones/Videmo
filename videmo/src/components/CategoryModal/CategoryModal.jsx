import React, { useState, useEffect } from "react";

// External
import CloseIcon from '@mui/icons-material/Close';

// Components
import Notification from "../Notification/Notification";

// Api
import CategoryApi from "../../services/api/category/CategoryApi";
import ExtensionsApi from "../../services/api/extension/ExtensionApi";

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Styles
import styles from "./CategoryModal.module.scss";

function CategoryModal({ serie, onClose, onMoreClick }) {
    // Utilities and services initialization
    const [categoryApi] = useState(() => new CategoryApi());
    const [extensionsApi] = useState(() => new ExtensionsApi());
    const [folderManager] = useState(() => new FolderManager());

    // States initialization
    const [categories, setCategories] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Retrieve all categories
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => setError({ message: error.message, type: "error" }));

        // Retrieve the categories of the serie
        categoryApi.readSerieCategoryIdsBySerieLink(serie.link)
            .then((data) => setCheckedCategories(data))
            .catch((error) => setError({ message: error.message, type: "error" }));

    }, [categoryApi, serie, setCheckedCategories]);

    const handleCategoryChange = (e, categoryId) => {
        const isChecked = e.target.checked;

        if (isChecked) {
            // Add the category ID to the checkedCategories state
            setCheckedCategories((prevCategories) => [...prevCategories, categoryId]);
        } else {
            // Remove the category ID from the checkedCategories state
            setCheckedCategories((prevCategories) => prevCategories.filter((id) => id !== categoryId));
        }
    };

    const handleAddToCategory = async () => {
        try {
            const extension = await extensionsApi.readExtensionById(serie.extension_id);
            const level = await folderManager.retrieveLevel(extension.link, serie.link);
            const basename = await folderManager.retrieveBaseNameByLevel(serie.link, level);

            const { name, link, image, extension_id } = serie;
            const serieToUpdate = { name, link, basename, image, extension_id };

            await categoryApi.addSerieToCategories(serieToUpdate, checkedCategories);
            onClose({ message: "La série a été déplacée avec succès", type: "success" });
            if (onMoreClick) onMoreClick();
        } catch (error) {
            setError({ message: error.message, type: "error" })
            console.error(error);
        }
    };

    return (
        <div className={styles.modal}>
            {error && <Notification message={error.message} type={error.type} />}
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Déplacer vers une catégorie</h2>
                    <CloseIcon className={styles.modalClose} onClick={() => onClose()} />
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.modalCategories}>
                        {categories.map((category) => (
                            <div key={category.id} className={styles.modalCategory}>
                                <input
                                    type="checkbox"
                                    id={category.id}
                                    name={category.name}
                                    value={category.name}
                                    checked={checkedCategories.includes(category.id)}
                                    onChange={(e) => handleCategoryChange(e, category.id)}
                                />
                                <label htmlFor={category.id}>{category.name}</label>
                            </div>
                        ))}
                    </div>
                    <div className={styles.modalCategoryActions}>
                        <button className={styles.emptyButton} onClick={() => onClose()}>Annuler</button>
                        <button className={styles.filledButton} onClick={handleAddToCategory}>
                            Déplacer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryModal;