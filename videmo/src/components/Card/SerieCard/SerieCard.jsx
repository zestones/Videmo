import React, { useState, useMemo } from 'react';
import { useNotification } from "../../Notification/NotificationProvider";

// External
import LabelIcon from '@mui/icons-material/Label';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Services
import Utils from '../../../utilities/utils/Utils';
import AniListService from '../../../services/extenal/AniListService';

// Components
import CategoryModal from '../../CategoryModal/CategoryModal';

// Styles
import styles from './SerieCard.module.scss';


function SerieCard({ serie, onPlayClick, onMoreClick, isCalledFromExplore, isCalledFromLibrary, isOptionBarActive, checked, setChecked, numberOfEpisode }) {
    // State initialization
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Services initialization
    const utils = useMemo(() => new Utils(), []);
    const aniList = useMemo(() => new AniListService(), []);

    // Initialization of the notification hook
    const { showNotification } = useNotification();

    const handleCloseModal = (notification) => {
        setShowCategoryModal(false);
        if (notification) showNotification(notification.type, notification.message);
    }

    const handleAddToCategory = () => {
        setShowCategoryModal(true);

        if (isCalledFromExplore) {
            aniList.searchAnimeInfosName(serie.basename)
                .then((data) => serie.infos = data)
                .catch((error) => showNotification("error", error.message));
        }
    }

    return (
        <>
            <li
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => !isOptionBarActive && onPlayClick(serie)}
            >
                {!imageLoaded && <div className={styles.loadingEffect}></div>}
                {(isCalledFromExplore && serie.inLibrary) && <span className={styles.inLibraryLabel}>In Library</span>}
                <img
                    className={`${styles.cardImage} ${imageLoaded ? styles.imageLoaded : ''}`}
                    src={serie.image}
                    alt={serie.name}
                    onLoad={() => setImageLoaded(true)}
                />

                <p className={styles.cardTitle}>{utils.constructTitle(serie)}</p>
                <div className={isCalledFromLibrary && styles.episodeInfos}>
                    <span className={styles.number}>
                        {serie.number}
                    </span>
                </div>

                <div className={`${styles.cardLayer} ${(isHovered || isOptionBarActive) && styles.hovered}`}>
                    <div className={styles.cardLayerContent}>
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
                    </div>
                </div>
            </li>

            {showCategoryModal && (
                <CategoryModal
                    series={[serie]}
                    onClose={handleCloseModal}
                    onMoreClick={onMoreClick}
                    shouldUpdateSeries={isCalledFromExplore}
                />
            )}
        </>
    );
}

export default SerieCard;