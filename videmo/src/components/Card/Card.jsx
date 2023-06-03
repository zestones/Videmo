import React, { useState } from 'react';

// Styles
import styles from './Card.module.scss';

function Card({ link, title, image }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <li
            key={link}
            className={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img className={styles.cardImage} src={image} alt={title} />
            <p className={styles.cardTitle}>{title}</p>
            <div className={`${styles.cardLayer} ${isHovered ? styles.hovered : styles.unhovered}`}>
                <div className={styles.cardLayerContent}>
                    <img className={styles.cardLayerImage} src="/icons/cards/play.png" alt="Play" />
                    <hr className={styles.separator} />
                    <img className={styles.cardLayerImage} src="/icons/cards/more.png" alt="More" />
                </div>
            </div>
        </li>
    );
}

export default Card;
