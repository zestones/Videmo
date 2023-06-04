import React, { useState } from 'react';

// Styles
import styles from './Card.module.scss';

function Card({ link, title, image, local = true, onMoreClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <li
            key={link}
            className={styles.card}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img className={styles.cardImage} src={image} alt={title} />
            <p className={styles.cardTitle}>{title}</p>
            <div className={`${styles.cardLayer} ${isHovered && styles.hovered}`}>
                <div className={styles.cardLayerContent}>
                    <img className={styles.cardLayerImage} src="/icons/cards/more.png" alt="More" />
                    <hr className={styles.separator} />
                    <img className={styles.cardLayerImage} src="/icons/cards/play.png" alt="Play" onClick={() => onMoreClick({ link, title, image, local })} />
                </div>
            </div>
        </li>
    );
}

export default Card;