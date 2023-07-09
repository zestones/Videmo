import React, { useState } from 'react';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';

// Styles
import styles from './Card.module.scss';

function Card({ basename, name, link, level = 0, image, extensionId, onPlayClick, onMoreClick, inLibrary = false, showInLibraryLabel = false }) {
    // State initialization
    const [isHovered, setIsHovered] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Function to retrieve the title of the serie based on the inLibrary prop
    const constructTitle = () => (inLibrary && basename !== name && level === 0) ? basename + ' - ' + name : name;
    const constructObject = () => ({ basename, name, link, level, image, extensionId});
    
    return (
        <>
            <li
                className={styles.card}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img className={styles.cardImage} src={image} alt={name} />
                {showInLibraryLabel && <span className={styles.inLibraryLabel}>In Library</span>}
                <p className={styles.cardTitle}>{constructTitle()}</p>
                <div className={`${styles.cardLayer} ${isHovered && styles.hovered}`}>
                    <div className={styles.cardLayerContent}>
                        <img className={styles.cardLayerImage} src="/icons/cards/more.png" alt="More" onClick={() => setShowCategoryModal(true)} />
                        <hr className={styles.separator} />
                        <img className={styles.cardLayerImage} src="/icons/cards/play.png" alt="Play" onClick={() => onPlayClick(basename, name, link, image)} />
                    </div>
                </div>
            </li>
            {showCategoryModal && (
                <CategoryModal
                    serie={constructObject()}
                    onClose={() => setShowCategoryModal(false)} onMoreClick={onMoreClick}
                />
            )}
        </>
    );
}

export default Card;