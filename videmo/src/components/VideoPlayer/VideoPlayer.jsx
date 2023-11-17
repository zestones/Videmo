import React, { useEffect, useState, useRef } from "react";

// External
import CloseIcon from '@mui/icons-material/Close';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import ReactPlayer from 'react-player'

// Styles
import styles from "./VideoPlayer.module.scss";

function VideoPlayer({ episode, startTime, onCloseVideoPlayer }) {
    const [isPlayerHovered, setIsPlayerHovered] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    const videoRef = useRef(null);

    useEffect(() => {
        if (!episode.stream) return;

        const referer = episode.stream.referer;
        const videoUrl = episode.stream.stream_url;

        const streamUrl = `http://localhost:4000/stream-video?url=${videoUrl}&referer=${referer}`;

        videoRef.current.src = streamUrl;

        videoRef.current.onloadedmetadata = () => {
            // When video metadata is loaded, we can set the current time
            if (videoRef.current && videoRef.current.duration) {
                const seekTimeInSeconds = startTime;
                videoRef.current.currentTime = seekTimeInSeconds;
                videoRef.current.play(); // Start playback after setting currentTime
            }
        };
    }, [episode, startTime]);

    const handleTimeUpdate = (event) => {
        setCurrentTime(event.target.currentTime);
    };

    return (
        <div className={styles.videoPlayer}>
            <div
                className={styles.videoWrapper}
                onMouseEnter={() => setIsPlayerHovered(true)}
                onMouseLeave={() => setIsPlayerHovered(false)}
            >
                <video
                    ref={videoRef}
                    currentTime={currentTime}
                    onTimeUpdate={handleTimeUpdate}
                    controls
                    width="100%"
                    height="auto"
                    autoPlay
                    preload="metadata"
                    type="video/mp4"
                >
                </video>

                {isPlayerHovered && (
                    <div className={styles.videoPlayer__customControls}>
                        <div className={styles.videoPlayer__closeContainer}>
                            <div className={styles.videoPlayer__close} onClick={() => onCloseVideoPlayer(0)}>
                                <CloseIcon />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VideoPlayer;
