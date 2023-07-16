import React, { useState, useEffect } from "react";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// Api
import CategoryApi from "../../services/api/category/CategoryApi";
import ExtensionsApi from "../../services/api/extension/ExtensionApi";

// Utilities
import FolderManager from "../../utilities/folderManager/folderManager";

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

    useEffect(() => {
        // Retrieve all categories
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error(error));

        // Retrieve the categories of the serie
        categoryApi.readSerieCategoryIdsBySerie(serie)
            .then((data) => {
                console.log(data);
                setCheckedCategories(data)
            })
            .catch((error) => console.error(error));
            
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
        extensionsApi.readExtensionById(serie.extension_id)
            .then((extension) => {
                // retrieve the level of the serie
                folderManager.retrieveLevel(extension.link, serie.link)
                    .then((level) => {
                        folderManager.retrieveBaseNameByLevel(serie.link, level)
                            .then((basename) => {
                                // Set the basename of the serie
                                const { name, link, image, extension_id } = serie;
                                const serieToUpdate = { name, link, basename, image, extension_id };
                                // Pass the checkedCategories to the API call or handle them as needed
                                categoryApi.addSerieToCategories(serieToUpdate, checkedCategories)
                                    .then(() => {
                                        onClose()
                                        // if OnMoreClick is passed as a prop, call it
                                        if (onMoreClick) onMoreClick();
                                    })
                                    .catch((error) => console.error(error));
                            })
                            .catch((error) => console.error(error));
                    })
                    .catch((error) => console.error(error));
            })
            .catch((error) => console.error(error));
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Déplacer vers une catégorie</h2>
                    <FontAwesomeIcon icon={faTimes} className={styles.modalClose} onClick={onClose} />
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
                        <button className={styles.emptyButton} onClick={onClose}>Annuler</button>
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