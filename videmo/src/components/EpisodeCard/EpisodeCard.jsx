import React from "react";

// Styles
import styles from "./EpisodeCard.module.scss";

function EpisodeCard({ title, link, modifiedTime }) {
    return (
        <li
            key={link}
            className={styles.card}
        >
            <p className={styles.cardTitle}>{title}</p>
            <p className={styles.cardModifiedTime}>{modifiedTime}</p>
        </li>
    );
}

export default EpisodeCard;