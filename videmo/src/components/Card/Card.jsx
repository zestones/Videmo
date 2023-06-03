import React, { useState } from 'react';

// Styles
import styles from './Card.module.scss';

function Card({ link, title, image, local = false, onMoreClick }) {
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
            <div className={`${styles.cardLayer} ${isHovered ? styles.hovered : styles.unhovered}`}>
                <div className={styles.cardLayerContent}>
                    <img className={styles.cardLayerImage} src="/icons/cards/play.png" alt="Play" />
                    <hr className={styles.separator} />
                    <img className={styles.cardLayerImage} src="/icons/cards/more.png" alt="More" onClick={() => onMoreClick(link)} />
                </div>
            </div>
        </li>
    );
}

export default Card;
