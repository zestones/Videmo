import React, { useState } from 'react';

// External
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';

// Styles
import styles from './Card.module.scss';

function Card({ key, details, onPlayClick, onMoreClick, displayLabel }) {
    // State initialization
    const [isHovered, setIsHovered] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const title = (details.basename !== details.name && !displayLabel && details.inLibrary) ? `${details.basename} (${details.name})` : details.name;

    return (
        <>
            <li
                key={key}
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img className={styles.cardImage} src={details.image} alt={details.name} />
                {(displayLabel && details.inLibrary) && <span className={styles.inLibraryLabel}>In Library</span>}
                <p className={styles.cardTitle}>{title}</p>
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
                    onClose={() => setShowCategoryModal(false)}
                    onMoreClick={onMoreClick}
                />
            )}
        </>
    );
}

export default Card;