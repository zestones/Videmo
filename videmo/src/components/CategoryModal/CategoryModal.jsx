import React, { useState, useEffect, useMemo } from "react";
import { useNotification } from "../../components/Notification/NotificationProvider";

// External
import CloseIcon from '@mui/icons-material/Close';

// Api
import CategoryApi from "../../services/api/category/CategoryApi";

// Styles
import styles from "./CategoryModal.module.scss";

function CategoryModal({ series, onClose, onMoreClick, shouldUpdateSeries = false }) {
    // Constants initialization
    const FLAGS = useMemo(() => ({ CHECKED: "checked", UNCHECKED: "unchecked", REMOVED: "removed" }), []);

    // Utilities and services initialization
    const [categoryApi] = useState(() => new CategoryApi());

    // States initialization
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [categories, setCategories] = useState([]);

    // Initialization of the notification hook
    const { showNotification } = useNotification();

    // Retrieve all categories
    useEffect(() => {
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => showNotification("error", error.message));
    }, [categoryApi, showNotification]);

    useEffect(() => {
        categoryApi.readSerieCategoryIdsBySerieLinkArray(series.map((s) => s.link))
            .then((data) => {
                let checkedCategories = [];
                categories.forEach((category) => {
                    // Check if the category ID is present for all series
                    const isPresentForAllSeries = series.every((s) => data[s.link].includes(category.id));

                    // Check if the category ID is present for any series
                    const isPresentForAnySeries = series.some((s) => data[s.link].includes(category.id));

                    // Determine the flag based on presence and completeness of the category
                    let flag;
                    if (isPresentForAllSeries) flag = FLAGS.CHECKED;
                    else if (isPresentForAnySeries) flag = FLAGS.REMOVED;
                    else flag = FLAGS.UNCHECKED;

                    // Find the existing entry for this category
                    const existingEntryIndex = checkedCategories.findIndex((element) => element.category.id === category.id);

                    // Prepare the series array for the category
                    const seriesForCategory = series.filter(s => data[s.link].includes(category.id));

                    // Update the existing entry or add a new entry
                    if (existingEntryIndex === -1) checkedCategories.push({ flag, category, serie: seriesForCategory });
                    else checkedCategories[existingEntryIndex].serie = seriesForCategory;
                });

                setCheckedCategories(checkedCategories)
            })
            .catch((error) => showNotification("error", error.message));
    }, [categoryApi, series, FLAGS, categories, showNotification]);

    const handleCategoryChange = (e, categoryId) => {
        const isChecked = e.target.checked;

        const newCategories = [...checkedCategories];
        const categoryIndex = newCategories.findIndex((element) => element.category.id === categoryId);

        if (isChecked) {
            newCategories[categoryIndex].flag = FLAGS.CHECKED;
            newCategories[categoryIndex].serie.push(...series);
        } else {
            newCategories[categoryIndex].flag = FLAGS.UNCHECKED;
            newCategories[categoryIndex].serie = [];
        }

        setCheckedCategories(newCategories);
    };

    const handleAddToCategory = async () => {
        console.log("checkedCategories", checkedCategories);

        try {
            await categoryApi.addSerieToCategories(series, checkedCategories, shouldUpdateSeries);

            showNotification("success", "La série a bien été déplacée avec succès");
            onClose();

            if (onMoreClick) onMoreClick();
        } catch (error) {
            showNotification("error", error.message)
            console.error(error);
        }
    };

    const retrieveDisplayedCheckboxClass = (categoryId) => {
        const category = checkedCategories.find((element) => element.category.id === categoryId);

        if (category) {
            if (category.flag === FLAGS.CHECKED) return styles.check;
            else if (category.flag === FLAGS.REMOVED) return styles.minus;
        }

        return "";
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Déplacer vers une catégorie</h2>
                    <span className={styles.modalClose} onClick={() => onClose()}>
                        <CloseIcon />
                    </span>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.modalCategories}>
                        {categories.map((category) => (
                            <div key={category.id} className={styles.modalCategory}>
                                <input
                                    type="checkbox"
                                    className={retrieveDisplayedCheckboxClass(category.id)}
                                    id={category.id}
                                    name={category.name}
                                    value={category.name}
                                    checked={checkedCategories.some((element) => element.category.id === category.id && element.flag !== FLAGS.UNCHECKED)}
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