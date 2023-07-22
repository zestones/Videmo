import React, { useState, useRef } from "react";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player'

// Styles
import styles from "./VideoPlayer.module.scss";
import { useEffect } from "react";


function VideoPlayer({ link, startTime, onCloseVideoPlayer }) {
    // State initialization
    const [isPlayerHovered, setIsPlayerHovered] = useState(false);
    const [playedTime, setPlayedTime] = useState(0); // Local state to store the played time
    const playerRef = useRef(null); // Create a ref to the player
    const isSeekingToStartTime = useRef(false); // Use a ref to track if seeking to startTime has already happened

    useEffect(() => {
        return () => {
            // Reset the flag when the component is unmounted to allow seeking to startTime on next mount
            isSeekingToStartTime.current = false;
        };
    }, []);

    const handlePlayerReady = () => {
        if (startTime && !isSeekingToStartTime.current) {
            // Seek to the specified startTime when the player is ready and has not already sought to the startTime
            playerRef.current.seekTo(startTime);
            isSeekingToStartTime.current = true; // Set the flag to true to avoid seeking again
        }
    };

    return (
        <div className={styles.videoPlayer}>
            <div
                className={styles.videoWrapper}
                onMouseEnter={() => setIsPlayerHovered(true)}
                onMouseLeave={() => setIsPlayerHovered(false)}
            >
                <ReactPlayer
                    ref={playerRef} // Set the ref to the playerRef
                    url={link}
                    controls // Display native controls
                    width="100%"
                    height="auto"
                    playing // Start playing the video as soon as it is loaded
                    pip // Picture in Picture mode
                    onProgress={(progress) => setPlayedTime(progress.playedSeconds)} // Update the local state with the current played time while the player is open
                    onEnded={() => onCloseVideoPlayer(playedTime, true)} // Update the played time in the database when the video is finished
                    onReady={handlePlayerReady} // Set the start time to the episode played time
                />

                <div className={styles.videoPlayer__closeContainer}>
                    {isPlayerHovered && (
                        <div className={styles.videoPlayer__close} onClick={() => onCloseVideoPlayer(playedTime)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoPlayer;