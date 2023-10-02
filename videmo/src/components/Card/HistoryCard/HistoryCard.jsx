import React, { useState } from 'react';

// External
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Services
import { Utils } from '../../../utilities/utils/Utils';

// Styles
import styles from './HistoryCard.module.scss';


const HistoryCard = ({ entry, isNewDateLabel, currentDateLabel, serieTime, handleSerieImageClick, handleSerieNameClick, handleDeleteEpisodeHistory }) => {
    // Services initialization
    const [utils] = useState(() => new Utils());

    return (
        <>
            {isNewDateLabel && <p className={styles.dateLabel}>{currentDateLabel}</p>}
            <div className={styles.historyCard}>
                <img
                    className={styles.cover}
                    src={entry.serie.image}
                    alt={entry.serie.name}
                    onClick={() => handleSerieImageClick(entry)}
                />
                <div className={styles.info}>
                    <h2 className={styles.title} onClick={() => handleSerieImageClick(entry)}>
                        {utils.constructTitle(entry.serie)}
                    </h2>
                    <p className={styles.episodeName} onClick={() => handleSerieNameClick(entry)}>{entry.episode.name}</p>
                    <p className={styles.episodeTime}> - {serieTime} </p>
                </div>
                <DeleteOutlineIcon className={styles.deleteIcon} onClick={() => handleDeleteEpisodeHistory(entry.episode)} />
            </div>
        </>
    );
};

export default HistoryCard;
