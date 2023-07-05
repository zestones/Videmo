import React, { useState, useEffect } from "react";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// Api
import CategoryApi from "../../services/api/category/CategoryApi";

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Styles
import styles from "./CategoryModal.module.scss";

function CategoryModal({ serie, onClose, onMoreClick }) {
    const [categoryApi] = useState(() => new CategoryApi());
    const [folderManager] = useState(() => new FolderManager());

    const [categories, setCategories] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);

    useEffect(() => {
        // Retrieve all categories
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => console.error(error));

        // Retrieve the categories of the serie
        categoryApi.readSerieCategoryIdsBySerie(serie)
            .then((data) => setCheckedCategories(data))
            .catch((error) => console.error(error));
    }, [categoryApi, serie, setCheckedCategories]);

    useEffect(() => {
        // The baseName is the name of the serie if it's a level 0 serie
        if (serie.level === 0) serie.basename = serie.name;

        // Retrieve the baseName of the serie only if it's not already set
        if (serie.basename !== null && serie.basename !== undefined) return;

        // retrieve the baseName of the serie
        folderManager.retrieveBaseNameByLevel(serie.link, serie.level + 1)
            .then((data) => serie.basename = data)
            .catch((error) => console.error(error));
    }, [folderManager, serie.basename, serie]);


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

    const handleAddToCategory = () => {
        // Pass the checkedCategories to the API call or handle them as needed
        categoryApi.addSerieToCategories(serie, checkedCategories)
            .then(() => {
                onClose()
                // if OnMoreClick is passed as a prop, call it
                if (onMoreClick) {
                    onMoreClick();
                }
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