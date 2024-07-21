import React, { useState, useMemo } from 'react';
import propTypes from 'prop-types';

// Context
import { useDisplayMode } from "../../FilterPanel/DisplayOptions/DisplayModeContext";
import { useNotification } from "../../Notification/NotificationProvider";

// External
import LabelIcon from '@mui/icons-material/Label';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Services
import { Utils } from '../../../utilities/utils/Utils';
import AniListService from '../../../services/extenal/AniListService';

// Components
import CategoryModal from '../../Modal/CategoryModal/CategoryModal';

// Styles
import styles from './SerieCard.module.scss';


function SerieCard({ serie, onPlayClick, onRefresh, isCalledFromExplore, isCalledFromLibrary, isCalledFromSource, isOptionBarActive, checked, setChecked }) {
    // State initialization
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Services initialization
    const utils = useMemo(() => new Utils(), []);
    const aniList = useMemo(() => new AniListService(), []);

    // Initialization of the notification hook
    const { showNotification } = useNotification();

    // Context initialization
    const { displayMode } = useDisplayMode();

    const handleCloseModal = (notification) => {
        setShowCategoryModal(false);
        if (notification) showNotification(notification.type, notification.message);
    }

    const handleAddToCategory = () => {
        setShowCategoryModal(true);

        if (isCalledFromExplore || isCalledFromSource) {
            aniList.searchAnimeInfosName(serie.basename)
                .then((data) => serie.infos = data)
                .catch((error) => showNotification("error", error.message));
        }
    }

    const isSerieCompleted = () => serie?.infos?.total_viewed_episodes === serie?.infos?.number_of_episodes && serie?.infos?.number_of_episodes !== undefined;

    return (
        <>
            <li
                className={styles[displayMode.name] + (checked ? " " + styles.checked : " ") + (isCalledFromSource ? " " + styles.source : "")}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => !isOptionBarActive && onPlayClick(serie)}
            >
                {((isCalledFromExplore || isCalledFromSource) && serie.inLibrary) && <span className={styles.inLibraryLabel}>Dans la bibliothèque</span>}
                {isCalledFromLibrary && (
                    <div className={`${styles.episodeInfos} ${isSerieCompleted() && styles.completed}`}>
                        <span className={styles.number}>
                            {serie?.infos?.total_viewed_episodes} / {serie?.infos?.number_of_episodes}
                        </span>
                    </div>
                )}

                <div className={`${styles.cardContent} ${(isSerieCompleted() || ((isCalledFromExplore || isCalledFromSource) && serie.inLibrary)) && styles.completed}`}>

                    <span className={styles.imgContainer}>
                        <img
                            className={`${styles.cardImage} ${imageLoaded ? styles.imageLoaded : ''}`}
                            src={serie.image}
                            alt={serie.name}
                            onLoad={() => setImageLoaded(true)}
                        />
                        {!imageLoaded && <div className={`${styles.cardImage} ${styles.loadingEffect}`} />}
                    </span>
                    <p className={styles.cardTitle}>{utils.constructTitle(serie)}</p>

                    <div
                        className={`${styles.cardLayer} ${(isHovered || isOptionBarActive) && styles.hovered}`}>
                        <div className={styles.cardLayerContent}>
                            <span className={styles.cardOptions}>
                                <span
                                    className={styles.iconContainer + " " + styles.moreIcon}
                                    style={{ display: isOptionBarActive ? "none" : "" }}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleAddToCategory();
                                    }}
                                >
                                    <LabelIcon />
                                </span>
                                <span
                                    className={styles.iconContainer + " " + styles.playIcon}
                                    style={{ display: isOptionBarActive ? "none" : "" }}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onPlayClick(serie);
                                    }}
                                >
                                    <PlayArrowIcon />
                                </span>
                            </span>

                            {isCalledFromLibrary && (
                                <span
                                    className={styles.iconContainer + " " + styles.checkboxIcon}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setChecked(!checked);
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(event) => {
                                            event.stopPropagation();
                                            setChecked(!checked);
                                        }}
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </li>

            {showCategoryModal && (
                <CategoryModal
                    series={[serie]}
                    onClose={handleCloseModal}
                    onRefresh={onRefresh}
                    shouldUpdateSeries={isCalledFromExplore || isCalledFromSource}
                />
            )}
        </>
    );
}

SerieCard.propTypes = {
    serie: propTypes.object.isRequired,
    onPlayClick: propTypes.func.isRequired,
    onRefresh: propTypes.func,
    isCalledFromExplore: propTypes.bool,
    isCalledFromLibrary: propTypes.bool,
    isCalledFromSource: propTypes.bool,
    isOptionBarActive: propTypes.bool,
    checked: propTypes.bool,
    setChecked: propTypes.func
};

export default SerieCard;
