import React, { useState } from 'react';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';

// Styles
import styles from './Card.module.scss';

function Card({ key, details, onPlayClick, onMoreClick, displayLabel }) {
    // State initialization
    const [isHovered, setIsHovered] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Function to retrieve the title of the serie based on the inLibrary prop
    const constructTitle = () => (!details.displayLabel && details.basename !== details.name) ? details.basename + ' - ' + details.name : details.name;

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
                <p className={styles.cardTitle}>{constructTitle()}</p>
                <div className={`${styles.cardLayer} ${isHovered && styles.hovered}`}>
                    <div className={styles.cardLayerContent}>
                        <img className={styles.cardLayerImage} src="/icons/cards/more.png" alt="More" onClick={() => setShowCategoryModal(true)} />
                        <hr className={styles.separator} />
                        <img className={styles.cardLayerImage} src="/icons/cards/play.png" alt="Play" onClick={() => onPlayClick(details)} />
                    </div>
                </div>
            </li>
            {showCategoryModal && (
                <CategoryModal
                    serie={details}
                    onClose={() => setShowCategoryModal(false)} onMoreClick={onMoreClick}
                />
            )}
        </>
    );
}

export default Card;