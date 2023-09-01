import React, { useState } from "react";

// External
import LabelIcon from '@mui/icons-material/Label';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

// Components
import Tooltip from "../Tooltip/Tooltip";
import CategoryModal from "../CategoryModal/CategoryModal";

// Styles
import styles from "./OptionBar.module.scss";

function OptionBar({ series, onClose, checked, onCheck, onCategoryChange, isCalledFromExplore }) {
    const [showCategoryModal, setShowCategoryModal] = useState(false);

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
                            <div className={styles.option}>
                                <span className={styles.icon}>
                                    <DoneAllIcon />
                                </span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Marquer comme non vu" placement="top">
                            <div className={styles.option}>
                                <span className={styles.icon}>
                                    <RemoveDoneIcon />
                                </span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Supprimer" placement="top">
                            <div className={styles.option}>
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
                    onMoreClick={onCategoryChange}
                    shouldUpdateSeries={isCalledFromExplore}
                />
            )}
        </>
    );
}

export default OptionBar;