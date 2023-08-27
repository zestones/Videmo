import React, { useState, useEffect } from "react";
import { useNotification } from "../../components/Notification/NotificationProvider";

// External
import CloseIcon from '@mui/icons-material/Close';

// Api
import CategoryApi from "../../services/api/category/CategoryApi";
import ExtensionsApi from "../../services/api/extension/ExtensionApi";

// Styles
import styles from "./CategoryModal.module.scss";

function CategoryModal({ serie, onClose, onMoreClick, shouldUpdateSeries = false }) {
    // Utilities and services initialization
    const [categoryApi] = useState(() => new CategoryApi());
    const [extensionApi] = useState(() => new ExtensionsApi());

    // States initialization
    const [categories, setCategories] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);

    // Initialization of the notification hook
    const { showNotification } = useNotification();

    useEffect(() => {
        // Retrieve all categories
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => showNotification("error", error.message));

        // Retrieve the categories of the serie
        categoryApi.readSerieCategoryIdsBySerieLink(serie.link)
            .then((data) => setCheckedCategories(data))
            .catch((error) => showNotification("error", error.message));

    }, [categoryApi, serie, setCheckedCategories, showNotification]);

    const handleCategoryChange = (e, categoryId) => {
        const isChecked = e.target.checked;

        if (isChecked) setCheckedCategories((prevCategories) => [...prevCategories, categoryId]);
        else setCheckedCategories((prevCategories) => prevCategories.filter((id) => id !== categoryId));
    };

    const handleAddToCategory = async () => {
        try {
            const extension = await extensionApi.readExtensionById(serie.extension_id);
            await categoryApi.addSerieToCategories(serie.link, extension.link, checkedCategories, shouldUpdateSeries);

            showNotification("success", "La série a bien été déplacée avec succès");
            onClose();
            
            if (onMoreClick) onMoreClick();
        } catch (error) {
            showNotification("error", error.message)
            console.error(error);
        }
    };

    return (
        <div className={styles.modal}>
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