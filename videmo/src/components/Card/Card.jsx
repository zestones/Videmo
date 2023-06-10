import React, { useState } from 'react';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';

// Styles
import styles from './Card.module.scss';

function Card({ serie, onPlayClick, onMoreClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    return (
        <>
            <li
                key={serie.link}
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img className={styles.cardImage} src={serie.image} alt={serie.name} />
                <p className={styles.cardTitle}>{serie.name}</p>
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