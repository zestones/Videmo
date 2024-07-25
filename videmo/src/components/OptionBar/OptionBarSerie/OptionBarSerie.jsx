import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";

import { useNotification } from "../../Notification/NotificationProvider";

// External
import LabelIcon from '@mui/icons-material/Label';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

// Components
import Tooltip from "../../Tooltip/Tooltip";
import CategoryModal from "../../Modal/CategoryModal/CategoryModal";

// Services
import TrackApi from "../../../services/api/track/TrackApi";
import CategoryApi from "../../../services/api/category/CategoryApi";

// Styles
import styles from "./OptionBarSerie.module.scss";

function OptionBarSerie({ series, onClose, checked, onCheck, onCategoryChange, isCalledFromExplore }) {
    // Services initialization
    const trackApi = useMemo(() => new TrackApi(), []);
    const categoryApi = useMemo(() => new CategoryApi(), []);

    // States initialization
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categories, setCategories] = useState([]);

    // Initialization of the notification hook
    const { showNotification } = useNotification();


    useEffect(() => {
        categoryApi.readAllCategories()
            .then((data) => setCategories(data))
            .catch((error) => showNotification("error", error.message));
    }, [categoryApi, showNotification]);

    const handleViewedState = async (viewed) => {
        try {
            await trackApi.updateAllSeriesEpisodesViewedFlag(series, viewed);
            showNotification("success", "Tout les épisodes ont été marqués comme " + (viewed ? "vu" : "non vu") + ".");
            onCategoryChange(series.map((serie) => serie.link));
        } catch (error) {
            showNotification("error", error.message);
            console.error(error);
        }
    }

    const handleDeleteFromLibrary = async () => {
        try {
            const checkedCategories = categories.map((category) => ({ category, serie: [], flag: "unchecked" }));
            await categoryApi.addSerieToCategories(series, checkedCategories, false);
            showNotification("success", "Les séries ont été supprimées de la bibliothèque.");
            onCategoryChange();
        } catch (error) {
            showNotification("error", error.message);
            console.error(error);
        }
    }

    return (
        <>
            <div className={styles.optionBar}>
                <div className={styles.container}>
                    <div className={styles.checkbox}>
                        <input type="checkbox" checked={checked} onChange={() => onCheck()} />
                        <span
                            className={styles.label}
                            onClick={() => onCheck()}
                        >
                            {series.length} Séries sélectionnées
                        </span>
                        <span className={styles.erase} onClick={() => onClose()}>Effacer</span>
                    </div>

                    <div className={styles.optionContainer}>
                        <Tooltip title="Ajouter à une catégorie" placement="top">
                            <div className={styles.option} onClick={() => setShowCategoryModal(true)}>
                                <span className={styles.icon}>
                                    <LabelIcon />
                                </span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Marquer comme vu" placement="top">
                            <div className={styles.option} onClick={() => handleViewedState(true)}>
                                <span className={styles.icon}>
                                    <DoneAllIcon />
                                </span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Marquer comme non vu" placement="top" >
                            <div className={styles.option} onClick={() => handleViewedState(false)}>
                                <span className={styles.icon}>
                                    <RemoveDoneIcon />
                                </span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Supprimer" placement="top">
                            <div className={styles.option} onClick={() => handleDeleteFromLibrary()}>
                                <span className={styles.icon}>
                                    <DeleteOutlinedIcon />
                                </span>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {showCategoryModal && (
                <CategoryModal
                    series={series}
                    onClose={() => setShowCategoryModal(false)}
                    onRefresh={onCategoryChange}
                    shouldUpdateSeries={isCalledFromExplore}
                />
            )}
        </>
    );
}

OptionBarSerie.propTypes = {
    series: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    onCheck: PropTypes.func.isRequired,
    onCategoryChange: PropTypes.func.isRequired,
    isCalledFromExplore: PropTypes.bool.isRequired,
};

export default OptionBarSerie;