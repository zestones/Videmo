import React, { useState } from 'react';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';

// Styles
import styles from './Card.module.scss';

function Card({ serie, onPlayClick, onMoreClick, inLibrary = false }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Function to retrieve the title of the serie based on the inLibrary prop
    const constructTitle = () => (inLibrary && serie.basename !== serie.name) ? serie.basename + ' - ' + serie.name : serie.name;

    return (
        <>
            <li
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img className={styles.cardImage} src={serie.image} alt={serie.name} />
                <p className={styles.cardTitle}>{constructTitle()}</p>
                <div className={`${styles.cardLayer} ${isHovered && styles.hovered}`}>
                    <div className={styles.cardLayerContent}>
                        <img className={styles.cardLayerImage} src="/icons/cards/more.png" alt="More" onClick={() => setShowCategoryModal(true)} />
                        <hr className={styles.separator} />
                        <img className={styles.cardLayerImage} src="/icons/cards/play.png" alt="Play" onClick={() => onPlayClick(serie)} />
                    </div>
                </div>
            </li>
            {showCategoryModal && (
                <CategoryModal serie={serie} onClose={() => setShowCategoryModal(false)} onMoreClick={onMoreClick} />
            )}
        </>
    );
}

export default Card;