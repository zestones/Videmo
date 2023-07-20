import React, { useState } from "react";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player'

// Styles
import styles from "./VideoPlayer.module.scss";


function VideoPlayer({ videoUrl, onShowVideoChange }) {
    const [isPlayerHovered, setIsPlayerHovered] = useState(false);

    return (
        <div className={styles.videoPlayer}>
            <div
                className={styles.videoWrapper}
                onMouseEnter={() => setIsPlayerHovered(true)}
                onMouseLeave={() => setIsPlayerHovered(false)}
            >
                <ReactPlayer
                    url={videoUrl}
                    controls // Display native controls
                    width="100%"
                    height="auto"
                    playing // Start playing the video as soon as it is loaded
                    pip // Picture in Picture mode
                />

                <div className={styles.videoPlayer__closeContainer}>
                    {isPlayerHovered && (
                        <div className={styles.videoPlayer__close} onClick={() => onShowVideoChange(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoPlayer;