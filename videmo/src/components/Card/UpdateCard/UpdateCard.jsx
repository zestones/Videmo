import React from "react";
import PropTypes from "prop-types";

// Styles
import styles from "./UpdateCard.module.scss";


function UpdateCard({ isNewDateLabel, currentDateLabel, entry, handleSerieImageClick, handleSerieNameClick }) {

    return (
        <>
            {isNewDateLabel && <p className={styles.dateLabel}>{currentDateLabel}</p>}
            <div
                className={`${styles.entry}
                ${entry.episode.viewed ? styles.viewed : ''}
                ${entry.episode.bookmarked ? styles.bookmarked : ''}`}
                key={entry.episode.link}>
                <div className={styles.serieInfo} onClick={() => handleSerieImageClick(entry)}>
                    <img src={entry.serie.image} alt={entry.serie.name} className={styles.serieImage} />
                </div>
                <div className={styles.episodeInfos}>
                    <div className={styles.serieName}>{entry.serie.name}</div>
                    <div className={styles.episodeName} onClick={() => handleSerieNameClick(entry)}>
                        {entry.episode.name}
                    </div>
                </div>
            </div>
        </>
    )
};

UpdateCard.propTypes = {
    isNewDateLabel: PropTypes.bool.isRequired,
    currentDateLabel: PropTypes.string.isRequired,
    entry: PropTypes.object.isRequired,
    handleSerieImageClick: PropTypes.func.isRequired,
    handleSerieNameClick: PropTypes.func.isRequired,
};

export default UpdateCard;