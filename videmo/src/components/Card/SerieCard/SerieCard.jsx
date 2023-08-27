import React, { useState } from 'react';

// External
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Services
import Utils from '../../../utilities/utils/Utils';

// Components
import CategoryModal from '../../CategoryModal/CategoryModal';
import Notification from '../../Notification/Notification';

// Styles
import styles from './SerieCard.module.scss';


function SerieCard({ details, extension, onPlayClick, onMoreClick, displayLabel }) {
    // State initialization
    const [isHovered, setIsHovered] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [utils] = useState(() => new Utils());
    const [error, setError] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false); // State to track image loading


    const handleCloseModal = (notification) => {
        setShowCategoryModal(false);
        setError(notification);
    }

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <>
            {error && <Notification message={error.message} type={error.type} onClose={setError} />}
            <li
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {!imageLoaded && <div className={styles.loadingEffect}></div>}
                {(displayLabel && details.inLibrary) && <span className={styles.inLibraryLabel}>In Library</span>}
                <img
                    className={`${styles.cardImage} ${imageLoaded ? styles.imageLoaded : ''}`}
                    src={details.image}
                    alt={details.name}
                    onLoad={handleImageLoad}
                />
                
                <p className={styles.cardTitle}>{utils.constructTitle(details)}</p>

                <div className={`${styles.cardLayer} ${isHovered && styles.hovered}`}>
                    <div className={styles.cardLayerContent}>
                        <ControlPointIcon className={styles.cardLayerImage} onClick={() => setShowCategoryModal(true)} />
                        <hr className={styles.separator} />
                        <PlayCircleOutlineIcon className={styles.cardLayerImage} onClick={() => onPlayClick(details)} />
                    </div>
                </div>
            </li>

            {showCategoryModal && (
                <CategoryModal
                    serie={details}
                    extension={extension}
                    onClose={handleCloseModal}
                    onMoreClick={onMoreClick}
                />
            )}
        </>
    );
}

export default SerieCard;