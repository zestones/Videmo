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


function SerieCard({ details, onPlayClick, onMoreClick, displayLabel }) {
    // State initialization
    const [isHovered, setIsHovered] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [utils] = useState(() => new Utils());
    const [error, setError] = useState(null);

    const handleCloseModal = (notification) => {
        setShowCategoryModal(false);
        setError(notification);
	}

    return (
        <>
            {error && <Notification message={error.message} type={error.type} onClose={setError} />}
            <li
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img className={styles.cardImage} src={details.image} alt={details.name} />
                {(displayLabel && details.inLibrary) && <span className={styles.inLibraryLabel}>In Library</span>}
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
                    onClose={handleCloseModal}
                    onMoreClick={onMoreClick}
                />
            )}
        </>
    );
}

export default SerieCard;