import React, { useEffect, useState, useRef } from "react";

// External
import CloseIcon from '@mui/icons-material/Close';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import ReactPlayer from 'react-player'

// Styles
import styles from "./VideoPlayer.module.scss";

function VideoPlayer({ episode, startTime, onCloseVideoPlayer }) {
    const [isPlayerHovered, setIsPlayerHovered] = useState(false);
    const [playedTime, setPlayedTime] = useState(0); // Local state to store the played time
    const [link, setLink] = useState(null);
    
    const playerRef = useRef(null); // Create a ref to the player
    const isSeekingToStartTime = useRef(false); 

     useEffect(() => {
            return () => {
                // Reset the flag when the component is unmounted to allow seeking to startTime on next mount
                isSeekingToStartTime.current = false;
            };
    }, []);

    useEffect(() => {
        if (!episode.stream) {
            setLink(episode.link);
            return;
        }

        const referer = episode.stream.referer;
        const videoUrl = episode.stream.stream_url;

        console.log("==>", episode);

        const streamUrl = `http://localhost:4000/stream-video?url=${videoUrl}&referer=${referer}`;
        setLink(streamUrl);
    }, [episode, startTime]);

    const handlePlayerReady = () => {
        if (startTime && !isSeekingToStartTime.current) {
            playerRef.current.seekTo(startTime);
            isSeekingToStartTime.current = true; // Set the flag to true to avoid seeking again
        }
    };

    const handleSkipForward = () => {
        // Skip forward 1 minute and 30 seconds (90 seconds)
        const newTime = Math.min(playerRef.current.getDuration(), playedTime + 90);
        playerRef.current.seekTo(newTime);
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
                {isPlayerHovered && (
                    <>
                        <div className={styles.videoPlayer__closeContainer}>
                            <div className={styles.videoPlayer__close} onClick={() => onCloseVideoPlayer(playedTime)}>
                                <CloseIcon />
                            </div>
                        </div>
                        <div className={styles.videoPlayer__skipButton} onClick={handleSkipForward}>
                            Passer <KeyboardDoubleArrowRightIcon className={styles.videoPlayer__skipButtonIcon} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default VideoPlayer;
