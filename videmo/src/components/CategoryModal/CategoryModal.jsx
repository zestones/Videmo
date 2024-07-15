import React, { useState, useEffect, useMemo, useCallback } from "react";
import propTypes from "prop-types";

import { useNotification } from "../../components/Notification/NotificationProvider";

// External
import CloseIcon from '@mui/icons-material/Close';

// Api
import CategoryApi from "../../services/api/category/CategoryApi";

// Styles
import styles from "./CategoryModal.module.scss";

function CategoryModal({ series, onClose, onRefresh, shouldUpdateSeries = false }) {
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

    const determineFlag = useCallback((isPresentForAllSeries, isPresentForAnySeries) => {
        if (isPresentForAllSeries) return FLAGS.CHECKED;
        else if (isPresentForAnySeries) return FLAGS.REMOVED;
        else return FLAGS.UNCHECKED;
    }, [FLAGS]);

    const updateCheckedCategories = useCallback((category, data, series, checkedCategories) => {
        const isPresentForAllSeries = series.every((s) => data[s.link].includes(category.id));
        const isPresentForAnySeries = series.some((s) => data[s.link].includes(category.id));
        const flag = determineFlag(isPresentForAllSeries, isPresentForAnySeries);

        const existingEntryIndex = checkedCategories.findIndex((element) => element.category.id === category.id);
        const seriesForCategory = series.filter(s => data[s.link].includes(category.id));

        if (existingEntryIndex === -1) checkedCategories.push({ flag, category, serie: seriesForCategory });
        else checkedCategories[existingEntryIndex].serie = seriesForCategory;
    }, [determineFlag]);

    useEffect(() => {
        categoryApi.readSerieCategoryIdsBySerieLinkArray(series.map((s) => s.link))
            .then((data) => {
                let checkedCategories = [];
                categories.forEach((category) => {
                    updateCheckedCategories(category, data, series, checkedCategories);
                });

                setCheckedCategories(checkedCategories)
            })
            .catch((error) => showNotification("error", error.message));
    }, [categoryApi, series, FLAGS, categories, showNotification, updateCheckedCategories]);

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
        try {
            onClose();
            await categoryApi.addSerieToCategories(series, checkedCategories, shouldUpdateSeries);
            showNotification("success", "La série a bien été déplacée avec succès");

            if (onRefresh) onRefresh(series[0]);
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
        <div className={styles.modal} id="categoryModal">
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

CategoryModal.propTypes = {
    series: propTypes.array.isRequired,
    onClose: propTypes.func.isRequired,
    onRefresh: propTypes.func,
    shouldUpdateSeries: propTypes.bool
};

export default CategoryModal;