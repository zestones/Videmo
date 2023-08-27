import React, { useState } from 'react';
import { useNotification } from "../../Notification/NotificationProvider";

// External
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Services
import Utils from '../../../utilities/utils/Utils';

// Components
import CategoryModal from '../../CategoryModal/CategoryModal';

// Styles
import styles from './SerieCard.module.scss';


function SerieCard({ serie, onPlayClick, onMoreClick, calledFromExplore }) {
    // State initialization
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Services initialization
    const [utils] = useState(() => new Utils());

	// Initialization of the notification hook
	const { showNotification } = useNotification();


    const handleCloseModal = (notification) => {
        setShowCategoryModal(false);
		if (notification) showNotification(notification.type, notification.message);
    }

    return (
        <>
            <li
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {!imageLoaded && <div className={styles.loadingEffect}></div>}
                {(calledFromExplore && serie.inLibrary) && <span className={styles.inLibraryLabel}>In Library</span>}
                <img
                    className={`${styles.cardImage} ${imageLoaded ? styles.imageLoaded : ''}`}
                    src={serie.image}
                    alt={serie.name}
                    onLoad={() => setImageLoaded(true)}
                />

                <p className={styles.cardTitle}>{utils.constructTitle(serie)}</p>

                <div className={`${styles.cardLayer} ${isHovered && styles.hovered}`}>
                    <div className={styles.cardLayerContent}>
                        <ControlPointIcon className={styles.cardLayerImage} onClick={() => setShowCategoryModal(true)} />
                        <hr className={styles.separator} />
                        <PlayCircleOutlineIcon className={styles.cardLayerImage} onClick={() => onPlayClick(serie)} />
                    </div>
                </div>
            </li>

            {showCategoryModal && (
                <CategoryModal
                    serie={serie}
                    onClose={handleCloseModal}
                    onMoreClick={onMoreClick}
                    shouldUpdateSeries={calledFromExplore}
                />
            )}
        </>
    );
}

export default SerieCard;